import { SQL } from '@event-driven-io/dumbo';
import { afterEach, describe, expect, it } from 'vitest';
import { ports, showPools } from '../../src/connections';
import type { DbClient } from '../../src/connections';
import { eventually, sleep, testClients } from '../testClients';

const clientsCount = 100;

describe('M1: 100 clients and 10 server connections', () => {
  const clients = testClients();

  afterEach(clients.closeAll);

  const runQueryInEachClient = async (port: number, database: string) => {
    const connected: DbClient[] = [];
    for (let i = 0; i < clientsCount; i++)
      connected.push(await clients.connect({ port, database }));

    const answered = new Set<number>();
    const queries = connected.map((client, index) =>
      client
        .query<{ pid: number }>(SQL`SELECT pg_backend_pid() AS pid;`)
        .then(([row]) => {
          answered.add(index);
          return row?.pid;
        }),
    );

    return { answered, queries };
  };

  const appPool = async (port: number, database: string) => {
    const pools = await showPools(port);
    return pools.find(
      (pool) => pool.database === database && pool.user === 'app_user',
    );
  };

  it('in session mode, 10 clients get their results and the other 90 wait', async () => {
    const { answered, queries } = await runQueryInEachClient(
      ports.session,
      'app',
    );

    const pool = await eventually(
      () => appPool(ports.session, 'app'),
      (pool) => pool?.cl_waiting === 90,
    );
    await sleep(500);

    expect(answered.size).toBe(10);
    expect(pool).toMatchObject({
      cl_active: 10,
      cl_waiting: 90,
      sv_active: 10,
      sv_idle: 0,
    });

    const results = Promise.allSettled(queries);
    await clients.closeAll();
    expect(
      (await results).filter((result) => result.status === 'rejected'),
    ).toHaveLength(90);
  });

  it('in transaction mode, all 100 clients get their results from the same 10 backends', async () => {
    const { answered, queries } = await runQueryInEachClient(
      ports.transaction,
      'app_multiplex',
    );

    const pids = await Promise.all(queries);

    expect(answered.size).toBe(100);
    expect(new Set(pids).size).toBeLessThanOrEqual(10);
    expect(await appPool(ports.transaction, 'app_multiplex')).toMatchObject({
      cl_active: 100,
      cl_waiting: 0,
      sv_active: 0,
    });
  });
});
