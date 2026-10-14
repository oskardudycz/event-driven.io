import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as cheerio from 'cheerio';
import { test } from 'vitest';
import { builtRedirects, firstRedirect } from '../../helpers/redirects.ts';

const site = 'https://event-driven.io';

function builtHtmlFiles(): string[] {
  return readdirSync('public', { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => join(entry.parentPath, entry.name));
}

function pageUrl(file: string): string {
  return `${site}/${relative('public', file).replace(/index\.html$/, '')}`;
}

function internalDestination(href: string, page: string): URL | undefined {
  if (href.startsWith('//')) return undefined;
  const url = new URL(href, page);
  if (!['event-driven.io', 'www.event-driven.io'].includes(url.hostname))
    return undefined;
  return url;
}

function isBuiltPage(path: string): boolean {
  return existsSync(join('public', path, 'index.html'));
}

function trailingSlashVariants(path: string): string[] {
  return path.endsWith('/') ? [path, path.slice(0, -1)] : [path, `${path}/`];
}

test('internal links point to their final destinations, not to redirects or former category pages', async () => {
  const redirects = (await builtRedirects()).filter(
    ({ status }) => status >= 300 && status < 400,
  );
  const stale: string[] = [];
  for (const file of builtHtmlFiles()) {
    const $ = cheerio.load(readFileSync(file, 'utf8'));
    const page = pageUrl(file);
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href')!;
      const url = internalDestination(href, page);
      if (!url) return;
      if (/^\/(?:(?:en|pl)\/)?category\//.test(url.pathname)) {
        stale.push(`${file}: ${href} (former category page)`);
        return;
      }
      if (isBuiltPage(url.pathname)) return;
      const query = Object.fromEntries(url.searchParams);
      const redirect = trailingSlashVariants(url.pathname)
        .map((path) => firstRedirect(redirects, path, { query }))
        .find(Boolean);
      if (redirect)
        stale.push(`${file}: ${href} (redirects to ${redirect.to})`);
    });
  }
  assert.deepEqual(stale, []);
});
