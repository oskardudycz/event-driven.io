import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { expect, test } from 'vitest';
import en from '../i18n/locales/en/translation.json';
import pl from '../i18n/locales/pl/translation.json';

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

test('article tags link to their tag pages with localized labels', async () => {
  for (const [language, label] of [
    ['pl', 'Wzorce projektowe'],
    ['en', 'Design Patterns'],
  ] as const) {
    const $ = await render(
      language,
      <Meta
        prefix="2021-02-10"
        author="Author"
        tags={[
          {
            tag: 'Design Patterns',
            path: `/${language}/articles/tag/design-patterns/`,
          },
          { tag: 'CQRS', path: '/en/articles/tag/cqrs/' },
        ]}
      />,
    );
    expect(
      $('a')
        .map((_, link) => `${$(link).attr('href')} ${$(link).text()}`)
        .get(),
    ).toEqual([
      `/${language}/articles/tag/design-patterns/ ${label}`,
      '/en/articles/tag/cqrs/ CQRS',
    ]);
  }
});

test('a tag without a page is shown without a link', async () => {
  const $ = await render(
    'en',
    <Meta prefix="2021-02-10" author="Author" tags={[{ tag: 'Orphan' }]} />,
  );
  expect($('a').length).toBe(0);
  expect($('.meta span').last().text().trim()).toBe('Orphan');
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
