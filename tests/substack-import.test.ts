import type { Node } from 'unist';
import type { Link } from 'mdast';
import { readFrontmatter } from './helpers/frontmatter.ts';
import sharp from 'sharp';
import * as articleContent from '../import/article-content.ts';
import * as markdownLabels from '../scripts/markdown-label.ts';
import { remark } from 'remark';
import { visit as visitMarkdown } from 'unist-util-visit';
import { temporaryDirectory } from './helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  importPost,
  extractPost,
  normalizeUrl,
  sourceLocation,
  originalImageUrl,
  imageExtension,
} from '../import/import-substack.ts';

const source = 'https://example.substack.com/p/example';
const image =
  'https://substack-post-media.s3.amazonaws.com/public/images/example.png';
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
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=',
  'base64',
);

void test('URL validation and CDN originals', () => {
  assert.equal(normalizeUrl(`${source}/?utm_source=email#comments`), source);
  assert.throws(() => normalizeUrl(`${source}${source}`), /Expected/);
  assert.throws(() => normalizeUrl('file:///p/example'), /Expected/);
  assert.equal(originalImageUrl(cdn, source), image);
});

void test('imports full article and local assets in both languages, preserving embeds', async (t) => {
  const output = temporaryDirectory(t, 'substack-test-');
  const fetched: string[] = [];
  const download = (url: string) => {
    fetched.push(url);
    return Promise.resolve(new Response(url === source ? html : png));
  };
  const directory = await importPost(
    { url: source, category: 'Event Sourcing' },
    { output, download },
  );
  const english = await fs.readFile(
    path.join(directory, 'index.en.md'),
    'utf8',
  );
  const polish = await fs.readFile(path.join(directory, 'index.pl.md'), 'utf8');
  const [enMeta, enBody] = english.slice(4).split('---\n\n');
  const [plMeta, plBody] = polish.slice(4).split('---\n\n');
  assert.ok(enBody && plBody, 'Missing imported article body');
  assert.equal(enBody, plBody);
  assert.equal(readFrontmatter(enMeta).title, 'A title: with punctuation');
  assert.equal(readFrontmatter(enMeta).publishedAt, '2026-09-07T11:49:46Z');
  assert.equal(readFrontmatter(plMeta).publishedAt, '2026-09-07T11:49:46Z');
  assert.equal(readFrontmatter(plMeta).useDefaultLangCanonical, true);
  assert.equal(readFrontmatter(enMeta).cover, '2026-09-07-cover.png');
  assert.equal(readFrontmatter(enMeta).redirectFrom, '/example/');
  assert.equal(readFrontmatter(plMeta).redirectFrom, undefined);
  assert.deepEqual(fetched, [source, image]); // cover and body reuse one download
  assert.deepEqual(
    await fs.readFile(path.join(directory, '2026-09-07-cover.png')),
    png,
  );
  assert.match(enBody, /\*\*world\*\*/);
  assert.match(enBody, /<em>That can be fine if you&#39;<\/em>re learning\./);
  assert.match(
    enBody,
    /\[read more\]\(https:\/\/example.substack.com\/p\/another\)/,
  );
  assert.match(enBody, /!\[Example image\]\(2026-09-07-cover.png\)/);
  assert.doesNotMatch(enBody, /^\[$/m);
  assert.match(enBody, /A caption\./);
  assert.match(enBody, /## A heading/);
  assert.match(enBody, /```typescript\nif \(x < 2\) return true;/);
  assert.match(enBody, /\| Name \| Value \|/);
  assert.match(enBody, /<iframe[^>]+start=30[^>]+allowfullscreen/);
  assert.match(enBody, /referrerpolicy="strict-origin-when-cross-origin"/);
  assert.doesNotMatch(enBody, /Navigation|Discussion|Subscribe|onload|srcdoc/);
  const metadata = JSON.parse(
    await fs.readFile(path.join(directory, 'substack-source.txt'), 'utf8'),
  ) as { embeds: number };
  assert.equal(metadata.embeds, 1);
  await assert.rejects(
    importPost({ url: source }, { output, download }),
    /already exists/,
  );
  assert.equal(
    await fs.readFile(path.join(directory, 'index.en.md'), 'utf8'),
    english,
  );
});

void test('failed image downloads leave no partial article', async (t) => {
  const output = temporaryDirectory(t, 'substack-failure-');
  await assert.rejects(
    importPost(
      { url: source },
      {
        output,
        html,
        download: () => Promise.resolve(new Response('Not an image')),
      },
    ),
    /Unsupported image/,
  );
  assert.deepEqual(await fs.readdir(output), []);
});

void test('refuses missing metadata, missing bodies and paywall previews', () => {
  assert.throws(
    () => extractPost('<p>Not an article</p>', source),
    /body missing/,
  );
  assert.throws(
    () => extractPost('<div class="body markup">Text</div>', source),
    /title or publication/,
  );
  assert.throws(
    () => extractPost(`${html}<div class="paywall">Upgrade</div>`, source),
    /Paywalled/,
  );
});

void test('Wayback extraction uses publication date and excludes archived site chrome', async (t) => {
  const output = temporaryDirectory(t, 'eventstore-test-');
  const url =
    'https://web.archive.org/web/20230325182019/https://www.eventstore.com/blog/example';
  const archive = 'https://web.archive.org/web/20230325182019id_/';
  const archivedHtml = `<meta property="og:title" content="Archived article">
    <meta property="article:published_time" content="2021-05-20T13:28:52+00:00">
    <nav>Wayback toolbar</nav><article><h1>Archived article</h1>
    <main><span id="hs_cos_wrapper_post_body"><p>Historical text.</p>
    <img src="/hubfs/diagram.png" alt="Diagram">
    <a href="/blog/related">Related</a></span></main><footer>Author bio</footer></article>`;
  const fetched: string[] = [];
  assert.equal(
    normalizeUrl(url),
    `${archive}https://www.eventstore.com/blog/example`,
  );
  assert.equal(
    sourceLocation(normalizeUrl(url)).base,
    'https://www.eventstore.com/blog/example',
  );
  assert.throws(
    () => normalizeUrl(url.replace('20230325182019', '20240000000000*')),
    /dated Wayback/,
  );
  const dir = await importPost(
    { url },
    {
      output,
      html: archivedHtml,
      download: (asset) => {
        fetched.push(asset);
        return Promise.resolve(new Response(png));
      },
    },
  );
  assert.match(dir, /2021-05-20--example$/);
  assert.deepEqual(fetched, [
    `${archive}https://www.eventstore.com/hubfs/diagram.png`,
  ]);
  const markdown = await fs.readFile(path.join(dir, 'index.en.md'), 'utf8');
  assert.match(
    markdown,
    /\[Related\]\(https:\/\/www.eventstore.com\/blog\/related\)/,
  );
  assert.doesNotMatch(markdown, /Wayback toolbar|Author bio/);
  const metadata = JSON.parse(
    await fs.readFile(path.join(dir, 'article-source.txt'), 'utf8'),
  ) as {
    originalUrl: string;
  };
  assert.equal(metadata.originalUrl, 'https://www.eventstore.com/blog/example');
  assert.match(markdown, /redirectFrom: \/example\//);
});

void test('custom import slugs also receive a bare-path redirect', async (t) => {
  const output = temporaryDirectory(t, 'substack-slug-');
  const dir = await importPost(
    { url: source, slug: 'custom-slug' },
    {
      output,
      html,
      download: () => Promise.resolve(new Response(png)),
    },
  );
  const markdown = await fs.readFile(path.join(dir, 'index.en.md'), 'utf8');
  assert.match(dir, /--custom-slug$/);
  assert.match(markdown, /redirectFrom: \/custom-slug\//);
  assert.deepEqual(readFrontmatter(markdown.split('---')[1]).redirectAliases, [
    '/example/',
    '/en/example/',
  ]);
  const polish = await fs.readFile(path.join(dir, 'index.pl.md'), 'utf8');
  assert.equal(
    readFrontmatter(polish.split('---')[1]).redirectAliases,
    undefined,
  );
});

void test('Kurrent SVG diagrams stay local, covers become PNG and code keeps its language', async (t) => {
  const output = temporaryDirectory(t, 'kurrent-test-');
  const url = 'https://kurrentdb.kurrent.io/blog/example/';
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><rect width="100" height="50" fill="red"/></svg>';
  const page = `<meta property="og:title" content="Kurrent article">
    <meta property="og:image" content="https://kurrentdb.kurrent.io/logo.png">
    <script type="application/ld+json">{"@type":"BlogPosting","datePublished":"2021-12-09T13:51:00Z"}</script>
    <article><img src="/_astro/hero.svg"><section id="blog-post-content"><p>Article text.</p>
    <img src="/_astro/diagram.svg" alt="Diagram"><pre data-language="typescript"><code><span>const x: number = 1;</span></code></pre></section><aside>Table of contents</aside></article>`;
  const fetched: string[] = [];
  const dir = await importPost(
    { url },
    {
      output,
      html: page,
      download: (asset) => {
        fetched.push(asset);
        return Promise.resolve(new Response(svg));
      },
    },
  );
  const markdown = await fs.readFile(path.join(dir, 'index.en.md'), 'utf8');
  assert.match(markdown, /cover: 2021-12-09-cover.png/);
  assert.match(markdown, /!\[Diagram\]\(image-2.svg\)/);
  assert.match(markdown, /```typescript\nconst x: number = 1;/);
  assert.doesNotMatch(markdown, /Table of contents/);
  assert.deepEqual(fetched, [
    'https://kurrentdb.kurrent.io/_astro/hero.svg',
    'https://kurrentdb.kurrent.io/_astro/diagram.svg',
  ]);
  const cover = await sharp(path.join(dir, '2021-12-09-cover.png')).metadata();
  assert.equal(cover.format, 'png');
  assert.equal(cover.width, 1200);
  assert.equal(await fs.readFile(path.join(dir, 'image-2.svg'), 'utf8'), svg);
});

void test('webinar overrides add the native recording and replace only mapped recording cards', async (t) => {
  const output = temporaryDirectory(t, 'webinar-test-');
  const recording =
    'https://www.architecture-weekly.com/p/frontent-architecture-backend-architecture';
  const page = `<meta property="og:title" content="A webinar"><meta property="article:published_time" content="2025-01-01">
    <video src="https://substack.com/native-player.mp4"></video><div class="body markup">
    <p>Original introduction.</p><div class="embedded-post-wrap"><a href="${recording}?utm_source=email"><img src="https://example.com/recording-thumbnail.png">Listen now</a></div>
    <p>Related <a href="https://another.substack.com/p/other">article</a>.</p>
    <iframe src="https://www.youtube.com/embed/7IkHIqPeFjY"></iframe><p>Original ending.</p></div>`;
  const dir = await importPost(
    {
      url: source,
      youtubeVideo: 'MLO08iaRvBk',
      recordingEmbeds: { [recording]: 'EXj9TTJQwNc' },
    },
    {
      output,
      html: page,
      download: (url) => {
        return Promise.reject(new Error(`Unexpected image download: ${url}`));
      },
    },
  );
  const en = await fs.readFile(path.join(dir, 'index.en.md'), 'utf8');
  const pl = await fs.readFile(path.join(dir, 'index.pl.md'), 'utf8');
  assert.equal(en.split('---\n\n')[1], pl.split('---\n\n')[1]);
  for (const id of ['MLO08iaRvBk', 'EXj9TTJQwNc', '7IkHIqPeFjY'])
    assert.equal(en.split(`v=${id}`).length - 1, 1);
  assert.match(en, /Original introduction/);
  assert.match(en, /Original ending/);
  assert.match(en, /\[article\]\(https:\/\/another.substack.com\/p\/other\)/);
  assert.doesNotMatch(en, /recording-thumbnail|Listen now|native-player/);
  const metadata = JSON.parse(
    await fs.readFile(path.join(dir, 'substack-source.txt'), 'utf8'),
  ) as {
    embeds: number;
    youtubeVideo: string;
  };
  assert.equal(metadata.embeds, 3);
  assert.equal(metadata.youtubeVideo, 'MLO08iaRvBk');
});

void test('recording overrides preserve existing players without adding duplicates', async (t) => {
  const output = temporaryDirectory(t, 'webinar-duplicate-');
  const page = html.replace(
    '/embed/abc?start=30',
    '/embed/0NYwN_p2pFI?start=30',
  );
  const dir = await importPost(
    { url: source, youtubeVideo: '0NYwN_p2pFI' },
    { output, html: page, download: () => Promise.resolve(new Response(png)) },
  );
  const en = await fs.readFile(path.join(dir, 'index.en.md'), 'utf8');
  assert.equal(en.split('v=0NYwN_p2pFI').length - 1, 1);
  assert.match(en, /start=30/);
  await assert.rejects(
    importPost(
      {
        url: source,
        slug: 'invalid-recording',
        youtubeVideo: 'bad" onload="oops',
      },
      { output, html },
    ),
    /Invalid YouTube/,
  );
  assert.deepEqual(await fs.readdir(output), [path.basename(dir)]);
});

void test('accepts former paywall markers only with a matching complete public body', () => {
  const body =
    '<p>Full public introduction.</p><div class="paywall-jump"></div><p>Full public ending.</p>';
  const page = (
    audience: string,
    content = body,
  ) => `<meta property="og:title" content="Formerly paid article">
    <meta property="article:published_time" content="2025-03-03"><div class="body markup">${body}</div>
    <script>window._preloads = JSON.parse(${JSON.stringify(JSON.stringify({ post: { audience, body_html: content } }))});</script>`;
  assert.match(
    extractPost(page('everyone'), source).body.text(),
    /Full public ending/,
  );
  assert.throws(() => extractPost(page('only_paid'), source), /Paywalled/);
  assert.throws(
    () => extractPost(page('everyone', '<p>Preview only.</p>'), source),
    /Paywalled/,
  );
  assert.throws(
    () =>
      extractPost(
        page('everyone') + '<div class="paywall">Locked</div>',
        source,
      ),
    /Paywalled/,
  );
});

void test('uses the cached Substack image when its original S3 asset is unavailable', async (t) => {
  const output = temporaryDirectory(t, 'substack-cdn-fallback-');
  const fetched: string[] = [];
  const dir = await importPost(
    { url: source },
    {
      output,
      html,
      download: (url) => {
        fetched.push(url);
        if (url === image) return Promise.reject(new Error('HTTP 403'));
        assert.equal(url, cdn);
        return Promise.resolve(new Response(png));
      },
    },
  );
  assert.deepEqual(fetched, [image, cdn]);
  assert.deepEqual(
    await fs.readFile(path.join(dir, '2026-09-07-cover.png')),
    png,
  );
});

void test('future imports remove paid prompts and use relative URLs for available blog articles', async (t) => {
  const output = temporaryDirectory(t, 'substack-local-links-');
  const { sourceKey } = articleContent;
  const existing = 'https://www.architecture-weekly.com/p/original-source-slug';
  const page = `<meta property="og:title" content="A migrated article"><meta property="article:published_time" content="2025-01-01">
    <div class="body markup"><p>Full introduction.</p><p>The next part of the article is for paid users. Get a free trial.</p>
    <p><a href="${existing}?utm_source=email#details">Existing article</a> and <a href="https://www.architecture-weekly.com/p/not-yet-imported">Older article</a>.</p>
    <p><a href="https://event-driven.io/en/another/">Another blog article</a>.</p>
    <iframe src="https://www.youtube-nocookie.com/embed/sQbkUl7-z_U?start=30" title="My recording"></iframe><p>Full ending.</p></div>`;
  const dir = await importPost(
    { url: source },
    {
      output,
      html: page,
      links: new Map([[sourceKey(existing), '/en/blog-slug/']]),
    },
  );
  const en = await fs.readFile(path.join(dir, 'index.en.md'), 'utf8');
  assert.match(en, /\[Existing article\]\(\/en\/blog-slug\/#details\)/);
  assert.match(
    en,
    /\[Older article\]\(https:\/\/www.architecture-weekly.com\/p\/not-yet-imported\)/,
  );
  assert.match(en, /\[Another blog article\]\(\/en\/another\/\)/);
  assert.match(
    en,
    /`youtube: \[My recording\]\(https:\/\/www.youtube.com\/watch\?start=30&v=sQbkUl7-z_U\)`/,
  );
  assert.doesNotMatch(en, /paid users|free trial|<iframe/);
  assert.match(en, /Full introduction/);
  assert.match(en, /Full ending/);
});

void test('imports YouTube text references as links and linked thumbnails as players in both languages', async (t) => {
  const output = temporaryDirectory(t, 'substack-video-link-scope-');
  const textVideo = 'https://www.youtube.com/watch?v=JQL4doMy73w';
  const imageVideo = 'https://www.youtube.com/watch?v=GOd7oj1AT00&start=30';
  const page = `<meta property="og:title" content="Video references"><meta property="article:published_time" content="2025-01-01">
    <div class="body markup"><p><a href="${textVideo}">Heather Wilde - How to Close the Diversity Gap</a></p>
    <ul><li><a href="${textVideo}">A reference in a list</a>.</li></ul>
    <p><a class="image-link" href="${imageVideo}"><img src="${image}" alt="Mr Bean"></a></p></div>`;
  const directory = await importPost(
    { url: source },
    { output, html: page, download: () => Promise.resolve(new Response(png)) },
  );
  for (const language of ['en', 'pl']) {
    const markdown = await fs.readFile(
      path.join(directory, `index.${language}.md`),
      'utf8',
    );
    assert.ok(
      markdown.includes(
        `[Heather Wilde - How to Close the Diversity Gap](${textVideo})`,
      ),
    );
    assert.ok(markdown.includes(`-   [A reference in a list](${textVideo}).`));
    assert.ok(markdown.includes(`\`youtube: [Mr Bean](${imageVideo})\``));
    assert.doesNotMatch(
      markdown,
      /`youtube: \[Heather Wilde|`youtube: \[A reference/,
    );
  }
});

void test('code language inference preserves source languages and recognizes typed examples', async () => {
  const { codeLanguage, labelCodeFences } =
    await import('../import/code-languages.ts');
  assert.equal(
    codeLanguage(
      'export type ShiftOpened = Event<"opened", { amount: number }>;',
    ),
    'typescript',
  );
  assert.equal(codeLanguage('SELECT id FROM events;'), 'sql');
  assert.equal(codeLanguage('sudo service pgbouncer start'), 'bash');
  assert.equal(codeLanguage('{"stream": "orders"}'), 'json');
  assert.equal(codeLanguage('public class Order {}'), 'csharp');
  assert.equal(codeLanguage('📁 orders\n  📁 confirming-order'), 'text');
  assert.equal(
    codeLanguage(
      'await appendToStream(streamName, events)',
      'text',
      'typescript',
    ),
    'typescript',
  );
  assert.equal(codeLanguage('example', 'js'), 'typescript');
  const markdown = '```\nSELECT id FROM events;\n```\n\nNext paragraph.\n';
  assert.equal(
    labelCodeFences(markdown),
    '```sql\nSELECT id FROM events;\n```\n\nNext paragraph.\n',
  );
});

void test('known EventStore and Kurrent article aliases resolve to canonical blog links', () => {
  const { buildArticleLinks, relativeArticleLink } = articleContent;
  const links = buildArticleLinks();
  for (const host of [
    'www.eventstore.com',
    'kurrent.io',
    'kurrentdb.kurrent.io',
  ]) {
    assert.equal(
      relativeArticleLink(
        `https://${host}/blog/how-to-get-the-current-entity-state-from-events?utm_source=source#example`,
        source,
        links,
      ),
      '/en/how_to_get_the_current_entity_state_in_event_sourcing/#example',
    );
    assert.equal(
      relativeArticleLink(
        `https://${host}/blog/keep-your-streams-short-temporal-modelling-for-fast-reads-and-optimal-data-retention`,
        source,
        links,
      ),
      '/en/keep-your-streams-short-temporal-modelling-for-fast-reads-and-optimal-data-retention/',
    );
  }
});

void test('imports actual publication timestamps without guessing date-only publication times', () => {
  assert.equal(extractPost(html, source).publishedAt, '2026-09-07T11:49:46Z');
  assert.equal(
    extractPost(html.replace('2026-09-07T11:49:46Z', '2026-09-07'), source)
      .publishedAt,
    undefined,
  );
});

void test('SVG detection handles declarations and comments without regex backtracking', () => {
  for (const svg of [
    '<svg></svg>',
    ' \n<?xml version="1.0"?>\n<!-- one --><!-- two --><svg />',
  ])
    assert.equal(imageExtension(Buffer.from(svg)), '.svg');
  for (const invalid of [
    '<!-- missing end',
    '<?xml missing end',
    '<svgscript>',
  ])
    assert.throws(
      () => imageExtension(Buffer.from(invalid)),
      /Unsupported image/,
    );
  // A regressed synchronous regex cannot be interrupted by a node:test timeout.
  // Bound the hostile case in a child so CI fails instead of hanging.
  execFileSync(
    process.execPath,
    [
      '-e',
      `
    import assert from 'node:assert/strict';
    import { imageExtension } from './import/import-substack.ts';
    assert.throws(() => imageExtension(Buffer.from('<!--' + '--><!--'.repeat(30000) + 'x')), /Unsupported image/);
  `,
    ],
    { cwd: path.resolve(import.meta.dirname, '..'), timeout: 5000 },
  );
});

void test('partial-word emphasis preserves formatting while stripping executable HTML', async (t) => {
  const output = temporaryDirectory(t, 'substack-emphasis-');
  const malicious = html.replace(
    '<p>Cheers!</p>',
    `<p><em onclick="attack()"><strong onmouseover="attack()">That</strong> &lt;img src=x onerror=attack()&gt; &amp; you'</em>re safe.</p>`,
  );
  const directory = await importPost(
    { url: source },
    {
      output,
      html: malicious,
      download: () => Promise.resolve(new Response(png)),
    },
  );
  const markdown = await fs.readFile(
    path.join(directory, 'index.en.md'),
    'utf8',
  );
  assert.match(
    markdown,
    /<em><strong>That<\/strong> &lt;img src=x onerror=attack\(\)&gt; &amp; you&#39;<\/em>re safe\./,
  );
  assert.doesNotMatch(markdown, /onclick=|onmouseover=|<img src=x/);
});

void test('llms Markdown labels escape backslashes and metacharacters together', () => {
  const { markdownLabel } = markdownLabels;
  assert.equal(markdownLabel('ordinary title'), 'ordinary title');
  for (const character of ['\\', '[', ']', '*', '_', '`', '<', '>'])
    assert.equal(
      markdownLabel(character.repeat(2)),
      ('\\' + character).repeat(2),
    );
  assert.equal(markdownLabel('\\] [link]'), '\\'.repeat(3) + '] \\[link\\]');
});

void test('article links reject executable schemes from source HTML and stored mappings', async (t) => {
  const output = temporaryDirectory(t, 'substack-link-security-');
  for (const href of [
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:attack()',
    'java&#x09;script:attack()',
    'JaVaScRiPt:attack()',
  ]) {
    await assert.rejects(
      importPost(
        { url: source },
        {
          output,
          html: html.replace('/p/another', href),
          download: () => Promise.resolve(new Response(png)),
        },
      ),
      /Unsupported article link/,
    );
    assert.deepEqual(await fs.readdir(output), []);
  }
  for (const target of [
    'javascript:attack()',
    'data:text/html,<script>attack()</script>',
    'vbscript:attack()',
    '/\\evil.example/attack',
    '//evil.example/attack',
    '/en/safe/\u0000attack',
  ]) {
    await assert.rejects(
      importPost(
        { url: source },
        {
          output,
          html,
          links: new Map([['example.substack.com/p/another', target]]),
          download: () => Promise.resolve(new Response(png)),
        },
      ),
      /Unsupported article link/,
    );
    assert.deepEqual(await fs.readdir(output), []);
  }
});

void test('mapped links cannot break out of Markdown and retain queries, fragments and titles', async (t) => {
  const output = temporaryDirectory(t, 'substack-markdown-links-');
  const target =
    '/en/article/)[attack](javascript:alert(1))?filter=a&b=c#details';
  const page = `<meta property="og:title" content="Links"><meta property="article:published_time" content="2025-01-01">
    <div class="body markup"><p><a href="/p/another" title="A &quot;quoted&quot; title">Read more</a></p>
    <p><a href="#details">Section</a> <a href="mailto:hello@example.com">Email</a> <a href="tel:+48123456789">Phone</a></p></div>`;
  const directory = await importPost(
    { url: source },
    {
      output,
      html: page,
      links: new Map([['example.substack.com/p/another', target]]),
    },
  );
  const markdown = await fs.readFile(
    path.join(directory, 'index.en.md'),
    'utf8',
  );
  const body = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
  const tree = remark().parse(body);
  const nodes: Node[] = [];
  visitMarkdown(tree, (node) => {
    nodes.push(node);
  });
  const links = nodes.filter((node): node is Link => node.type === 'link');
  assert.equal(links.length, 4);
  assert.ok(links[0]);
  assert.equal(decodeURI(links[0].url), target);
  assert.equal(links[0].title, 'A "quoted" title');
  assert.deepEqual(
    links.slice(1).map((node) => node.url),
    ['#details', 'mailto:hello@example.com', 'tel:+48123456789'],
  );
  assert.equal(nodes.filter((node) => node.type === 'html').length, 0);
  assert.doesNotMatch(markdown, /\]\(javascript:/);
});

void test('link encoding keeps HTML attribute delimiters inside one Markdown destination', async () => {
  const { markdownLinkDestination, markdownLinkTitle } =
    await import('../import/markdown-links.ts');
  const destination =
    '/en/article/"><img src=x onerror=attack()>?value=a&other=b#part';
  const title = 'A "quoted" <img onerror=attack()> title';
  const markdown = `[Read](${markdownLinkDestination(destination, source)}${markdownLinkTitle(title)})`;
  const tree = remark().parse(markdown);
  const paragraph = tree.children[0];
  assert.ok(paragraph && 'children' in paragraph);
  const nodes = paragraph.children;
  assert.equal(nodes.length, 1);
  const link = nodes[0];
  assert.ok(link?.type === 'link');
  assert.equal(decodeURI(link.url), destination);
  assert.equal(link.title, title);
  assert.doesNotMatch(markdown, /<img/);
  assert.equal(markdownLinkDestination('#', source), '#');
});
