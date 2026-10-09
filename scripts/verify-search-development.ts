import type { SearchDocument } from '../src/search/types.ts';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import MiniSearch from 'minisearch';
import { indexOptions } from '../src/search/options.ts';
const manifest = JSON.parse(fs.readFileSync('import/architecture-weekly-missing.json', 'utf8')) as {
  url: string;
}[];
const slug = new URL(manifest[0].url).pathname.split('/').filter(Boolean).pop();
const directory = fs.readdirSync('content/posts').find((name) => name.endsWith(`--${slug}`));
assert(directory, 'Development-check article not found');
const file = `content/posts/${directory}/index.en.md`;
const baseUrl = process.env.DEV_SEARCH_BASE_URL || 'http://127.0.0.1:8001';
const original = fs.readFileSync(file);
const id = `posts:/${slug}/`;
const marker = 'minisearchdevelopmentrefreshverification';
async function current() {
  const manifest = (await (
    await fetch(`${baseUrl}/search-index/manifest.json`, { cache: 'no-cache' })
  ).json()) as Record<string, string>;
  const json = await (await fetch(baseUrl + manifest.en, { cache: 'no-cache' })).text();
  return MiniSearch.loadJSON(json, indexOptions);
}
async function waitFor(check: (index: MiniSearch<SearchDocument>) => boolean, label: string) {
  const until = Date.now() + 60000;
  let last: unknown;
  while (Date.now() < until) {
    try {
      const index = await current();
      if (check(index)) {
        console.log('PASS ' + label);
        return;
      }
    } catch (error) {
      last = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(label + ': ' + (last instanceof Error ? last.message : 'index not refreshed'));
}
try {
  await waitFor((index) => index.has(id), 'development initial index');
  fs.writeFileSync(file, original.toString('utf8') + '\n\n' + marker + '\n');
  await waitFor(
    (index) => index.search(marker, { fuzzy: false, prefix: false }).some((hit) => hit.id === id),
    'development modified content',
  );
  fs.unlinkSync(file);
  await waitFor((index) => !index.has(id), 'development deleted content');
} finally {
  fs.writeFileSync(file, original);
}
await waitFor(
  (index) => index.has(id) && index.search(marker, { fuzzy: false, prefix: false }).length === 0,
  'development restored content',
);
assert.deepEqual(fs.readFileSync(file), original);
