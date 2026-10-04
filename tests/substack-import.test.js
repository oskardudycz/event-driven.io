const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const yaml = require("js-yaml");
const { importPost, extractPost, normalizeUrl, sourceLocation, originalImageUrl } = require("../import/import-substack");

const source = "https://example.substack.com/p/example";
const image = "https://substack-post-media.s3.amazonaws.com/public/images/example.png";
const cdn = `https://substackcdn.com/image/fetch/w_1200,f_auto/${encodeURIComponent(image)}`;
const html = `<!doctype html><html><head>
<meta property="og:title" content="A title: with punctuation">
<meta property="og:image" content="${cdn}">
<script type="application/ld+json">{"@type":"NewsArticle","datePublished":"2026-09-07T11:49:46Z"}</script>
</head><body><nav>Navigation must disappear</nav><div class="available-content"><div class="body markup">
<p>Hello <strong>world</strong>, <a href="/p/another">read more</a>.</p>
<p><em>That can be fine if you'</em><span>re learning.</span></p>
<figure><a class="image-link" href="${cdn}"><div class="image2-inset"><picture><source srcset="${cdn} 1200w"><img src="${cdn}" alt="Example image"></picture></div></a><figcaption>A caption.</figcaption></figure>
<h2>A heading</h2><blockquote><p>A quotation.</p></blockquote>
<ol><li>First</li><li>Second</li></ol><pre><code class="language-js">if (x &lt; 2) return true;</code></pre>
<table><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody><tr><td>one</td><td>1</td></tr></tbody></table>
<div class="youtube-wrap"><iframe src="https://www.youtube-nocookie.com/embed/abc?start=30" width="728" height="409" allowfullscreen="true" onload="bad()" srcdoc="bad"></iframe></div>
<p>Cheers!</p><div class="subscription-widget-wrap">Subscribe now</div>
</div></div><footer>Discussion and comments</footer></body></html>`;
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=", "base64");

test("URL validation and CDN originals", () => {
  assert.equal(normalizeUrl(`${source}/?utm_source=email#comments`), source);
  assert.throws(() => normalizeUrl(`${source}${source}`), /Expected/);
  assert.throws(() => normalizeUrl("file:///p/example"), /Expected/);
  assert.equal(originalImageUrl(cdn, source), image);
});

test("imports full article and local assets in both languages, preserving embeds", async () => {
  const output = await fs.mkdtemp(path.join(os.tmpdir(), "substack-test-"));
  const fetched = [];
  const download = async (url) => { fetched.push(url); return new Response(url === source ? html : png); };
  try {
    const directory = await importPost({ url: source, category: "Event Sourcing" }, { output, download });
    const english = await fs.readFile(path.join(directory, "index.en.md"), "utf8");
    const polish = await fs.readFile(path.join(directory, "index.pl.md"), "utf8");
    const [enMeta, enBody] = english.slice(4).split("---\n\n");
    const [plMeta, plBody] = polish.slice(4).split("---\n\n");
    assert.equal(enBody, plBody);
    assert.equal(yaml.load(enMeta).title, "A title: with punctuation");
    assert.equal(yaml.load(plMeta).useDefaultLangCanonical, true);
    assert.equal(yaml.load(enMeta).cover, "2026-09-07-cover.png");
    assert.equal(yaml.load(enMeta).redirectFrom, "/example/");
    assert.equal(yaml.load(plMeta).redirectFrom, undefined);
    assert.deepEqual(fetched, [source, image]); // cover and body reuse one download
    assert.deepEqual(await fs.readFile(path.join(directory, "2026-09-07-cover.png")), png);
    assert.match(enBody, /\*\*world\*\*/);
    assert.match(enBody, /<em>That can be fine if you'<\/em>re learning\./);
    assert.match(enBody, /\[read more\]\(https:\/\/example.substack.com\/p\/another\)/);
    assert.match(enBody, /!\[Example image\]\(2026-09-07-cover.png\)/);
    assert.doesNotMatch(enBody, /^\[$/m);
    assert.match(enBody, /A caption\./);
    assert.match(enBody, /## A heading/);
    assert.match(enBody, /```js\nif \(x < 2\) return true;/);
    assert.match(enBody, /\| Name \| Value \|/);
    assert.match(enBody, /<iframe[^>]+start=30[^>]+allowfullscreen/);
    assert.match(enBody, /referrerpolicy="strict-origin-when-cross-origin"/);
    assert.doesNotMatch(enBody, /Navigation|Discussion|Subscribe|onload|srcdoc/);
    const metadata = JSON.parse(await fs.readFile(path.join(directory, "substack-source.txt")));
    assert.equal(metadata.embeds, 1);
    await assert.rejects(importPost({ url: source }, { output, download }), /already exists/);
    assert.equal(await fs.readFile(path.join(directory, "index.en.md"), "utf8"), english);
  } finally { await fs.rm(output, { recursive: true, force: true }); }
});

test("failed image downloads leave no partial article", async () => {
  const output = await fs.mkdtemp(path.join(os.tmpdir(), "substack-failure-"));
  try {
    await assert.rejects(importPost({ url: source }, {
      output, html, download: async () => new Response("Not an image"),
    }), /Unsupported image/);
    assert.deepEqual(await fs.readdir(output), []);
  } finally { await fs.rm(output, { recursive: true, force: true }); }
});

test("refuses missing metadata, missing bodies and paywall previews", () => {
  assert.throws(() => extractPost("<p>Not an article</p>", source), /body missing/);
  assert.throws(() => extractPost('<div class="body markup">Text</div>', source), /title or publication/);
  assert.throws(() => extractPost(`${html}<div class="paywall">Upgrade</div>`, source), /Paywalled/);
});

test("Wayback extraction uses publication date and excludes archived site chrome", async () => {
  const output = await fs.mkdtemp(path.join(os.tmpdir(), "eventstore-test-"));
  const url = "https://web.archive.org/web/20230325182019/https://www.eventstore.com/blog/example";
  const archive = "https://web.archive.org/web/20230325182019id_/";
  const archivedHtml = `<meta property="og:title" content="Archived article">
    <meta property="article:published_time" content="2021-05-20T13:28:52+00:00">
    <nav>Wayback toolbar</nav><article><h1>Archived article</h1>
    <main><span id="hs_cos_wrapper_post_body"><p>Historical text.</p>
    <img src="/hubfs/diagram.png" alt="Diagram">
    <a href="/blog/related">Related</a></span></main><footer>Author bio</footer></article>`;
  const fetched = [];
  try {
    assert.equal(normalizeUrl(url), `${archive}https://www.eventstore.com/blog/example`);
    assert.equal(sourceLocation(normalizeUrl(url)).base, "https://www.eventstore.com/blog/example");
    assert.throws(() => normalizeUrl(url.replace("20230325182019", "20240000000000*")), /dated Wayback/);
    const dir = await importPost({ url }, { output, html: archivedHtml, download: async (asset) => {
      fetched.push(asset); return new Response(png);
    } });
    assert.match(dir, /2021-05-20--example$/);
    assert.deepEqual(fetched, [`${archive}https://www.eventstore.com/hubfs/diagram.png`]);
    const markdown = await fs.readFile(path.join(dir, "index.en.md"), "utf8");
    assert.match(markdown, /\[Related\]\(https:\/\/www.eventstore.com\/blog\/related\)/);
    assert.doesNotMatch(markdown, /Wayback toolbar|Author bio/);
    const metadata = JSON.parse(await fs.readFile(path.join(dir, "article-source.txt")));
    assert.equal(metadata.originalUrl, "https://www.eventstore.com/blog/example");
    assert.match(markdown, /redirectFrom: \/example\//);
  } finally { await fs.rm(output, { recursive: true, force: true }); }
});

test("custom import slugs also receive a bare-path redirect", async () => {
  const output = await fs.mkdtemp(path.join(os.tmpdir(), "substack-slug-"));
  try {
    const dir = await importPost({ url: source, slug: "custom-slug" }, {
      output, html, download: async () => new Response(png),
    });
    const markdown = await fs.readFile(path.join(dir, "index.en.md"), "utf8");
    assert.match(dir, /--custom-slug$/);
    assert.match(markdown, /redirectFrom: \/custom-slug\//);
    assert.deepEqual(yaml.load(markdown.split('---')[1]).redirectAliases, ['/example/', '/en/example/']);
    const polish = await fs.readFile(path.join(dir, 'index.pl.md'), 'utf8');
    assert.equal(yaml.load(polish.split('---')[1]).redirectAliases, undefined);
  } finally { await fs.rm(output, { recursive: true, force: true }); }
});

test("Kurrent SVG diagrams stay local, covers become PNG and code keeps its language", async () => {
  const output = await fs.mkdtemp(path.join(os.tmpdir(), "kurrent-test-"));
  const url = "https://kurrentdb.kurrent.io/blog/example/";
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><rect width="100" height="50" fill="red"/></svg>';
  const page = `<meta property="og:title" content="Kurrent article">
    <meta property="og:image" content="https://kurrentdb.kurrent.io/logo.png">
    <script type="application/ld+json">{"@type":"BlogPosting","datePublished":"2021-12-09T13:51:00Z"}</script>
    <article><img src="/_astro/hero.svg"><section id="blog-post-content"><p>Article text.</p>
    <img src="/_astro/diagram.svg" alt="Diagram"><pre data-language="typescript"><code><span>const x: number = 1;</span></code></pre></section><aside>Table of contents</aside></article>`;
  const fetched = [];
  try {
    const dir = await importPost({ url }, { output, html: page, download: async (asset) => {
      fetched.push(asset); return new Response(svg);
    } });
    const markdown = await fs.readFile(path.join(dir, "index.en.md"), "utf8");
    assert.match(markdown, /cover: 2021-12-09-cover.png/);
    assert.match(markdown, /!\[Diagram\]\(image-2.svg\)/);
    assert.match(markdown, /```typescript\nconst x: number = 1;/);
    assert.doesNotMatch(markdown, /Table of contents/);
    assert.deepEqual(fetched, ["https://kurrentdb.kurrent.io/_astro/hero.svg", "https://kurrentdb.kurrent.io/_astro/diagram.svg"]);
    const cover = await require("sharp")(path.join(dir, "2021-12-09-cover.png")).metadata();
    assert.equal(cover.format, "png");
    assert.equal(cover.width, 1200);
    assert.equal(await fs.readFile(path.join(dir, "image-2.svg"), "utf8"), svg);
  } finally { await fs.rm(output, { recursive: true, force: true }); }
});

test("webinar overrides add the native recording and replace only mapped recording cards", async () => {
  const output = await fs.mkdtemp(path.join(os.tmpdir(), "webinar-test-"));
  const recording = "https://www.architecture-weekly.com/p/frontent-architecture-backend-architecture";
  const page = `<meta property="og:title" content="A webinar"><meta property="article:published_time" content="2025-01-01">
    <video src="https://substack.com/native-player.mp4"></video><div class="body markup">
    <p>Original introduction.</p><div class="embedded-post-wrap"><a href="${recording}?utm_source=email"><img src="https://example.com/recording-thumbnail.png">Listen now</a></div>
    <p>Related <a href="https://another.substack.com/p/other">article</a>.</p>
    <iframe src="https://www.youtube.com/embed/7IkHIqPeFjY"></iframe><p>Original ending.</p></div>`;
  try {
    const dir = await importPost({ url: source, youtubeVideo: "MLO08iaRvBk", recordingEmbeds: { [recording]: "EXj9TTJQwNc" } }, {
      output, html: page, download: async (url) => { throw new Error(`Unexpected image download: ${url}`); },
    });
    const en = await fs.readFile(path.join(dir, "index.en.md"), "utf8");
    const pl = await fs.readFile(path.join(dir, "index.pl.md"), "utf8");
    assert.equal(en.split('---\n\n')[1], pl.split('---\n\n')[1]);
    for (const id of ["MLO08iaRvBk", "EXj9TTJQwNc", "7IkHIqPeFjY"]) assert.equal(en.split(`/embed/${id}`).length - 1, 1);
    assert.match(en, /Original introduction/);
    assert.match(en, /Original ending/);
    assert.match(en, /\[article\]\(https:\/\/another.substack.com\/p\/other\)/);
    assert.doesNotMatch(en, /recording-thumbnail|Listen now|native-player/);
    const metadata = JSON.parse(await fs.readFile(path.join(dir, 'substack-source.txt')));
    assert.equal(metadata.embeds, 3);
    assert.equal(metadata.youtubeVideo, "MLO08iaRvBk");
  } finally { await fs.rm(output, { recursive: true, force: true }); }
});

test("recording overrides preserve existing players without adding duplicates", async () => {
  const output = await fs.mkdtemp(path.join(os.tmpdir(), "webinar-duplicate-"));
  try {
    const page = html.replace("/embed/abc?start=30", "/embed/0NYwN_p2pFI?start=30");
    const dir = await importPost({ url: source, youtubeVideo: "0NYwN_p2pFI" }, { output, html: page, download: async () => new Response(png) });
    const en = await fs.readFile(path.join(dir, "index.en.md"), "utf8");
    assert.equal(en.split('/embed/0NYwN_p2pFI').length - 1, 1);
    assert.match(en, /start=30/);
    await assert.rejects(importPost({ url: source, slug: "invalid-recording", youtubeVideo: 'bad" onload="oops' }, { output, html }), /Invalid YouTube/);
    assert.deepEqual(await fs.readdir(output), [path.basename(dir)]);
  } finally { await fs.rm(output, { recursive: true, force: true }); }
});
