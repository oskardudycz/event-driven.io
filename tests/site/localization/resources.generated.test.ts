import assert from 'node:assert/strict';
import { test } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { publishedPages } from '../../../scripts/published-pages.ts';

test('every built page renders its editorial language and translated navigation', () => {
  const languages = new Set();
  for (const { route, file } of publishedPages('dist')) {
    const language = route.split('/')[1];
    if (language !== 'en' && language !== 'pl') continue;
    languages.add(language);
    const $ = load(readFileSync(file, 'utf8'));
    assert.equal($('html').attr('lang'), language, route);
    const articles = $('header nav a[data-slug="/articles/"]');
    assert.equal(articles.length, 1, route);
    assert.equal(
      articles.text().trim(),
      language === 'en' ? 'Articles' : 'Artykuły',
      route,
    );
    assert.equal(articles.attr('href'), `/${language}/articles/`, route);
  }
  assert.deepEqual([...languages].sort(), ['en', 'pl']);
});
