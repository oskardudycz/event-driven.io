import type { HeadProps } from 'gatsby';
import type { SitePageProps } from '../types/content.ts';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, test, vi } from 'vitest';

vi.mock('gatsby', () => ({
  graphql: () => '',
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));
vi.mock('gatsby-plugin-react-i18next', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

import GuideTemplate, { Head as GuideHead } from './GuideTemplate.tsx';
import { Head as GuidesHead } from './GuidesTemplate.tsx';
import en from '../i18n/locales/en/translation.json';
import pl from '../i18n/locales/pl/translation.json';

const renderHead = (
  Head: (props: HeadProps<never, never>) => React.ReactNode,
  data: unknown,
  pageContext: Record<string, unknown>,
) =>
  load(
    renderToStaticMarkup(
      <>
        {Head({
          data,
          pageContext,
        } as unknown as HeadProps<never, never>)}
      </>,
    ),
  );

const schema = ($: ReturnType<typeof load>) =>
  JSON.parse($('#page-schema').text()) as Record<string, string>;

test.each(['en', 'pl'])(
  '%s guide page is self-canonical with reciprocal alternates, its description and cover',
  (language) => {
    const $ = renderHead(
      GuideHead,
      {
        guide: {
          fields: { pathSlug: 'cqrs', langKey: language, source: 'paths' },
          frontmatter: {
            title: 'CQRS',
            description: 'What CQRS is and what it is not.',
            cover: {
              childImageSharp: { resize: { src: '/static/guide-cover.png' } },
            },
          },
        },
      },
      {
        lang: language,
        originalPath: '/guides/cqrs/',
        availableLanguages: ['en', 'pl'],
      },
    );
    expect($('link[rel=canonical]').attr('href')).toBe(
      `https://event-driven.io/${language}/guides/cqrs/`,
    );
    expect(
      $('link[rel=alternate]')
        .map((_, link) => `${$(link).attr('hreflang')} ${$(link).attr('href')}`)
        .get(),
    ).toEqual([
      'x-default https://event-driven.io/en/guides/cqrs/',
      'en https://event-driven.io/en/guides/cqrs/',
      'pl https://event-driven.io/pl/guides/cqrs/',
    ]);
    expect($('meta[name=description]').attr('content')).toBe(
      'What CQRS is and what it is not.',
    );
    expect($('meta[property="og:image"]').attr('content')).toBe(
      'https://event-driven.io/static/guide-cover.png',
    );
    expect($('title').text()).toBe('CQRS - Event-Driven.io');
    expect(schema($)['@type']).toBe('CollectionPage');
    expect(schema($).inLanguage).toBe(language);
    expect($('meta[name=robots]').length).toBe(0);
  },
);

test.each([
  ['en', 'Guides - Event-Driven.io', en.guides.description],
  ['pl', 'Przewodniki - Event-Driven.io', pl.guides.description],
])(
  '%s guide index has a translated title and description',
  (language, title, description) => {
    const $ = renderHead(
      GuidesHead,
      {},
      {
        lang: language,
        originalPath: '/guides/',
        availableLanguages: ['en', 'pl'],
      },
    );
    expect($('title').text()).toBe(title);
    expect($('meta[name=description]').attr('content')).toBe(description);
    expect($('link[rel=canonical]').attr('href')).toBe(
      `https://event-driven.io/${language}/guides/`,
    );
    expect($('link[rel=alternate][hreflang=x-default]').attr('href')).toBe(
      'https://event-driven.io/en/guides/',
    );
    expect(schema($)['@type']).toBe('CollectionPage');
  },
);

test('guide page shows its Markdown intro instead of the short description', () => {
  const $ = load(
    renderToStaticMarkup(
      <GuideTemplate
        {...({
          data: {
            guide: {
              html: '<p>CQRS separates <em>reads</em> from writes.</p>',
              fields: { pathSlug: 'cqrs', langKey: 'en', source: 'paths' },
              frontmatter: {
                title: 'CQRS',
                icon: '🔀',
                description: 'What CQRS is and what it is not.',
              },
            },
            articles: { edges: [] },
          },
          pageContext: { lang: 'en', articleIds: [] },
        } as unknown as SitePageProps<'guide' | 'articles'>)}
      />,
    ),
  );
  expect($('h1').text()).toBe('🔀 CQRS');
  expect($('.bodytext').html()).toBe(
    '<p>CQRS separates <em>reads</em> from writes.</p>',
  );
  expect($.root().text()).not.toContain('What CQRS is and what it is not.');
});
