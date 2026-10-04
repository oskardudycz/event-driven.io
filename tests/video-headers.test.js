const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const config = require("../gatsby-config");
const buildHeaders = require("gatsby-plugin-netlify/build-headers-program").default;
const { DEFAULT_OPTIONS } = require("gatsby-plugin-netlify/constants");

test("Netlify output sends the referrer YouTube requires and keeps other headers", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "video-headers-"));
  const plugin = config.plugins.find((entry) => entry.resolve === "gatsby-plugin-netlify");
  try {
    await buildHeaders({
      manifest: {}, pages: [], pathPrefix: "", publicFolder: (file) => path.join(directory, file),
    }, { ...DEFAULT_OPTIONS, ...plugin.options }, { warn: (message) => { throw new Error(message); } });
    const headers = await fs.readFile(path.join(directory, "_headers"), "utf8");
    assert.match(headers, /\/\*\n(?:  [^\n]+\n)*  Referrer-Policy: strict-origin-when-cross-origin\n/);
    assert.doesNotMatch(headers, /Referrer-Policy: same-origin/);
    assert.equal((headers.match(/Referrer-Policy:/g) || []).length, 1);
    assert.match(headers, /X-Frame-Options: DENY/);
    assert.match(headers, /X-Content-Type-Options: nosniff/);
    assert.match(headers, /Content-Type: text\/plain; charset=UTF-8/);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test('Gatsby video plugin renders bare IDs and preserves URL timestamps and titles', () => {
  const render = require('../plugins/gatsby-remark-video');
  const remark = config.plugins.find(p => p.resolve === 'gatsby-transformer-remark');
  const video = remark.options.plugins.find(p => typeof p === 'object' && p.resolve.includes('gatsby-remark-video'));
  const ast = { type: 'root', children: [
    { type: 'inlineCode', value: 'youtube: sQbkUl7-z_U' },
    { type: 'inlineCode', value: 'youtube: [A titled video](https://www.youtube.com/watch?v=sQbkUl7-z_U&t=1m30s&end=120)' },
    { type: 'inlineCode', value: 'youtube: [Another position](https://www.youtube-nocookie.com/embed/sQbkUl7-z_U?start=30)' },
  ] };
  render({ markdownAST: ast }, video.options);
  for (const node of ast.children) {
    assert.equal(node.type, 'html');
    assert.match(node.value, /youtube-nocookie\.com\/embed\/sQbkUl7-z_U/);
    assert.match(node.value, /referrerpolicy="strict-origin-when-cross-origin"/);
    assert.match(node.value, /loading="lazy"/);
    assert.doesNotMatch(node.value, /Error:|sandbox=/);
  }
  assert.match(ast.children[1].value, /start=90/);
  assert.match(ast.children[1].value, /end=120/);
  assert.match(ast.children[1].value, /title="A titled video"/);
  assert.match(ast.children[2].value, /start=30/);
});
