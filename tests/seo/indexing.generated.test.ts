import type { BuildPageData } from '../helpers/build-output.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  verifyIndexingBuild,
  siteOrigin,
} from '../../scripts/indexing-build-verifier.ts';
import { builtRedirects } from '../helpers/redirects.ts';
import { collectBuildContract } from '../../scripts/build-contract.ts';

test('every generated canonical, sitemap URL and reciprocal alternate resolves consistently', () => {
  assert.deepEqual(verifyIndexingBuild('public'), []);
});

test('known legacy category queries use literal query conditions, with 404 fallbacks last', async () => {
  const redirects = await builtRedirects();
  const routes = new Set(collectBuildContract('public').routes);
  const queries = redirects.filter((rule) => rule.query.category);
  assert.ok(
    queries.length > 0,
    'Expected configured legacy category redirects',
  );
  for (const rule of queries) {
    assert.equal(rule.status, 301);
    assert.equal(rule.force, true);
    assert.ok(routes.has(rule.to), rule.to);
    assert.ok(rule.query.category);
    assert.ok(
      !/[%+]/.test(rule.query.category),
      'Match decoded values; do not double-encode',
    );
  }
  assert.equal(
    queries.find(
      (rule) =>
        rule.from === '/pl/category/' && rule.query.category === 'Postgres',
    )?.to,
    '/pl/articles/tag/postgre-sql/',
  );
  assert.deepEqual(
    redirects
      .slice(-3)
      .map(({ from, to, status, force }) => ({ from, to, status, force })),
    [
      { from: '/en/*', to: '/en/404/', status: 404, force: false },
      { from: '/pl/*', to: '/pl/404/', status: 404, force: false },
      { from: '/*', to: '/404.html', status: 404, force: false },
    ],
  );
});

test('confirmed reported aliases lead directly to a generated canonical article', () => {
  const rules = collectBuildContract('public').redirects;
  for (const [source, destination] of [
    ['/en/risk_of_ignoring_risks/', '/en/the_risk_of_ignoring_risks/'],
    [
      '/en/rebuilding_read_models_safely/',
      '/en/rebuilding_event_driven_read_models/',
    ],
    [
      '/2026/04/09/vibing-harness-and-ooda-loop/',
      '/en/vibing_harness_and_ooda_loops/',
    ],
  ]) {
    assert.ok(rules.includes(`${source} ${destination} 301`));
    assert.match(
      readFileSync(`public${destination}index.html`, 'utf8'),
      new RegExp(`href="${siteOrigin}${destination}"`),
    );
  }
});

test('case-normalized article routes retain feed GUIDs and Disqus thread identifiers', () => {
  const feed = readFileSync('public/rss.xml', 'utf8');
  for (const original of [
    '12_things_I_learned_on_last_pull_request_review',
    'how_to_do_snapshots_in_Marten',
    'integrating_Marten',
    'type_script_node_Js_event_sourcing',
  ]) {
    const route = `/en/${original.toLowerCase()}/`;
    const data = JSON.parse(
      readFileSync(`public/page-data${route}page-data.json`, 'utf8'),
    ) as BuildPageData;
    assert.equal(
      data.result.data.post.fields.slug,
      `/${original.toLowerCase()}/`,
    );
    assert.equal(data.result.data.post.fields.originalSlug, `/${original}/`);
    assert.ok(
      feed.includes(
        `<guid isPermaLink="false">${siteOrigin}/en/${original}/</guid>`,
      ),
    );
    assert.ok(feed.includes(`<link>${siteOrigin}${route}</link>`));
  }
});
