import { temporaryDirectory } from './helpers/temporary-directory.mts';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import yaml from 'js-yaml';
import cheerio from 'cheerio';
import { verifyIndexingBuild, siteOrigin } from '../scripts/indexing-build-verifier.mts';
import { parseAllRedirects } from 'netlify-redirect-parser';

import { collectBuildContract } from '../scripts/build-contract.mts';

function linkDestinations(html: string): Set<string> {
  const $ = cheerio.load(html);
  return new Set(
    $('a[href]')
      .map((_, element) => $(element).attr('href')!)
      .get(),
  );
}

test('link checks require the complete anchor destination, not text or a URL substring', () => {
  const destination = 'https://example.com/registration';
  for (const href of [
    `https://unrelated.example/?next=${destination}`,
    `https://unrelated.example/${destination}`,
    'https://example.com.unrelated.example/registration',
    'https://example.com@unrelated.example/registration',
  ]) {
    const html = `<p>${destination}</p><a href="${href}">${destination}</a>`;
    assert.equal(linkDestinations(html).has(destination), false, href);
  }
  assert.equal(linkDestinations(`<a href="${destination}">Register</a>`).has(destination), true);
});

test('every generated canonical, sitemap URL and reciprocal alternate resolves consistently', () => {
  assert.deepEqual(verifyIndexingBuild('public'), []);
});

test('untranslated copies declare English canonical and English originals stay discoverable', () => {
  for (const directory of readdirSync('content/posts')) {
    const parse = (language: string) => {
      const source = readFileSync(join('content/posts', directory, `index.${language}.md`), 'utf8');
      const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(source);
      assert.ok(match, directory);
      const [, header, body] = match;
      return {
        frontmatter: yaml.load(header) as { useDefaultLangCanonical?: boolean },
        body: body.trim().replace(/\/(?:en|pl)\//g, '/locale/'),
      };
    };
    if (!readdirSync(join('content/posts', directory)).includes('index.en.md')) continue;
    const en = parse('en');
    assert.notEqual(en.frontmatter.useDefaultLangCanonical, true, directory);
    if (!readdirSync(join('content/posts', directory)).includes('index.pl.md')) continue;
    const pl = parse('pl');
    if (en.body === pl.body) {
      assert.equal(pl.frontmatter.useDefaultLangCanonical, true, directory);
    }
  }
});

test('canonical validation catches mismatched sitemap destinations and broken alternates', (t) => {
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
  assert.ok(failures.some((failure) => failure.includes('Sitemap: destination')));
  assert.ok(failures.some((failure) => failure.includes('alternate pl: destination')));
  assert.ok(failures.some((failure) => failure.includes('non-reciprocal')));
});

test('published page/post collisions fail instead of silently changing the route canonical', async () => {
  const { createPages } = await import('../site/node.mts');
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
          graphql: async () => ({
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

test('known legacy category queries use literal query conditions, with 404 fallbacks last', async () => {
  const { redirects, errors } = await parseAllRedirects({
    redirectsFiles: ['public/_redirects'],
    netlifyConfigPath: 'netlify.toml',
    minimal: true,
  });
  assert.deepEqual(errors, []);
  const routes = new Set(collectBuildContract('public').routes);
  const queries = redirects.filter((rule) => rule.query.category);
  assert.equal(queries.length, 24);
  for (const rule of queries) {
    assert.equal(rule.status, 301);
    assert.equal(rule.force, true);
    assert.ok(routes.has(rule.to), rule.to);
    assert.ok(!/[%+]/.test(rule.query.category), 'Match decoded values; do not double-encode');
  }
  assert.equal(
    queries.find((rule) => rule.from === '/pl/category/' && rule.query.category === 'Postgres')?.to,
    '/en/category/postgres/',
  );
  assert.deepEqual(
    redirects.slice(-3).map(({ from, to, status, force }) => ({ from, to, status, force })),
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
    ['/en/rebuilding_read_models_safely/', '/en/rebuilding_event_driven_read_models/'],
    ['/2026/04/09/vibing-harness-and-ooda-loop/', '/en/vibing_harness_and_ooda_loops/'],
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
    const data = JSON.parse(readFileSync(`public/page-data${route}page-data.json`, 'utf8'));
    assert.equal(data.result.data.post.fields.slug, `/${original.toLowerCase()}/`);
    assert.equal(data.result.data.post.fields.originalSlug, `/${original}/`);
    assert.ok(feed.includes(`<guid isPermaLink="false">${siteOrigin}/en/${original}/</guid>`));
    assert.ok(feed.includes(`<link>${siteOrigin}${route}</link>`));
  }
});

test('the anti-patterns article links its series and talks and has one canonical discovery entry', () => {
  for (const language of ['en', 'pl']) {
    const html = readFileSync(`public/${language}/anti-patterns/index.html`, 'utf8');
    const destinations = linkDestinations(html);
    const series = readdirSync('content/posts').filter((directory) => {
      const file = join('content/posts', directory, 'index.en.md');
      return (
        existsSync(file) &&
        /^title: Anti-patterns in event modelling - /m.test(readFileSync(file, 'utf8'))
      );
    });
    assert.ok(series.length >= 5);
    for (const directory of series) {
      const slug = directory.split('--')[1];
      assert.ok(destinations.has(`/en/${slug}/`), slug);
      assert.ok(existsSync(`public/en/${slug}/index.html`));
    }
    assert.ok(
      destinations.has(
        'https://www.confluent.io/events/kafka-summit-london-2024/event-modeling-anti-patterns/',
      ),
    );
    assert.ok(destinations.has('/en/new-recording-on-event-modelling/'));
    for (const video of ['0pYmuk0-N_4', '20zvAJAhqS0'])
      assert.ok(destinations.has(`https://www.youtube.com/watch?v=${video}`));
  }
  const discovery = readFileSync('public/llms.txt', 'utf8');
  assert.equal(discovery.split('](https://event-driven.io/en/anti-patterns/)').length - 1, 1);
  assert.equal(discovery.includes('](https://event-driven.io/pl/anti-patterns/)'), false);
  const urls = [
    ...discovery.matchAll(/^- \[[^\n]*\]\((https:\/\/event-driven\.io\/[^)]+)\)/gm),
  ].map((match) => match[1]);
  assert.equal(new Set(urls).size, urls.length, 'llms.txt repeats a destination');
});

test('the workshop has distinct English and Polish content and discovery titles', () => {
  const discovery = readFileSync('public/llms.txt', 'utf8');
  for (const [language, heading, title] of [
    ['en', 'What will you learn?', 'Understand Event Sourcing in practice - public workshop'],
    ['pl', 'Czego się nauczysz?', 'Zrozum Event Sourcing w praktyce - otwarte szkolenie'],
  ]) {
    assert.ok(
      discovery.includes(
        `[${title}](https://event-driven.io/${language}/szkolenie-event-sourcing/)`,
      ),
    );
    const html = readFileSync(`public/${language}/szkolenie-event-sourcing/index.html`, 'utf8');
    const $ = cheerio.load(html);
    assert.ok(
      $('h2')
        .toArray()
        .some((element) => $(element).text() === heading),
    );
    assert.ok(linkDestinations(html).has('https://forms.gle/YxfhZ9wUQetX9iue8'));
  }
});
