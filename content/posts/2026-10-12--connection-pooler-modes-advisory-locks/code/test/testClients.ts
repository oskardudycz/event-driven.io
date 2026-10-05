import { connect, ports } from '../src/connections';
import type { ConnectOptions, DbClient } from '../src/connections';

export const testClients = () => {
  const clients: DbClient[] = [];

  return {
    connect: async (options: ConnectOptions) => {
      const client = await connect(options);
      clients.push(client);
      return client;
    },
    closeAll: async () => {
      await Promise.all(clients.splice(0).map((client) => client.close()));
    },
  };
};

export const asSuperuser = async <T>(
  handle: (postgres: DbClient) => Promise<T>,
) => {
  const postgres = await connect({ port: ports.postgres, user: 'postgres' });
  try {
    return await handle(postgres);
  } finally {
    await postgres.close();
  }
};

export const singleRow = async <Row>(rows: Promise<Row[]>) => {
  const all = await rows;
  if (all.length !== 1 || !all[0])
    throw new Error(`Expected a single row, got ${all.length}`);
  return all[0];
};

export const eventually = async <T>(
  check: () => Promise<T>,
  isDone: (result: T) => boolean,
  { timeoutMs = 5_000, intervalMs = 50 } = {},
): Promise<T> => {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const result = await check();
    if (isDone(result) || Date.now() > deadline) return result;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
