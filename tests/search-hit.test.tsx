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
vi.mock('../src/i18n/page-context', () => ({
  usePageContext: () => ({ lang: 'en' }),
}));

import Hit from '../src/components/Search/Hit.tsx';

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
