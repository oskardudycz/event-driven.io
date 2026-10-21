import type { SitePageProps } from '../types/content.ts';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { expect, test } from 'vitest';
import en from '../i18n/locales/en/translation.json';
import pl from '../i18n/locales/pl/translation.json';

import TagTemplate from './Tag.tsx';

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
