import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const option = (name: string, fallback: string) => {
  const index = args.indexOf(name);
  return index < 0 ? fallback : args[index + 1];
};
const base = new URL(option('--base-url', 'http://127.0.0.1:9000'));
const output = resolve(option('--output', 'report/fonts'));
const omitPolishPreloads = args.includes('--without-polish-preload');
const runs = Number(option('--runs', '3'));
if (!Number.isInteger(runs) || runs < 1 || runs > 10) throw new Error('Use 1–10 runs');
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const language of ['en', 'pl']) {
    for (let attempt = 1; attempt <= runs; attempt++) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      // Attribution run: isolate first-party font/layout costs from vendor scripts.
      await page.route('**/*', async (route) => {
        if (new URL(route.request().url()).origin !== base.origin) return route.abort();
        if (
          omitPolishPreloads &&
          route.request().isNavigationRequest() &&
          route.request().frame() === page.mainFrame()
        ) {
          const response = await route.fetch();
          const body = (await response.text()).replace(
            /<link\b(?=[^>]*rel="preload")(?=[^>]*href="[^"]*open-sans-latin-ext-)[^>]*>/g,
            '',
          );
          return route.fulfill({ response, body });
        }
        return route.continue();
      });
      await page.addInitScript(() => {
        const record = { shifts: [], switches: [], lcp: [] };
        (window as unknown as { fontProfile: typeof record }).fontProfile = record;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          })[]) {
            if (!entry.hadRecentInput)
              (record.shifts as unknown[]).push({ time: entry.startTime, value: entry.value });
          }
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            (record.lcp as unknown[]).push({ time: entry.startTime });
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new MutationObserver(() => {
          if (!document.body) return;
          (record.switches as unknown[]).push({
            time: performance.now(),
            bodyFont: getComputedStyle(document.body).fontFamily,
            headingWeight: document.querySelector('h1')
              ? getComputedStyle(document.querySelector('h1')!).fontWeight
              : null,
          });
        }).observe(document, {
          subtree: true,
          attributes: true,
          attributeFilter: ['data-font400', 'data-font600'],
        });
      });
      try {
        await page.goto(new URL(`/${language}/introduction_to_event_sourcing/`, base).href, {
          waitUntil: 'domcontentloaded',
        });
        await page.waitForFunction(
          () =>
            document.documentElement.dataset.font400 === 'loaded' &&
            document.documentElement.dataset.font600 === 'loaded',
        );
        await page.waitForTimeout(1000);
        results.push({
          language,
          attempt,
          ...(await page.evaluate(() => ({
            ...(window as unknown as { fontProfile: object }).fontProfile,
            resources: performance
              .getEntriesByType('resource')
              .filter((entry) => entry.name.includes('/fonts/'))
              .map((entry) => {
                const resource = entry as PerformanceResourceTiming;
                return {
                  url: resource.name,
                  start: resource.startTime,
                  end: resource.responseEnd,
                  bytes: resource.transferSize,
                };
              }),
          }))),
        });
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
await writeFile(
  resolve(output, 'summary.json'),
  JSON.stringify(
    {
      base: base.href,
      vendorBlocked: true,
      omitPolishPreloads,
      browser: browser.version(),
      results,
    },
    null,
    2,
  ),
);
console.log(
  `Font request/switch/CLS attribution saved to ${output}/summary.json (vendors blocked; not a full-page score)`,
);
