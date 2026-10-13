import type { ArticleEdge } from '../src/types/content.ts';
import type { LearningPathNode } from '../src/utils/learning-paths.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';

async function fieldsFor(sourceInstanceName: string, relativePath: string) {
  const { onCreateNode } = await import('./node.ts');
  const file = {
    id: 'file',
    internal: { type: 'File' },
    sourceInstanceName,
    relativePath,
  };
  const markdown = {
    id: 'markdown',
    parent: 'file',
    internal: { type: 'MarkdownRemark' },
  };
  const fields: Record<string, string> = {};
  await onCreateNode(
    {
      node: markdown,
      getNode: (id: string) => (id === 'file' ? file : undefined),
      actions: {
        createNodeField: ({ name, value }: { name: string; value: string }) => {
          fields[name] = value;
        },
      },
    } as unknown as Parameters<typeof onCreateNode>[0],
    { plugins: [] },
    () => {},
  );
  return fields;
}

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

async function createPagesWith(learningPaths: LearningPathNode[]) {
  const { createPages } = await import('./node.ts');
  const edges: ArticleEdge[] = ['en', 'pl'].map((langKey) => ({
    node: {
      id: `${langKey}-basics`,
      frontmatter: { title: 'Basics', related: [] },
      fields: { slug: '/basics/', langKey, source: 'posts' },
    },
  }));
  const pages: string[] = [];
  await createPages(
    {
      actions: {
        createPage: ({ path }: { path: string }) => pages.push(path),
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

const path = (langKey: string, articles: string[]): LearningPathNode => ({
  fields: { pathSlug: 'foundations', langKey, prefix: '01' },
  frontmatter: { title: 'Foundations', articles },
});

test('a build with valid learning paths creates article pages', async () => {
  const pages = await createPagesWith([
    path('en', ['basics']),
    path('pl', ['basics']),
  ]);
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
