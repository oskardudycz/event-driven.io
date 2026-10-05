import { SQL } from '@event-driven-io/dumbo';
import { afterEach, describe, expect, it } from 'vitest';
import { advisoryLocks } from '../../src/advisoryLocks';
import { ports } from '../../src/connections';
import { singleRow, testClients } from '../testClients';

describe('Advisory locks without a pooler', () => {
  const clients = testClients();
  const instance = () => clients.connect({ port: ports.postgres });

  afterEach(clients.closeAll);

  it('S1: a session-level lock is released when its session ends', async () => {
    const a = await instance();
    const b = await instance();

    expect(
      await a.query(SQL`SELECT pg_try_advisory_lock(42) AS locked;`),
    ).toEqual([{ locked: true }]);
    expect(
      await b.query(SQL`SELECT pg_try_advisory_lock(42) AS locked;`),
    ).toEqual([{ locked: false }]);

    await a.close();

    expect(
      await b.query(SQL`SELECT pg_try_advisory_lock(42) AS locked;`),
    ).toEqual([{ locked: true }]);
  });

  it('S2: a session-level lock is re-entrant and must be released as many times as it was taken', async () => {
    const a = await instance();

    expect(
      await a.query(SQL`SELECT pg_try_advisory_lock(42) AS locked;`),
    ).toEqual([{ locked: true }]);
    expect(
      await a.query(SQL`SELECT pg_try_advisory_lock(42) AS locked;`),
    ).toEqual([{ locked: true }]);

    expect(
      await a.query(SQL`SELECT pg_advisory_unlock(42) AS unlocked;`),
    ).toEqual([{ unlocked: true }]);
    expect(
      await a.query(SQL`SELECT pg_advisory_unlock(42) AS unlocked;`),
    ).toEqual([{ unlocked: true }]);
    expect(a.warnings).toEqual([]);

    expect(
      await a.query(SQL`SELECT pg_advisory_unlock(42) AS unlocked;`),
    ).toEqual([{ unlocked: false }]);
    expect(a.warnings).toEqual([
      "WARNING:  you don't own a lock of type ExclusiveLock",
    ]);
  });

  it('S3: a transaction-level lock is released when its transaction ends', async () => {
    const a = await instance();
    const b = await instance();

    await a.query(SQL`BEGIN;`);
    expect(
      await a.query(SQL`SELECT pg_try_advisory_xact_lock(42) AS locked;`),
    ).toEqual([{ locked: true }]);

    expect(
      await b.query(SQL`SELECT pg_try_advisory_lock(42) AS locked;`),
    ).toEqual([{ locked: false }]);

    await a.query(SQL`COMMIT;`);

    expect(
      await b.query(SQL`SELECT pg_try_advisory_lock(42) AS locked;`),
    ).toEqual([{ locked: true }]);
  });

  it('S4: shared locks block the exclusive one, and pg_advisory_lock waits until it gets it', async () => {
    const a = await instance();
    const b = await instance();
    const c = await instance();

    expect(
      await a.query(SQL`SELECT pg_try_advisory_lock_shared(42) AS locked;`),
    ).toEqual([{ locked: true }]);
    expect(
      await b.query(SQL`SELECT pg_try_advisory_lock_shared(42) AS locked;`),
    ).toEqual([{ locked: true }]);
    expect(
      await c.query(SQL`SELECT pg_try_advisory_lock(42) AS locked;`),
    ).toEqual([{ locked: false }]);

    let waitingLockAcquired = false;
    const waitingLock = c
      .query(SQL`SELECT pg_advisory_lock(42);`)
      .then(() => (waitingLockAcquired = true));

    await a.close();
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(waitingLockAcquired).toBe(false);

    await b.close();
    await waitingLock;
    expect(waitingLockAcquired).toBe(true);
  });

  it('S5: pg_locks shows which backend holds the lock', async () => {
    const a = await instance();
    const b = await instance();

    const { pid } = await singleRow(
      a.query<{ pid: number }>(SQL`SELECT pg_backend_pid() AS pid;`),
    );
    await a.query(SQL`SELECT pg_try_advisory_lock(42) AS locked;`);

    expect(await b.query(advisoryLocks)).toEqual([
      {
        pid,
        classid: 0,
        objid: 42,
        objsubid: 1,
        mode: 'ExclusiveLock',
        granted: true,
      },
    ]);
  });
});
