import { SQL } from '@event-driven-io/dumbo';

export type LockResult = { locked: boolean; pid: number };

export const tryLock = SQL`SELECT pg_try_advisory_lock(42) AS locked, pg_backend_pid() AS pid;`;

export type UnlockResult = { unlocked: boolean; pid: number };

export const unlock = SQL`SELECT pg_advisory_unlock(42) AS unlocked, pg_backend_pid() AS pid;`;

export const tryXactLock = SQL`SELECT pg_try_advisory_xact_lock(42) AS locked, pg_backend_pid() AS pid;`;

export const advisoryLocks = SQL`SELECT pid, classid, objid, objsubid, mode, granted
FROM pg_locks
WHERE locktype = 'advisory';`;
