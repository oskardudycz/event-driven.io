import { expect, test } from 'vitest';
import { seoMetadata } from './seo.ts';

test('article metadata preserves an explicit timestamp and validates its timezone', () => {
  const timestamp = '2026-10-05T12:34:56+02:00';
  const metadata = (publishedAt?: string) =>
    seoMetadata({
      pageContext: {
        lang: 'en',
        originalPath: '/example/',
        supportedLanguages: ['en', 'pl'],
      },
      schemaType: 'BlogPosting',
      data: {
        fields: { prefix: '2022-03-16', source: 'posts' },
        frontmatter: {
          title: 'Example',
          description: 'Example article',
          ...(publishedAt !== undefined ? { publishedAt } : {}),
        },
      },
    });
  const actual = metadata(timestamp);
  expect(actual.structuredData.datePublished).toBe(timestamp);
  expect(
    actual.metaTags.find((tag) => tag.property === 'article:published_time')
      ?.content,
  ).toBe(timestamp);
  expect(metadata().structuredData.datePublished).toBe('2022-03-16');
  expect(() => metadata('2026-10-05T12:34:56')).toThrow(/publishedAt/);
});

test('article section metadata uses the primary tag only', () => {
  const actual = seoMetadata({
    pageContext: {
      lang: 'en',
      originalPath: '/example/',
      supportedLanguages: ['en', 'pl'],
    },
    schemaType: 'BlogPosting',
    data: {
      fields: { prefix: '2022-03-16', source: 'posts' },
      frontmatter: { title: 'Example', tags: ['Event Sourcing', 'CQRS'] },
    },
  });
  expect(
    actual.metaTags.find((tag) => tag.property === 'article:section')?.content,
  ).toBe('Event Sourcing');
  expect(actual.structuredData.articleSection).toBe('Event Sourcing');
});
