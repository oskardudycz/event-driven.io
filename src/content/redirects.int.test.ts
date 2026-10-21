import { expect, test } from 'vitest';
import { redirectRules } from './redirects.ts';
import type { ArticleNode } from '../types/content.ts';
test('hosting aliases redirect once to English and keep language fallbacks after specific aliases', () => {
  const article = (language: string): ArticleNode => ({
    fields: { slug: '/example/', langKey: language, source: 'posts' },
    frontmatter: {
      title: 'Example',
      redirectFrom: '/imported/',
      redirectAliases: ['/imported/', '/en/example/', '/former/'],
    },
  });
  const rules = redirectRules(
    [article('en'), article('pl')],
    [
      { language: 'en', slug: 'cqrs' },
      { language: 'pl', slug: 'cqrs' },
    ],
    '/fixed/ /en/example/ 301!',
  );
  const lines = rules.trim().split('\n');
  expect(lines[0]).toBe('/fixed/ /en/example/ 301!');
  expect(lines.filter((line) => line.startsWith('/imported/'))).toEqual([
    '/imported/  /en/example/  301',
  ]);
  expect(lines.filter((line) => line.startsWith('/former/'))).toEqual([
    '/former/  /en/example/  301',
  ]);
  expect(lines.some((line) => line.startsWith('/en/example/'))).toBe(false);
  expect(lines.filter((line) => line.startsWith('/guides/'))).toEqual([
    '/guides/  /en/guides/  301  Language=en',
    '/guides/  /pl/guides/  301  Language=pl',
    '/guides/  /en/guides/  301',
  ]);
  expect(lines).toContain('/pl/category/cqrs/  /pl/articles/tag/cqrs/  301');
});
