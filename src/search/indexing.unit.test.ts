import { temporaryDirectory } from '../../tests/helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import MiniSearch from 'minisearch';
import { searchDocuments, searchableText } from './documents.ts';
import { indexOptions } from './options.ts';
import { loadIndex } from './runtime.ts';
import { highlightParts, snippet } from './snippets.ts';
import { writeSearchIndexes } from '../../scripts/build-search-index.ts';

const node = (
  slug: string,
  langKey: string,
  title: string,
  content: string,
  placeholder = false,
) => ({
  fields: { slug: `/${slug}/`, langKey, source: 'posts', prefix: '2026-10-05' },
  frontmatter: {
    title,
    category: 'Event Sourcing',
    useDefaultLangCanonical: placeholder,
  },
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
    searchableText(
      '![cover](cover.png) Main **text** and [link](https://example.com)',
    ),
    'Main text and link',
  );
  const docs = searchDocuments(nodes, 'pl');
  assert.deepEqual(
    docs.map((doc) => doc.path),
    ['/pl/one/', '/pl/two/'],
  );
  assert.equal(docs.length, 2);
  assert.ok(docs[1]);
  assert.equal(
    docs[1].langKey,
    'en',
    'content badge still identifies the English original',
  );
  const index = new MiniSearch(indexOptions);
  index.addAll(docs);
  for (const query of [
    'zazolc',
    'zażółć',
    'zolc',
    'appendToStr',
    'appendToStream',
    'architecure',
  ])
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
    highlightParts(malicious, ['appendtostream']).filter(
      (part) => part.highlighted,
    ).length,
    1,
  );
  assert.ok(
    snippet('a '.repeat(500) + 'appendToStream value', [
      'appendtostream',
    ]).includes('appendToStream'),
  );
  assert.equal(
    (await loadIndex(JSON.stringify(index))).documentCount,
    docs.length,
  );
});
test('rebuilding indexes replaces modified/deleted documents and removes obsolete assets', async () => {
  const directory = temporaryDirectory('local-search-update-');
  const nodes = [
    node('one', 'en', 'First', 'olduniqueterm'),
    node('two', 'en', 'Second', 'deleteduniqueterm'),
  ];
  await writeSearchIndexes(nodes, directory);
  const before = JSON.parse(
    readFileSync(join(directory, 'search-index/manifest.json'), 'utf8'),
  ) as Record<'en' | 'pl', string>;
  assert.ok(nodes[0]);
  nodes[0].rawMarkdownBody = 'newuniqueterm';
  nodes.pop();
  await writeSearchIndexes(nodes, directory);
  const after = JSON.parse(
    readFileSync(join(directory, 'search-index/manifest.json'), 'utf8'),
  ) as Record<'en' | 'pl', string>;
  assert.notEqual(before.en, after.en);
  const index = await loadIndex(
    readFileSync(join(directory, after.en), 'utf8'),
  );
  assert.equal(
    index.search('olduniqueterm', { fuzzy: false, prefix: false }).length,
    0,
  );
  assert.equal(
    index.search('deleteduniqueterm', { fuzzy: false, prefix: false }).length,
    0,
  );
  assert.equal(index.search('newuniqueterm').length, 1);
  assert.equal(readdirSync(join(directory, 'search-index')).length, 3);
});
test('canonical cover data follows the selected genuine translation and stays optional', async () => {
  const english = { ...node('one', 'en', 'English', 'content'), id: 'english' };
  const polish = { ...node('one', 'pl', 'Polski', 'tekst'), id: 'polish' };
  const fallback = {
    ...node('two', 'en', 'Fallback', 'content'),
    id: 'fallback',
  };
  const cover = {
    layout: 'constrained' as const,
    width: 240,
    height: 120,
    images: { fallback: { src: '/static/cover.webp' } },
  };
  const covers = new Map([
    ['english', cover],
    ['fallback', cover],
  ]);
  const docs = searchDocuments([english, polish, fallback], 'pl', 'en', covers);
  assert.ok(docs[0] && docs[1]);
  assert.equal(
    docs[0].cover,
    null,
    'do not copy English artwork into a genuine Polish version without a cover',
  );
  assert.deepEqual(docs[1].cover, cover);
  const index = new MiniSearch(indexOptions);
  index.addAll(docs);
  assert.deepEqual(
    (await loadIndex(JSON.stringify(index))).search('fallback')[0]?.cover,
    cover,
  );
});
