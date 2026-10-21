import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { temporaryDirectory } from '../../tests/helpers/temporary-directory.ts';
import { prepare, origin } from './manifest.ts';

const page = `${origin}/en/example/`;
const html = `<html lang="en"><head><title>Example</title><link rel="canonical" href="${page}"></head><body><main><p>Published content</p></main></body></html>`;

test('IndexNow reads root sitemap shards and ignores feed and sitemap-index URLs', async () => {
  const directory = temporaryDirectory('indexnow-discovery-');
  await mkdir(join(directory, 'en/example'), { recursive: true });
  await writeFile(join(directory, 'en/example/index.html'), html);
  await writeFile(
    join(directory, 'sitemap-0.xml'),
    `<urlset><url><loc>${page}</loc></url></urlset>`,
  );
  await writeFile(
    join(directory, 'rss.xml'),
    '<rss><loc>https://other.example/untrusted/</loc></rss>',
  );
  await writeFile(
    join(directory, 'sitemap-index.xml'),
    `<sitemapindex><sitemap><loc>${origin}/sitemap-0.xml</loc></sitemap></sitemapindex>`,
  );
  const manifest = await prepare(directory);
  expect(Object.keys(manifest.pages)).toEqual([page]);
  expect(manifest.pages[page]).toMatch(/^[a-f0-9]{64}$/);
});

test('duplicate canonical URLs across sitemap shards fail preparation', async () => {
  const directory = temporaryDirectory('indexnow-duplicates-');
  await mkdir(join(directory, 'en/example'), { recursive: true });
  await writeFile(join(directory, 'en/example/index.html'), html);
  const shard = `<urlset><url><loc>${page}</loc></url></urlset>`;
  await writeFile(join(directory, 'sitemap-0.xml'), shard);
  await writeFile(join(directory, 'sitemap-1.xml'), shard);
  await expect(prepare(directory)).rejects.toThrow('Duplicate sitemap page');
});
