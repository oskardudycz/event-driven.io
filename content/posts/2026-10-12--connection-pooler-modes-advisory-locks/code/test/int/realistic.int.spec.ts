import { describe, expect, it } from 'vitest';
import { ports } from '../../src/connections';
import { leaderElectionRace } from '../../src/leaderElectionRace';

describe('R1: workers competing for the leadership through a bigger pool', () => {
  it('in session mode, two workers never believe they are the leader at the same time', async () => {
    const result = await leaderElectionRace({
      port: ports.session,
      database: 'app',
    });

    expect(result.acquisitions).toBeGreaterThan(0);
    expect(result.overlaps).toBe(0);
    expect(result.failedUnlocks).toBe(0);
  });

  it('in transaction mode with a pool of 20 server connections, they do', async () => {
    const result = await leaderElectionRace({
      port: ports.transaction,
      database: 'app_realistic',
    });

    expect(result.acquisitions).toBeGreaterThan(0);
    expect(result.overlaps).toBeGreaterThan(0);
  });
});
