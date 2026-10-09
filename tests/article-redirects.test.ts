import type { Actions } from 'gatsby';
import type { ArticleEdge } from '../src/types/content.ts';
import { readFrontmatter } from './helpers/frontmatter.ts';
import netlifyRedirects from 'gatsby-plugin-netlify/create-redirects.js';
import archiveAudit from '../import/architecture-weekly-audit.json' with { type: 'json' };
import missingPosts from '../import/architecture-weekly-missing.json' with { type: 'json' };
import eventStorePosts from '../import/eventstore-posts.json' with { type: 'json' };
import { temporaryDirectory } from './helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
const writeRedirects = netlifyRedirects.default;

void test('imported bare paths redirect permanently to English before the catch-all', async (t) => {
  const { createPages, onPreBuild } = await import('../site/node.ts');
  const directory = temporaryDirectory(t, 'article-redirects-');
  const root = path.resolve(import.meta.dirname, '../content/posts');
  const names = await fs.readdir(root);
  const archive = archiveAudit.posts.filter((post) => post.status === 'existing');
  const entries: { directory?: string; slug?: string; url: string }[] = [
    ...archive,
    ...missingPosts,
    ...eventStorePosts,
  ];
  const nodes: ArticleEdge[] = [];
  const expected = [];
  for (const entry of entries) {
    const slug =
      entry.directory?.split('--')[1] ||
      entry.slug ||
      entry.url.replace(/\/$/, '').split('/').pop();
    const name = entry.directory || names.find((name) => name.endsWith(`--${slug}`));
    assert(name, `Missing imported article: ${slug}`);
    expected.push(`/${slug}/ /en/${slug}/ 301`);
    for (const lang of ['en', 'pl']) {
      const markdown = await fs.readFile(path.join(root, name, `index.${lang}.md`), 'utf8');
      const frontmatter = readFrontmatter(markdown.split('---')[1]);
      assert.equal(frontmatter.redirectFrom, lang === 'en' ? `/${slug}/` : undefined);
      if (lang === 'en') {
        for (const alias of frontmatter.redirectAliases || [])
          expected.push(`${alias} /en/${slug}/ 301`);
        const sourceSlug = entry.url.replace(/\/$/, '').split('/').pop();
        assert(
          [frontmatter.redirectFrom, ...(frontmatter.redirectAliases || [])].includes(
            `/${sourceSlug}/`,
          ),
        );
      }
      // This test concerns redirects; related content is verified by the SEO tests.
      frontmatter.related = [];
      nodes.push({
        node: {
          id: `${lang}-${slug}`,
          frontmatter,
          fields: { slug: `/${slug}/`, langKey: lang, source: 'posts' },
        },
      });
    }
  }
  // Existing posts that do not opt in should not get new redirects.
  nodes.push({
    node: {
      id: 'existing',
      frontmatter: { title: 'Existing post' },
      fields: { slug: '/existing/', langKey: 'en', source: 'posts' },
    },
  });
  const redirects: Parameters<Actions['createRedirect']>[0][] = [];
  const pages: Parameters<Actions['createPage']>[0][] = [];
  const actions = {
    createPage: (page: Parameters<Actions['createPage']>[0]) => pages.push(page),
    createRedirect: (redirect: Parameters<Actions['createRedirect']>[0]) =>
      redirects.push(redirect),
  };
  await createPages(
    {
      actions,
      graphql: (query: string) => {
        assert.match(query, /redirectFrom/);
        // Cover resolution is verified by the generated search-index tests.
        return Promise.resolve({
          data: { allMarkdownRemark: { edges: nodes }, searchCovers: { nodes: [] } },
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
  await writeRedirects({ publicFolder: (file) => path.join(directory, file) }, redirects, []);
  const output = await fs.readFile(path.join(directory, '_redirects'), 'utf8');
  const lines = output.split(/\r?\n/).map((line) => line.trim().replace(/\s+/g, ' '));
  for (const redirect of expected) {
    assert.equal(lines.filter((line) => line === redirect).length, 1);
    assert(
      !lines.some((line) => /^\/\* /.test(line)),
      'Final hosting fallbacks live in netlify.toml',
    );
  }
  assert(!lines.some((line) => line.startsWith('/existing/ ')));
});
