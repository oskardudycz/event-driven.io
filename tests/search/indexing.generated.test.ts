import type { IndexedSearchResult } from '../../src/search/types.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import MiniSearch from 'minisearch';
import { loadIndex, searchIndex } from '../../src/search/runtime.ts';

for (const lang of ['en', 'pl'] as const) {
  test(`${lang} generated index includes canonical searchable content once with valid relative links`, async () => {
    const manifest = JSON.parse(
      readFileSync('dist/search-index/manifest.json', 'utf8'),
    ) as Record<'en' | 'pl', string>;
    const index = await loadIndex(
      readFileSync(join('dist', manifest[lang]), 'utf8'),
    );
    const results = searchIndex(index, 'event sourcing');
    assert.ok(results.length > 0, 'Expected matching indexed articles');
    assert.equal(
      new Set(results.map((result) => result.id)).size,
      results.length,
    );
    const introduction = results.find(
      (result) => result.path === `/${lang}/introduction_to_event_sourcing/`,
    );
    assert.ok(introduction?.cover, 'canonical fallback keeps its real cover');
    assert.equal(introduction.cover.width, 240);
    const documents = index
      .search(MiniSearch.wildcard)
      .map((result) => result as IndexedSearchResult);
    const assets = new Set<string>();
    for (const document of documents) {
      if (document.source === 'posts')
        assert.ok(document.cover, `${document.path} is missing its cover`);
      if (!document.cover) continue;
      for (const image of [
        document.cover.images.fallback,
        ...(document.cover.images.sources || []),
      ]) {
        assert.ok(image?.srcSet);
        for (const variant of image.srcSet.split(', ')) {
          const url = variant.split(' ')[0];
          assert.ok(url);
          assets.add(url);
        }
      }
    }
    for (const url of assets) {
      assert.match(url, /^\/(?!\/).+\.webp$/);
      assert.ok(
        readFileSync(join('dist', decodeURIComponent(url))).length,
        `Missing cover asset ${url}`,
      );
    }

    for (const image of [
      introduction.cover.images.fallback,
      ...(introduction.cover.images.sources || []),
    ]) {
      assert.ok(image?.srcSet);
      for (const variant of image.srcSet.split(', ')) {
        const url = variant.split(' ')[0];
        assert.ok(url);
        assert.match(url, /^\/(?!\/).+\.webp$/);
        assert.ok(readFileSync(join('dist', decodeURI(url))).length);
      }
    }
    for (const result of results) {
      assert.match(result.path, /^\/(en|pl)\//);
      const localPath = result.path.replace(/^\/(en|pl)\//, `/${lang}/`);
      if (existsSync(join('dist', localPath, 'index.html'))) {
        assert.equal(
          result.path,
          localPath,
          'Search must preserve an available locale route',
        );
      }
      assert.ok(readFileSync(join('dist', result.path, 'index.html')).length);
    }
  });
}
