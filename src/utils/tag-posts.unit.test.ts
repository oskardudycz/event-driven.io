import assert from 'node:assert/strict';
import { test } from 'vitest';
import i18next from 'i18next';
import en from '../i18n/locales/en/translation.json' with { type: 'json' };
import pl from '../i18n/locales/pl/translation.json' with { type: 'json' };
import { tagSlug } from './tag-slug.ts';
import { tagLabel } from './tag-label.ts';
import { mergedTagRedirects } from './tag-redirects.ts';
import { tagsForLanguage, tagPostsForLanguage } from './tag-posts.ts';

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

test('tag locales share membership even without a placeholder file', () => {
  const nodes = [
    post('english-only', 'en', ['Event Sourcing']),
    post('translated', 'en', ['Event Sourcing']),
    post('translated', 'pl', ['Event Sourcing']),
    post('polish-only', 'pl', ['Event Sourcing']),
  ];
  const en = tagPostsForLanguage(nodes, 'event-sourcing', 'en');
  const pl = tagPostsForLanguage(nodes, 'event-sourcing', 'pl');
  assert.deepEqual(
    en.map((node) => node.fields.slug),
    pl.map((node) => node.fields.slug),
  );
  assert.deepEqual(
    pl.map((node) => node.id),
    ['en:english-only', 'pl:translated', 'pl:polish-only'],
  );
  assert.deepEqual(
    en.map((node) => node.id),
    ['en:english-only', 'en:translated', 'pl:polish-only'],
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
  assert.deepEqual(tagsForLanguage(nodes, 'pl'), []);
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

test('tag indexes count unique shared articles and retain established locale routes', () => {
  const nodes = [
    post('translated', 'en', ['Event Sourcing']),
    post('translated', 'pl', ['Event Sourcing']),
    post('english-only', 'en', ['Event Sourcing', 'CQRS']),
    post('polish-only', 'pl', ['Event Sourcing']),
  ];
  const en = new Map(tagsForLanguage(nodes, 'en'));
  const pl = new Map(tagsForLanguage(nodes, 'pl'));
  assert.equal(en.get('Event Sourcing')?.length, 3);
  assert.equal(pl.get('Event Sourcing')?.length, 3);
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

test('merged tag URLs redirect to the canonical tag page, preferring the same language', () => {
  const routes = new Set([
    '/en/category/architecture/',
    '/en/category/testing/',
    '/en/category/postgre-sql/',
    '/en/category/design-patterns/',
    '/pl/category/testing/',
  ]);
  const redirects = mergedTagRedirects(routes, ['en', 'pl'], 'en');
  assert.deepEqual(
    redirects.filter(({ fromPath }) => fromPath.startsWith('/en/')),
    [
      { fromPath: '/en/category/tests/', toPath: '/en/category/testing/' },
      {
        fromPath: '/en/category/postgres/',
        toPath: '/en/category/postgre-sql/',
      },
      {
        fromPath: '/en/category/wzorce-projektowe/',
        toPath: '/en/category/design-patterns/',
      },
      {
        fromPath: '/en/category/software-architecture/',
        toPath: '/en/category/architecture/',
      },
    ],
  );
  assert.deepEqual(
    redirects.find(({ fromPath }) => fromPath === '/pl/category/tests/'),
    { fromPath: '/pl/category/tests/', toPath: '/pl/category/testing/' },
  );
  assert.deepEqual(
    redirects.find(
      ({ fromPath }) => fromPath === '/pl/category/software-architecture/',
    ),
    {
      fromPath: '/pl/category/software-architecture/',
      toPath: '/en/category/architecture/',
    },
  );
  for (const { fromPath, toPath } of redirects) {
    assert(routes.has(toPath), toPath);
    assert.notEqual(fromPath, toPath);
  }
});

test('merged tags without a canonical page anywhere get no redirect', () => {
  assert.deepEqual(mergedTagRedirects(new Set(), ['en', 'pl'], 'en'), []);
});
