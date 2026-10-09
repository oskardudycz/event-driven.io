import { parseArgs } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import cheerio from 'cheerio';
import { siteOrigin } from './indexing-build-verifier.ts';

const { values } = parseArgs({
  options: {
    'base-url': { type: 'string', default: siteOrigin },
    'urls-file': { type: 'string' },
    output: { type: 'string', default: 'report/indexing/live.json' },
    help: { type: 'boolean' },
  },
});
if (values.help) {
  console.log(
    'Usage: yarn audit:indexing [--base-url https://event-driven.io] [--urls-file urls.json] [--output report/indexing/live.json]\nChecks robots, every sitemap URL, canonicals, reciprocal alternates and real 404s. Optional JSON: an array of reported URL strings. Read-only; sends no indexing requests.',
  );
  process.exit(0);
}
const base = new URL(values['base-url']);
if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password)
  throw new Error('Use an HTTP(S) site origin without credentials');
const output = resolve(values.output);
const failures: string[] = [];
type ResponseRecord = {
  requested: string;
  url: string;
  status: number;
  hops: { url: string; status: number; location: string | null }[];
  contentType: string;
  robotsHeader: string;
  body: string;
};
const fetched = new Map<string, Promise<ResponseRecord>>();
const allowed = (url: URL) =>
  !url.username &&
  !url.password &&
  (url.origin === base.origin ||
    (base.origin === siteOrigin &&
      ['event-driven.io', 'www.event-driven.io'].includes(url.hostname) &&
      ['http:', 'https:'].includes(url.protocol)));
function get(path: string): Promise<ResponseRecord> {
  let input = new URL(path, base.origin);
  // Preview HTML should still declare production canonicals; fetch those
  // documents from the selected preview rather than crossing deployments.
  if (input.origin === siteOrigin)
    input = new URL(`${input.pathname}${input.search}${input.hash}`, base.origin);
  if (!allowed(input)) throw new Error(`URL outside audited origin: ${path}`);
  if (fetched.has(input.href)) return fetched.get(input.href)!;
  const requested = input.href;
  const request = (async () => {
    let url = input;
    const hops: ResponseRecord['hops'] = [];
    for (let hop = 0; hop < 8; hop++) {
      const response = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(20000),
        headers: { 'User-Agent': 'EventDrivenIO-IndexingAudit/1.0' },
      });
      const location = response.headers.get('location');
      hops.push({ url: url.href, status: response.status, location });
      if ([301, 302, 303, 307, 308].includes(response.status) && location) {
        await response.body?.cancel();
        const next = new URL(location, url);
        if (!allowed(next)) throw new Error(`Cross-origin redirect: ${url} → ${next}`);
        url = next;
        continue;
      }
      return {
        requested,
        url: url.href,
        status: response.status,
        hops,
        contentType: response.headers.get('content-type') || '',
        robotsHeader: response.headers.get('x-robots-tag') || '',
        body: await response.text(),
      };
    }
    throw new Error(`Redirect loop or excessive chain: ${requested}`);
  })();
  fetched.set(requested, request);
  return request;
}
function metadata(response: ResponseRecord) {
  const $ = cheerio.load(response.body);
  return {
    canonical: $('head link[rel="canonical"]').attr('href'),
    canonicalCount: $('head link[rel="canonical"]').length,
    noIndex: /\bnoindex\b/i.test(
      `${$('meta[name="robots"]').attr('content') || ''} ${response.robotsHeader}`,
    ),
    language: $('html').attr('lang'),
    headingCount: $('h1').length,
    alternates: $('head link[rel="alternate"][hreflang]')
      .map((_, element) => ({
        language: $(element).attr('hreflang'),
        href: $(element).attr('href'),
      }))
      .get(),
  };
}
async function pool<T>(values: T[], run: (_value: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(3, values.length) }, async () => {
      while (next < values.length) {
        const value = values[next++];
        try {
          await run(value);
        } catch (error) {
          failures.push(`${String(value)}: ${String(error)}`);
        }
      }
    }),
  );
}
const robots = await get('/robots.txt');
if (
  robots.status !== 200 ||
  !robots.body.includes(`Sitemap: ${siteOrigin}/sitemap/sitemap-index.xml`)
)
  failures.push('robots.txt does not serve the expected sitemap declaration');
const sitemapIndex = await get('/sitemap/sitemap-index.xml');
const locations = (body: string) =>
  [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (sitemapIndex.status !== 200 || !/xml/.test(sitemapIndex.contentType))
  failures.push('Sitemap index is not HTTP 200 XML');
const urls: string[] = [];
for (const sitemapUrl of locations(sitemapIndex.body)) {
  const response = await get(sitemapUrl);
  if (response.status !== 200 || !/xml/.test(response.contentType))
    failures.push(`Invalid child sitemap: ${sitemapUrl}`);
  urls.push(...locations(response.body));
}
if (!urls.length || new Set(urls).size !== urls.length)
  failures.push('Empty or duplicate sitemap URLs');
await pool(urls, async (url) => {
  const response = await get(url);
  const page = metadata(response);
  if (response.status !== 200 || response.hops.length !== 1)
    failures.push(`${url}: sitemap destination redirects or returns ${response.status}`);
  if (!/text\/html/.test(response.contentType) || page.noIndex || page.headingCount !== 1)
    failures.push(`${url}: non-indexable HTML, noindex or invalid H1 count`);
  if (page.canonicalCount !== 1 || page.canonical !== url)
    failures.push(`${url}: inconsistent canonical ${page.canonical}`);
});
await pool(urls, async (url) => {
  const page = metadata(await get(url));
  for (const alternate of page.alternates) {
    if (!alternate.href) {
      failures.push(`${url}: empty alternate URL`);
      continue;
    }
    const response = await get(alternate.href);
    const target = metadata(response);
    if (response.status !== 200 || target.noIndex || target.canonical !== alternate.href)
      failures.push(`${url}: non-canonical alternate ${alternate.href}`);
    if (alternate.language !== 'x-default')
      for (const other of page.alternates)
        if (
          !target.alternates.some(
            (candidate) => candidate.language === other.language && candidate.href === other.href,
          )
        )
          failures.push(`${url}: non-reciprocal alternate ${alternate.language}/${other.language}`);
  }
});
for (const language of ['en', 'pl']) {
  const path = `/${language}/__indexing-audit-missing-page__/`;
  const response = await get(path);
  const page = metadata(response);
  if (
    response.status !== 404 ||
    response.hops.length !== 1 ||
    !page.noIndex ||
    page.language !== language
  )
    failures.push(`${path}: expected direct, localized, noindex HTTP 404`);
}
const reported: Record<string, unknown>[] = [];
if (values['urls-file']) {
  const inputs: unknown = JSON.parse(await readFile(resolve(values['urls-file']), 'utf8'));
  if (!Array.isArray(inputs) || inputs.some((url) => typeof url !== 'string'))
    throw new Error('--urls-file must contain a JSON array of URL strings');
  await pool(inputs as string[], async (url) => {
    const response = await get(url);
    const page = metadata(response);
    reported.push({
      url,
      status: response.status,
      final: response.url,
      hops: response.hops,
      ...page,
    });
    if (response.status >= 500) failures.push(`${url}: current server error ${response.status}`);
    // Reported 404s and canonical alternatives require interpretation; don't
    // count expected exclusions as errors or silently select replacement URLs.
  });
}
await mkdir(dirname(output), { recursive: true });
await writeFile(
  output,
  `${JSON.stringify({ capturedAt: new Date().toISOString(), baseUrl: base.origin, sitemapUrls: urls.length, failures, reported }, null, 2)}\n`,
);
console.log(`Checked ${urls.length} sitemap URLs; ${failures.length} failures. Report: ${output}`);
process.exitCode = failures.length ? 1 : 0;
