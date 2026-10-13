import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

const development = process.env.GATSBY_TEST_MODE === 'development';
const localURL = development
  ? 'http://127.0.0.1:8001'
  : 'http://127.0.0.1:9000';
const baseURL = process.env.VISUAL_BASE_URL || localURL;
const artifacts = resolve(
  import.meta.dirname,
  development ? '../visual-artifacts/development' : '../visual-artifacts',
);

export default defineConfig({
  testDir: resolve(import.meta.dirname, '..'),
  testMatch: ['src/components/**/*.e2e.spec.ts', 'tests/**/*.e2e.spec.ts'],
  testIgnore: ['**/content/**', '**/public/**', '**/.cache/**'],
  workers: 1,
  ...(development ? { grep: /@dev/ } : {}),
  retries: 0,
  timeout: 60000,
  forbidOnly: !!process.env.CI,
  updateSnapshots: process.env.UPDATE_VISUAL_SNAPSHOTS === '1' ? 'all' : 'none',
  snapshotPathTemplate:
    '{testDir}/tests/fixtures/visual{/projectName}/{arg}{ext}',
  outputDir: `${artifacts}/results`,
  reporter: [
    ['list'],
    ['html', { outputFolder: `${artifacts}/report`, open: 'never' }],
  ],
  expect: {
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixelRatio: 0.03,
      animations: 'allow',
      scale: 'device',
    },
  },
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  ...(process.env.VISUAL_BASE_URL
    ? {}
    : {
        webServer: {
          command: development
            ? 'env -u DEBUG npm run dev -- -H 127.0.0.1 -p 8001'
            : 'env -u DEBUG npm run serve -- -H 127.0.0.1 -p 9000',
          cwd: resolve(import.meta.dirname, '..'),
          // Gatsby disables development query-on-demand in CI by default.
          // Exercise normal development behavior; production validates all pages.
          ...(development
            ? { env: { GATSBY_ENABLE_QUERY_ON_DEMAND_IN_CI: '1' } }
            : {}),
          url: `${baseURL}/en/articles/`,
          reuseExistingServer: !process.env.CI,
          timeout: development ? 180000 : 30000,
        },
      }),
});
