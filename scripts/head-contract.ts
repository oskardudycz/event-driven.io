import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { load } from 'cheerio';
import { publishedPages } from './published-pages.ts';

export type PageHead = {
  language: string;
  titles: string[];
  canonicals: string[];
  alternates: { language: string; href: string }[];
  meta: { key: string; content: string }[];
  schemas: unknown[];
};
export type HeadContract = Record<string, PageHead>;

export function readPageHead(html: string): PageHead {
  const $ = load(html);
  const strings = (selector: string, attribute?: string) =>
    $(selector)
      .toArray()
      .map((element) =>
        attribute ? $(element).attr(attribute) || '' : $(element).text(),
      )
      .sort();
  const alternates: PageHead['alternates'] = [];
  for (const element of $('head link[rel="alternate"][hreflang]').toArray()) {
    alternates.push({
      language: $(element).attr('hreflang') || '',
      href: $(element).attr('href') || '',
    });
  }
  alternates.sort(
    (left, right) =>
      left.language.localeCompare(right.language) ||
      left.href.localeCompare(right.href),
  );

  const meta: PageHead['meta'] = [];
  for (const element of $('head meta[name], head meta[property]').toArray()) {
    const key = $(element).attr('name') || $(element).attr('property') || '';
    if (
      key !== 'description' &&
      key !== 'robots' &&
      !/^(og:|twitter:|article:|fb:)/.test(key)
    )
      continue;
    meta.push({ key, content: $(element).attr('content') || '' });
  }
  meta.sort(
    (left, right) =>
      left.key.localeCompare(right.key) ||
      left.content.localeCompare(right.content),
  );

  return {
    language: $('html').attr('lang') || '',
    titles: strings('head title'),
    canonicals: strings('head link[rel="canonical"]', 'href'),
    alternates,
    meta,
    schemas: $('head script[type="application/ld+json"]')
      .toArray()
      .map((element) => JSON.parse($(element).text()) as unknown),
  };
}

export function collectHeadContract(directory: string): HeadContract {
  return Object.fromEntries(
    publishedPages(directory).map(({ route, file }) => [
      route,
      readPageHead(readFileSync(file, 'utf8')),
    ]),
  );
}

export function compareHeadContracts(
  expected: HeadContract,
  actual: HeadContract,
): string[] {
  const failures: string[] = [];
  for (const [route, head] of Object.entries(expected)) {
    const candidate = actual[route];
    if (!candidate) {
      failures.push(`${route}: missing page`);
      continue;
    }
    for (const field of Object.keys(head) as (keyof PageHead)[]) {
      if (!isDeepStrictEqual(head[field], candidate[field]))
        failures.push(`${route}: ${field} changed`);
    }
  }
  for (const route of Object.keys(actual)) {
    if (!expected[route]) failures.push(`${route}: added page`);
  }
  return failures;
}
