import assert from 'node:assert/strict';
import { test } from 'vitest';
import i18next from 'i18next';
import en from '../i18n/locales/en/translation.json' with { type: 'json' };
import pl from '../i18n/locales/pl/translation.json' with { type: 'json' };
import { tagSlug } from './tag-slug.ts';
import { tagDescription, tagLabel } from './tag-label.ts';
import { legacyTagRedirects } from './tag-redirects.ts';
import { tagDestination, tagRoute } from './tag-routes.ts';
import { tagChips, tagsForLanguage, tagPostsForLanguage } from './tag-posts.ts';

const post = (
  slug: string,
  langKey: string,
  tags: string[],
  placeholder = false,
) => ({
  id: `${langKey}:${slug}`,
  fields: { slug: `/${slug}/`, langKey, source: 'posts' },
  frontmatter: { tags, useDefaultLangCanonical: placeholder },
});

test('tag URLs handle punctuation, acronyms, mixed case and accents', () => {
  const examples = [
    ['Event-Driven Architecture', 'event-driven-architecture'],
    ['TypeScript', 'type-script'],
    ['PostgreSQL', 'postgre-sql'],
    ['PostgreSql', 'postgre-sql'],
    ['CQRS', 'cqrs'],
    ['.NET', 'net'],
    ['C#', 'c'],
    ['  Coding Life  ', 'coding-life'],
    ['Café Patterns', 'cafe-patterns'],
  ] as const;
  for (const [name, slug] of examples) assert.equal(tagSlug(name), slug);
});

test('an article belongs to every one of its tags', () => {
  const nodes = [
    post('multi', 'en', ['Event Sourcing', 'CQRS', 'Architecture']),
    post('single', 'en', ['CQRS']),
  ];
  for (const slug of ['event-sourcing', 'cqrs', 'architecture'])
    assert(
      tagPostsForLanguage(nodes, slug, 'en').some(
        (node) => node.fields.slug === '/multi/',
      ),
      slug,
    );
  assert.deepEqual(
    tagPostsForLanguage(nodes, 'cqrs', 'en').map((node) => node.id),
    ['en:multi', 'en:single'],
  );
  assert.deepEqual(
    tagsForLanguage(nodes, 'en').map(([tag, posts]) => [tag, posts.length]),
    [
      ['Event Sourcing', 1],
      ['CQRS', 2],
      ['Architecture', 1],
    ],
  );
});

test('a tag page lists the tagged articles that have a route in its language', () => {
  const nodes = [
    post('english-only', 'en', ['Event Sourcing']),
    post('translated', 'en', ['Event Sourcing']),
    post('translated', 'pl', ['Event Sourcing']),
    post('copied', 'en', ['Event Sourcing']),
    post('copied', 'pl', ['Event Sourcing'], true),
    post('polish-only', 'pl', ['Event Sourcing']),
  ];
  assert.deepEqual(
    tagPostsForLanguage(nodes, 'event-sourcing', 'pl').map((node) => node.id),
    ['pl:translated', 'pl:copied', 'pl:polish-only'],
  );
  assert.deepEqual(
    tagPostsForLanguage(nodes, 'event-sourcing', 'en').map((node) => node.id),
    ['en:english-only', 'en:translated', 'en:copied'],
  );
});

test('canonical translation membership wins over stale placeholder metadata', () => {
  const nodes = [
    post('article', 'en', ['Event Sourcing']),
    post('article', 'pl', ['Old Topic'], true),
  ];
  assert.equal(
    tagPostsForLanguage(nodes, 'event-sourcing', 'pl')[0]?.fields.langKey,
    'pl',
  );
  assert.deepEqual(tagPostsForLanguage(nodes, 'old-topic', 'en'), []);
  assert.deepEqual(tagPostsForLanguage(nodes, 'old-topic', 'pl'), []);
});

test('an English copy gives the Polish tag page a route', () => {
  const nodes = [
    post('article', 'en', ['Event Sourcing']),
    post('article', 'pl', ['Event Sourcing'], true),
  ];
  assert.deepEqual(
    tagsForLanguage(nodes, 'pl').map(([tag, posts]) => [
      tag,
      posts.map((node) => node.id),
    ]),
    [['Event Sourcing', ['pl:article']]],
  );
});

test('a translation is selected even when its tag metadata differs', () => {
  const nodes = [
    post('article', 'en', ['Event Sourcing']),
    post('article', 'pl', ['Architecture']),
  ];
  assert.equal(
    tagPostsForLanguage(nodes, 'event-sourcing', 'pl')[0]?.fields.langKey,
    'pl',
  );
  assert.equal(
    tagPostsForLanguage(nodes, 'architecture', 'en')[0]?.fields.langKey,
    'en',
  );
});

test('a tag has a page only in languages where one of its articles has a route', () => {
  const nodes = [
    post('translated', 'en', ['Event Sourcing']),
    post('translated', 'pl', ['Event Sourcing']),
    post('english-only', 'en', ['Event Sourcing', 'CQRS']),
    post('polish-only', 'pl', ['Event Sourcing']),
  ];
  const en = new Map(tagsForLanguage(nodes, 'en'));
  const pl = new Map(tagsForLanguage(nodes, 'pl'));
  assert.equal(en.get('Event Sourcing')?.length, 2);
  assert.equal(pl.get('Event Sourcing')?.length, 2);
  assert(en.has('CQRS'));
  assert(!pl.has('CQRS'));
});

test('tag labels use the interface translation and fall back to the English tag', async () => {
  const i18n = i18next.createInstance();
  await i18n.init({
    resources: { en: { translation: en }, pl: { translation: pl } },
    fallbackLng: 'en',
    lng: 'pl',
  });
  const polish = i18n.getFixedT('pl');
  const english = i18n.getFixedT('en');
  assert.equal(tagLabel(polish, 'Design Patterns'), 'Wzorce projektowe');
  assert.equal(tagLabel(english, 'Design Patterns'), 'Design Patterns');
  assert.equal(tagLabel(polish, 'Event Sourcing'), 'Event Sourcing');
  assert.equal(tagLabel(polish, '.NET'), '.NET');
  assert.equal(tagLabel(english, 'C#'), 'C#');
});

test('tag pages live under the localized article archive', () => {
  assert.equal(
    tagRoute('en', 'event-sourcing'),
    '/en/articles/tag/event-sourcing/',
  );
  assert.equal(tagRoute('pl', 'cqrs'), '/pl/articles/tag/cqrs/');
});

test('a tag link prefers its own language and falls back to the default language', () => {
  const routes = new Set([
    '/en/articles/tag/cloud/',
    '/en/articles/tag/testing/',
    '/pl/articles/tag/testing/',
    '/pl/articles/tag/community/',
  ]);
  assert.equal(
    tagDestination(routes, 'pl', 'testing', 'en'),
    '/pl/articles/tag/testing/',
  );
  assert.equal(
    tagDestination(routes, 'pl', 'cloud', 'en'),
    '/en/articles/tag/cloud/',
  );
  assert.equal(tagDestination(routes, 'en', 'community', 'en'), undefined);
});

test('every former category URL, including merged tags, redirects in one hop to a tag page', () => {
  const pages = [
    { language: 'en', slug: 'architecture' },
    { language: 'en', slug: 'testing' },
    { language: 'en', slug: 'postgre-sql' },
    { language: 'en', slug: 'design-patterns' },
    { language: 'pl', slug: 'testing' },
    { language: 'pl', slug: 'community' },
  ];
  const redirects = legacyTagRedirects(pages, ['en', 'pl'], 'en');
  const lines = redirects.map(
    ({ fromPath, toPath }) => `${fromPath} ${toPath}`,
  );
  assert.deepEqual(lines.sort(), [
    '/en/category/architecture/ /en/articles/tag/architecture/',
    '/en/category/design-patterns/ /en/articles/tag/design-patterns/',
    '/en/category/postgre-sql/ /en/articles/tag/postgre-sql/',
    '/en/category/postgres/ /en/articles/tag/postgre-sql/',
    '/en/category/software-architecture/ /en/articles/tag/architecture/',
    '/en/category/testing/ /en/articles/tag/testing/',
    '/en/category/tests/ /en/articles/tag/testing/',
    '/en/category/wzorce-projektowe/ /en/articles/tag/design-patterns/',
    '/pl/category/architecture/ /en/articles/tag/architecture/',
    '/pl/category/community/ /pl/articles/tag/community/',
    '/pl/category/design-patterns/ /en/articles/tag/design-patterns/',
    '/pl/category/postgre-sql/ /en/articles/tag/postgre-sql/',
    '/pl/category/postgres/ /en/articles/tag/postgre-sql/',
    '/pl/category/software-architecture/ /en/articles/tag/architecture/',
    '/pl/category/testing/ /pl/articles/tag/testing/',
    '/pl/category/tests/ /pl/articles/tag/testing/',
    '/pl/category/wzorce-projektowe/ /en/articles/tag/design-patterns/',
  ]);
  const sources = new Set(redirects.map(({ fromPath }) => fromPath));
  for (const { toPath } of redirects) assert(!sources.has(toPath), toPath);
});

test('tags without a page anywhere get no redirect', () => {
  assert.deepEqual(legacyTagRedirects([], ['en', 'pl'], 'en'), []);
});

test('tag chips list the tags of a language by article count, then label', () => {
  const nodes = [
    post('one', 'pl', ['Testing', 'Design Patterns']),
    post('two', 'pl', ['Testing', 'Agile']),
    post('three', 'pl', ['Zebra', 'Design Patterns']),
    post('four', 'pl', ['Testing']),
    post('english-only', 'en', ['CQRS']),
  ];
  const labels: Record<string, string> = { 'design-patterns': 'Wzorce' };
  assert.deepEqual(
    tagChips(nodes, 'pl', (tag) => labels[tagSlug(tag)] || tag),
    [
      { slug: 'testing', label: 'Testing', count: 3 },
      { slug: 'design-patterns', label: 'Wzorce', count: 2 },
      { slug: 'agile', label: 'Agile', count: 1 },
      { slug: 'zebra', label: 'Zebra', count: 1 },
    ],
  );
});

test('tag descriptions use the tag file’s description or the language’s default description', async () => {
  const i18n = i18next.createInstance();
  await i18n.init({
    resources: {
      en: {
        translation: {
          tags: { defaultDescription: 'Practical articles about {{tag}}.' },
        },
      },
      pl: {
        translation: {
          tags: {
            defaultDescription: 'Praktyczne artykuły na temat {{tag}}.',
            labels: { 'design-patterns': 'Wzorce projektowe' },
          },
        },
      },
    },
    fallbackLng: 'en',
    lng: 'pl',
  });
  const polish = i18n.getFixedT('pl');
  const english = i18n.getFixedT('en');
  assert.equal(
    tagDescription(english, 'CQRS', 'CQRS in English.'),
    'CQRS in English.',
  );
  assert.equal(
    tagDescription(polish, 'CQRS', 'CQRS po polsku.'),
    'CQRS po polsku.',
  );
  assert.equal(
    tagDescription(polish, 'Testing'),
    'Praktyczne artykuły na temat Testing.',
  );
  assert.equal(
    tagDescription(polish, 'Design Patterns', ''),
    'Praktyczne artykuły na temat Wzorce projektowe.',
  );
  assert.equal(
    tagDescription(english, 'Event Sourcing'),
    'Practical articles about Event Sourcing.',
  );
});
