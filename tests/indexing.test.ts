import type { BuildPageData } from './helpers/build-output.ts';
import { temporaryDirectory } from './helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import * as yaml from 'js-yaml';
import {
  verifyIndexingBuild,
  siteOrigin,
} from '../scripts/indexing-build-verifier.ts';
import { builtRedirects } from './helpers/redirects.ts';

import { collectBuildContract } from '../scripts/build-contract.ts';

void test('every generated canonical, sitemap URL and reciprocal alternate resolves consistently', () => {
  assert.deepEqual(verifyIndexingBuild('public'), []);
});

void test('untranslated copies declare English canonical and English originals stay discoverable', () => {
  for (const directory of readdirSync('content/posts')) {
    const parse = (language: string) => {
      const source = readFileSync(
        join('content/posts', directory, `index.${language}.md`),
        'utf8',
      );
      const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(
        source,
      );
      assert.ok(match, directory);
      const [, header, body] = match;
      assert.equal(typeof header, 'string');
      assert.equal(typeof body, 'string');
      return {
        frontmatter: yaml.load(header as string) as {
          useDefaultLangCanonical?: boolean;
        },
        body: (body as string).trim().replace(/\/(?:en|pl)\//g, '/locale/'),
      };
    };
    if (!readdirSync(join('content/posts', directory)).includes('index.en.md'))
      continue;
    const en = parse('en');
    assert.notEqual(en.frontmatter.useDefaultLangCanonical, true, directory);
    if (!readdirSync(join('content/posts', directory)).includes('index.pl.md'))
      continue;
    const pl = parse('pl');
    if (en.body === pl.body) {
      assert.equal(pl.frontmatter.useDefaultLangCanonical, true, directory);
    }
  }
});

void test('canonical validation catches mismatched sitemap destinations and broken alternates', (t) => {
  const fixture = temporaryDirectory(t, 'indexing-regression-');
  mkdirSync(join(fixture, 'sitemap'));
  mkdirSync(join(fixture, 'en'), { recursive: true });
  mkdirSync(join(fixture, 'pl'), { recursive: true });
  writeFileSync(
    join(fixture, 'en/index.html'),
    `<head><link rel="canonical" href="${siteOrigin}/en/"><link rel="alternate" hreflang="pl" href="${siteOrigin}/pl/"></head>`,
  );
  writeFileSync(
    join(fixture, 'pl/index.html'),
    `<head><link rel="canonical" href="${siteOrigin}/en/"></head>`,
  );
  writeFileSync(
    join(fixture, 'sitemap/sitemap-0.xml'),
    `<urlset><loc>${siteOrigin}/pl/</loc></urlset>`,
  );
  const failures = verifyIndexingBuild(fixture);
  assert.ok(
    failures.some((failure) => failure.includes('Sitemap: destination')),
  );
  assert.ok(
    failures.some((failure) => failure.includes('alternate pl: destination')),
  );
  assert.ok(failures.some((failure) => failure.includes('non-reciprocal')));
});

void test('published page/post collisions fail instead of silently changing the route canonical', async () => {
  const { createPages } = await import('../site/node.ts');
  const node = (source: string) => ({
    node: {
      id: source,
      fields: { slug: '/collision/', source, langKey: 'en' },
      frontmatter: { title: 'Collision', related: [] },
    },
  });
  await assert.rejects(
    Promise.resolve(
      createPages(
        {
          actions: { createPage: () => {}, createRedirect: () => {} },
          graphql: () =>
            Promise.resolve({
              data: {
                searchCovers: { nodes: [] },
                allMarkdownRemark: { edges: [node('posts'), node('pages')] },
              },
            }),
        } as unknown as Parameters<typeof createPages>[0],
        { plugins: [] },
        () => {},
      ),
    ),
    /Multiple published documents claim \/en\/collision\//,
  );
});

void test('known legacy category queries use literal query conditions, with 404 fallbacks last', async () => {
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
    '/en/category/postgres/',
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

void test('confirmed reported aliases lead directly to a generated canonical article', () => {
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

void test('case-normalized article routes retain feed GUIDs and Disqus thread identifiers', () => {
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
