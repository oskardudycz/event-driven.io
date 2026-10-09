import { integerOption } from './cli-options.mts';
import { parseArgs } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium, firefox } from 'playwright';

const { values } = parseArgs({
  options: {
    url: { type: 'string', default: 'http://127.0.0.1:9000/en/open-source-a-relict-a-charity-or/' },
    browser: { type: 'string', default: 'firefox' },
    seconds: { type: 'string', default: '15' },
    output: { type: 'string' },
    help: { type: 'boolean' },
  },
});
if (values.help) {
  console.log(
    'Usage: yarn audit:console [--url https://event-driven.io/en/open-source-a-relict-a-charity-or/] [--browser firefox|chromium] [--seconds 15] [--output report/browser-console/firefox.json]',
  );
  process.exit(0);
}
const url = new URL(values.url!);
if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Use an HTTP(S) page URL');
const browserName = values.browser!;
if (!['firefox', 'chromium'].includes(browserName)) throw new Error('Unsupported browser');
const seconds = integerOption(values.seconds!, '--seconds', 1, 60);
const output = resolve(values.output || `report/browser-console/${browserName}.json`);
const events: Record<string, unknown>[] = [];
const browser = await (browserName === 'firefox' ? firefox : chromium).launch();
try {
  // A fresh profile with no extensions; third-party requests remain enabled.
  const page = await browser.newPage();
  page.on('console', (message) => {
    events.push({
      kind: 'console',
      level: message.type(),
      text: message.text(),
      location: message.location(),
    });
  });
  page.on('pageerror', (error) => events.push({ kind: 'exception', stack: error.stack }));
  page.on('requestfailed', (request) => {
    events.push({ kind: 'request-failed', url: request.url(), failure: request.failure() });
  });
  const response = await page.goto(url.href, { waitUntil: 'domcontentloaded' });
  const comments = page.locator('#disqus_thread');
  if (await comments.count()) await comments.scrollIntoViewIfNeeded();
  // Bounded observation, not networkidle: ad/analytics requests may never settle.
  await page.waitForTimeout(seconds * 1000);
  const localFileReferences = await page.locator('[href],[src],[data]').evaluateAll((elements) =>
    elements.flatMap((element) =>
      ['href', 'src', 'data'].flatMap((attribute) => {
        const value = element.getAttribute(attribute);
        return value && /^\s*file:/i.test(value)
          ? [{ tag: element.tagName, attribute, value }]
          : [];
      }),
    ),
  );
  await mkdir(dirname(output), { recursive: true });
  await writeFile(
    output,
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        url: url.href,
        browser: browserName,
        version: browser.version(),
        status: response?.status(),
        language: await page.locator('html').getAttribute('lang'),
        frames: page.frames().map((frame) => frame.url()),
        localFileReferences,
        events,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`Saved ${events.length} browser events to ${output}`);
  // Vendor warnings remain visible in the report; this is a diagnostic, not a CI gate.
} finally {
  await browser.close();
}
