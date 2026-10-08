import { defineConfig } from '@playwright/test';

const baseURL = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:9000';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 60000,
  forbidOnly: !!process.env.CI,
  updateSnapshots: process.env.UPDATE_VISUAL_SNAPSHOTS === '1' ? 'all' : 'none',
  snapshotPathTemplate: '{testDir}/../fixtures/visual/{arg}{ext}',
  outputDir: 'visual-artifacts/results',
  reporter: [['list'], ['html', { outputFolder: 'visual-artifacts/report', open: 'never' }]],
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
  webServer: process.env.VISUAL_BASE_URL
    ? undefined
    : {
        command: 'env -u DEBUG yarn serve -H 127.0.0.1 -p 9000',
        url: `${baseURL}/en/articles/`,
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
      },
});
