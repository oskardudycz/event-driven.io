import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['test/unit/**/*.unit.spec.ts'],
        },
      },
      {
        test: {
          name: 'int',
          environment: 'node',
          include: ['test/int/**/*.int.spec.ts'],
          globalSetup: ['test/globalSetup.ts'],
          setupFiles: ['test/resetPgBouncers.ts'],
          fileParallelism: false,
          hookTimeout: 120_000,
          testTimeout: 60_000,
        },
      },
      {
        test: {
          name: 'e2e',
          environment: 'node',
          include: ['test/e2e/**/*.e2e.spec.ts'],
          globalSetup: ['test/globalSetup.ts'],
          setupFiles: ['test/resetPgBouncers.ts'],
          fileParallelism: false,
          hookTimeout: 120_000,
          testTimeout: 60_000,
        },
      },
    ],
  },
});
