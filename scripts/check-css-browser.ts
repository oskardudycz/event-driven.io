import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

// Serve the current output through Playwright routes, without a shared preview
// server or live analytics/widgets. Local Gatsby scripts still hydrate normally.
export async function checkCssBrowser(expectedColor?: string) {
  const browser = await chromium.launch();
  const root = resolve('public');
  const origin = 'http://css-cache.test';
  const types: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  const colors: string[] = [];
  try {
    for (const javaScriptEnabled of [false, true]) {
      const context = await browser.newContext({ javaScriptEnabled });
      await context.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.origin !== origin) return route.abort();
        let file = resolve(root, `.${decodeURIComponent(url.pathname)}`);
        if (!file.startsWith(`${root}${sep}`)) return route.abort();
        if (url.pathname.endsWith('/')) file = resolve(file, 'index.html');
        try {
          await route.fulfill({
            body: await readFile(file),
            contentType: types[extname(file)] || 'application/octet-stream',
          });
        } catch {
          await route.fulfill({ status: 404, body: 'Missing local asset' });
        }
      });
      const page = await context.newPage();
      await page.goto(`${origin}/en/introduction_to_event_sourcing/`, {
        waitUntil: 'load',
      });
      if (javaScriptEnabled)
        await page.waitForFunction(() => document.documentElement.dataset.font400 === 'loaded');
      const color = await page
        .locator('nav.links time')
        .first()
        .evaluate((element) => {
          return getComputedStyle(element).color;
        });
      if (expectedColor) assert.equal(color, expectedColor);
      colors.push(color);
      await context.close();
    }
    assert.equal(colors[0], colors[1], 'Hydration changed the warm-build date color');
    return colors[0];
  } finally {
    await browser.close();
  }
}
