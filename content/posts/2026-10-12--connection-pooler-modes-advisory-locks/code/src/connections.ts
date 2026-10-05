import { dumbo, SQL } from '@event-driven-io/dumbo';
import type { QueryResultRow } from '@event-driven-io/dumbo';
import { pgDumboDriver } from '@event-driven-io/dumbo/pg';

export const ports = {
  postgres: 5432,
  session: 6432,
  transaction: 6433,
  timeouts: 6434,
} as const;

const passwords: Record<string, string> = {
  postgres: 'postgres',
  app_user: 'app_password',
  processor: 'processor_password',
  pgbouncer_admin: 'admin_password',
};

export type ConnectOptions = {
  port: number;
  database?: string;
  user?: string;
};

export const connectionString = ({
  port,
  database = 'app',
  user = 'app_user',
}: ConnectOptions) =>
  `postgresql://${user}:${passwords[user]}@localhost:${port}/${database}`;

export type DbClient = Awaited<ReturnType<typeof connect>>;

export const connect = async (options: ConnectOptions) => {
  const pool = dumbo({
    driver: pgDumboDriver,
    connectionString: connectionString(options),
    pooled: false,
  });
  const connection = await pool.connection();
  const client = await connection.open();

  const warnings: string[] = [];
  client.on('notice', (notice) =>
    warnings.push(`${notice.severity}:  ${notice.message}`),
  );
  const errors: string[] = [];
  client.on('error', (error) => errors.push(error.message));

  return {
    query: async <Row extends QueryResultRow = QueryResultRow>(sql: SQL) =>
      (await connection.execute.query<Row>(sql)).rows,
    warnings,
    errors,
    close: async () => {
      await connection.close();
      await pool.close();
    },
  };
};

export const pgBouncerAdmin = (port: number) =>
  connect({ port, database: 'pgbouncer', user: 'pgbouncer_admin' });

export type PoolStats = {
  database: string;
  user: string;
  cl_active: number;
  cl_waiting: number;
  sv_active: number;
  sv_idle: number;
  sv_used: number;
  pool_mode: string;
};

export const showPools = async (port: number): Promise<PoolStats[]> => {
  const admin = await pgBouncerAdmin(port);
  try {
    const pools = await admin.query<Record<string, unknown>>(SQL`SHOW POOLS;`);
    return pools.map((pool) => ({
      database: String(pool.database),
      user: String(pool.user),
      cl_active: Number(pool.cl_active),
      cl_waiting: Number(pool.cl_waiting),
      sv_active: Number(pool.sv_active),
      sv_idle: Number(pool.sv_idle),
      sv_used: Number(pool.sv_used),
      pool_mode: String(pool.pool_mode),
    }));
  } finally {
    await admin.close();
  }
};

export const resetPgBouncer = async (port: number) => {
  const admin = await pgBouncerAdmin(port);
  try {
    const databases = await admin.query<{ name: string }>(SQL`SHOW DATABASES;`);
    for (const { name } of databases) {
      if (name === 'pgbouncer') continue;
      await admin.query(SQL`KILL ${SQL.plain(name)};`);
      await admin.query(SQL`RESUME ${SQL.plain(name)};`);
    }
  } finally {
    await admin.close();
  }
};
