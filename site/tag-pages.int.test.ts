import type { Actions } from 'gatsby';
import type { ArticleEdge } from '../src/types/content.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';
import { markdownFields } from '../tests/helpers/markdown-fields.ts';

type CreatedPage = {
  path: string;
  component: string;
  context: Record<string, unknown>;
};
type CreatedRedirect = Parameters<Actions['createRedirect']>[0] & {
  conditions?: { language?: string };
};

const article = (
  language: string,
  slug: string,
  tags: string[],
  useDefaultLangCanonical = false,
): ArticleEdge => ({
  node: {
    id: `${language}-${slug}`,
    frontmatter: {
      title: `Article ${slug}`,
      related: [],
      tags,
      useDefaultLangCanonical,
    },
    fields: { slug: `/${slug}/`, langKey: language, source: 'posts' },
  },
});

async function createPagesWith(edges: ArticleEdge[]) {
  const { createPages } = await import('./node.ts');
  const pages: CreatedPage[] = [];
  const redirects: CreatedRedirect[] = [];
  await createPages(
    {
      actions: {
        createPage: (page: CreatedPage) => pages.push(page),
        createRedirect: (redirect: CreatedRedirect) => redirects.push(redirect),
      },
      graphql: () =>
        Promise.resolve({
          data: {
            allMarkdownRemark: { edges },
            searchCovers: { nodes: [] },
            learningPaths: { nodes: [] },
          },
        }),
    } as unknown as Parameters<typeof createPages>[0],
    { plugins: [] },
    () => {},
  );
  return { pages, redirects };
}

const fixture = [
  article('en', 'newer', ['Event Sourcing', 'Cloud']),
  article('pl', 'newer', ['Event Sourcing'], true),
  article('en', 'older', ['Event Sourcing']),
  article('pl', 'polish-only', ['Community']),
];

test('tag pages live under the article archive in every language with a tagged route', async () => {
  const { pages } = await createPagesWith(fixture);
  const tagPages = pages.filter(({ path }) => path.includes('/tag/'));
  assert.deepEqual(
    tagPages.map(({ path, component, context }) => ({
      path,
      component: component.split('/').pop(),
      context,
    })),
    [
      {
        path: '/en/articles/tag/event-sourcing/',
        component: 'TagTemplate.tsx',
        context: {
          tag: 'Event Sourcing',
          tagSlug: 'event-sourcing',
          lang: 'en',
          langKey: 'en',
          originalPath: '/articles/tag/event-sourcing/',
          availableLanguages: ['en', 'pl'],
          tagPostIds: ['en-newer', 'en-older'],
        },
      },
      {
        path: '/en/articles/tag/cloud/',
        component: 'TagTemplate.tsx',
        context: {
          tag: 'Cloud',
          tagSlug: 'cloud',
          lang: 'en',
          langKey: 'en',
          originalPath: '/articles/tag/cloud/',
          availableLanguages: ['en', 'pl'],
          tagPostIds: ['en-newer'],
        },
      },
      {
        path: '/pl/articles/tag/event-sourcing/',
        component: 'TagTemplate.tsx',
        context: {
          tag: 'Event Sourcing',
          tagSlug: 'event-sourcing',
          lang: 'pl',
          langKey: 'pl',
          originalPath: '/articles/tag/event-sourcing/',
          availableLanguages: ['en', 'pl'],
          tagPostIds: ['pl-newer'],
        },
      },
      {
        path: '/pl/articles/tag/cloud/',
        component: 'TagTemplate.tsx',
        context: {
          tag: 'Cloud',
          tagSlug: 'cloud',
          lang: 'pl',
          langKey: 'pl',
          originalPath: '/articles/tag/cloud/',
          availableLanguages: ['en', 'pl'],
          tagPostIds: ['pl-newer'],
        },
      },
      {
        path: '/pl/articles/tag/community/',
        component: 'TagTemplate.tsx',
        context: {
          tag: 'Community',
          tagSlug: 'community',
          lang: 'pl',
          langKey: 'pl',
          originalPath: '/articles/tag/community/',
          availableLanguages: ['pl'],
          tagPostIds: ['pl-polish-only'],
        },
      },
    ],
  );
  assert.deepEqual(
    pages.filter(({ path }) => path.includes('/category/')),
    [],
  );
});

test('tag description files get a tag slug, but no published route', async () => {
  assert.deepEqual(
    await markdownFields('tags', 'event-driven-architecture/index.pl.md'),
    {
      tagSlug: 'event-driven-architecture',
      prefix: '',
      source: 'tags',
      langKey: 'pl',
    },
  );
});

test('article tags link to the tag page in their language, or the English one', async () => {
  const { pages } = await createPagesWith([
    article('en', 'cloudy', ['Cloud', 'Testing']),
    article('pl', 'cloudy', ['Cloud'], true),
    article('pl', 'polish-testing', ['Testing']),
    article('en', 'english-testing', ['Testing']),
  ]);
  const tagLinks = (path: string) =>
    pages.find((page) => page.path === path)?.context.tagLinks;
  assert.deepEqual(tagLinks('/en/cloudy/'), [
    { tag: 'Cloud', path: '/en/articles/tag/cloud/' },
    { tag: 'Testing', path: '/en/articles/tag/testing/' },
  ]);
  assert.deepEqual(tagLinks('/pl/cloudy/'), [
    { tag: 'Cloud', path: '/pl/articles/tag/cloud/' },
  ]);
  assert.deepEqual(tagLinks('/pl/polish-testing/'), [
    { tag: 'Testing', path: '/pl/articles/tag/testing/' },
  ]);
  const paths = new Set(pages.map(({ path }) => path));
  for (const page of pages)
    for (const link of (page.context.tagLinks || []) as { path: string }[])
      assert(paths.has(link.path), `${page.path}: ${link.path}`);
});

test('a Polish article whose tag has no Polish page links to the English tag page', async () => {
  const { pages } = await createPagesWith([
    article('en', 'english-cqrs', ['CQRS']),
    article('pl', 'polish-article', ['CQRS']),
  ]);
  // The Polish article is canonical, so CQRS gets a Polish page through it.
  assert.deepEqual(
    pages.find(({ path }) => path === '/pl/polish-article/')?.context.tagLinks,
    [{ tag: 'CQRS', path: '/pl/articles/tag/cqrs/' }],
  );
  const { pages: englishOnly } = await createPagesWith([
    article('en', 'english-cqrs', ['CQRS']),
    article('pl', 'stale-copy', ['CQRS'], true),
    article('en', 'stale-copy', ['Event Sourcing']),
  ]);
  assert.deepEqual(
    englishOnly.find(({ path }) => path === '/pl/stale-copy/')?.context
      ?.tagLinks,
    [{ tag: 'CQRS', path: '/en/articles/tag/cqrs/' }],
  );
});

test('former category URLs redirect permanently, in one hop, to created tag pages', async () => {
  const { pages, redirects } = await createPagesWith(fixture);
  const categoryRedirects = redirects.filter(({ fromPath }) =>
    fromPath.includes('/category/'),
  );
  assert.deepEqual(
    categoryRedirects
      .map(({ fromPath, toPath }) => `${fromPath} ${toPath}`)
      .sort(),
    [
      '/en/category/cloud/ /en/articles/tag/cloud/',
      '/en/category/event-sourcing/ /en/articles/tag/event-sourcing/',
      '/pl/category/cloud/ /pl/articles/tag/cloud/',
      '/pl/category/community/ /pl/articles/tag/community/',
      '/pl/category/event-sourcing/ /pl/articles/tag/event-sourcing/',
    ],
  );
  for (const redirect of categoryRedirects) {
    assert.equal(redirect.isPermanent, true);
    assert.equal(redirect.statusCode, 301);
    assert.equal(redirect.conditions, undefined);
    assert(pages.some((page) => page.path === redirect.toPath));
  }
});

test('bare guide and category URLs redirect to the visitor’s guides index', async () => {
  const { onPreBuild } = await import('./node.ts');
  const redirects: CreatedRedirect[] = [];
  await onPreBuild(
    {
      actions: {
        createRedirect: (redirect: CreatedRedirect) => redirects.push(redirect),
      },
    } as unknown as Parameters<typeof onPreBuild>[0],
    { plugins: [] },
    () => {},
  );
  const bare = redirects
    .filter(({ fromPath }) => ['/guides/', '/category/'].includes(fromPath))
    .map(
      ({ fromPath, toPath, conditions, statusCode }) =>
        `${fromPath} ${toPath} ${statusCode}${conditions ? ` Language=${conditions.language}` : ''}`,
    );
  assert.deepEqual(bare, [
    '/guides/ /en/guides/ 301 Language=en',
    '/guides/ /pl/guides/ 301 Language=pl',
    '/guides/ /en/guides/ 301',
    '/category/ /en/guides/ 301 Language=en',
    '/category/ /pl/guides/ 301 Language=pl',
    '/category/ /en/guides/ 301',
  ]);
});
