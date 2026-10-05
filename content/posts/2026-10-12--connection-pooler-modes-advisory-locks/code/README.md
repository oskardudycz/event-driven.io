# Connection pooler modes, explained with PostgreSQL advisory locks

Companion code for the article [Connection pooler modes explained: what PgBouncer's transaction mode gives you and what it takes away](https://event-driven.io/en/connection-pooler-modes-advisory-locks/). It lets you run every query from the article yourself, and its tests check that the results shown in the article are what PostgreSQL and PgBouncer actually return.

## What's where

```text
code/
├── docker-compose.yml          PostgreSQL 18 and three PgBouncer 1.26 instances
├── postgres/
│   └── init.sql                creates the app_user and processor roles
├── pgbouncer/
│   ├── session/pgbouncer.ini       session mode, port 6432
│   ├── transaction/pgbouncer.ini   transaction mode with per-alias and per-user overrides, port 6433
│   ├── timeouts/pgbouncer.ini      transaction mode with a 2-second client_idle_timeout, port 6434
│   └── userlist.txt                SCRAM secrets PgBouncer uses to authenticate clients
├── src/
│   ├── advisoryLocks.ts        the lock, unlock and pg_locks queries used across the tests
│   ├── connections.ts          Dumbo connections, ports, and PgBouncer admin helpers (SHOW POOLS, reset)
│   ├── leaderElectionRace.ts   workers competing for the same lock, counting overlaps
│   └── lockKey.ts              md5-based lock key, the formula from the read model rebuild article
├── e2e/
│   └── leader.ts               a leader election node polling for an advisory lock
├── test/
│   ├── unit/                   no database needed
│   ├── int/                    the article's scenarios, against the Docker Compose setup
│   ├── e2e/                    leader.ts started as two separate processes
│   ├── fixtures/               a script that the timeout test runs as a separate process
│   ├── globalSetup.ts          starts docker-compose.yml with Testcontainers
│   ├── resetPgBouncers.ts      drops all PgBouncer server connections before each test
│   └── testClients.ts          test helpers
├── bench/
│   ├── run-bench.sh            pgbench runs, writes results.md
│   ├── results.md              the pgbench results quoted in the article
│   ├── race.ts                 runs the leader election race in several setups
│   └── race-results.md         the race results quoted in the article
└── diagrams/                   Mermaid sources of the article's diagrams
```

The article marks its examples with IDs. Each test's name starts with the ID it checks, for example, `T1: a second client gets the same backend...`. Here's where to find them:

| IDs             | What                                                                  | Test                                                                             |
| --------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| S1–S5           | advisory lock basics, without a pooler                                | [test/int/basics.int.spec.ts](test/int/basics.int.spec.ts)                       |
| P3, P4          | pool mode set per database alias and per user                         | [test/int/configuration.int.spec.ts](test/int/configuration.int.spec.ts)         |
| M1, P5          | 100 clients sharing 10 server connections, seen through `SHOW POOLS`  | [test/int/multiplexing.int.spec.ts](test/int/multiplexing.int.spec.ts)           |
| T0–T5           | advisory locks through PgBouncer in session and transaction mode      | [test/int/scenarios.int.spec.ts](test/int/scenarios.int.spec.ts)                 |
| R1              | workers competing for the leadership through a pool of 20             | [test/int/realistic.int.spec.ts](test/int/realistic.int.spec.ts)                 |
| X1, X2          | `SET` leaking to other clients, and pools fighting over idle timeouts | [test/int/otherSessionState.int.spec.ts](test/int/otherSessionState.int.spec.ts) |
|                 | leader election between two processes                                 | [test/e2e/leaderElection.e2e.spec.ts](test/e2e/leaderElection.e2e.spec.ts)       |
| all SQL and ini | the article's snippets are the ones the code runs                     | [test/unit/articleSnippets.unit.spec.ts](test/unit/articleSnippets.unit.spec.ts) |
|                 | lock key matches PostgreSQL's md5 formula                             | [test/unit/lockKey.unit.spec.ts](test/unit/lockKey.unit.spec.ts)                 |
| B1, B2          | pgbench in both modes                                                 | [bench/run-bench.sh](bench/run-bench.sh)                                         |

The code uses [Dumbo](https://github.com/event-driven-io/Pongo/tree/main/src/packages/dumbo) with non-pooled connections, so each simulated application instance is exactly one client connection to PgBouncer. The leader election node follows [Jeremy D. Miller's post](https://jeremydmiller.com/2020/05/05/using-postgresql-advisory-locks-for-leader-election/).

## Running the examples by hand

You need Docker and `psql`.

```bash
docker compose up -d --wait
```

| Port | What                                            | Pool mode                   |
| ---- | ----------------------------------------------- | --------------------------- |
| 5432 | PostgreSQL, directly                            | none                        |
| 6432 | PgBouncer                                       | session                     |
| 6433 | PgBouncer                                       | transaction, with overrides |
| 6434 | PgBouncer with a 2-second `client_idle_timeout` | transaction                 |

Users and passwords (for local demos only): `app_user`/`app_password`, `processor`/`processor_password`, the PgBouncer admin `pgbouncer_admin`/`admin_password`, and the PostgreSQL superuser `postgres`/`postgres`.

The transaction mode PgBouncer exposes several aliases of the same `app` database, each with its own pool:

| Alias            | Pool size | Used for                                                |
| ---------------- | --------- | ------------------------------------------------------- |
| `app`            | 1         | deterministic demos: every client gets the same backend |
| `app_other`      | 1         | a second, separate backend                              |
| `app_pair`       | 2         | the unlock that lands on the wrong backend              |
| `app_multiplex`  | 10        | 100 clients sharing 10 server connections               |
| `app_realistic`  | 20        | the leader election race                                |
| `app_processors` | 10        | session mode set for a single alias                     |

The `processor` user gets session mode whichever alias it uses.

Open two terminals and connect, for example:

```bash
psql -h localhost -p 6433 -U app_user app
```

To see what PgBouncer is doing, connect to its admin console and run `SHOW POOLS;` or `SHOW SERVERS;`:

```bash
psql -h localhost -p 6433 -U pgbouncer_admin pgbouncer
```

Locks taken through transaction mode stay on PgBouncer's server connections after you disconnect, as the article explains. To start from a clean state, run `KILL app;` and then `RESUME app;` in the admin console, or restart the containers.

Stop everything with:

```bash
docker compose down -v
```

## Running the tests

You need Docker and Node.js 22 or newer.

```bash
npm install
npm test
```

The tests start the same `docker-compose.yml` with [Testcontainers](https://node.testcontainers.org/), on the same ports, so stop your own `docker compose up` first. `npm test` runs:

- `npm run test:unit`: the lock key hash and a check that every SQL query and PgBouncer setting quoted in the article is used by the code,
- `npm run test:int`: the scenarios from the article,
- `npm run test:e2e`: two leader election nodes running as separate processes.

`npm run build` type-checks the code, and `npm run lint` runs ESLint and Prettier.

## Benchmarks

```bash
npm run bench
npm run race
```

`npm run bench` starts the containers, runs pgbench in both modes and writes [bench/results.md](bench/results.md), together with the hardware it ran on. Set `DURATION` (in seconds, 30 by default) to change the length of each run.

`npm run race` needs the containers to be running. It runs workers competing for the same advisory lock, ten times for each setup, and prints how often two of them believed they held the lock at the same time. [bench/race-results.md](bench/race-results.md) is its output, quoted in the article.

Treat the numbers as indicative. They come from a laptop and Docker, not from a tuned production setup.
