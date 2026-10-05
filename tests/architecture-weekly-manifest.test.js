const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const audit = require('../import/architecture-weekly-audit.json');
const manifest = require('../import/architecture-weekly-missing.json');
const root = path.resolve(__dirname, '../content/posts');

test('all 96 requested source posts have English and Polish article files', () => {
  const directories = fs.readdirSync(root),
    seen = new Set();
  const sources = [...audit.posts, ...require('../import/eventstore-posts.json')];
  for (const entry of sources) {
    const slug = entry.slug || entry.url.replace(/\/$/, '').split('/').pop();
    const directory = entry.directory || directories.find((name) => name.endsWith(`--${slug}`));
    assert(directory, `Missing requested article: ${entry.url}`);
    assert(!seen.has(directory), `Duplicate article mapping: ${entry.url}`);
    seen.add(directory);
    for (const language of ['en', 'pl'])
      assert(fs.statSync(path.join(root, directory, `index.${language}.md`)).size > 0);
  }
  assert.equal(seen.size, 96);
  for (const entry of require('../import/substack-posts.json'))
    assert(audit.posts.some((post) => post.url === entry.url));
});

test('every archive post through the inclusive cutoff is accounted for exactly once', () => {
  const posts = audit.posts;
  assert.equal(posts.length, 93);
  assert.equal(new Set(posts.map((p) => p.id)).size, posts.length);
  assert.equal(new Set(posts.map((p) => p.url)).size, posts.length);
  assert.equal(posts.at(-1).url, audit.cutoff);
  assert.equal(posts.at(-1).date.slice(0, 10), '2024-08-05');
  for (let i = 1; i < posts.length; i++)
    assert(Date.parse(posts[i - 1].date) >= Date.parse(posts[i].date));
  const missing = posts.filter((p) => p.status === 'missing');
  const existing = posts.filter((p) => p.status === 'existing');
  assert.deepEqual(audit.counts, { total: 93, missing: 63, existing: 30, recordings: 10 });
  assert.equal(missing.length + existing.length, posts.length);
  assert.deepEqual(
    manifest.map((p) => p.url),
    missing.map((p) => p.url),
  );
  const sourceSlugs = new Map(manifest.map((p) => [p.url.split('/').pop(), p.url]));
  // The reviewed backlog remains useful after import. A newly present source
  // slug must belong to that source article rather than an unrelated collision.
  for (const directory of fs.readdirSync(root)) {
    const source = sourceSlugs.get(directory.split('--')[1]);
    if (!source) continue;
    const provenance = JSON.parse(
      fs.readFileSync(path.join(root, directory, 'substack-source.txt'), 'utf8'),
    );
    assert.equal(provenance.url, source, `Source slug collision: ${directory}`);
  }
  for (const post of existing) {
    const text = fs.readFileSync(path.join(root, post.directory, 'index.en.md'), 'utf8');
    const fm = yaml.load(text.split('---')[1]);
    const sourceSlug = post.url.split('/').pop();
    const localSlug = post.directory.split('--')[1];
    const aliases = [fm.redirectFrom, ...(fm.redirectAliases || [])];
    assert(aliases.includes(`/${sourceSlug}/`), `Missing source redirect: ${sourceSlug}`);
    assert(aliases.includes(`/${localSlug}/`), `Missing bare redirect: ${localSlug}`);
    if (sourceSlug !== localSlug) assert(aliases.includes(`/en/${sourceSlug}/`));
  }
});

test('all podcast posts and recording articles have matching YouTube overrides', () => {
  const recordings = audit.posts.filter((p) => p.youtubeVideo);
  assert.equal(recordings.length, 10);
  for (const post of audit.posts.filter((p) => p.type === 'podcast'))
    assert(post.youtubeVideo, `No recording: ${post.url}`);
  for (const post of recordings) {
    assert.match(post.youtubeVideo, /^[a-zA-Z0-9_-]{11}$/);
    assert.equal(manifest.find((entry) => entry.url === post.url)?.youtubeVideo, post.youtubeVideo);
  }
  const react = manifest.find((p) => p.url.endsWith('/react-query-a-solution-for-frontend'));
  assert.equal(
    react.recordingEmbeds[
      'https://www.architecture-weekly.com/p/frontent-architecture-backend-architecture'
    ],
    'EXj9TTJQwNc',
  );
});

test('all 63 migrated posts have complete matching language copies, local assets and recording embeds', () => {
  const directories = fs.readdirSync(root);
  let images = 0,
    embeds = 0;
  for (const entry of manifest) {
    const slug = entry.url.split('/').pop();
    const matches = directories.filter((name) => name.endsWith(`--${slug}`));
    assert.equal(matches.length, 1, `Missing or duplicate article: ${slug}`);
    const directory = path.join(root, matches[0]);
    const en = fs.readFileSync(path.join(directory, 'index.en.md'), 'utf8');
    const pl = fs.readFileSync(path.join(directory, 'index.pl.md'), 'utf8');
    const fm = yaml.load(en.split('---')[1]),
      polish = yaml.load(pl.split('---')[1]);
    const body = (text) => text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
    assert.equal(body(en), body(pl), `Language bodies differ: ${slug}`);
    assert(body(en).trim().length > 0);
    assert.equal(fm.redirectFrom, `/${slug}/`);
    assert.equal(polish.useDefaultLangCanonical, true);
    assert.equal(polish.redirectFrom, undefined);
    const metadata = JSON.parse(
      fs.readFileSync(path.join(directory, 'substack-source.txt'), 'utf8'),
    );
    assert.equal(metadata.url, entry.url);
    for (const image of [...Object.values(metadata.assets), fm.cover].filter(Boolean))
      assert(fs.statSync(path.join(directory, image)).size > 0);
    for (const match of body(en).matchAll(/!\[[^\]]*\]\(([^\s)]+)/g)) {
      assert(!/^https?:/.test(match[1]), `Remote image in ${slug}`);
      assert(
        fs.existsSync(path.join(directory, match[1])),
        `Missing image in ${slug}: ${match[1]}`,
      );
    }
    if (entry.youtubeVideo)
      assert.equal(
        body(en).split(`v=${entry.youtubeVideo}`).length - 1,
        1,
        `Wrong recording: ${slug}`,
      );
    for (const id of Object.values(entry.recordingEmbeds || {}))
      assert(body(en).includes(`v=${id}`));
    images += Object.keys(metadata.assets).length;
    embeds += metadata.embeds;
  }
  assert.deepEqual(audit.imported, { completedOn: '2026-10-04', posts: 63, images, embeds });
});

test('migrated pages contain no paid prompts, raw YouTube players or source links to available blog posts', () => {
  const {
    isSubscriptionPromotion,
    buildArticleLinks,
    sourceKey,
  } = require('../import/article-content');
  const links = buildArticleLinks(),
    directories = fs.readdirSync(root);
  for (const post of [...audit.posts, ...require('../import/eventstore-posts.json')]) {
    const directory =
      post.directory ||
      directories.find((name) =>
        name.endsWith(`--${post.url.replace(/\/$/, '').split('/').pop()}`),
      );
    for (const language of ['en', 'pl']) {
      const file = path.join(root, directory, `index.${language}.md`);
      if (!fs.existsSync(file)) continue;
      const text = fs.readFileSync(file, 'utf8');
      assert.doesNotMatch(
        text,
        /paywall-jump|<iframe[^>]*src="https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com/,
      );
      for (const block of text.split(/\n\s*\n/))
        assert(!isSubscriptionPromotion(block.replace(/^#+\s*/, '')), `Paid prompt in ${file}`);
      for (const match of text.matchAll(/(?:\]\(|href=")(https?:\/\/[^\s)"]+)/g)) {
        const url = new URL(match[1]);
        assert(
          !links.has(sourceKey(url)),
          `Source link to an available blog article in ${file}: ${url}`,
        );
        assert(
          !/^(www\.)?event-driven\.io$/.test(url.hostname),
          `Absolute blog link in ${file}: ${url}`,
        );
      }
    }
  }
});
