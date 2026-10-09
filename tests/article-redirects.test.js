const { temporaryDirectory } = require('./helpers/temporary-directory.mts');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { test } = require('node:test');
const yaml = require('js-yaml');
const writeRedirects = require('gatsby-plugin-netlify/create-redirects').default;

test('imported bare paths redirect permanently to English before the catch-all', async (t) => {
  const { createPages, onPreBuild } = await import('../gatsby-node.mjs');
  const directory = temporaryDirectory(t, 'article-redirects-');
  const root = path.resolve(__dirname, '../content/posts');
  const names = await fs.readdir(root);
  const archive = require('../import/architecture-weekly-audit.json').posts.filter(
    (post) => post.status === 'existing',
  );
  const entries = [
    ...archive,
    ...require('../import/architecture-weekly-missing.json'),
    ...require('../import/eventstore-posts.json'),
  ];
  const nodes = [];
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
      const frontmatter = yaml.load(markdown.split('---')[1]);
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
  const redirects = [],
    pages = [];
  const actions = {
    createPage: (page) => pages.push(page),
    createRedirect: (redirect) => redirects.push(redirect),
  };
  await createPages({
    actions,
    graphql: async (query) => {
      assert.match(query, /redirectFrom/);
      // Cover resolution is verified by the generated search-index tests.
      return { data: { allMarkdownRemark: { edges: nodes }, searchCovers: { nodes: [] } } };
    },
  });
  assert.equal(redirects.length, expected.length);
  for (const redirect of redirects) {
    assert.equal(redirect.isPermanent, true);
    assert.equal(redirect.statusCode, 301);
    assert.equal(redirect.conditions, undefined);
    assert(pages.some((page) => page.path === redirect.toPath));
  }
  onPreBuild({ actions }, {});
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
