import type { Actions } from 'gatsby';
import type { ArticleEdge } from '../src/types/content.ts';
import type { Frontmatter } from '../src/types/content.ts';
import netlifyRedirects from 'gatsby-plugin-netlify/create-redirects.js';
import { temporaryDirectory } from '../tests/helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from 'vitest';
const writeRedirects = netlifyRedirects.default;

test('opted-in aliases redirect once to English, excluding self aliases and unconfigured posts', async () => {
  const { createPages, onPreBuild } = await import('./node.ts');
  const directory = temporaryDirectory('article-redirects-');
  function article(
    language: string,
    slug: string,
    aliases: Partial<Frontmatter> = {},
  ): ArticleEdge {
    return {
      node: {
        id: `${language}-${slug}`,
        frontmatter: { title: `Article ${slug}`, related: [], ...aliases },
        fields: { slug: `/${slug}/`, langKey: language, source: 'posts' },
      },
    };
  }
  const nodes = [
    article('en', 'imported', {
      redirectFrom: '/imported/',
      redirectAliases: ['/original-title/', '/imported/', '/en/imported/'],
    }),
    // Polish copies must not steal the English alias, even if metadata includes it.
    article('pl', 'imported', { redirectFrom: '/imported/' }),
    article('en', 'existing'),
  ];
  const expected = [
    '/imported/ /en/imported/ 301',
    '/original-title/ /en/imported/ 301',
  ];
  const redirects: Parameters<Actions['createRedirect']>[0][] = [];
  const pages: Parameters<Actions['createPage']>[0][] = [];
  const actions = {
    createPage: (page: Parameters<Actions['createPage']>[0]) =>
      pages.push(page),
    createRedirect: (redirect: Parameters<Actions['createRedirect']>[0]) =>
      redirects.push(redirect),
  };
  await createPages(
    {
      actions,
      graphql: () => {
        // Cover resolution is verified by the generated search-index tests.
        return Promise.resolve({
          data: {
            allMarkdownRemark: { edges: nodes },
            searchCovers: { nodes: [] },
            learningPaths: { nodes: [] },
          },
        });
      },
    } as unknown as Parameters<typeof createPages>[0],
    { plugins: [] },
    () => {},
  );
  assert.equal(redirects.length, expected.length);
  for (const redirect of redirects) {
    assert.equal(redirect.isPermanent, true);
    assert.equal(redirect.statusCode, 301);
    assert.equal(redirect.conditions, undefined);
    assert(pages.some((page) => page.path === redirect.toPath));
  }
  await onPreBuild(
    { actions } as unknown as Parameters<typeof onPreBuild>[0],
    { plugins: [] },
    () => {},
  );
  await writeRedirects(
    { publicFolder: (file) => path.join(directory, file) },
    redirects,
    [],
  );
  const output = await fs.readFile(path.join(directory, '_redirects'), 'utf8');
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, ' '));
  for (const redirect of expected) {
    assert.equal(lines.filter((line) => line === redirect).length, 1);
    assert(
      !lines.some((line) => /^\/\* /.test(line)),
      'Final hosting fallbacks live in netlify.toml',
    );
  }
  assert(!lines.some((line) => line.startsWith('/existing/ ')));
});

test('merged tag URLs redirect permanently to created canonical tag pages', async () => {
  const { createPages } = await import('./node.ts');
  const article = (
    language: string,
    slug: string,
    tags: string[],
  ): ArticleEdge => ({
    node: {
      id: `${language}-${slug}`,
      frontmatter: { title: `Article ${slug}`, related: [], tags },
      fields: { slug: `/${slug}/`, langKey: language, source: 'posts' },
    },
  });
  const nodes = [
    article('en', 'boundaries', ['Architecture', 'Testing']),
    article('pl', 'polish-testing', ['Testing']),
  ];
  const redirects: Parameters<Actions['createRedirect']>[0][] = [];
  const pages: Parameters<Actions['createPage']>[0][] = [];
  await createPages(
    {
      actions: {
        createPage: (page: Parameters<Actions['createPage']>[0]) =>
          pages.push(page),
        createRedirect: (redirect: Parameters<Actions['createRedirect']>[0]) =>
          redirects.push(redirect),
      },
      graphql: () =>
        Promise.resolve({
          data: {
            allMarkdownRemark: { edges: nodes },
            searchCovers: { nodes: [] },
            learningPaths: { nodes: [] },
          },
        }),
    } as unknown as Parameters<typeof createPages>[0],
    { plugins: [] },
    () => {},
  );
  const tagRedirects = redirects.filter(({ fromPath }) =>
    fromPath.includes('/category/'),
  );
  assert.deepEqual(
    tagRedirects.map(({ fromPath, toPath }) => `${fromPath} ${toPath}`).sort(),
    [
      '/en/category/architecture/ /en/articles/tag/architecture/',
      '/en/category/software-architecture/ /en/articles/tag/architecture/',
      '/en/category/testing/ /en/articles/tag/testing/',
      '/en/category/tests/ /en/articles/tag/testing/',
      '/pl/category/architecture/ /en/articles/tag/architecture/',
      '/pl/category/software-architecture/ /en/articles/tag/architecture/',
      '/pl/category/testing/ /pl/articles/tag/testing/',
      '/pl/category/tests/ /pl/articles/tag/testing/',
    ],
  );
  for (const redirect of tagRedirects) {
    assert.equal(redirect.isPermanent, true);
    assert.equal(redirect.statusCode, 301);
    assert(pages.some((page) => page.path === redirect.toPath));
  }
});
