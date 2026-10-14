import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';

vi.mock('gatsby', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));
vi.mock('gatsby-plugin-image', () => ({
  GatsbyImage: ({
    image,
    alt,
  }: {
    image: { images: { fallback: { src: string } } };
    alt: string;
  }) => <img src={image.images.fallback.src} alt={alt} />,
}));
vi.mock('../../i18n/page-context.ts', () => ({
  usePageContext: () => ({ lang: 'en' }),
}));

import Hit from './Hit.tsx';
import SearchResult from './SearchResult.tsx';

test('result rendering escapes source text while highlighting code matches', () => {
  const html = renderToStaticMarkup(
    <Hit
      hit={{
        title: '<img src=x onerror=alert(1)>',
        content: '<script>attack</script> appendToStream',
        terms: ['appendtostream'],
        path: '/en/example/',
        langKey: 'en',
        source: 'posts',
      }}
    />,
  );
  expect(html).not.toContain('<img ');
  expect(html).not.toContain('<script>');
  expect(html).toContain('&lt;img');
  expect(html).toMatch(/<mark[^>]*>appendToStream<\/mark>/);
});

test.each([
  ['en', 'Guide'],
  ['pl', 'Przewodnik'],
])('%s guide results are labelled as guides', (lang, label) => {
  const html = renderToStaticMarkup(
    <SearchResult
      lang={lang}
      hit={{
        title: 'CQRS',
        content: 'What CQRS is and what it is not.',
        terms: ['cqrs'],
        path: `/${lang}/guides/cqrs/`,
        langKey: lang,
        source: 'paths',
      }}
    />,
  );
  expect(html).toContain(`>${label}</p>`);
  expect(html).toContain(`href="/${lang}/guides/cqrs/"`);
});

test.each(['en', 'pl'])('%s tag results are labelled as tags', (lang) => {
  const html = renderToStaticMarkup(
    <SearchResult
      lang={lang}
      hit={{
        title: 'CQRS',
        content: 'Practical articles about CQRS.',
        terms: ['cqrs'],
        path: `/${lang}/articles/tag/cqrs/`,
        langKey: lang,
        source: 'tags',
      }}
    />,
  );
  expect(html).toContain('>Tag</p>');
  expect(html).toContain(`href="/${lang}/articles/tag/cqrs/"`);
});
