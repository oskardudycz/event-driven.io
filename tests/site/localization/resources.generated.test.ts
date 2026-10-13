import type { BuildPageData } from '../../helpers/build-output.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';
import { globSync, readFileSync } from 'node:fs';

test('every built page has matching editorial and plugin language with queried translations', () => {
  const languages = new Set();
  for (const file of globSync('public/page-data/**/page-data.json')) {
    const { path, result } = JSON.parse(
      readFileSync(file, 'utf8'),
    ) as BuildPageData;
    const language = path.split('/')[1];
    if (language !== 'en' && language !== 'pl') continue;
    languages.add(language);
    const context = result.pageContext;
    assert.equal(context.lang, language, path);
    assert.equal(context.langKey, language, path);
    assert.equal(context.language, language, path);
    assert.equal(context.i18n.language, language, path);
    assert.equal(context.i18n.generateDefaultLanguagePage, true, path);
    assert.equal(context.i18n.routed, true, path);
    assert.equal(context.i18n.originalPath, context.originalPath, path);
    const locales: { language: string; ns: string; data: string }[] =
      result.data.locales.edges.map(
        ({ node }: { node: { language: string; ns: string; data: string } }) =>
          node,
      );
    assert.deepEqual(
      locales.map(({ language }) => language).sort(),
      language === 'en' ? ['en'] : ['en', 'pl'],
      path,
    );
    const resource = locales.find((node) => node.language === language);
    assert.ok(resource);
    assert.equal(resource.ns, 'translation', path);
    assert.equal(
      (JSON.parse(resource.data) as { menu: { articles: string } }).menu
        .articles,
      language === 'en' ? 'Articles' : 'Artykuły',
      path,
    );
  }
  assert.deepEqual([...languages].sort(), ['en', 'pl']);
});
