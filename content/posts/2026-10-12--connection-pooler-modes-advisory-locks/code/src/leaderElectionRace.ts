import { tryLock, unlock } from './advisoryLocks';
import type { LockResult, UnlockResult } from './advisoryLocks';
import { connect } from './connections';

export type LeaderElectionRaceOptions = {
  port: number;
  database: string;
  workers?: number;
  rounds?: number;
  workMs?: number;
};

export type LeaderElectionRaceResult = {
  acquisitions: number;
  overlaps: number;
  failedUnlocks: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const leaderElectionRace = async ({
  port,
  database,
  workers = 10,
  rounds = 50,
  workMs = 5,
}: LeaderElectionRaceOptions): Promise<LeaderElectionRaceResult> => {
  const result = { acquisitions: 0, overlaps: 0, failedUnlocks: 0 };
  const currentLeaders = new Set<number>();

  const worker = async (id: number) => {
    const client = await connect({ port, database });
    try {
      for (let round = 0; round < rounds; round++) {
        const [lock] = await client.query<LockResult>(tryLock);

        if (lock?.locked) {
          result.acquisitions++;
          if (currentLeaders.size > 0) result.overlaps++;

          currentLeaders.add(id);
          await sleep(workMs);
          currentLeaders.delete(id);

          const [unlocked] = await client.query<UnlockResult>(unlock);
          if (!unlocked?.unlocked) result.failedUnlocks++;
        }

        await sleep(Math.random() * workMs);
      }
    } finally {
      await client.close();
    }
  };

  await Promise.all(Array.from({ length: workers }, (_, id) => worker(id)));

  return result;
};
