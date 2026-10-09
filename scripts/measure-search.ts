import ts from 'typescript';
import type MiniSearch from 'minisearch';
import type { Options } from 'minisearch';
import type { SearchDocument } from '../src/search/types.ts';
type Measurement = {
  initializationMs: number;
  maxQueryMs: number;
  documents: number;
  retainedHeapBytes: number;
};
type BrowserScope = Window & {
  MiniSearch: typeof MiniSearch;
  searchOptions: Options<SearchDocument>;
};
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const manifest = JSON.parse(
  readFileSync('public/search-index/manifest.json', 'utf8'),
) as Record<'en' | 'pl', string>;
const browser = await chromium.launch();
const metrics: Record<
  string,
  {
    cpuSlowdown: number;
    runs: Measurement[];
    medianInitializationMs: number;
    medianMaxQueryMs: number;
    medianRetainedHeapBytes: number;
  }
> = {};
try {
  for (const lang of ['en', 'pl'] as const) {
    const measurements: Measurement[] = [];
    for (let run = 0; run < 3; run++) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
      });
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      // Load the real options as a native browser module before measuring.
      await page.route('https://search-profile.invalid/options.mjs', (route) =>
        route.fulfill({
          body: ts.transpileModule(
            readFileSync('src/search/options.ts', 'utf8'),
            {
              compilerOptions: {
                module: ts.ModuleKind.ESNext,
                target: ts.ScriptTarget.ESNext,
              },
            },
          ).outputText,
          contentType: 'text/javascript',
        }),
      );
      await page.route(
        'https://search-profile.invalid/minisearch.js',
        (route) =>
          route.fulfill({
            path: 'node_modules/minisearch/dist/umd/index.js',
            contentType: 'text/javascript',
          }),
      );
      await page.route('https://search-profile.invalid/', (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: `<script src="/minisearch.js"></script><script type="module">
            import { indexOptions } from '/options.mjs';
            window.searchOptions = indexOptions;
          </script>`,
        }),
      );
      await page.goto('https://search-profile.invalid/', { waitUntil: 'load' });
      await cdp.send('Performance.enable');
      await cdp.send('HeapProfiler.collectGarbage');
      const before = await cdp.send('Performance.getMetrics');
      const measured = await page.evaluate(
        async (json) => {
          const scope = window as unknown as BrowserScope;
          const started = performance.now();
          const measuredIndex =
            await scope.MiniSearch.loadJSONAsync<SearchDocument>(
              json,
              scope.searchOptions,
            );
          const initialized = performance.now();
          const queryTimes = [
            'event sourcing',
            'architecure',
            'appendToStream',
            'zdarzenia',
          ].map((query) => {
            const start = performance.now();
            measuredIndex.search(query);
            return performance.now() - start;
          });
          return {
            initializationMs: initialized - started,
            maxQueryMs: Math.max(...queryTimes),
            documents: measuredIndex.documentCount,
          };
        },
        readFileSync(join('public', manifest[lang]), 'utf8'),
      );
      await cdp.send('HeapProfiler.collectGarbage');
      const after = await cdp.send('Performance.getMetrics');
      const heap = (data: { metrics: { name: string; value: number }[] }) =>
        data.metrics.find((metric) => metric.name === 'JSHeapUsedSize')!.value;
      measurements.push({
        ...measured,
        retainedHeapBytes: heap(after) - heap(before),
      });
      await page.close();
    }
    const median = (key: keyof Measurement) => {
      const value = measurements
        .map((item) => item[key])
        .sort((a, b) => a - b)[1];
      if (value === undefined)
        throw new Error('Expected three search measurements');
      return value;
    };
    metrics[lang] = {
      cpuSlowdown: 4,
      runs: measurements,
      medianInitializationMs: median('initializationMs'),
      medianMaxQueryMs: median('maxQueryMs'),
      medianRetainedHeapBytes: median('retainedHeapBytes'),
    };
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify(metrics, null, 2));
