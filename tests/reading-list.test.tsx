import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, test, vi } from 'vitest';
import ReadingList from '../src/components/List/ReadingList';
import List from '../src/components/List/List';

vi.mock('../src/components/Link', () => ({
  Link: ({ to, ...props }: { to: string }) => <a {...props} href={to} />,
}));

test('reading list preserves editorial order and usable destinations without a routing framework', () => {
  const $ = load(
    renderToStaticMarkup(
      <ReadingList
        ordered
        showImages
        items={[
          {
            id: 'second',
            href: '/pl/second/',
            title: 'Second article',
            date: '2026-10-08',
            excerpt: 'A useful summary',
            image: { src: '/second.webp' },
          },
          { id: 'first', href: '/en/first/', title: 'First article' },
        ]}
      />,
    ),
  );
  expect($('ol > li').length).toBe(2);
  expect(
    $('li a')
      .map((_, a) => $(a).attr('href'))
      .get(),
  ).toEqual(['/pl/second/', '/en/first/']);
  expect(
    $('h3')
      .map((_, h) => $(h).text())
      .get(),
  ).toEqual(['Second article', 'First article']);
  expect($('small').text()).toBe('2026-10-08');
  expect($('.excerpt').text()).toBe('A useful summary');
  expect($('img').attr('src')).toBe('/second.webp');
  expect($('img').attr('alt')).toBe(''); // Adjacent title supplies the link's name.
  expect($('img').length).toBe(1);
});

test('Gatsby reading-list adapter preserves available locale routes independently of canonical identity', () => {
  const edges = [
    {
      node: {
        fields: { slug: '/translated/', langKey: 'pl' },
        frontmatter: { title: 'Polish title' },
      },
    },
    {
      node: {
        fields: { slug: '/fallback/', langKey: 'pl' },
        frontmatter: { title: 'English original', useDefaultLangCanonical: true },
      },
    },
  ];
  const $ = load(renderToStaticMarkup(<List edges={edges} />));
  expect(
    $('ul > li a')
      .map((_, a) => $(a).attr('href'))
      .get(),
  ).toEqual(['/pl/translated/', '/pl/fallback/']);
  expect(
    $('a')
      .map((_, a) => $(a).text())
      .get(),
  ).toEqual(['Polish title', 'English original']);
  expect($('h3, img, small').length).toBe(0);
});
