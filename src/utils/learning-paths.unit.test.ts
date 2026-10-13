import assert from 'node:assert/strict';
import { test } from 'vitest';
import { learningPathProblems } from './learning-paths.ts';

const post = (
  slug: string,
  langKey: string,
  { source = 'posts', placeholder = false } = {},
) => ({
  id: `${langKey}:${slug}`,
  fields: { slug: `/${slug}/`, langKey, source },
  frontmatter: { useDefaultLangCanonical: placeholder },
});

const path = (pathSlug: string, langKey: string, articles: string[]) => ({
  fields: { pathSlug, langKey },
  frontmatter: { title: `Path ${pathSlug}`, articles },
});

test('a path whose articles exist in every language has no problems', () => {
  const posts = [
    post('basics', 'en'),
    post('basics', 'pl'),
    post('advanced', 'en'),
    post('advanced', 'pl', { placeholder: true }),
  ];
  const paths = [
    path('foundations', 'en', ['basics', 'advanced']),
    path('foundations', 'pl', ['basics', 'advanced']),
  ];
  assert.deepEqual(learningPathProblems(paths, posts), []);
});

test('a Polish path falls back to the canonical English article', () => {
  const posts = [post('english-only', 'en')];
  const paths = [
    path('foundations', 'en', ['english-only']),
    path('foundations', 'pl', ['english-only']),
  ];
  assert.deepEqual(learningPathProblems(paths, posts), []);
});

test('an unknown article is reported for each language that lists it', () => {
  const posts = [post('basics', 'en')];
  const paths = [
    path('foundations', 'en', ['basics', 'missing']),
    path('foundations', 'pl', ['basics', 'missing']),
  ];
  assert.deepEqual(learningPathProblems(paths, posts), [
    'Learning path "foundations" (en) lists unknown article "missing"',
    'Learning path "foundations" (pl) lists unknown article "missing"',
  ]);
});

test('pages do not count as articles', () => {
  const posts = [post('consulting', 'en', { source: 'pages' })];
  const paths = [path('foundations', 'en', ['consulting'])];
  assert.deepEqual(learningPathProblems(paths, posts), [
    'Learning path "foundations" (en) lists unknown article "consulting"',
  ]);
});

test('an article with only a placeholder copy in another language is unknown', () => {
  const posts = [post('orphan', 'en', { placeholder: true })];
  const paths = [path('foundations', 'pl', ['orphan'])];
  assert.deepEqual(learningPathProblems(paths, posts), [
    'Learning path "foundations" (pl) lists unknown article "orphan"',
  ]);
});

test('language versions of a path must list the same articles in the same order', () => {
  const posts = [post('first', 'en'), post('second', 'en')];
  const paths = [
    path('foundations', 'en', ['first', 'second']),
    path('foundations', 'pl', ['second', 'first']),
    path('testing', 'en', ['first']),
    path('testing', 'pl', ['first', 'second']),
  ];
  assert.deepEqual(learningPathProblems(paths, posts), [
    'Learning path "foundations" lists different articles in pl than in en',
    'Learning path "testing" lists different articles in pl than in en',
  ]);
});
