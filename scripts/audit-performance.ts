type LighthouseReport = {
  lighthouseVersion: string;
  runtimeError?: { message: string };
  finalDisplayedUrl: string;
  categories: Record<string, { score: number | null }>;
  audits: Record<
    string,
    {
      id: string;
      score: number | null;
      scoreDisplayMode: string;
      numericValue?: number;
    }
  >;
};
import { integerOption } from './cli-options.ts';
import { parseArgs } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const { values } = parseArgs({
  options: {
    'base-url': { type: 'string', default: 'http://127.0.0.1:9000' },
    runs: { type: 'string', default: '3' },
    page: { type: 'string' },
    label: { type: 'string', default: 'baseline' },
    output: { type: 'string', default: 'report/performance' },
    'lighthouse-bin': { type: 'string' },
    'block-pattern': { type: 'string', multiple: true, default: [] },
    help: { type: 'boolean' },
  },
});
if (values.help) {
  console.log(
    'Usage: yarn audit:performance --base-url URL [--runs 3] [--page /en/] [--label baseline] [--output report/performance] [--lighthouse-bin /path/to/lighthouse/cli/index.js] [--block-pattern *disqus*]',
  );
  process.exit(0);
}
const blockedPatterns = values['block-pattern'];
const base = new URL(values['base-url']);
if (!['http:', 'https:'].includes(base.protocol))
  throw new Error('Use an HTTP(S) site URL');
const runs = integerOption(values.runs, '--runs', 1, 10);
const pages = values.page
  ? [values.page]
  : ['/en/', '/en/introduction_to_event_sourcing/'];
if (pages.some((page) => !page.startsWith('/') || page.startsWith('//')))
  throw new Error('--page must be a path on the selected site');
const label = values.label.replace(/[^a-zA-Z0-9_-]/g, '_');
const output = path.resolve(values.output, label);
await fs.mkdir(output, { recursive: true });
// Playwright owns Chrome profiles; Lighthouse attaches to its debugging port.
// This avoids chrome-launcher's WSL/Windows profile-path detection.
const temporaryRoot = await fs.mkdtemp(
  path.join(
    process.platform === 'win32' ? os.tmpdir() : '/tmp',
    'event-driven-audit-',
  ),
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

function run(command: string, arguments_: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, arguments_, {
      cwd: temporaryRoot,
      env: environment,
      stdio: 'inherit',
      shell: false,
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`Audit exited with code ${code}`)),
    );
  });
}
async function freePort() {
  const server = net.createServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Expected a TCP listener address');
  const port = address.port;
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
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
        const file = path.join(
          output,
          `${page.replace(/[^a-zA-Z0-9]+/g, '_')}-${attempt}.json`,
        );
        const auditArguments = [
          new URL(page, base).href,
          `--port=${port}`,
          '--output=json',
          `--output-path=${file}`,
          '--quiet',
          ...blockedPatterns.map(
            (pattern) => `--blocked-url-patterns=${pattern}`,
          ),
        ];
        const binary = values['lighthouse-bin'];
        if (binary)
          await run(process.execPath, [
            path.resolve(binary),
            ...auditArguments,
          ]);
        else
          await run(process.platform === 'win32' ? 'npm.cmd' : 'npm', [
            'exec',
            '--yes',
            '--package=lighthouse@13.5.0',
            '--',
            'lighthouse',
            ...auditArguments,
          ]);
        const report = JSON.parse(
          await fs.readFile(file, 'utf8'),
        ) as LighthouseReport;
        if (report.lighthouseVersion !== '13.5.0')
          throw new Error(
            'Expected Lighthouse 13.5.0; comparison requires the pinned version',
          );
        if (report.runtimeError) throw new Error(report.runtimeError.message);
        results.push({
          page,
          attempt,
          lighthouseVersion: report.lighthouseVersion,
          browserVersion: browser.version(),
          finalUrl: report.finalDisplayedUrl,
          scores: Object.fromEntries(
            Object.entries(report.categories).map(([name, value]) => [
              name,
              value.score,
            ]),
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
                audit.score !== null &&
                audit.score < 1 &&
                audit.scoreDisplayMode !== 'informative',
            )
            .map((audit) => audit.id),
        });
        await fs.writeFile(
          path.join(output, 'summary.json'),
          JSON.stringify(
            { baseUrl: base.href, runs, blockedPatterns, results },
            null,
            2,
          ),
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
console.log(
  `Compare median metrics across ${runs} runs per page; reports: ${output}`,
);
