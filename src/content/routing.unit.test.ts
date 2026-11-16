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

test('articles listing this one follow its own related entries, newest first', () => {
  const article = post('2026-01-05--article/index.en.md', ['explicit']);
  const explicit = post('2026-01-01--explicit/index.en.md');
  const older = post('2026-01-02--older/index.en.md', ['article']);
  const newer = post('2026-01-03--newer/index.en.md', ['article']);
  expect(relatedArticles([article, explicit, older, newer], article)).toEqual([
    explicit,
    newer,
    older,
  ]);
});

test('articles listing each other appear once', () => {
  const first = post('2026-01-02--first/index.en.md', ['second']);
  const second = post('2026-01-01--second/index.en.md', ['first']);
  expect(relatedArticles([first, second], first)).toEqual([second]);
  expect(relatedArticles([first, second], second)).toEqual([first]);
});

test('articles listing this one prefer the reader language, then canonical English', () => {
  const target = post('2026-01-01--target/index.pl.md');
  const english = post('2026-01-02--referrer/index.en.md', ['target']);
  const polish = post('2026-01-02--referrer/index.pl.md', ['target']);
  expect(relatedArticles([target, english, polish], target)).toEqual([polish]);
  expect(relatedArticles([target, english], target)).toEqual([english]);
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
