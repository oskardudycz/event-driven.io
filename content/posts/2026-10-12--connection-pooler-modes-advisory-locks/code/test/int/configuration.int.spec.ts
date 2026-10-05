import { afterEach, describe, expect, it } from 'vitest';
import { tryLock } from '../../src/advisoryLocks';
import type { LockResult } from '../../src/advisoryLocks';
import { ports, showPools } from '../../src/connections';
import { eventually, singleRow, testClients } from '../testClients';

describe('Pool mode set per database alias and per user', () => {
  const clients = testClients();

  afterEach(clients.closeAll);

  it('P3: the app_processors alias uses session mode in a PgBouncer that defaults to transaction mode', async () => {
    const a = await clients.connect({
      port: ports.transaction,
      database: 'app_processors',
    });
    const b = await clients.connect({
      port: ports.transaction,
      database: 'app_processors',
    });

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

    expect(await showPools(ports.transaction)).toContainEqual(
      expect.objectContaining({
        database: 'app_processors',
        user: 'app_user',
        pool_mode: 'session',
      }),
    );
  });

  it('P4: the processor user gets session mode whichever alias it uses', async () => {
    const a = await clients.connect({
      port: ports.transaction,
      database: 'app_pair',
      user: 'processor',
    });
    const b = await clients.connect({
      port: ports.transaction,
      database: 'app_pair',
      user: 'processor',
    });
    const appUser = await clients.connect({
      port: ports.transaction,
      database: 'app_pair',
    });

    const aLock = await singleRow(a.query<LockResult>(tryLock));
    expect(aLock.locked).toBe(true);

    const bLock = await singleRow(b.query<LockResult>(tryLock));
    expect(bLock.locked).toBe(false);
    expect(bLock.pid).not.toBe(aLock.pid);

    await appUser.query(tryLock);

    const pools = await showPools(ports.transaction);
    expect(pools).toContainEqual(
      expect.objectContaining({
        database: 'app_pair',
        user: 'processor',
        pool_mode: 'session',
      }),
    );
    expect(pools).toContainEqual(
      expect.objectContaining({
        database: 'app_pair',
        user: 'app_user',
        pool_mode: 'transaction',
      }),
    );
  });
});
