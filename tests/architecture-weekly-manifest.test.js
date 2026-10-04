const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const audit = require('../import/architecture-weekly-audit.json');
const manifest = require('../import/architecture-weekly-missing.json');
const root = path.resolve(__dirname, '../content/posts');

test('every archive post through the inclusive cutoff is accounted for exactly once', () => {
  const posts = audit.posts;
  assert.equal(posts.length, 93);
  assert.equal(new Set(posts.map(p => p.id)).size, posts.length);
  assert.equal(new Set(posts.map(p => p.url)).size, posts.length);
  assert.equal(posts.at(-1).url, audit.cutoff);
  assert.equal(posts.at(-1).date.slice(0, 10), '2024-08-05');
  for (let i = 1; i < posts.length; i++) assert(Date.parse(posts[i - 1].date) >= Date.parse(posts[i].date));
  const missing = posts.filter(p => p.status === 'missing');
  const existing = posts.filter(p => p.status === 'existing');
  assert.deepEqual(audit.counts, { total: 93, missing: 63, existing: 30, recordings: 10 });
  assert.equal(missing.length + existing.length, posts.length);
  assert.deepEqual(manifest.map(p => p.url), missing.map(p => p.url));
  const sourceSlugs = new Map(manifest.map(p => [p.url.split('/').pop(), p.url]));
  // The reviewed backlog remains useful after import. A newly present source
  // slug must belong to that source article rather than an unrelated collision.
  for (const directory of fs.readdirSync(root)) {
    const source = sourceSlugs.get(directory.split('--')[1]);
    if (!source) continue;
    const provenance = JSON.parse(fs.readFileSync(path.join(root, directory, 'substack-source.txt'), 'utf8'));
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
  const recordings = audit.posts.filter(p => p.youtubeVideo);
  assert.equal(recordings.length, 10);
  for (const post of audit.posts.filter(p => p.type === 'podcast')) assert(post.youtubeVideo, `No recording: ${post.url}`);
  for (const post of recordings) {
    assert.match(post.youtubeVideo, /^[a-zA-Z0-9_-]{11}$/);
    assert.equal(manifest.find(entry => entry.url === post.url)?.youtubeVideo, post.youtubeVideo);
  }
  const react = manifest.find(p => p.url.endsWith('/react-query-a-solution-for-frontend'));
  assert.equal(react.recordingEmbeds['https://www.architecture-weekly.com/p/frontent-architecture-backend-architecture'], 'EXj9TTJQwNc');
});
