import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { expect, test, vi } from 'vitest';
import en from '../../i18n/locales/en/translation.json';
import pl from '../../i18n/locales/pl/translation.json';

vi.mock('gatsby', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));
vi.mock('gatsby-plugin-react-i18next', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

import TagChips from './TagChips.tsx';

test.each([
  ['en', 'Browse articles by tag'],
  ['pl', 'Przeglądaj artykuły według tagów'],
])(
  '%s tag chips link to the tag pages of their language in the given order',
  async (language, name) => {
    const i18n = i18next.createInstance();
    await i18n.init({
      resources: { en: { translation: en }, pl: { translation: pl } },
      fallbackLng: 'en',
      lng: language,
    });
    const $ = load(
      renderToStaticMarkup(
        <I18nextProvider i18n={i18n}>
          <TagChips
            language={language}
            chips={[
              { slug: 'event-sourcing', label: 'Event Sourcing', count: 40 },
              { slug: 'design-patterns', label: 'Wzorce', count: 3 },
            ]}
          />
        </I18nextProvider>,
      ),
    );
    expect($('nav').attr('aria-label')).toBe(name);
    expect(
      $('nav li a')
        .map((_, link) => `${$(link).attr('href')} ${$(link).text()}`)
        .get(),
    ).toEqual([
      `/${language}/articles/tag/event-sourcing/ Event Sourcing`,
      `/${language}/articles/tag/design-patterns/ Wzorce`,
    ]);
  },
);
