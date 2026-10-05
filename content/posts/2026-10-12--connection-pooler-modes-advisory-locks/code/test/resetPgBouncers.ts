import { beforeEach } from 'vitest';
import { ports, resetPgBouncer } from '../src/connections';

// Locks taken through transaction mode outlive the test that took them,
// as they stay on PgBouncer's server connections. Each test starts with new ones.
beforeEach(async () => {
  await Promise.all(
    [ports.session, ports.transaction, ports.timeouts].map(resetPgBouncer),
  );
});
