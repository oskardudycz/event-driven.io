import { test, expect } from 'vitest';
import { localizedHref } from './links.ts';

test.each([
  'https://example.com/',
  '//example.com/file',
  'mailto:test@example.com',
  '#heading',
  '?page=2',
  '/en/articles/',
  '/pl/articles/?q=test#results',
])('native or localized destination stays intact: %s', (href) => {
  expect(localizedHref(href, 'pl')).toBe(href);
});
test.each(['en', 'pl'])(
  'relative destinations use the %s interface language once',
  (language) => {
    expect(localizedHref('/articles/', language)).toBe(
      `/${language}/articles/`,
    );
    expect(localizedHref('/', language)).toBe(`/${language}/`);
  },
);
