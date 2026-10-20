export type BuildContract = {
  schemaVersion: number;
  pageCount: number;
  routes: string[];
  redirects: string[];
  sitemapUrls: string[];
  feedEntries: Record<string, string[]>;
};
import fs from 'fs';
import path from 'path';
import { publishedPages } from './published-pages.ts';

const FEED_FILES = ['rss.xml', 'newsletter-pl-rss.xml'];

function readRequired(publicDirectory: string, relativePath: string) {
  const filePath = path.join(publicDirectory, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing generated file: public/${relativePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function extractXmlValues(xml: string, tagName: string) {
  const pattern = new RegExp(
    `<${tagName}(?:\\s[^>]*)?>([^<]+)</${tagName}>`,
    'g',
  );
  return Array.from(xml.matchAll(pattern), (match) =>
    (match[1] || '').replace(/&amp;/g, '&'),
  );
}

function collectRoutes(publicDirectory: string) {
  return uniqueSorted(
    publishedPages(publicDirectory).map(({ route }) => route),
  );
}

export function collectRedirectRules(publicDirectory: string): string[] {
  return readRequired(publicDirectory, '_redirects')
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .filter((line) => line && !line.startsWith('#'));
}

function collectRedirects(publicDirectory: string) {
  return uniqueSorted(collectRedirectRules(publicDirectory));
}

function collectSitemapUrls(publicDirectory: string) {
  const sitemapDirectory = fs.existsSync(
    path.join(publicDirectory, 'sitemap-index.xml'),
  )
    ? publicDirectory
    : path.join(publicDirectory, 'sitemap');
  return uniqueSorted(
    fs
      .readdirSync(sitemapDirectory)
      .map((file) => path.join(sitemapDirectory, file))
      .filter((filePath) => /^sitemap-\d+\.xml$/.test(path.basename(filePath)))
      .flatMap((filePath) =>
        extractXmlValues(fs.readFileSync(filePath, 'utf8'), 'loc'),
      ),
  );
}

function collectFeedEntries(publicDirectory: string) {
  return Object.fromEntries(
    FEED_FILES.map((feedFile) => [
      feedFile,
      uniqueSorted(
        extractXmlValues(readRequired(publicDirectory, feedFile), 'guid'),
      ),
    ]),
  );
}

function collectBuildContract(publicDirectory: string) {
  const routes = collectRoutes(publicDirectory);
  return {
    schemaVersion: 1,
    pageCount: routes.length,
    routes,
    redirects: collectRedirects(publicDirectory),
    sitemapUrls: collectSitemapUrls(publicDirectory),
    feedEntries: collectFeedEntries(publicDirectory),
  };
}

type ComparedValues = { label: string; expected: string[]; actual: string[] };

function comparedValues(
  expected: BuildContract,
  actual: BuildContract,
): ComparedValues[] {
  const feedFiles = uniqueSorted([
    ...Object.keys(expected.feedEntries),
    ...Object.keys(actual.feedEntries),
  ]);
  return [
    { label: 'Routes', expected: expected.routes, actual: actual.routes },
    {
      label: 'Redirects',
      expected: expected.redirects,
      actual: actual.redirects,
    },
    {
      label: 'Sitemap URLs',
      expected: expected.sitemapUrls,
      actual: actual.sitemapUrls,
    },
    ...feedFiles.map((feedFile) => ({
      label: `${feedFile} entries`,
      expected: expected.feedEntries[feedFile] || [],
      actual: actual.feedEntries[feedFile] || [],
    })),
  ];
}

function absentFrom(values: string[], reference: string[]) {
  const referenceSet = new Set(reference);
  return values.filter((value) => !referenceSet.has(value));
}

function describeValues(label: string, change: string, values: string[]) {
  return values.length > 0 ? [`${label} ${change}: ${values.join(', ')}`] : [];
}

function compareBuildContracts(expected: BuildContract, actual: BuildContract) {
  const failures: string[] = [];

  if (expected.schemaVersion !== actual.schemaVersion) {
    failures.push(
      `Build-contract schema changed from ${expected.schemaVersion} to ${actual.schemaVersion}`,
    );
  }

  for (const values of comparedValues(expected, actual)) {
    failures.push(
      ...describeValues(
        values.label,
        'missing',
        absentFrom(values.expected, values.actual),
      ),
    );
  }

  return failures;
}

function buildContractAdditions(
  expected: BuildContract,
  actual: BuildContract,
) {
  return comparedValues(expected, actual).flatMap((values) =>
    describeValues(
      values.label,
      'added',
      absentFrom(values.actual, values.expected),
    ),
  );
}

export { buildContractAdditions, collectBuildContract, compareBuildContracts };
