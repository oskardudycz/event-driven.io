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

const renderHead = (pageContext: Record<string, unknown>, data = {}) =>
  load(
    renderToStaticMarkup(
      <>{Head({ data, pageContext } as unknown as HeadProps<never, never>)}</>,
    ),
  );

type TagContent = { html: string; frontmatter: { description: string } };

const renderPage = async (
  language: string,
  tag: string,
  count: number,
  tagContent: TagContent | null = null,
) => {
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
            data: { posts: { edges }, tagContent },
            pageContext: { tag, lang: language },
          } as unknown as SitePageProps<'posts' | 'tagContent'>)}
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
  ['en', 'CQRS articles - Event-Driven.io', 'CQRS in English.'],
  ['pl', 'CQRS — artykuły - Event-Driven.io', 'CQRS po polsku.'],
])(
  '%s tag page title uses the tag translations and its description the tag file',
  (language, title, description) => {
    const $ = renderHead(
      {
        lang: language,
        tag: 'CQRS',
        originalPath: '/articles/tag/cqrs/',
        availableLanguages: ['en', 'pl'],
      },
      { tagContent: { html: '<p>Intro</p>', frontmatter: { description } } },
    );
    expect($('title').text()).toBe(title);
    expect($('meta[name=description]').attr('content')).toBe(description);
  },
);

test('a tag without a file uses the localized default description', () => {
  const $ = renderHead(
    {
      lang: 'pl',
      tag: 'Caching',
      originalPath: '/articles/tag/caching/',
      availableLanguages: ['en', 'pl'],
    },
    { tagContent: null },
  );
  expect($('meta[name=description]').attr('content')).toBe(
    'Artykuły z tagiem Caching na Event-Driven.io, od najnowszych do najstarszych.',
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

test.each([
  ['en', 'Practical CQRS articles.', '<p>CQRS separates <em>reads</em>.</p>'],
  [
    'pl',
    'Praktyczne artykuły o CQRS.',
    '<p>CQRS rozdziela <em>odczyty</em>.</p>',
  ],
])(
  '%s tag page shows the Markdown intro of its tag file instead of the description',
  async (language, description, html) => {
    const $ = await renderPage(language, 'CQRS', 2, {
      html,
      frontmatter: { description },
    });
    expect($('.main .bodytext').html()).toBe(html);
    expect($('.main').text()).not.toContain(description);
    expect($('.main').text()).toContain(
      language === 'pl' ? '2 artykuły' : '2 articles',
    );
  },
);

test('a tag page without a tag file shows the default description and no intro', async () => {
  const $ = await renderPage('en', 'Caching', 1);
  expect($('.main .bodytext').length).toBe(0);
  expect($('.main').text()).toContain(
    en.tags.defaultDescription.replace('{{tag}}', 'Caching'),
  );
});

test('a tag file without an intro shows its own description', async () => {
  const $ = await renderPage('en', 'CQRS', 1, {
    html: '',
    frontmatter: { description: 'Practical CQRS articles.' },
  });
  expect($('.main .bodytext').length).toBe(0);
  expect($('.main .text-summary').text()).toBe('Practical CQRS articles.');
});
