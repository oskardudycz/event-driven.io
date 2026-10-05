import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { dumbo, SQL } from '@event-driven-io/dumbo';
import { pgDumboDriver } from '@event-driven-io/dumbo/pg';
import pg from 'pg';
import { afterEach, describe, expect, it } from 'vitest';
import { connectionString, ports } from '../../src/connections';
import { sleep, testClients } from '../testClients';

describe('Other session state in transaction mode', () => {
  const clients = testClients();
  const instance = () =>
    clients.connect({ port: ports.transaction, database: 'app' });

  afterEach(clients.closeAll);

  it('X1: a setting changed with SET leaks to the next client on the same backend', async () => {
    const a = await instance();
    const b = await instance();

    await a.query(SQL`SET statement_timeout = '5s';`);

    expect(await b.query(SQL`SHOW statement_timeout;`)).toEqual([
      { statement_timeout: '5s' },
    ]);
  });

  it('X1: a parameter that PostgreSQL reports to the client, like search_path, is tracked by PgBouncer and does not leak', async () => {
    const a = await instance();
    const b = await instance();

    await a.query(SQL`SET search_path = 'other';`);

    expect(await b.query(SQL`SHOW search_path;`)).toEqual([
      { search_path: '"$user", public' },
    ]);
    expect(await a.query(SQL`SHOW search_path;`)).toEqual([
      { search_path: 'other' },
    ]);
  });
});

describe('X2: application pool and PgBouncer fighting over idle timeouts', () => {
  const clients = testClients();
  const pastClientIdleTimeout = () => sleep(3_000);
  const timeoutsPgBouncer = connectionString({ port: ports.timeouts });

  afterEach(clients.closeAll);

  it('an idle pooled connection closed by PgBouncer makes the pool emit an error, and the next query opens a new connection', async () => {
    const nativePool = new pg.Pool({ connectionString: timeoutsPgBouncer });
    const poolErrors: string[] = [];
    nativePool.on('error', (error) => poolErrors.push(error.message));
    const pool = dumbo({ driver: pgDumboDriver, pool: nativePool });

    try {
      await pool.execute.query(SQL`SELECT 1;`);
      expect(nativePool.idleCount).toBe(1);

      await pastClientIdleTimeout();

      expect(poolErrors).toEqual(['client_idle_timeout']);
      expect(nativePool.idleCount).toBe(0);
      expect((await pool.execute.query(SQL`SELECT 1 AS ok;`)).rows).toEqual([
        { ok: 1 },
      ]);
    } finally {
      await pool.close();
    }
  });

  it('without an error listener on the pool, that error crashes the process', async () => {
    const script = path.resolve(
      import.meta.dirname,
      '../fixtures/idlePooledClient.ts',
    );

    const result = await promisify(execFile)(process.execPath, [
      '--import',
      'tsx',
      script,
      timeoutsPgBouncer,
    ]).then(
      () => ({ crashed: false, stderr: '' }),
      (error: { code: number; stderr: string }) => ({
        crashed: error.code !== 0,
        stderr: error.stderr,
      }),
    );

    expect(result.crashed).toBe(true);
    expect(result.stderr).toContain('client_idle_timeout');
  });

  it('a connection held by the application fails on its next query', async () => {
    const held = await clients.connect({ port: ports.timeouts });
    await held.query(SQL`SELECT 1;`);

    await pastClientIdleTimeout();

    expect(held.errors).toEqual([
      'client_idle_timeout',
      'Connection terminated unexpectedly',
    ]);
    await expect(held.query(SQL`SELECT 1;`)).rejects.toThrow(
      'Client has encountered a connection error and is not queryable',
    );
  });
});
