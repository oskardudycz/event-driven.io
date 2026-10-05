import { dumbo, SQL } from '@event-driven-io/dumbo';
import { pgDumboDriver } from '@event-driven-io/dumbo/pg';

const connectionString = process.argv[2];
if (!connectionString) throw new Error('Pass the connection string');

const pool = dumbo({ driver: pgDumboDriver, connectionString });

await pool.execute.query(SQL`SELECT 1;`);
await new Promise((resolve) => setTimeout(resolve, 3_000));
await pool.close();
