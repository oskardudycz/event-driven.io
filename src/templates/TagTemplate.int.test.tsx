import type { HeadProps } from 'gatsby';
import type { SitePageProps } from '../types/content.ts';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { expect, test, vi } from 'vitest';
import en from '../i18n/locales/en/translation.json';
import pl from '../i18n/locales/pl/translation.json';

vi.mock('gatsby', () => ({
  graphql: () => '',
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

import TagTemplate, { Head } from './TagTemplate.tsx';

const renderHead = (pageContext: Record<string, unknown>) =>
  load(
    renderToStaticMarkup(
      <>
        {Head({ data: {}, pageContext } as unknown as HeadProps<never, never>)}
      </>,
    ),
  );

const renderPage = async (language: string, tag: string, count: number) => {
  const i18n = i18next.createInstance();
  await i18n.init({
    resources: { en: { translation: en }, pl: { translation: pl } },
    fallbackLng: 'en',
    lng: language,
  });
  const edges = Array.from({ length: count }, (_, index) => ({
    node: {
      excerpt: `Excerpt ${index}`,
      fields: {
        slug: `/article-${index}/`,
        prefix: '2026-01-01',
        langKey: language,
      },
      frontmatter: { title: `Article ${index}`, tags: [tag] },
    },
  }));
  return load(
    renderToStaticMarkup(
      <I18nextProvider i18n={i18n}>
        <TagTemplate
          {...({
            data: { posts: { edges } },
            pageContext: { tag, lang: language },
          } as unknown as SitePageProps<'posts'>)}
        />
      </I18nextProvider>,
    ),
  );
};

test.each(['en', 'pl'])(
  '%s tag page is a self-canonical collection with reciprocal alternates',
  (language) => {
    const $ = renderHead({
      lang: language,
      tag: 'Event Sourcing',
      originalPath: '/articles/tag/event-sourcing/',
      availableLanguages: ['en', 'pl'],
    });
    expect($('link[rel=canonical]').attr('href')).toBe(
      `https://event-driven.io/${language}/articles/tag/event-sourcing/`,
    );
    expect(
      $('link[rel=alternate]')
        .map((_, link) => `${$(link).attr('hreflang')} ${$(link).attr('href')}`)
        .get(),
    ).toEqual([
      'x-default https://event-driven.io/en/articles/tag/event-sourcing/',
      'en https://event-driven.io/en/articles/tag/event-sourcing/',
      'pl https://event-driven.io/pl/articles/tag/event-sourcing/',
    ]);
    expect(
      (JSON.parse($('#page-schema').text()) as Record<string, string>)['@type'],
    ).toBe('CollectionPage');
    expect($('meta[name=robots]').length).toBe(0);
  },
);

test('a tag page in one language advertises no alternates', () => {
  const $ = renderHead({
    lang: 'pl',
    tag: 'Community',
    originalPath: '/articles/tag/community/',
    availableLanguages: ['pl'],
  });
  expect($('link[rel=canonical]').attr('href')).toBe(
    'https://event-driven.io/pl/articles/tag/community/',
  );
  expect($('link[rel=alternate]').length).toBe(0);
});

test.each([
  ['en', 'CQRS articles - Event-Driven.io', en.tags.descriptions.cqrs],
  ['pl', 'CQRS — artykuły - Event-Driven.io', pl.tags.descriptions.cqrs],
])(
  '%s tag page title and description use the tag translations',
  (language, title, description) => {
    const $ = renderHead({
      lang: language,
      tag: 'CQRS',
      originalPath: '/articles/tag/cqrs/',
      availableLanguages: ['en', 'pl'],
    });
    expect($('title').text()).toBe(title);
    expect($('meta[name=description]').attr('content')).toBe(description);
  },
);

test('an undescribed tag uses the localized default description', () => {
  const $ = renderHead({
    lang: 'pl',
    tag: 'Design Patterns',
    originalPath: '/articles/tag/design-patterns/',
    availableLanguages: ['en', 'pl'],
  });
  expect($('meta[name=description]').attr('content')).toBe(
    'Praktyczne artykuły na temat Wzorce projektowe.',
  );
});

test.each([
  ['en', 1, '1 article'],
  ['en', 19, '19 articles'],
  ['pl', 1, '1 artykuł'],
  ['pl', 3, '3 artykuły'],
  ['pl', 19, '19 artykułów'],
  ['pl', 22, '22 artykuły'],
])(
  '%s tag page with %i articles shows its heading, description, count and tiles',
  async (language, count, label) => {
    const $ = await renderPage(language, 'Design Patterns', count);
    expect($('h1').text()).toBe(
      language === 'pl' ? 'Wzorce projektowe' : 'Design Patterns',
    );
    expect($('.main').text()).toContain(label);
    expect($('li > a').length).toBe(count);
    expect($('ol').length).toBe(0);
  },
);
