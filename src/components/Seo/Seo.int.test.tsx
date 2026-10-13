import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, test } from 'vitest';
import Seo from './Seo.tsx';

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

test('article section metadata uses the primary tag only', () => {
  const $ = load(
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
            tags: ['Event Sourcing', 'CQRS'],
          },
        }}
      />,
    ),
  );
  expect($('meta[property="article:section"]').attr('content')).toBe(
    'Event Sourcing',
  );
  expect(
    (JSON.parse($('#page-schema').text()) as { articleSection: string })
      .articleSection,
  ).toBe('Event Sourcing');
});
