import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

export default defineConfig({
  testDir: import.meta.dirname,
  testMatch: '*.spec.ts',
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  updateSnapshots: process.env.UPDATE_VISUAL_SNAPSHOTS === '1' ? 'all' : 'none',
  snapshotPathTemplate: '{testDir}/../fixtures/visual/components/{arg}{ext}',
  outputDir: '../../visual-artifacts/components/results',
  reporter: [
    ['list'],
    [
      'html',
      { outputFolder: 'visual-artifacts/components/report', open: 'never' },
    ],
  ],
  expect: {
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixelRatio: 0.03,
      animations: 'disabled',
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:9001/',
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',
  },
  webServer: {
    command: 'npm run dev:components',
    cwd: resolve(import.meta.dirname, '../..'),
    url: 'http://127.0.0.1:9001/',
    reuseExistingServer: !process.env.CI,
  },
});
