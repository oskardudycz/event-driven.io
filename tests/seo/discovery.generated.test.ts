import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import { test, expect } from 'vitest';
import { builtRedirects, firstRedirect } from '../helpers/redirects.ts';

const origin = 'https://event-driven.io';

test('robots and llms name the published root sitemap and its shards exist', () => {
  const indexUrl = `${origin}/sitemap-index.xml`;
  expect(readFileSync('dist/robots.txt', 'utf8')).toContain(
    `Sitemap: ${indexUrl}`,
  );
  expect(readFileSync('dist/llms.txt', 'utf8')).toContain(`(${indexUrl})`);
  const index = load(readFileSync('dist/sitemap-index.xml', 'utf8'), {
    xml: true,
  });
  const urls = index('sitemap > loc')
    .map((_, node) => index(node).text())
    .get();
  expect(urls.length).toBeGreaterThan(0);
  for (const url of urls) {
    expect(new URL(url).origin).toBe(origin);
    expect(new URL(url).pathname).toMatch(/^\/sitemap-\d+\.xml$/);
    expect(existsSync(join('dist', new URL(url).pathname))).toBe(true);
  }
});

test('legacy sitemap files redirect once to the published root files for every visitor language', async () => {
  const redirects = await builtRedirects();
  for (const file of ['sitemap-index.xml', 'sitemap-0.xml']) {
    for (const language of [undefined, 'en', 'pl', 'de']) {
      const rule = firstRedirect(redirects, `/sitemap/${file}`, { language });
      expect(rule).toMatchObject({ to: `/${file}`, status: 301, force: true });
      expect(existsSync(join('dist', file))).toBe(true);
    }
  }
});
