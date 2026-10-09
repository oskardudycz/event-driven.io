import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, test } from 'vitest';
import Seo from '../src/components/Seo/Seo.tsx';

test('article Head emits the actual timestamp in both schema and Open Graph', () => {
  const timestamp = '2026-10-05T12:34:56+02:00';
  const render = (publishedAt?: string) =>
    load(
      renderToStaticMarkup(
        <Seo
          pageContext={{
            lang: 'en',
            originalPath: '/example/',
            supportedLanguages: ['en', 'pl'],
          }}
          schemaType="BlogPosting"
          data={{
            fields: { prefix: '2022-03-16', source: 'posts' },
            frontmatter: {
              title: 'Example',
              description: 'Example article',
              ...(publishedAt !== undefined ? { publishedAt } : {}),
            },
          }}
        />,
      ),
    );
  const $ = render(timestamp);
  expect(
    (JSON.parse($('#page-schema').text()) as { datePublished: string })
      .datePublished,
  ).toBe(timestamp);
  expect($('meta[property="article:published_time"]').attr('content')).toBe(
    timestamp,
  );
  const legacy = render();
  expect(
    (JSON.parse(legacy('#page-schema').text()) as { datePublished: string })
      .datePublished,
  ).toBe('2022-03-16');
  expect(() => render('2026-10-05T12:34:56')).toThrow(/publishedAt/);
});
