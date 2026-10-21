import type { SearchDocument } from '../src/search/types.ts';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import MiniSearch from 'minisearch';
import { indexOptions } from '../src/search/options.ts';
// Use an unreferenced source article: deleting an existing guide entry must
// correctly fail guide validation rather than produce an ordinary 404.
const directory = fs.mkdtempSync(
  `content/posts/${new Date().toISOString().slice(0, 10)}--development-refresh-`,
);
const slug = directory.split('--').at(-1)!.toLowerCase();
const file = `${directory}/index.en.md`;
const baseUrl = process.env.DEV_SEARCH_BASE_URL || 'http://127.0.0.1:8001';
const original = Buffer.from(
  '---\ntitle: Development refresh verification\n---\n\nInitial verification content.\n',
);
const id = `posts:/${slug}/`;
const marker = 'minisearchdevelopmentrefreshverification';
async function currentArticle() {
  const response = await fetch(`${baseUrl}/en/${slug}/`);
  return { status: response.status, body: await response.text() };
}
async function current() {
  const manifest = (await (
    await fetch(`${baseUrl}/search-index/manifest.json`, { cache: 'no-cache' })
  ).json()) as Record<'en' | 'pl', string>;
  const json = await (
    await fetch(baseUrl + manifest.en, { cache: 'no-cache' })
  ).text();
  return MiniSearch.loadJSON(json, indexOptions);
}
async function waitFor(
  check: (index: MiniSearch<SearchDocument>) => boolean | Promise<boolean>,
  label: string,
) {
  const until = Date.now() + 60000;
  let last: unknown;
  while (Date.now() < until) {
    try {
      const index = await current();
      if (await check(index)) {
        console.log('PASS ' + label);
        return;
      }
    } catch (error) {
      last = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(
    label +
      ': ' +
      (last instanceof Error ? last.message : 'index not refreshed'),
  );
}
try {
  fs.writeFileSync(file, original);
  await waitFor(
    async (index) => index.has(id) && (await currentArticle()).status === 200,
    'development initial index and article',
  );
  fs.writeFileSync(file, original.toString('utf8') + '\n\n' + marker + '\n');
  await waitFor(async (index) => {
    const searchable = index
      .search(marker, { fuzzy: false, prefix: false })
      .some((hit) => hit.id === id);
    if (!searchable) return false;
    const article = await currentArticle();
    return article.status === 200 && article.body.includes(marker);
  }, 'development modified index and article');
  fs.unlinkSync(file);
  await waitFor(
    async (index) => !index.has(id) && (await currentArticle()).status === 404,
    'development deleted index entry and article',
  );
  fs.writeFileSync(file, original);
  await waitFor(async (index) => {
    if (
      !index.has(id) ||
      index.search(marker, { fuzzy: false, prefix: false }).length > 0
    )
      return false;
    const article = await currentArticle();
    return article.status === 200 && !article.body.includes(marker);
  }, 'development restored index and article');
  assert.deepEqual(fs.readFileSync(file), original);
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
await waitFor(
  async (index) => !index.has(id) && (await currentArticle()).status === 404,
  'development probe removed',
);
