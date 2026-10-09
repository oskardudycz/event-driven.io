import assert from 'node:assert/strict';
import test from 'node:test';
import { categoriesForLanguage, categoryPostsForLanguage } from '../src/utils/category-posts.ts';

const post = (slug: string, langKey: string, categories: string[], placeholder = false) => ({
  id: `${langKey}:${slug}`,
  fields: { slug: `/${slug}/`, langKey, source: 'posts' },
  frontmatter: { categories, useDefaultLangCanonical: placeholder },
});

void test('category locales share membership even without a placeholder file', () => {
  const nodes = [
    post('english-only', 'en', ['Event Sourcing']),
    post('translated', 'en', ['Event Sourcing']),
    post('translated', 'pl', ['Event Sourcing']),
    post('polish-only', 'pl', ['Event Sourcing']),
  ];
  const en = categoryPostsForLanguage(nodes, 'event-sourcing', 'en');
  const pl = categoryPostsForLanguage(nodes, 'event-sourcing', 'pl');
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

void test('canonical translation membership wins over stale placeholder metadata', () => {
  const nodes = [
    post('article', 'en', ['Event Sourcing']),
    post('article', 'pl', ['Old Topic'], true),
  ];
  assert.equal(categoryPostsForLanguage(nodes, 'event-sourcing', 'pl')[0].fields.langKey, 'pl');
  assert.deepEqual(categoryPostsForLanguage(nodes, 'old-topic', 'en'), []);
  assert.deepEqual(categoriesForLanguage(nodes, 'pl'), []);
});

void test('a translation is selected even when its category metadata differs', () => {
  const nodes = [
    post('article', 'en', ['Event Sourcing']),
    post('article', 'pl', ['Software Architecture']),
  ];
  assert.equal(categoryPostsForLanguage(nodes, 'event-sourcing', 'pl')[0].fields.langKey, 'pl');
  assert.equal(
    categoryPostsForLanguage(nodes, 'software-architecture', 'en')[0].fields.langKey,
    'en',
  );
});

void test('category indexes count unique shared articles and retain established locale routes', () => {
  const nodes = [
    post('translated', 'en', ['Event Sourcing']),
    post('translated', 'pl', ['Event Sourcing']),
    post('english-only', 'en', ['Event Sourcing', 'CQRS']),
    post('polish-only', 'pl', ['Event Sourcing']),
  ];
  const en = new Map(categoriesForLanguage(nodes, 'en'));
  const pl = new Map(categoriesForLanguage(nodes, 'pl'));
  assert.equal(en.get('Event Sourcing')?.length, 3);
  assert.equal(pl.get('Event Sourcing')?.length, 3);
  assert(en.has('CQRS'));
  assert(!pl.has('CQRS'));
});
