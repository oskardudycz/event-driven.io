import type { BuildContract } from './build-contract.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
  buildContractAdditions,
  compareBuildContracts,
  collectBuildContract,
  collectRedirectRules,
} from './build-contract.ts';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { temporaryDirectory } from '../tests/helpers/temporary-directory.ts';

const origin = 'https://event-driven.io';

function contract(slugs: string[], redirects: string[]): BuildContract {
  const routes = slugs.flatMap((slug) => [`/en/${slug}/`, `/pl/${slug}/`]);
  const urls = slugs.map((slug) => `${origin}/en/${slug}/`);
  return {
    schemaVersion: 1,
    pageCount: routes.length,
    routes,
    redirects,
    sitemapUrls: urls,
    feedEntries: { 'rss.xml': urls, 'newsletter-pl-rss.xml': [] },
  };
}

const baseline = contract(['existing'], ['/old /en/existing/ 301']);

test('publication contracts read HTML routes without framework page data', () => {
  const directory = temporaryDirectory('build-contract-');
  for (const file of [
    'en/index.html',
    'pl/article/index.html',
    '404.html',
    '_gatsby/slices/footer.html',
    'page-data/404.html/index.html',
  ]) {
    mkdirSync(join(directory, file, '..'), { recursive: true });
    writeFileSync(join(directory, file), '<!doctype html><html></html>');
  }
  writeFileSync(
    join(directory, '_redirects'),
    '# language before fallback\n/old /pl/ 301 Language=pl\n/old /en/ 301\n',
  );
  writeFileSync(join(directory, 'sitemap-index.xml'), '<sitemapindex/>');
  writeFileSync(
    join(directory, 'sitemap-0.xml'),
    `<urlset><url><loc>${origin}/en/</loc></url></urlset>`,
  );
  for (const file of ['rss.xml', 'newsletter-pl-rss.xml'])
    writeFileSync(join(directory, file), '<rss/>');
  const actual = collectBuildContract(directory);
  assert.deepEqual(actual.routes, ['/404.html', '/en/', '/pl/article/']);
  assert.deepEqual(actual.sitemapUrls, [`${origin}/en/`]);
  assert.equal(actual.pageCount, 3);
  assert.deepEqual(collectRedirectRules(directory), [
    '/old /pl/ 301 Language=pl',
    '/old /en/ 301',
  ]);
});

test('a new article passes the contract and is reported as an addition', () => {
  const published = contract(
    ['existing', 'new-article'],
    ['/old /en/existing/ 301'],
  );

  assert.deepEqual(compareBuildContracts(baseline, published), []);
  assert.deepEqual(buildContractAdditions(baseline, published), [
    'Routes added: /en/new-article/, /pl/new-article/',
    `Sitemap URLs added: ${origin}/en/new-article/`,
    `rss.xml entries added: ${origin}/en/new-article/`,
  ]);
});

test('missing routes, redirects, sitemap URLs and feed entries fail the contract', () => {
  const regressed = contract([], []);

  assert.deepEqual(compareBuildContracts(baseline, regressed), [
    'Routes missing: /en/existing/, /pl/existing/',
    'Redirects missing: /old /en/existing/ 301',
    `Sitemap URLs missing: ${origin}/en/existing/`,
    `rss.xml entries missing: ${origin}/en/existing/`,
  ]);
  assert.deepEqual(buildContractAdditions(baseline, regressed), []);
});

test('a changed contract schema fails the contract', () => {
  assert.deepEqual(
    compareBuildContracts(baseline, { ...baseline, schemaVersion: 2 }),
    ['Build-contract schema changed from 1 to 2'],
  );
});
