import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load, type CheerioAPI } from 'cheerio';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { expect, test, vi } from 'vitest';
import en from '../../i18n/locales/en/translation.json';
import pl from '../../i18n/locales/pl/translation.json';

vi.mock('../Link/index.tsx', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

import Meta from './Meta.tsx';

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

const tags = (language: string) => [
  { tag: 'Event Sourcing', path: `/${language}/articles/tag/event-sourcing/` },
  { tag: 'Orphan' },
  { tag: 'CQRS', path: `/${language}/articles/tag/cqrs/` },
];

const guides = (language: string) => [
  {
    title: 'Handling business logic',
    path: `/${language}/guides/handling-business-logic/`,
    step: 3,
    total: 12,
    next: { title: 'Next article', path: `/${language}/next_article/` },
  },
  {
    title: 'Idempotency',
    path: `/${language}/guides/idempotency/`,
    step: 1,
    total: 3,
  },
];

const groups = ($: CheerioAPI) =>
  $('.meta [role=group]')
    .map((_, group) => {
      const label = $(`[id="${$(group).attr('aria-labelledby')}"]`);
      return {
        label: label.text(),
        labelInsideGroup: $(group).find(label).length === 1,
        items: $(group)
          .children()
          .not(label)
          .map((_, item) => $(item).text().replace('·', '').trim())
          .get(),
        links: $(group)
          .find('a')
          .map((_, link) => `${$(link).attr('href')} ${$(link).text()}`)
          .get(),
        separators: $(group)
          .find('[aria-hidden=true]')
          .map((_, separator) => $(separator).text().trim())
          .get(),
      };
    })
    .get();

test.each([
  ['en', 'Tags:', 'Guides:'],
  ['pl', 'Tagi:', 'Przewodniki:'],
])(
  '%s article header lists tags and guides in labelled rows',
  async (language, tagsLabel, guidesLabel) => {
    const $ = await render(
      language,
      <Meta
        prefix="2024-11-15"
        author="Oskar Dudycz"
        tags={tags(language)}
        guides={guides(language)}
      />,
    );
    expect(
      $('.meta').children().first().text().replace(/\s+/g, ' ').trim(),
    ).toBe('2024-11-15 Oskar Dudycz');
    expect(groups($)).toEqual([
      {
        label: tagsLabel,
        labelInsideGroup: true,
        items: ['Event Sourcing', 'Orphan', 'CQRS'],
        links: [
          `/${language}/articles/tag/event-sourcing/ Event Sourcing`,
          `/${language}/articles/tag/cqrs/ CQRS`,
        ],
        separators: ['·', '·'],
      },
      {
        label: guidesLabel,
        labelInsideGroup: true,
        items: ['Handling business logic (3/12)', 'Idempotency (1/3)'],
        links: [
          `/${language}/guides/handling-business-logic/ Handling business logic (3/12)`,
          `/${language}/guides/idempotency/ Idempotency (1/3)`,
        ],
        separators: ['·'],
      },
    ]);
  },
);

test('each row has one icon', async () => {
  const $ = await render(
    'en',
    <Meta
      prefix="2024-11-15"
      author="Oskar Dudycz"
      tags={tags('en')}
      guides={guides('en')}
    />,
  );
  expect($('.meta svg').length).toBe(4);
  expect($('.meta [role=group] svg').length).toBe(2);
});

test.each([
  ['tags', { tags: [], guides: guides('en') }, ['Guides:']],
  ['guides', { tags: tags('en'), guides: [] }, ['Tags:']],
  ['tags and guides', {}, []],
])('an article without %s omits that row', async (_, props, labels) => {
  const $ = await render(
    'en',
    <Meta prefix="2024-11-15" author="Oskar Dudycz" {...props} />,
  );
  expect(groups($).map(({ label }) => label)).toEqual(labels);
  expect($('.meta').children().length).toBe(labels.length + 1);
});
