import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, test } from 'vitest';
import { Link } from './index.tsx';
test.each([
  'https://example.com/article?source=blog#heading',
  'http://example.com/',
  '//example.com/file',
  'mailto:oskar@example.com',
  'tel:+48123456789',
  '#heading',
  '?page=2',
])('native destination %s preserves anchor attributes', (to) => {
  const $ = load(
    renderToStaticMarkup(
      <Link
        to={to}
        language="pl"
        target="_blank"
        rel="noopener noreferrer"
        className="reference"
        title="Reference"
        data-reference="article"
      >
        Read more
      </Link>,
    ),
  );
  expect($('a').attr()).toEqual({
    href: to,
    target: '_blank',
    rel: 'noopener noreferrer',
    class: 'reference',
    title: 'Reference',
    'data-reference': 'article',
  });
  expect($('a').text()).toBe('Read more');
});
test.each([true, '', 'guide.pdf'])(
  'download %s keeps the file destination native',
  (download) => {
    const $ = load(
      renderToStaticMarkup(
        <Link to="/files/guide.pdf" download={download} language="pl">
          Guide
        </Link>,
      ),
    );
    expect($('a').attr('href')).toBe('/files/guide.pdf');
    expect($('a').attr('download')).toBe(
      typeof download === 'string' ? download : '',
    );
  },
);
test.each(['/en/articles/', '/pl/articles/?page=2#results', '/en?source=blog'])(
  'explicit locale destination %s retains its URL',
  (to) => {
    const $ = load(
      renderToStaticMarkup(
        <Link to={to} language="pl">
          Articles
        </Link>,
      ),
    );
    expect($('a').attr('href')).toBe(to);
  },
);
test.each(['en', 'pl'])(
  'unprefixed routes preserve %s localization',
  (language) => {
    const $ = load(
      renderToStaticMarkup(
        <Link to="/articles/" language={language}>
          Articles
        </Link>,
      ),
    );
    expect($('a').attr('href')).toBe(`/${language}/articles/`);
  },
);
