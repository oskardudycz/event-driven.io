import { beforeEach, expect, test, vi } from 'vitest';
import type { SourceDocument } from './catalog.ts';
const input = vi.hoisted(() => ({ documents: [] as SourceDocument[] }));
vi.mock('./catalog.ts', () => ({
  readCatalog: () => Promise.resolve(input.documents),
}));
import { sitePages } from './site.ts';
beforeEach(() => {
  input.documents = [];
});
function article(
  language: string,
  slug: string,
  placeholder = false,
): SourceDocument {
  return {
    id: `${language}:${slug}`,
    file: `content/posts/2026-01-01--${slug}/index.${language}.md`,
    body: '',
    fields: {
      slug: `/${slug}/`,
      langKey: language,
      source: 'posts',
      prefix: '2026-01-01',
    },
    frontmatter: {
      title: slug,
      tags: ['CQRS'],
      ...(placeholder ? { useDefaultLangCanonical: true } : {}),
    },
  };
}
function guide(language: string, articles: string[]): SourceDocument {
  return {
    id: `guide:${language}`,
    file: `content/paths/01--foundations/index.${language}.md`,
    body: '',
    coverFile: 'content/paths/01--foundations/cover.png',
    fields: {
      slug: '/foundations/',
      pathSlug: 'foundations',
      langKey: language,
      source: 'paths',
      prefix: '01',
    },
    frontmatter: {
      title: 'Foundations',
      description: 'A guide.',
      icon: '🧭',
      articles,
    },
  };
}
test('route definitions preserve placeholder navigation, canonical languages and locale tag membership', async () => {
  input.documents = [
    article('en', 'first'),
    article('pl', 'first', true),
    article('pl', 'polish-only'),
  ];
  const pages = await sitePages();
  const placeholder = pages.find((page) => page.route === '/pl/first/')!;
  expect(placeholder.context.availableLanguages).toEqual(['en', 'pl']);
  expect(placeholder.context.canonicalLanguages).toEqual(['en']);
  expect(placeholder.tagLinks).toEqual([
    { tag: 'CQRS', path: '/pl/articles/tag/cqrs/' },
  ]);
  expect(
    pages
      .find((page) => page.route === '/pl/articles/tag/cqrs/')
      ?.articles.map(({ node }) => node.fields.slug),
  ).toEqual(['/first/', '/polish-only/']);
  expect(
    pages
      .filter((page) => page.kind === 'notFound')
      .map((page) => page.route)
      .sort(),
  ).toEqual(
    [
      '/404.html',
      '/404/',
      '/en/404.html',
      '/en/404/',
      '/pl/404.html',
      '/pl/404/',
    ].sort(),
  );
});
test('guides retain authored article order and the locale route of available placeholder copies', async () => {
  input.documents = [
    article('en', 'first'),
    article('pl', 'first', true),
    article('en', 'second'),
    article('pl', 'second', true),
    guide('en', ['second', 'first']),
    guide('pl', ['second', 'first']),
  ];
  const pages = await sitePages();
  const selected = pages.find(
    (page) => page.route === '/pl/guides/foundations/',
  )!;
  expect(
    selected.articles.map(
      ({ node }) => `${node.fields.langKey}${node.fields.slug}`,
    ),
  ).toEqual(['pl/second/', 'pl/first/']);
  expect(pages.find((page) => page.route === '/pl/first/')?.guides).toEqual([
    expect.objectContaining({
      path: '/pl/guides/foundations/',
      step: 2,
      total: 2,
    }),
  ]);
});
test('colliding published routes and invalid guide references fail the build', async () => {
  const duplicate = article('en', 'collision');
  input.documents = [
    duplicate,
    {
      ...duplicate,
      id: 'page',
      fields: { ...duplicate.fields, source: 'pages' },
    },
  ];
  await expect(sitePages()).rejects.toThrow(/collision/);
  input.documents = [
    article('en', 'first'),
    guide('en', ['missing']),
    guide('pl', ['missing']),
  ];
  await expect(sitePages()).rejects.toThrow(/missing/);
});
