import { expect, test } from 'vitest';
import { pageSeo } from './page-seo.ts';
import { seoMetadata } from './seo.ts';
import type { SitePageContext } from '../types/content.ts';
import en from '../i18n/locales/en/translation.json';
import pl from '../i18n/locales/pl/translation.json';

const context = (lang: string, originalPath: string): SitePageContext => ({
  lang,
  originalPath,
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'pl'],
  availableLanguages: ['en', 'pl'],
});

test.each(['en', 'pl'])(
  '%s guide metadata includes its canonical, alternates, description and cover',
  (lang) => {
    const pageContext = context(lang, '/guides/cqrs/');
    const actual = seoMetadata({
      ...pageSeo({ kind: 'guide', context: pageContext }),
      pageContext,
      data: {
        fields: { pathSlug: 'cqrs', langKey: lang, source: 'paths' },
        frontmatter: {
          title: 'CQRS',
          description: 'What CQRS is and what it is not.',
          cover: { src: '/images/guide-cover.png' },
        },
      },
    });
    expect(actual.title).toBe('CQRS - Event-Driven.io');
    expect(actual.linkTags.map((tag) => tag.href)).toEqual([
      `https://event-driven.io/${lang}/guides/cqrs/`,
      'https://event-driven.io/en/guides/cqrs/',
      'https://event-driven.io/en/guides/cqrs/',
      'https://event-driven.io/pl/guides/cqrs/',
    ]);
    expect(
      actual.metaTags.find((tag) => tag.name === 'description')?.content,
    ).toBe('What CQRS is and what it is not.');
    expect(
      actual.metaTags.find((tag) => tag.property === 'og:image')?.content,
    ).toBe('https://event-driven.io/images/guide-cover.png');
    expect(actual.structuredData['@type']).toBe('CollectionPage');
    expect(actual.structuredData.inLanguage).toBe(lang);
    expect(actual.noIndex).toBe(false);
  },
);

test.each([
  ['en', 'Guides', en.guides.description],
  ['pl', 'Przewodniki', pl.guides.description],
])(
  '%s guide index translates its title and description',
  (lang, title, description) => {
    const actual = pageSeo({
      kind: 'guides',
      context: context(lang, '/guides/'),
    });
    expect(actual).toEqual({
      title,
      description,
      schemaType: 'CollectionPage',
    });
  },
);

test.each(['en', 'pl'])(
  '%s tag metadata is a self-canonical collection with reciprocal alternates',
  (lang) => {
    const pageContext = {
      ...context(lang, '/articles/tag/event-sourcing/'),
      tag: 'Event Sourcing',
    };
    const actual = seoMetadata({
      ...pageSeo({ kind: 'tags', context: pageContext }),
      pageContext,
    });
    expect(actual.linkTags.map((tag) => tag.href)).toEqual([
      `https://event-driven.io/${lang}/articles/tag/event-sourcing/`,
      'https://event-driven.io/en/articles/tag/event-sourcing/',
      'https://event-driven.io/en/articles/tag/event-sourcing/',
      'https://event-driven.io/pl/articles/tag/event-sourcing/',
    ]);
    expect(actual.structuredData['@type']).toBe('CollectionPage');
    expect(actual.noIndex).toBe(false);
  },
);

test('a tag available in one language advertises no alternates', () => {
  const pageContext = {
    ...context('pl', '/articles/tag/community/'),
    tag: 'Community',
    availableLanguages: ['pl'],
  };
  const actual = seoMetadata({
    ...pageSeo({ kind: 'tags', context: pageContext }),
    pageContext,
  });
  expect(actual.linkTags).toEqual([
    {
      rel: 'canonical',
      href: 'https://event-driven.io/pl/articles/tag/community/',
    },
  ]);
});

test.each([
  ['en', 'CQRS articles', 'CQRS in English.'],
  ['pl', 'CQRS — artykuły', 'CQRS po polsku.'],
])(
  '%s tag metadata uses localized labels and an authored description',
  (lang, title, description) => {
    expect(
      pageSeo({
        kind: 'tags',
        context: { ...context(lang, '/articles/tag/cqrs/'), tag: 'CQRS' },
        tagContent: { description },
      }),
    ).toEqual({ title, description, schemaType: 'CollectionPage' });
  },
);

test('a tag without an authored description uses the localized fallback', () => {
  expect(
    pageSeo({
      kind: 'tags',
      context: { ...context('pl', '/articles/tag/caching/'), tag: 'Caching' },
    }).description,
  ).toBe(
    'Artykuły z tagiem Caching na Event-Driven.io, od najnowszych do najstarszych.',
  );
});
