import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
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

import GuideSteps from './GuideSteps.tsx';

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

const guides = (language: string) => [
  {
    title: 'Event Sourcing foundations',
    path: `/${language}/guides/event-sourcing-foundations/`,
    step: 2,
    total: 13,
    next: { title: 'Bank accounts', path: `/${language}/bank_account/` },
  },
  {
    title: 'Anti-patterns',
    path: `/${language}/guides/anti-patterns/`,
    step: 9,
    total: 9,
  },
];

test.each([
  [
    'en',
    'Guide: Event Sourcing foundations — step 2 of 13 · Next: Bank accounts',
    'Guide: Anti-patterns — step 9 of 9',
    'Next: Bank accounts',
  ],
  [
    'pl',
    'Przewodnik: Event Sourcing foundations — krok 2 z 13 · Dalej: Bank accounts',
    'Przewodnik: Anti-patterns — krok 9 z 9',
    'Dalej: Bank accounts',
  ],
])(
  '%s article footer shows one line per guide with its step and next article',
  async (language, firstLine, lastLine, nextLabel) => {
    const $ = await render(language, <GuideSteps guides={guides(language)} />);
    expect(
      $('aside li')
        .map((_, line) => $(line).text())
        .get(),
    ).toEqual([firstLine, lastLine]);
    expect(
      $('aside a')
        .map((_, link) => `${$(link).attr('href')} ${$(link).text()}`)
        .get(),
    ).toEqual([
      `/${language}/guides/event-sourcing-foundations/ Event Sourcing foundations`,
      `/${language}/bank_account/ ${nextLabel}`,
      `/${language}/guides/anti-patterns/ Anti-patterns`,
    ]);
    expect($('h1, h2').length).toBe(0);
  },
);

test('an article outside every guide has no guide box', async () => {
  const $ = await render('en', <GuideSteps guides={[]} />);
  expect($('aside').length).toBe(0);
});
