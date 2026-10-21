import { expect, test } from 'vitest';
import {
  contentFields,
  articleLanguages,
  relatedArticles,
  articleAliases,
} from './routing.ts';
import type { ArticleNode } from '../types/content.ts';

function post(
  file: string,
  related: string[] = [],
  canonicalCopy = false,
): ArticleNode {
  return {
    id: file,
    fields: contentFields('posts', file),
    frontmatter: {
      title: file,
      related,
      useDefaultLangCanonical: canonicalCopy,
    },
  };
}

test('routes normalize case while retaining original publication identity and order', () => {
  expect(
    contentFields('posts', '2026-10-20--Mixed_Case/index.pl.md'),
  ).toMatchObject({
    slug: '/mixed_case/',
    originalSlug: '/Mixed_Case/',
    prefix: '2026-10-20',
    langKey: 'pl',
  });
  expect(contentFields('paths', '01--Architecture/index.en.md')).toMatchObject({
    pathSlug: 'architecture',
    prefix: '01',
  });
});

test('editorial copies remain available without becoming canonical translations', () => {
  const english = post('2026-01-01--example/index.en.md');
  const polish = post('2026-01-01--example/index.pl.md', [], true);
  expect(articleLanguages([english, polish], polish)).toEqual({
    availableLanguages: ['en', 'pl'],
    canonicalLanguages: ['en'],
  });
});

test('related links prefer the reader language, then canonical English, and reject unknown targets', () => {
  const article = post('2026-01-02--example/index.pl.md', ['target']);
  const english = post('2026-01-01--target/index.en.md');
  const polish = post('2026-01-01--target/index.pl.md', [], true);
  expect(relatedArticles([article, english, polish], article)).toEqual([
    polish,
  ]);
  expect(relatedArticles([article, english], article)).toEqual([english]);
  expect(() => relatedArticles([article], article)).toThrow(
    'Invalid related article',
  );
});

test('aliases preserve order, exclude self redirects and belong to the English publication', () => {
  const article = post('2026-01-01--example/index.en.md');
  article.frontmatter.redirectFrom = '/old/';
  article.frontmatter.redirectAliases = ['/old/', '/en/example/', '/older/'];
  expect(articleAliases(article)).toEqual([
    { fromPath: '/old/', toPath: '/en/example/' },
    { fromPath: '/older/', toPath: '/en/example/' },
  ]);
  expect(articleAliases(post('2026-01-01--example/index.pl.md'))).toEqual([]);
});
