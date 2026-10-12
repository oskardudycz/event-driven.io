import type { BuildContract } from '../scripts/build-contract.ts';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildContractAdditions,
  compareBuildContracts,
} from '../scripts/build-contract.ts';

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

void test('a new article passes the contract and is reported as an addition', () => {
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

void test('missing routes, redirects, sitemap URLs and feed entries fail the contract', () => {
  const regressed = contract([], []);

  assert.deepEqual(compareBuildContracts(baseline, regressed), [
    'Routes missing: /en/existing/, /pl/existing/',
    'Redirects missing: /old /en/existing/ 301',
    `Sitemap URLs missing: ${origin}/en/existing/`,
    `rss.xml entries missing: ${origin}/en/existing/`,
  ]);
  assert.deepEqual(buildContractAdditions(baseline, regressed), []);
});

void test('a changed contract schema fails the contract', () => {
  assert.deepEqual(
    compareBuildContracts(baseline, { ...baseline, schemaVersion: 2 }),
    ['Build-contract schema changed from 1 to 2'],
  );
});
