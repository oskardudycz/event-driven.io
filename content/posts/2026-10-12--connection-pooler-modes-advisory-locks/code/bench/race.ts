import { ports, resetPgBouncer } from '../src/connections';
import { leaderElectionRace } from '../src/leaderElectionRace';

const runs = Number(process.argv[2] ?? 10);

const busy = { workers: 10, rounds: 50, workMs: 5 };
const calm = { workers: 3, rounds: 20, workMs: 200 };

const setups = [
  { mode: 'session', port: ports.session, database: 'app', load: busy },
  {
    mode: 'transaction',
    port: ports.transaction,
    database: 'app_realistic',
    load: busy,
  },
  {
    mode: 'transaction',
    port: ports.transaction,
    database: 'app_realistic',
    load: calm,
  },
];

console.log(
  '| mode | workers | attempts per worker | work (ms) | run | lock acquisitions | overlaps | failed unlocks |',
);
console.log('|---|---|---|---|---|---|---|---|');

for (const { mode, port, database, load } of setups) {
  for (let run = 1; run <= runs; run++) {
    await resetPgBouncer(port);
    const { acquisitions, overlaps, failedUnlocks } = await leaderElectionRace({
      port,
      database,
      ...load,
    });
    console.log(
      `| ${mode} | ${load.workers} | ${load.rounds} | ${load.workMs} | ${run} | ${acquisitions} | ${overlaps} | ${failedUnlocks} |`,
    );
  }
}
