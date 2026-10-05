import { SQL } from '@event-driven-io/dumbo';
import { afterEach, describe, expect, it } from 'vitest';
import {
  advisoryLocks,
  tryLock,
  tryXactLock,
  unlock,
} from '../../src/advisoryLocks';
import type { LockResult, UnlockResult } from '../../src/advisoryLocks';
import { ports } from '../../src/connections';
import {
  asSuperuser,
  eventually,
  singleRow,
  sleep,
  testClients,
} from '../testClients';

const isBackendAlive = (pid: number) =>
  asSuperuser(async (postgres) => {
    const rows = await postgres.query(
      SQL`SELECT 1 FROM pg_stat_activity WHERE pid = ${pid}`,
    );
    return rows.length === 1;
  });

const advisoryLocksHeld = () =>
  asSuperuser((postgres) => postgres.query(advisoryLocks));

describe('Advisory locks through PgBouncer', () => {
  const clients = testClients();

  afterEach(clients.closeAll);

  describe('in session mode', () => {
    const instance = () => clients.connect({ port: ports.session });

    it('T0: works as without a pooler, because PgBouncer runs DISCARD ALL when a client disconnects', async () => {
      const a = await instance();
      const b = await instance();

      const aLock = await singleRow(a.query<LockResult>(tryLock));
      expect(aLock.locked).toBe(true);

      const bLock = await singleRow(b.query<LockResult>(tryLock));
      expect(bLock.locked).toBe(false);
      expect(bLock.pid).not.toBe(aLock.pid);

      await a.close();

      const bTakesOver = await eventually(
        () => singleRow(b.query<LockResult>(tryLock)),
        ({ locked }) => locked,
      );
      expect(bTakesOver).toEqual({ locked: true, pid: bLock.pid });
      expect(await isBackendAlive(aLock.pid)).toBe(true);
    });
  });

  describe('in transaction mode', () => {
    const instance = (database: string) =>
      clients.connect({ port: ports.transaction, database });

    it('T1: a second client gets the same backend and, through re-entrancy, the same lock', async () => {
      const a = await instance('app');
      const b = await instance('app');

      const aLock = await singleRow(a.query<LockResult>(tryLock));
      const bLock = await singleRow(b.query<LockResult>(tryLock));

      expect(aLock.locked).toBe(true);
      expect(bLock).toEqual({ locked: true, pid: aLock.pid });
    });

    it('T2: unlock runs on a backend that does not hold the lock, and the lock leaks', async () => {
      const a = await instance('app_pair');
      const b = await instance('app_pair');

      const aLock = await singleRow(a.query<LockResult>(tryLock));
      expect(aLock.locked).toBe(true);

      await b.query(SQL`BEGIN;`);
      expect(await b.query(SQL`SELECT pg_backend_pid() AS pid;`)).toEqual([
        { pid: aLock.pid },
      ]);

      const aUnlock = await singleRow(a.query<UnlockResult>(unlock));
      expect(aUnlock.unlocked).toBe(false);
      expect(aUnlock.pid).not.toBe(aLock.pid);
      expect(a.warnings).toEqual([
        "WARNING:  you don't own a lock of type ExclusiveLock",
      ]);

      await b.query(SQL`COMMIT;`);

      expect(await advisoryLocksHeld()).toEqual([
        {
          pid: aLock.pid,
          classid: 0,
          objid: 42,
          objsubid: 1,
          mode: 'ExclusiveLock',
          granted: true,
        },
      ]);
    });

    it('T3: when the leader dies, the lock stays on its backend and the standby never takes over', async () => {
      const a = await instance('app');
      const aLock = await singleRow(a.query<LockResult>(tryLock));
      expect(aLock.locked).toBe(true);

      await a.close();

      const standby = await instance('app_other');
      for (let attempt = 0; attempt < 5; attempt++) {
        const standbyLock = await singleRow(standby.query<LockResult>(tryLock));
        expect(standbyLock.locked).toBe(false);
        expect(standbyLock.pid).not.toBe(aLock.pid);
        await sleep(100);
      }

      const anyOther = await instance('app');
      expect(await singleRow(anyOther.query<LockResult>(tryLock))).toEqual({
        locked: true,
        pid: aLock.pid,
      });
    });

    it('T4: a transaction-level lock keeps other clients away until the transaction ends', async () => {
      const a = await instance('app');
      const b = await instance('app_other');

      await a.query(SQL`BEGIN;`);
      const aLock = await singleRow(a.query<LockResult>(tryXactLock));
      expect(aLock.locked).toBe(true);

      const bLock = await singleRow(b.query<LockResult>(tryXactLock));
      expect(bLock.locked).toBe(false);
      expect(bLock.pid).not.toBe(aLock.pid);

      await a.query(SQL`COMMIT;`);

      expect(await singleRow(b.query<LockResult>(tryXactLock))).toEqual({
        locked: true,
        pid: bLock.pid,
      });
      expect(await advisoryLocksHeld()).toEqual([]);
    });

    it('T5: a transaction-level lock taken outside of a transaction is released right away', async () => {
      const a = await instance('app');
      const b = await instance('app_other');

      const aLock = await singleRow(a.query<LockResult>(tryXactLock));
      const bLock = await singleRow(b.query<LockResult>(tryXactLock));

      expect(aLock.locked).toBe(true);
      expect(bLock.locked).toBe(true);
      expect(bLock.pid).not.toBe(aLock.pid);
    });
  });
});
