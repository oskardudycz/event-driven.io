import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    clearMocks: true,
    update: 'none',
    attachmentsDir: 'visual-artifacts/components',
    // Tooling fixtures spawn linters; generated checks parse the complete site.
    // Keep memory bounded and output attributable to one suite at a time.
    fileParallelism: false,
    testTimeout: 30000,
    projects: [
      {
        plugins: [react()],
        publicDir: resolve('static'),
        css: { modules: { localsConvention: 'camelCaseOnly' } },
        test: {
          name: 'browser',
          sequence: { groupOrder: 2 },
          include: ['{src,tests}/**/*.browser.test.tsx'],
          setupFiles: ['tests/helpers/browser/component-setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ contextOptions: { deviceScaleFactor: 1 } }),
            instances: [{ browser: 'chromium' }],
            viewport: { width: 1440, height: 900 },
            trace: {
              mode: 'retain-on-failure',
              tracesDir: 'visual-artifacts/components/traces',
            },
            screenshotDirectory: resolve(
              'visual-artifacts/components/failures',
            ),
            expect: {
              toMatchScreenshot: {
                comparatorOptions: {
                  threshold: 0.2,
                  allowedMismatchedPixelRatio: 0.03,
                },
                screenshotOptions: { animations: 'disabled', scale: 'device' },
                resolveScreenshotPath: ({ root, arg, ext }) =>
                  resolve(
                    root,
                    'tests/fixtures/visual/components',
                    `${arg}${ext}`,
                  ),
              },
            },
          },
        },
      },
      {
        test: {
          name: 'unit',
          sequence: { groupOrder: 0 },
          environment: 'node',
          include: ['{astro,src,scripts,import,tests}/**/*.unit.test.ts'],
        },
      },
      {
        plugins: [react()],
        test: {
          name: 'integration',
          sequence: { groupOrder: 1 },
          environment: 'node',
          // Node-owned Markdown tools use native Node CommonJS interop.
          deps: { interopDefault: false },
          include: ['{astro,src,scripts,import,tests}/**/*.int.test.{ts,tsx}'],
        },
      },
      {
        test: {
          name: 'generated',
          sequence: { groupOrder: 3 },
          environment: 'node',
          include: ['tests/**/*.generated.test.ts'],
        },
      },
    ],
  },
});
