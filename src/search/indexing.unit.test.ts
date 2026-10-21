import type { ArticleNode } from '../types/content.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';
import MiniSearch from 'minisearch';
import i18next from 'i18next';
import en from '../i18n/locales/en/translation.json' with { type: 'json' };
import pl from '../i18n/locales/pl/translation.json' with { type: 'json' };
import {
  searchDocuments,
  searchableText,
  tagSearchDocuments,
} from './documents.ts';
import { indexOptions } from './options.ts';
import { loadIndex } from './runtime.ts';
import { highlightParts, snippet } from './snippets.ts';
import { createSearchIndex } from './build.ts';

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
    tags: ['Event Sourcing', 'Distributed Tracing'],
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
  assert.equal(docs[0]?.tags, 'Event Sourcing · Distributed Tracing');
  assert.equal(index.search('tracing').length, 2, 'every tag is searchable');
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
test('rebuilding indexes replaces modified and deleted documents', async () => {
  const nodes = [
    node('one', 'en', 'First', 'olduniqueterm'),
    node('two', 'en', 'Second', 'deleteduniqueterm'),
  ];
  const before = createSearchIndex(nodes, 'en').json;
  nodes[0]!.rawMarkdownBody = 'newuniqueterm';
  nodes.pop();
  const after = createSearchIndex(nodes, 'en').json;
  assert.notEqual(before, after);
  const index = await loadIndex(after);
  assert.equal(
    index.search('olduniqueterm', { fuzzy: false, prefix: false }).length,
    0,
  );
  assert.equal(
    index.search('deleteduniqueterm', { fuzzy: false, prefix: false }).length,
    0,
  );
  assert.equal(index.search('newuniqueterm').length, 1);
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
test('guides are searchable by title and description and lead to the guide page in the reader language', () => {
  // Gatsby's guide nodes have no slug, unlike the articles ArticleNode models.
  const guide = (langKey: string, title: string, id: string) =>
    ({
      id,
      fields: { pathSlug: 'cqrs', langKey, source: 'paths', prefix: '04' },
      frontmatter: {
        title,
        description: 'What CQRS is and what it isnt.',
        articles: ['cqrs_facts_and_myths_explained'],
      },
      rawMarkdownBody: '',
    }) as unknown as ArticleNode;
  const cover = {
    layout: 'constrained' as const,
    width: 240,
    height: 120,
    images: { fallback: { src: '/static/guide.webp' } },
  };
  const nodes = [
    guide('en', 'CQRS guide', 'guide-en'),
    guide('pl', 'Przewodnik CQRS', 'guide-pl'),
    node('one', 'en', 'Event sourcing', 'appendToStream history'),
  ];
  for (const [language, title] of [
    ['en', 'CQRS guide'],
    ['pl', 'Przewodnik CQRS'],
  ] as const) {
    const docs = searchDocuments(
      nodes,
      language,
      'en',
      new Map([[`guide-${language}`, cover]]),
    );
    const found = docs.find((doc) => doc.source === 'paths');
    assert.deepEqual(
      found && {
        title: found.title,
        path: found.path,
        langKey: found.langKey,
        content: found.content,
        cover: found.cover,
        date: found.date,
      },
      {
        title,
        path: `/${language}/guides/cqrs/`,
        langKey: language,
        content: 'What CQRS is and what it isnt.',
        cover,
        date: '',
      },
    );
    const index = new MiniSearch(indexOptions);
    index.addAll(docs);
    assert.equal(index.search('isnt')[0]?.path, `/${language}/guides/cqrs/`);
  }
});

test('tags are searchable documents that lead to the tag page of the language, or the English one', async () => {
  const i18n = i18next.createInstance();
  await i18n.init({
    resources: { en: { translation: en }, pl: { translation: pl } },
    fallbackLng: 'en',
  });
  const tagged = (
    slug: string,
    langKey: string,
    tags: string[],
    placeholder = false,
  ) => ({
    ...node(slug, langKey, slug, ''),
    frontmatter: { title: slug, tags, useDefaultLangCanonical: placeholder },
  });
  const tagFile = (tagSlug: string, langKey: string, description: string) => ({
    fields: { tagSlug, langKey, source: 'tags', prefix: '' },
    frontmatter: { title: tagSlug, description },
    rawMarkdownBody: `${tagSlug} tag intro`,
  });
  const nodes = [
    tagged('one', 'en', ['CQRS', 'Design Patterns']),
    tagged('one', 'pl', ['CQRS'], true),
    tagged('two', 'en', ['Caching']),
    tagFile('cqrs', 'pl', 'Artykuły o CQRS po polsku.'),
    tagFile('cqrs', 'en', 'CQRS articles in English.'),
    tagFile('design-patterns', 'pl', 'Wzorce projektowe w praktyce.'),
  ] as unknown as ArticleNode[];
  assert.deepEqual(
    searchDocuments(nodes, 'pl').map(({ source }) => source),
    ['posts', 'posts'],
  );
  const polish = tagSearchDocuments(nodes, 'pl', i18n.getFixedT('pl'));
  assert.deepEqual(
    polish.map(({ id, title, path, langKey, source, content }) => ({
      id,
      title,
      path,
      langKey,
      source,
      content,
    })),
    [
      {
        id: 'tags:caching',
        title: 'Caching',
        path: '/en/articles/tag/caching/',
        langKey: 'en',
        source: 'tags',
        content:
          'Artykuły z tagiem Caching na Event-Driven.io, od najnowszych do najstarszych.',
      },
      {
        id: 'tags:cqrs',
        title: 'CQRS',
        path: '/pl/articles/tag/cqrs/',
        langKey: 'pl',
        source: 'tags',
        content: 'Artykuły o CQRS po polsku.',
      },
      {
        id: 'tags:design-patterns',
        title: 'Wzorce projektowe',
        path: '/pl/articles/tag/design-patterns/',
        langKey: 'pl',
        source: 'tags',
        content: 'Wzorce projektowe w praktyce.',
      },
    ],
  );
  const index = new MiniSearch(indexOptions);
  index.addAll(polish);
  assert.equal(
    index.search('wzorce')[0]?.path,
    '/pl/articles/tag/design-patterns/',
  );
  assert.deepEqual(
    tagSearchDocuments(nodes, 'en', i18n.getFixedT('en')).map(
      ({ path }) => path,
    ),
    [
      '/en/articles/tag/caching/',
      '/en/articles/tag/cqrs/',
      '/en/articles/tag/design-patterns/',
    ],
  );
});

test('built search indexes include tag documents', async () => {
  const { json } = createSearchIndex(
    [node('one', 'en', 'First', 'content')],
    'en',
  );
  const index = await loadIndex(json);
  assert.equal(
    index.search('distributed tracing').find(({ source }) => source === 'tags')
      ?.path,
    '/en/articles/tag/distributed-tracing/',
  );
});
