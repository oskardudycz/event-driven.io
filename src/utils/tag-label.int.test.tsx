import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { expect, test, vi } from 'vitest';
import en from '../i18n/locales/en/translation.json';
import pl from '../i18n/locales/pl/translation.json';

vi.mock('gatsby', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));
vi.mock('gatsby-plugin-react-i18next', () => ({
  Link: React.forwardRef(
    (props: { to: string; children: React.ReactNode }, ref) => (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={props.to}>
        {props.children}
      </a>
    ),
  ),
}));
vi.mock('gatsby-plugin-image', () => ({
  GatsbyImage: () => null,
  getImage: () => null,
}));

import Meta from '../components/Post/Meta.tsx';
import Item from '../components/Blog/Item.tsx';

const render = async (language: string, element: React.ReactElement) => {
  const i18n = i18next.createInstance();
  await i18n.init({
    resources: { en: { translation: en }, pl: { translation: pl } },
    fallbackLng: 'en',
    lng: language,
  });
  return load(
    renderToStaticMarkup(
      <I18nextProvider i18n={i18n}>{element}</I18nextProvider>,
    ),
  );
};

test('article tags link to language-neutral routes with localized labels', async () => {
  for (const [language, label] of [
    ['pl', 'Wzorce projektowe'],
    ['en', 'Design Patterns'],
  ] as const) {
    const $ = await render(
      language,
      <Meta
        prefix="2021-02-10"
        author="Author"
        tags={['Design Patterns', 'CQRS']}
      />,
    );
    expect(
      $('a')
        .map((_, link) => `${$(link).attr('href')} ${$(link).text()}`)
        .get(),
    ).toEqual([`/category/design-patterns/ ${label}`, '/category/cqrs/ CQRS']);
  }
});

test('archive cards show every tag with its localized label', async () => {
  const $ = await render(
    'pl',
    <Item
      post={{
        fields: { slug: '/saga/', prefix: '2021-02-10', langKey: 'pl' },
        frontmatter: {
          title: 'Saga',
          tags: ['Design Patterns', 'Event Sourcing'],
        },
      }}
    />,
  );
  expect(
    $('.meta span')
      .slice(2)
      .map((_, tag) => $(tag).text().trim())
      .get(),
  ).toEqual(['Wzorce projektowe', 'Event Sourcing']);
});
