const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const yaml = require("js-yaml");
const { createPages, onPreBuild } = require("../gatsby-node");
const writeRedirects = require("gatsby-plugin-netlify/create-redirects").default;

test("imported bare paths redirect permanently to English before the catch-all", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "article-redirects-"));
  try {
    const root = path.resolve(__dirname, "../content/posts");
    const names = await fs.readdir(root);
    const entries = [...require("../import/substack-posts.json"), ...require("../import/eventstore-posts.json")];
    const nodes = [];
    const expected = [];
    for (const entry of entries) {
      const slug = entry.slug || entry.url.replace(/\/$/, "").split("/").pop();
      const name = names.find((name) => name.endsWith(`--${slug}`));
      assert(name, `Missing imported article: ${slug}`);
      expected.push(`/${slug}/ /en/${slug}/ 301`);
      for (const lang of ["en", "pl"]) {
        const markdown = await fs.readFile(path.join(root, name, `index.${lang}.md`), "utf8");
        const frontmatter = yaml.load(markdown.split("---")[1]);
        assert.equal(frontmatter.redirectFrom, lang === "en" ? `/${slug}/` : undefined);
        nodes.push({ node: {
          id: `${lang}-${slug}`, frontmatter,
          fields: { slug: `/${slug}/`, langKey: lang, source: "posts" },
        } });
      }
    }
    // Existing posts that do not opt in should not get new redirects.
    nodes.push({ node: { id: "existing", frontmatter: { title: "Existing post" },
      fields: { slug: "/existing/", langKey: "en", source: "posts" } } });
    const redirects = [], pages = [];
    const actions = {
      createPage: (page) => pages.push(page),
      createRedirect: (redirect) => redirects.push(redirect),
    };
    await createPages({ actions, graphql: async (query) => {
      assert.match(query, /redirectFrom/);
      return { data: { allMarkdownRemark: { edges: nodes } } };
    } });
    assert.equal(redirects.length, entries.length);
    for (const redirect of redirects) {
      assert.equal(redirect.isPermanent, true);
      assert.equal(redirect.statusCode, 301);
      assert.equal(redirect.conditions, undefined);
      assert(pages.some((page) => page.path === redirect.toPath));
    }
    onPreBuild({ actions }, {});
    await writeRedirects({ publicFolder: (file) => path.join(directory, file) }, redirects, []);
    const output = await fs.readFile(path.join(directory, "_redirects"), "utf8");
    const lines = output.split(/\r?\n/).map((line) => line.trim().replace(/\s+/g, " "));
    for (const redirect of expected) {
      assert.equal(lines.filter((line) => line === redirect).length, 1);
      assert(lines.indexOf(redirect) < lines.indexOf("/* /404/ 302"));
    }
    assert(!lines.some((line) => line.startsWith("/existing/ ")));
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
