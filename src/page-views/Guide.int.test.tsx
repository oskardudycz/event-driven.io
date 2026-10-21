import type { SitePageProps } from '../types/content.ts';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, test } from 'vitest';
import GuideTemplate from './Guide.tsx';

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
