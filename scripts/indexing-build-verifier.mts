import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import cheerio from 'cheerio';

export const siteOrigin = 'https://event-driven.io';

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? (entry.name === '_gatsby' ? [] : files(file)) : [file];
  });
}

export function verifyIndexingBuild(directory: string): string[] {
  const failures: string[] = [];
  const pages = new Map<
    string,
    { canonical: string | undefined; noIndex: boolean; alternates: Map<string, string> }
  >();
  for (const file of files(directory).filter((file) => file.endsWith('.html'))) {
    const route = `/${relative(directory, file).replace(/index\.html$/, '')}`;
    if (route !== route.toLowerCase()) failures.push(`${route}: mixed-case document route`);
    const $ = cheerio.load(readFileSync(file, 'utf8'));
    const canonicals = $('head link[rel="canonical"]');
    const noIndex = /\bnoindex\b/i.test($('meta[name="robots"]').attr('content') || '');
    if (canonicals.length !== (noIndex ? Math.min(canonicals.length, 1) : 1))
      failures.push(`${route}: expected a single canonical on an indexable page`);
    const alternates = new Map<string, string>();
    $('head link[rel="alternate"][hreflang]').each((_, element) => {
      const language = $(element).attr('hreflang')!;
      if (alternates.has(language)) failures.push(`${route}: duplicate alternate ${language}`);
      alternates.set(language, $(element).attr('href') || '');
    });
    pages.set(route, { canonical: canonicals.attr('href'), noIndex, alternates });
  }
  function destination(url: string, label: string) {
    try {
      const target = new URL(url);
      if (target.origin !== siteOrigin || target.search || target.hash)
        throw new Error('expected clean absolute production URL');
      const page = pages.get(target.pathname);
      if (!page || page.noIndex || page.canonical !== url)
        failures.push(`${label}: destination is missing, noindex or not self-canonical: ${url}`);
      return page;
    } catch {
      failures.push(`${label}: invalid discovery URL: ${url}`);
      return undefined;
    }
  }
  for (const [route, page] of pages) {
    if (!page.noIndex && page.canonical) destination(page.canonical, `${route} canonical`);
    for (const [language, href] of page.alternates) {
      const target = destination(href, `${route} alternate ${language}`);
      if (language !== 'x-default' && target)
        for (const [otherLanguage, otherHref] of page.alternates)
          if (target.alternates.get(otherLanguage) !== otherHref)
            failures.push(`${route}: non-reciprocal alternate ${language}/${otherLanguage}`);
    }
  }
  const sitemapFiles = files(join(directory, 'sitemap')).filter((file) =>
    /sitemap-\d+\.xml$/.test(file),
  );
  const sitemapUrls = sitemapFiles.flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]),
  );
  if (!sitemapUrls.length) failures.push('Sitemap has no content URLs');
  if (new Set(sitemapUrls).size !== sitemapUrls.length) failures.push('Sitemap repeats URLs');
  for (const url of sitemapUrls) destination(url, 'Sitemap');
  const listed = new Set(sitemapUrls);
  for (const [route, page] of pages)
    if (!page.noIndex && page.canonical === `${siteOrigin}${route}` && !listed.has(page.canonical))
      failures.push(`${route}: canonical indexable page missing from sitemap`);
  return failures;
}
