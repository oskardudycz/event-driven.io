import assert from 'node:assert/strict';
import { test } from 'node:test';
import { globSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const config = require('../gatsby-config.js');
const { options } = config.plugins.find(({ resolve }) => resolve === 'gatsby-plugin-react-i18next');
const { onCreatePage } = require('gatsby-plugin-react-i18next/gatsby-node');

test('the locale plugin decorates existing routes without generating duplicate language pages', async () => {
  for (const path of [
    '/en/',
    '/pl/',
    '/en/articles/',
    '/pl/404/',
    '/en/open-source-a-relict-a-charity-or/',
  ]) {
    const created = [];
    await onCreatePage(
      {
        page: { path, context: {} },
        actions: { createPage: (page) => created.push(page), deletePage: () => {} },
      },
      options,
    );
    assert.equal(created.length, 1);
    assert.equal(created[0].path, path);
    assert.equal(created[0].context.language, path.split('/')[1]);
  }
  const created = [];
  await onCreatePage(
    {
      page: { path: '/articles/', context: {} },
      actions: { createPage: (page) => created.push(page), deletePage: () => {} },
    },
    options,
  );
  assert.deepEqual(
    created.map(({ path }) => path),
    ['/articles/'],
  );
});

test('every built page has matching editorial and plugin language with queried translations', () => {
  const languages = new Set();
  for (const file of globSync('public/page-data/**/page-data.json')) {
    const { path, result } = JSON.parse(readFileSync(file, 'utf8'));
    const language = path.split('/')[1];
    if (!['en', 'pl'].includes(language)) continue;
    languages.add(language);
    const context = result.pageContext;
    assert.equal(context.lang, language, path);
    assert.equal(context.langKey, language, path);
    assert.equal(context.language, language, path);
    assert.equal(context.i18n.language, language, path);
    assert.equal(context.i18n.generateDefaultLanguagePage, true, path);
    assert.equal(context.i18n.routed, true, path);
    assert.equal(context.i18n.originalPath, context.originalPath, path);
    const locales = result.data.locales.edges.map(({ node }) => node);
    assert.deepEqual(
      locales.map(({ language }) => language).sort(),
      language === 'en' ? ['en'] : ['en', 'pl'],
      path,
    );
    const resource = locales.find((node) => node.language === language);
    assert.equal(resource.ns, 'translation', path);
    assert.equal(
      JSON.parse(resource.data).menu.articles,
      language === 'en' ? 'Articles' : 'Artykuły',
      path,
    );
  }
  assert.deepEqual([...languages].sort(), ['en', 'pl']);
});
