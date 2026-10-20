import { test, expect } from 'vitest';
import { compareHeadContracts, readPageHead } from './head-contract.ts';

const html = `<html lang="pl"><head><title>Title &amp; name</title><meta name="description" content="Description"><meta property="og:locale" content="pl_PL"><link href="https://example.com/pl/" rel="canonical"><link rel="alternate" hrefLang="en" href="https://example.com/en/"><script type="application/ld+json">{"@type":"WebPage","url":"https://example.com/pl/"}</script></head></html>`;

test('head parity ignores HTML serialization and JSON object key order', () => {
  const expected = readPageHead(html);
  const candidate = readPageHead(
    html
      .replace('hrefLang', 'hreflang')
      .replace(
        '{"@type":"WebPage","url":"https://example.com/pl/"}',
        '{"url":"https://example.com/pl/","@type":"WebPage"}',
      ),
  );
  expect(
    compareHeadContracts({ '/pl/': expected }, { '/pl/': candidate }),
  ).toEqual([]);
  expect(expected.alternates).toEqual([
    { language: 'en', href: 'https://example.com/en/' },
  ]);
});

test('head parity reports canonical, locale, metadata and structured data regressions', () => {
  const expected = readPageHead(html);
  const actual = readPageHead(
    html
      .replaceAll('https://example.com/pl/', 'https://example.com/en/')
      .replace('lang="pl"', 'lang="en"')
      .replace('pl_PL', 'en_US'),
  );
  expect(
    compareHeadContracts({ '/pl/': expected }, { '/pl/': actual }),
  ).toEqual([
    '/pl/: language changed',
    '/pl/: canonicals changed',
    '/pl/: meta changed',
    '/pl/: schemas changed',
  ]);
});

test('head parity retains duplicates and detects missing or added pages', () => {
  const head = readPageHead(html);
  expect(compareHeadContracts({ '/old/': head }, { '/new/': head })).toEqual([
    '/old/: missing page',
    '/new/: added page',
  ]);
  expect(
    readPageHead(
      html.replace('</head>', '<link rel="canonical" href="duplicate"></head>'),
    ).canonicals,
  ).toHaveLength(2);
});
