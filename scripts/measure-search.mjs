import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const manifest = JSON.parse(readFileSync('public/search-index/manifest.json'));
const options =
  readFileSync('src/search/options.mjs', 'utf8').replace(/export /g, '') +
  '\nwindow.searchOptions = indexOptions;';
const browser = await chromium.launch();
const metrics = {};
try {
  for (const lang of ['en', 'pl']) {
    const measurements = [];
    for (let run = 0; run < 3; run++) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.addScriptTag({ path: 'node_modules/minisearch/dist/umd/index.js' });
      await page.addScriptTag({ content: options });
      await cdp.send('Performance.enable');
      await cdp.send('HeapProfiler.collectGarbage');
      const before = await cdp.send('Performance.getMetrics');
      const measured = await page.evaluate(
        async (json) => {
          const started = performance.now();
          window.measuredIndex = await window.MiniSearch.loadJSONAsync(json, window.searchOptions);
          const initialized = performance.now();
          const queryTimes = ['event sourcing', 'architecure', 'appendToStream', 'zdarzenia'].map(
            (query) => {
              const start = performance.now();
              window.measuredIndex.search(query);
              return performance.now() - start;
            },
          );
          return {
            initializationMs: initialized - started,
            maxQueryMs: Math.max(...queryTimes),
            documents: window.measuredIndex.documentCount,
          };
        },
        readFileSync(join('public', manifest[lang]), 'utf8'),
      );
      await cdp.send('HeapProfiler.collectGarbage');
      const after = await cdp.send('Performance.getMetrics');
      const heap = (data) => data.metrics.find((metric) => metric.name === 'JSHeapUsedSize').value;
      measurements.push({ ...measured, retainedHeapBytes: heap(after) - heap(before) });
      await page.close();
    }
    const median = (key) => measurements.map((item) => item[key]).sort((a, b) => a - b)[1];
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
