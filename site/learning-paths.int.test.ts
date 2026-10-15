import type { ArticleEdge } from '../src/types/content.ts';
import type { LearningPathNode } from '../src/utils/learning-paths.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';
import { markdownFields as fieldsFor } from '../tests/helpers/markdown-fields.ts';

test('learning path files get a path slug and order, but no published route', async () => {
  assert.deepEqual(
    await fieldsFor('paths', '13--event-sourcing-foundations/index.pl.md'),
    {
      pathSlug: 'event-sourcing-foundations',
      prefix: '13',
      source: 'paths',
      langKey: 'pl',
    },
  );
  const post = await fieldsFor(
    'posts',
    '2022-03-16--introduction_to_event_sourcing/index.en.md',
  );
  assert.equal(post.slug, '/introduction_to_event_sourcing/');
  assert.equal(post.pathSlug, undefined);
});

type CreatedPage = {
  path: string;
  component: string;
  context: Record<string, unknown>;
};

const article = (slug: string, langKey: string, title: string) => ({
  node: {
    id: `${langKey}-${slug}`,
    frontmatter: { title, related: [] },
    fields: { slug: `/${slug}/`, langKey, source: 'posts' },
  },
});

async function createPagesWith(
  learningPaths: LearningPathNode[],
  edges: ArticleEdge[] = ['en', 'pl'].map((langKey) =>
    article('basics', langKey, 'Basics'),
  ),
) {
  const { createPages } = await import('./node.ts');
  const pages: CreatedPage[] = [];
  await createPages(
    {
      actions: {
        createPage: (page: CreatedPage) => pages.push(page),
        createRedirect: () => {},
      },
      graphql: () =>
        Promise.resolve({
          data: {
            allMarkdownRemark: { edges },
            searchCovers: { nodes: [] },
            learningPaths: { nodes: learningPaths },
          },
        }),
    } as unknown as Parameters<typeof createPages>[0],
    { plugins: [] },
    () => {},
  );
  return pages;
}

const path = (
  langKey: string,
  articles: string[],
  pathSlug = 'foundations',
  prefix = '01',
): LearningPathNode => ({
  fields: { pathSlug, langKey, prefix },
  frontmatter: {
    title: `Foundations (${langKey})`,
    articles,
    icon: '🧱',
    description: 'Start here.',
    cover: { id: 'cover-file' },
  },
});

const pageAt = (pages: CreatedPage[], route: string) => {
  const page = pages.find((page) => page.path === route);
  assert.ok(page, `Missing page ${route}`);
  return page;
};

test('a build with valid learning paths creates article pages', async () => {
  const pages = (
    await createPagesWith([path('en', ['basics']), path('pl', ['basics'])])
  ).map((page) => page.path);
  assert.ok(pages.includes('/en/basics/'));
  assert.ok(pages.includes('/pl/basics/'));
});

test('a learning path with an unknown article fails the build', async () => {
  await assert.rejects(
    createPagesWith([path('en', ['basics', 'missing'])]),
    /Learning path "foundations" \(en\) lists unknown article "missing"/,
  );
});

test('learning path translations listing different articles fail the build', async () => {
  await assert.rejects(
    createPagesWith([path('en', ['basics']), path('pl', [])]),
    /Learning path "foundations" lists different articles in pl than in en/,
  );
});

test('a learning path whose cover does not resolve fails the build', async () => {
  const withoutCover = path('en', ['basics']);
  withoutCover.frontmatter.cover = null;
  await assert.rejects(
    createPagesWith([withoutCover]),
    /Learning path "foundations" \(en\) has no cover/,
  );
});

test('every language gets a guide index and self-canonical guide pages listing articles in its language', async () => {
  const edges = [
    article('basics', 'en', 'Basics'),
    article('basics', 'pl', 'Podstawy'),
    article('advanced', 'en', 'Advanced'),
  ];
  const paths = [
    path('pl', ['basics', 'advanced']),
    path('en', ['basics', 'advanced']),
    path('en', ['advanced'], 'testing', '02'),
    path('pl', ['advanced'], 'testing', '02'),
  ];
  const pages = await createPagesWith(paths, edges);

  for (const language of ['en', 'pl']) {
    const index = pageAt(pages, `/${language}/guides/`);
    assert.match(index.component, /GuidesTemplate\.tsx$/);
    assert.deepEqual(index.context, {
      lang: language,
      langKey: language,
      originalPath: '/guides/',
      availableLanguages: ['en', 'pl'],
    });
  }
  const guide = pageAt(pages, '/pl/guides/foundations/');
  assert.match(guide.component, /GuideTemplate\.tsx$/);
  assert.deepEqual(guide.context, {
    lang: 'pl',
    langKey: 'pl',
    pathSlug: 'foundations',
    originalPath: '/guides/foundations/',
    availableLanguages: ['en', 'pl'],
    articleIds: ['pl-basics', 'en-advanced'],
  });
  assert.deepEqual(
    pageAt(pages, '/en/guides/foundations/').context.articleIds,
    ['en-basics', 'en-advanced'],
  );
  assert.ok(pageAt(pages, '/en/guides/testing/'));
  assert.equal(
    pages.filter((page) => page.path.includes('/guides/')).length,
    6,
  );
});

test('an article page knows its place in every guide that lists it', async () => {
  const edges = [
    article('basics', 'en', 'Basics'),
    article('basics', 'pl', 'Podstawy'),
    article('advanced', 'en', 'Advanced'),
    article('advanced', 'pl', 'Zaawansowane'),
  ];
  const pages = await createPagesWith(
    [path('en', ['basics', 'advanced']), path('pl', ['basics', 'advanced'])],
    edges,
  );
  assert.deepEqual(pageAt(pages, '/pl/basics/').context.guides, [
    {
      title: 'Foundations (pl)',
      path: '/pl/guides/foundations/',
      step: 1,
      total: 2,
      next: { title: 'Zaawansowane', path: '/pl/advanced/' },
    },
  ]);
  assert.deepEqual(pageAt(pages, '/en/advanced/').context.guides, [
    {
      title: 'Foundations (en)',
      path: '/en/guides/foundations/',
      step: 2,
      total: 2,
    },
  ]);
});

test('an article cannot claim the guides route', async () => {
  await assert.rejects(
    createPagesWith(
      [path('en', ['guides'])],
      [article('guides', 'en', 'Guides')],
    ),
    /Multiple published documents claim \/en\/guides\//,
  );
});
