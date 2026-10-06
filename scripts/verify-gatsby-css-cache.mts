import assert from 'node:assert/strict';
import { mkdtempSync, openSync, closeSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import cheerio from 'cheerio';
import { checkCssBrowser } from './check-css-browser.mts';

// Opt-in integration check: change only a declaration, keeping every CSS Module
// export and all publication sources unchanged. Always rebuild restored styles.
const file = 'src/components/Post/NextPrev.module.css';
const original = readFileSync(file, 'utf8');
const logs = mkdtempSync(join(tmpdir(), 'gatsby-css-cache-'));
const page = 'public/en/introduction_to_event_sourcing/index.html';
function build(label: string) {
  const log = join(logs, `${label}.log`);
  const fd = openSync(log, 'w');
  console.log(`Building ${label}; log: ${log}`);
  try {
    const result = spawnSync('yarn', ['build'], {
      stdio: ['ignore', fd, fd],
      env: {
        ...process.env,
        GATSBY_CPU_COUNT: process.env.GATSBY_CPU_COUNT || '4',
        GATSBY_FEEDBACK_DISABLED: '1',
        GATSBY_TELEMETRY_DISABLED: '1',
      },
    });
    assert.equal(result.status, 0, `Build failed; inspect ${log}`);
  } finally {
    closeSync(fd);
  }
  const result = spawnSync(
    process.execPath,
    ['--test', '--test-isolation=none', 'tests/css-build.test.mts'],
    {
      stdio: 'inherit',
    },
  );
  assert.equal(result.status, 0, `${label} produced obsolete or inconsistent CSS`);
}
function inlineStyles() {
  const $ = cheerio.load(readFileSync(page, 'utf8'));
  return $('style[data-href]')
    .map((_, el) => $(el).text())
    .get()
    .join('\n');
}
build('baseline');
const baseline = inlineStyles();
const baselineColor = await checkCssBrowser();
const probe = '.date { color: rgb(1, 2, 3); }';
try {
  writeFileSync(file, `${original}\n${probe}\n`);
  build('css-only-change');
  assert.notEqual(inlineStyles(), baseline, 'Warm build ignored a CSS-only edit');
  assert.match(inlineStyles(), /color:(?:#010203|rgb\(1,\s*2,\s*3\))/);
  await checkCssBrowser('rgb(1, 2, 3)');
} finally {
  writeFileSync(file, original);
  build('restored');
}
assert.equal(inlineStyles(), baseline, 'Warm build did not restore the original CSS');
await checkCssBrowser(baselineColor);
console.log('CSS-only modification and restoration passed across all generated pages.');
