import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index < 0 ? fallback : args[index + 1];
}
if (args.includes('--help')) {
  console.log(
    'Usage: yarn audit:performance --base-url URL [--runs 3] [--page /en/] [--label baseline] [--output report/performance] [--lighthouse-bin /path/to/lighthouse/cli/index.js]',
  );
  process.exit(0);
}
const base = new URL(option('--base-url', 'http://127.0.0.1:9000'));
const runs = Number(option('--runs', '3'));
if (!Number.isInteger(runs) || runs < 1 || runs > 10)
  throw new Error('--runs must be between 1 and 10');
const pages = args.includes('--page')
  ? [option('--page')]
  : ['/en/', '/en/introduction_to_event_sourcing/'];
if (pages.some((page) => !page.startsWith('/') || page.startsWith('//')))
  throw new Error('--page must be a path on the selected site');
const label = option('--label', 'baseline').replace(/[^a-zA-Z0-9_-]/g, '_');
const output = path.resolve(option('--output', 'report/performance'), label);
await fs.mkdir(output, { recursive: true });
// Playwright owns Chrome profiles; Lighthouse attaches to its debugging port.
// This avoids chrome-launcher's WSL/Windows profile-path detection.
const temporaryRoot = await fs.mkdtemp(
  path.join(process.platform === 'win32' ? os.tmpdir() : '/tmp', 'event-driven-audit-'),
);
const environment = {
  ...process.env,
  TMPDIR: temporaryRoot,
  TEMP: temporaryRoot,
  TMP: temporaryRoot,
};
process.env.TMPDIR = temporaryRoot;
process.env.TEMP = temporaryRoot;
process.env.TMP = temporaryRoot;

function run(command, arguments_) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, {
      cwd: temporaryRoot,
      env: environment,
      stdio: 'inherit',
      shell: false,
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`Audit exited with code ${code}`)),
    );
  });
}
async function freePort() {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}
const results = [];
try {
  for (const page of pages) {
    for (let attempt = 1; attempt <= runs; attempt++) {
      const port = await freePort();
      const browser = await chromium.launch({
        args: [`--remote-debugging-port=${port}`],
        env: environment,
      });
      try {
        const file = path.join(output, `${page.replace(/[^a-zA-Z0-9]+/g, '_')}-${attempt}.json`);
        const auditArguments = [
          new URL(page, base).href,
          `--port=${port}`,
          '--output=json',
          `--output-path=${file}`,
          '--quiet',
        ];
        const binary = option('--lighthouse-bin');
        if (binary) await run(process.execPath, [path.resolve(binary), ...auditArguments]);
        else
          await run(process.platform === 'win32' ? 'npm.cmd' : 'npm', [
            'exec',
            '--yes',
            '--package=lighthouse@13.5.0',
            '--',
            'lighthouse',
            ...auditArguments,
          ]);
        const report = JSON.parse(await fs.readFile(file, 'utf8'));
        if (report.lighthouseVersion !== '13.5.0')
          throw new Error('Expected Lighthouse 13.5.0; comparison requires the pinned version');
        if (report.runtimeError) throw new Error(report.runtimeError.message);
        results.push({
          page,
          attempt,
          lighthouseVersion: report.lighthouseVersion,
          browserVersion: browser.version(),
          finalUrl: report.finalDisplayedUrl,
          scores: Object.fromEntries(
            Object.entries(report.categories).map(([name, value]) => [name, value.score]),
          ),
          metrics: Object.fromEntries(
            [
              'first-contentful-paint',
              'largest-contentful-paint',
              'total-blocking-time',
              'cumulative-layout-shift',
              'total-byte-weight',
            ].map((name) => [name, report.audits[name]?.numericValue]),
          ),
          failedAudits: Object.values(report.audits)
            .filter(
              (audit) =>
                audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'informative',
            )
            .map((audit) => audit.id),
        });
        await fs.writeFile(
          path.join(output, 'summary.json'),
          JSON.stringify({ baseUrl: base.href, runs, results }, null, 2),
        );
        console.log(`Saved ${page}, run ${attempt}: ${file}`);
      } finally {
        await browser.close();
      }
    }
  }
} finally {
  await fs.rm(temporaryRoot, { recursive: true, force: true });
}
console.log(`Compare median metrics across ${runs} runs per page; reports: ${output}`);
