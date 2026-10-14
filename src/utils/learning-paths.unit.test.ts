import assert from 'node:assert/strict';
import { test } from 'vitest';
import { guideSteps, learningPathProblems } from './learning-paths.ts';

const post = (
  slug: string,
  langKey: string,
  { source = 'posts', placeholder = false } = {},
) => ({
  id: `${langKey}:${slug}`,
  fields: { slug: `/${slug}/`, langKey, source },
  frontmatter: {
    title: `Article ${slug} (${langKey})`,
    useDefaultLangCanonical: placeholder,
  },
});

const path = (
  pathSlug: string,
  langKey: string,
  articles: string[],
  details: { icon?: string; description?: string; cover?: string } = {
    icon: '📡',
    description: `About ${pathSlug}.`,
    cover: 'cover.png',
  },
) => ({
  fields: { pathSlug, langKey },
  frontmatter: { title: `Path ${pathSlug}`, articles, ...details },
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

test('every language version of a path needs an icon, a description and a cover', () => {
  const posts = [post('basics', 'en')];
  const paths = [
    path('foundations', 'en', ['basics']),
    path('foundations', 'pl', ['basics'], {}),
    path('testing', 'en', ['basics'], { icon: '🧪', description: ' ' }),
  ];
  assert.deepEqual(learningPathProblems(paths, posts), [
    'Learning path "foundations" (pl) has no icon',
    'Learning path "foundations" (pl) has no description',
    'Learning path "foundations" (pl) has no cover',
    'Learning path "testing" (en) has no description',
    'Learning path "testing" (en) has no cover',
  ]);
});

test("a guide step names the guide, the position and the next article in the reader's language", () => {
  const posts = [
    post('basics', 'en'),
    post('basics', 'pl', { placeholder: true }),
    post('advanced', 'en'),
    post('advanced', 'pl'),
  ];
  const paths = [
    path('foundations', 'pl', ['basics', 'advanced']),
    path('foundations', 'en', ['basics', 'advanced']),
  ];
  assert.deepEqual(guideSteps(paths, posts, 'basics', 'pl'), [
    {
      title: 'Path foundations',
      path: '/pl/guides/foundations/',
      step: 1,
      total: 2,
      next: { title: 'Article advanced (pl)', path: '/pl/advanced/' },
    },
  ]);
  assert.deepEqual(guideSteps(paths, posts, 'advanced', 'en'), [
    {
      title: 'Path foundations',
      path: '/en/guides/foundations/',
      step: 2,
      total: 2,
    },
  ]);
});

test('an article in several guides gets one step per guide, in guide order', () => {
  const posts = [post('shared', 'en'), post('other', 'en')];
  const paths = [
    {
      ...path('later', 'en', ['other', 'shared']),
      fields: { pathSlug: 'later', langKey: 'en', prefix: '11' },
    },
    {
      ...path('earlier', 'en', ['shared']),
      fields: { pathSlug: 'earlier', langKey: 'en', prefix: '09' },
    },
  ];
  assert.deepEqual(
    guideSteps(paths, posts, 'shared', 'en').map(({ path, step, total }) => ({
      path,
      step,
      total,
    })),
    [
      { path: '/en/guides/earlier/', step: 1, total: 1 },
      { path: '/en/guides/later/', step: 2, total: 2 },
    ],
  );
  assert.deepEqual(guideSteps(paths, posts, 'unlisted', 'en'), []);
});

test('a Polish guide falls back to the English article as the next step', () => {
  const posts = [
    post('first', 'en'),
    post('first', 'pl'),
    post('english-only', 'en'),
  ];
  const paths = [path('foundations', 'pl', ['first', 'english-only'])];
  assert.deepEqual(guideSteps(paths, posts, 'first', 'pl')[0]?.next, {
    title: 'Article english-only (en)',
    path: '/en/english-only/',
  });
});
