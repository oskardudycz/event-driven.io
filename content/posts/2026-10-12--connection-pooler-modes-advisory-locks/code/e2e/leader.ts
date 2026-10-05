import { SQL } from '@event-driven-io/dumbo';
import { connect } from '../src/connections';
import { lockKey } from '../src/lockKey';

const [name, port, database] = process.argv.slice(2);
if (!name || !port || !database)
  throw new Error('Usage: leader.ts <name> <port> <database>');

const processorLockKey = lockKey('shopping_cart_summary');
const pollingIntervalMs = 100;

const client = await connect({ port: Number(port), database });

for (;;) {
  const [lock] = await client.query<{ locked: boolean }>(
    SQL`SELECT pg_try_advisory_lock(${processorLockKey}) AS locked;`,
  );

  if (lock?.locked) {
    console.log(`${name}: I'm the leader`);
    break;
  }

  await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
}

for (;;) {
  await client.query(SQL`SELECT 1;`);
  await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
}
