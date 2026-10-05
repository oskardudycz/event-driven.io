import assert from 'node:assert/strict';
import { test } from 'node:test';
import yaml from 'js-yaml';
import { readFileSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import MiniSearch from 'minisearch';
import { searchDocuments, searchableText } from '../src/search/documents.mjs';
import { indexOptions } from '../src/search/options.mjs';
import { loadIndex, searchIndex } from '../src/search/runtime.mjs';
import { highlightParts, snippet } from '../src/search/snippets.mjs';
import { writeSearchIndexes } from '../scripts/build-search-index.mjs';

const node = (slug, langKey, title, content, placeholder = false) => ({
  fields: { slug: `/${slug}/`, langKey, source: 'posts', prefix: '2026-10-05' },
  frontmatter: { title, category: 'Event Sourcing', useDefaultLangCanonical: placeholder },
  rawMarkdownBody: content,
});
test('canonical locale selection, Polish diacritics, identifiers, prefix/fuzzy matches and safe snippets', async () => {
  const nodes = [
    node('one', 'en', 'Event sourcing', 'appendToStream history'),
    node('one', 'pl', 'Zdarzenia i żółć', 'zażółć gęślą jaźń appendToStream'),
    node('two', 'en', 'Architecture', 'Vertical slices'),
    node('two', 'pl', 'Placeholder', 'bogusplaceholder', true),
  ];
  assert.equal(
    searchableText('![cover](cover.png) Main **text** and [link](https://example.com)'),
    'Main text and link',
  );
  const docs = searchDocuments(nodes, 'pl');
  assert.deepEqual(
    docs.map((doc) => doc.path),
    ['/pl/one/', '/en/two/'],
  );
  assert.equal(docs.length, 2);
  const index = new MiniSearch(indexOptions);
  index.addAll(docs);
  for (const query of ['zazolc', 'zażółć', 'zolc', 'appendToStr', 'appendToStream', 'architecure'])
    assert.ok(index.search(query).length, query);
  assert.equal(index.search('bogusplaceholder').length, 0);
  const malicious = '<img src=x onerror=alert(1)> appendToStream';
  assert.equal(
    highlightParts(malicious, ['appendtostream'])
      .map((part) => part.text)
      .join(''),
    malicious,
  );
  assert.equal(
    highlightParts(malicious, ['appendtostream']).filter((part) => part.highlighted).length,
    1,
  );
  assert.ok(
    snippet('a '.repeat(500) + 'appendToStream value', ['appendtostream']).includes(
      'appendToStream',
    ),
  );
  assert.equal((await loadIndex(JSON.stringify(index))).documentCount, docs.length);
});
test('rebuilding indexes replaces modified/deleted documents and removes obsolete assets', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'local-search-update-'));
  try {
    const nodes = [
      node('one', 'en', 'First', 'olduniqueterm'),
      node('two', 'en', 'Second', 'deleteduniqueterm'),
    ];
    await writeSearchIndexes(nodes, directory);
    const before = JSON.parse(readFileSync(join(directory, 'search-index/manifest.json')));
    nodes[0].rawMarkdownBody = 'newuniqueterm';
    nodes.pop();
    await writeSearchIndexes(nodes, directory);
    const after = JSON.parse(readFileSync(join(directory, 'search-index/manifest.json')));
    assert.notEqual(before.en, after.en);
    const index = await loadIndex(readFileSync(join(directory, after.en), 'utf8'));
    assert.equal(index.search('olduniqueterm', { fuzzy: false, prefix: false }).length, 0);
    assert.equal(index.search('deleteduniqueterm', { fuzzy: false, prefix: false }).length, 0);
    assert.equal(index.search('newuniqueterm').length, 1);
    assert.equal(readdirSync(join(directory, 'search-index')).length, 3);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
for (const lang of ['en', 'pl']) {
  test(`${lang} generated index includes canonical searchable content once with valid relative links`, async () => {
    const manifest = JSON.parse(readFileSync('public/search-index/manifest.json'));
    const index = await loadIndex(readFileSync(join('public', manifest[lang]), 'utf8'));
    const results = searchIndex(index, 'event sourcing');
    assert.ok(results.length > 10);
    assert.equal(new Set(results.map((result) => result.id)).size, results.length);
    const introduction = results.find(
      (result) => result.path === '/en/introduction_to_event_sourcing/',
    );
    assert.ok(introduction?.cover, 'canonical fallback keeps its real cover');
    assert.equal(introduction.cover.width, 240);
    const documents = index.search(MiniSearch.wildcard);
    const assets = new Set();
    for (const document of documents) {
      if (document.source === 'posts')
        assert.ok(document.cover, `${document.path} is missing its cover`);
      if (!document.cover) continue;
      for (const image of [document.cover.images.fallback, ...document.cover.images.sources]) {
        for (const variant of image.srcSet.split(', ')) assets.add(variant.split(' ')[0]);
      }
    }
    for (const url of assets) {
      assert.match(url, /^\/static\//);
      assert.ok(
        readFileSync(join('public', decodeURIComponent(url))).length,
        `Missing cover asset ${url}`,
      );
    }

    assert.ok(introduction.cover.images.sources.some((source) => source.type === 'image/webp'));
    for (const image of [
      introduction.cover.images.fallback,
      ...introduction.cover.images.sources,
    ]) {
      for (const variant of image.srcSet.split(', ')) {
        const url = variant.split(' ')[0];
        assert.match(url, /^\/static\//);
        assert.ok(readFileSync(join('public', decodeURI(url))).length);
      }
    }
    for (const result of results) {
      assert.match(result.path, /^\/(en|pl)\//);
      assert.ok(readFileSync(join('public', result.path, 'index.html')).length);
    }
  });
}

test('result rendering escapes source text while highlighting code matches', async () => {
  const { createRequire, Module } = await import('node:module');
  const { resolve } = await import('node:path');
  const require = createRequire(resolve('src/components/Search/Hit.js'));
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const filename = resolve('src/components/Search/Hit.test.cjs');
  const compiled = new Module(filename);
  compiled.filename = filename;
  compiled.require = (id) =>
    id === 'gatsby'
      ? { Link: ({ to, children }) => React.createElement('a', { href: to }, children) }
      : id === 'gatsby-plugin-image'
        ? {
            GatsbyImage: ({ image, alt }) =>
              React.createElement('img', { src: image.images.fallback.src, alt }),
          }
        : id === '../../i18n/page-context'
          ? { usePageContext: () => ({ lang: 'en' }) }
          : require(id);
  const { transformSync } = require('@babel/core');
  compiled._compile(
    transformSync(readFileSync('src/components/Search/Hit.js', 'utf8'), {
      babelrc: false,
      configFile: false,
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
        '@babel/preset-react',
      ],
      plugins: ['styled-jsx/babel'],
    }).code,
    filename,
  );
  const html = renderToStaticMarkup(
    React.createElement(compiled.exports.default, {
      theme: yaml.load(readFileSync('src/theme/theme.yaml', 'utf8')),
      hit: {
        title: '<img src=x onerror=alert(1)>',
        content: '<script>attack</script> appendToStream',
        terms: ['appendtostream'],
        path: '/en/example/',
        langKey: 'en',
        source: 'posts',
      },
    }),
  );
  assert.ok(!html.includes('<img '));
  assert.ok(!html.includes('<script>'));
  assert.match(html, /&lt;img/);
  assert.match(html, /<mark[^>]*>appendToStream<\/mark>/);
});

test('canonical cover data follows the selected genuine translation and stays optional', async () => {
  const english = { ...node('one', 'en', 'English', 'content'), id: 'english' };
  const polish = { ...node('one', 'pl', 'Polski', 'tekst'), id: 'polish' };
  const fallback = { ...node('two', 'en', 'Fallback', 'content'), id: 'fallback' };
  const cover = { width: 240, height: 120, images: { fallback: { src: '/static/cover.webp' } } };
  const covers = new Map([
    ['english', cover],
    ['fallback', cover],
  ]);
  const docs = searchDocuments([english, polish, fallback], 'pl', 'en', covers);
  assert.equal(
    docs[0].cover,
    null,
    'do not copy English artwork into a genuine Polish version without a cover',
  );
  assert.deepEqual(docs[1].cover, cover);
  const index = new MiniSearch(indexOptions);
  index.addAll(docs);
  assert.deepEqual((await loadIndex(JSON.stringify(index))).search('fallback')[0].cover, cover);
});
