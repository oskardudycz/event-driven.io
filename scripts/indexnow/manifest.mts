import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import cheerio from 'cheerio';
import config from '../../content/meta/config.js';

export const origin = config.siteUrl;
export type Manifest = { version: 1; origin: string; pages: Record<string, string> };
export function productionUrl(input: string): string {
  const url = new URL(input, origin);
  if (
    url.origin !== origin ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !/^\/(en|pl)\//.test(url.pathname) ||
    !url.pathname.endsWith('/')
  )
    throw new Error(`Expected a canonical production page URL: ${input}`);
  return url.href;
}
export function fingerprint(html: string, url: string): string {
  const $ = cheerio.load(html);
  if (
    $('link[rel=canonical]').length !== 1 ||
    $('link[rel=canonical]').attr('href') !== url ||
    /\bnoindex\b/i.test($('meta[name=robots]').attr('content') || '') ||
    $('main').length !== 1
  )
    throw new Error(`Not a canonical, indexable page: ${url}`);
  const main = $('main').clone();
  main.find('script, style, noscript, svg').remove();
  const content = {
    language: $('html').attr('lang'),
    title: $('head title').text(),
    description: $('meta[name=description]').attr('content'),
    text: main.text().replace(/\s+/g, ' ').trim(),
    links: main
      .find('a[href]')
      .map((_, e) => $(e).attr('href'))
      .get(),
    images: main
      .find('img')
      .map((_, e) => ({ src: $(e).attr('src'), alt: $(e).attr('alt') }))
      .get(),
    media: main
      .find('iframe[src], video[src], audio[src]')
      .map((_, e) => $(e).attr('src'))
      .get(),
  };
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}
export function validateManifest(input: unknown): Manifest {
  const manifest = input as Manifest;
  if (
    manifest?.version !== 1 ||
    manifest.origin !== origin ||
    !manifest.pages ||
    Array.isArray(manifest.pages) ||
    typeof manifest.pages !== 'object'
  )
    throw new Error('Invalid IndexNow manifest');
  for (const [url, hash] of Object.entries(manifest.pages)) {
    productionUrl(url);
    if (typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash))
      throw new Error(`Invalid page fingerprint: ${url}`);
  }
  return manifest;
}
export function changedUrls(previous: Manifest, current: Manifest): string[] {
  validateManifest(previous);
  validateManifest(current);
  return [...new Set([...Object.keys(previous.pages), ...Object.keys(current.pages)])]
    .filter((url) => previous.pages[url] !== current.pages[url])
    .sort();
}
export async function prepare(directory = 'public'): Promise<Manifest> {
  const pages: Record<string, string> = {};
  const sitemapDirectory = join(directory, 'sitemap');
  for (const name of (await readdir(sitemapDirectory)).sort()) {
    if (!name.endsWith('.xml') || name === 'sitemap-index.xml') continue;
    const xml = cheerio.load(await readFile(join(sitemapDirectory, name), 'utf8'), {
      xmlMode: true,
    });
    for (const element of xml('url > loc').toArray()) {
      const url = productionUrl(xml(element).text());
      if (Object.hasOwn(pages, url)) throw new Error(`Duplicate sitemap page: ${url}`);
      pages[url] = fingerprint(
        await readFile(join(directory, new URL(url).pathname, 'index.html'), 'utf8'),
        url,
      );
    }
  }
  if (!Object.keys(pages).length) throw new Error('Empty sitemap: build before preparing IndexNow');
  const manifest: Manifest = { version: 1, origin, pages };
  await writeFile(
    join(directory, 'indexnow-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest;
}
