import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

const development = process.env.SITE_TEST_MODE === 'development';
const port = process.env.SITE_TEST_PORT || (development ? '8001' : '9000');
const localURL = `http://127.0.0.1:${port}`;
const baseURL = process.env.VISUAL_BASE_URL || localURL;
const artifacts = resolve(
  import.meta.dirname,
  development ? '../visual-artifacts/development' : '../visual-artifacts',
);

export default defineConfig({
  testDir: resolve(import.meta.dirname, '..'),
  testMatch: ['src/components/**/*.e2e.spec.ts', 'tests/**/*.e2e.spec.ts'],
  testIgnore: ['**/content/**', '**/dist/**', '**/.cache/**'],
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
            ? `env -u DEBUG npm run dev -- --host 127.0.0.1 --port ${port}`
            : `env -u DEBUG npm run serve -- --port ${port}`,
          cwd: resolve(import.meta.dirname, '..'),
          ...(development ? { env: { ASTRO_DEV_BACKGROUND: '0' } } : {}),
          url: `${baseURL}/en/articles/`,
          reuseExistingServer: !process.env.CI,
          timeout: development ? 180000 : 30000,
        },
      }),
});
