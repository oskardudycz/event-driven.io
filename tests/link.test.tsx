import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { expect, test, vi } from 'vitest';

const routers = vi.hoisted(() => ({ internal: vi.fn(), localized: vi.fn() }));

// Exercise the adapter's boundary without loading Gatsby's generated runtime.
vi.mock('gatsby', () => ({
  Link: (props: { to: string; children: React.ReactNode }) => {
    routers.internal(props);
    return <a href={props.to}>{props.children}</a>;
  },
}));
vi.mock('gatsby-plugin-react-i18next', () => ({
  Link: React.forwardRef(
    (props: { to: string; language?: string; children: React.ReactNode }, ref) => {
      routers.localized(props, ref);
      return <a href={`/${props.language || 'en'}${props.to}`}>{props.children}</a>;
    },
  ),
}));

import { Link } from '../src/components/Link/index.tsx';

test.each([
  'https://example.com/article?source=blog#heading',
  'http://example.com/',
  '//example.com/file',
  'mailto:oskar@example.com',
  'tel:+48123456789',
  '#heading',
  '?page=2',
])('native destination %s preserves anchor attributes without invoking a router', (to) => {
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
        activeClassName="active"
        activeStyle={{ color: 'red' }}
        partiallyActive
        state={{ from: 'article' }}
        replace
        getProps={() => ({})}
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
  expect(routers.internal).not.toHaveBeenCalled();
  expect(routers.localized).not.toHaveBeenCalled();
});

test.each([true, '', 'guide.pdf'])('download %s keeps the file destination native', (download) => {
  const $ = load(
    renderToStaticMarkup(
      <Link to="/files/guide.pdf" download={download}>
        Guide
      </Link>,
    ),
  );
  expect($('a').attr('href')).toBe('/files/guide.pdf');
  expect($('a').attr('download')).toBe(typeof download === 'string' ? download : '');
  expect(routers.internal).not.toHaveBeenCalled();
  expect(routers.localized).not.toHaveBeenCalled();
});

test.each(['/en/articles/', '/pl/articles/?page=2#results', '/en?source=blog'])(
  'explicit locale destination %s retains its URL, router state and anchor ref',
  (to) => {
    const ref = React.createRef<HTMLAnchorElement>();
    const state = { from: 'article' };
    const $ = load(
      renderToStaticMarkup(
        <Link to={to} ref={ref} state={state}>
          Articles
        </Link>,
      ),
    );
    expect($('a').attr('href')).toBe(to);
    expect(routers.internal).toHaveBeenCalledWith(
      expect.objectContaining({ to, state, innerRef: ref }),
    );
    expect(routers.localized).not.toHaveBeenCalled();
  },
);

test.each(['en', 'pl'])('unprefixed routes preserve %s localization and ref', (language) => {
  const ref = React.createRef<HTMLAnchorElement>();
  const $ = load(
    renderToStaticMarkup(
      <Link to="/articles/" language={language} ref={ref}>
        Articles
      </Link>,
    ),
  );
  expect($('a').attr('href')).toBe(`/${language}/articles/`);
  expect(routers.localized).toHaveBeenCalledWith(
    expect.objectContaining({ to: '/articles/', language }),
    ref,
  );
  expect(routers.internal).not.toHaveBeenCalled();
});
