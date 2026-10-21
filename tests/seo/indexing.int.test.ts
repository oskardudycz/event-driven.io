import { temporaryDirectory } from '../helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import * as yaml from 'js-yaml';
import {
  verifyIndexingBuild,
  siteOrigin,
} from '../../scripts/indexing-build-verifier.ts';

test('untranslated copies declare English canonical and English originals stay discoverable', () => {
  for (const directory of readdirSync('content/posts')) {
    const parse = (language: string) => {
      const source = readFileSync(
        join('content/posts', directory, `index.${language}.md`),
        'utf8',
      );
      const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(
        source,
      );
      assert.ok(match, directory);
      const [, header, body] = match;
      assert.equal(typeof header, 'string');
      assert.equal(typeof body, 'string');
      return {
        frontmatter: yaml.load(header as string) as {
          useDefaultLangCanonical?: boolean;
        },
        body: (body as string).trim().replace(/\/(?:en|pl)\//g, '/locale/'),
      };
    };
    if (!readdirSync(join('content/posts', directory)).includes('index.en.md'))
      continue;
    const en = parse('en');
    assert.notEqual(en.frontmatter.useDefaultLangCanonical, true, directory);
    if (!readdirSync(join('content/posts', directory)).includes('index.pl.md'))
      continue;
    const pl = parse('pl');
    if (en.body === pl.body) {
      assert.equal(pl.frontmatter.useDefaultLangCanonical, true, directory);
    }
  }
});

test('canonical validation catches mismatched sitemap destinations and broken alternates', () => {
  const fixture = temporaryDirectory('indexing-regression-');
  mkdirSync(join(fixture, 'en'), { recursive: true });
  mkdirSync(join(fixture, 'pl'), { recursive: true });
  writeFileSync(
    join(fixture, 'en/index.html'),
    `<head><link rel="canonical" href="${siteOrigin}/en/"><link rel="alternate" hreflang="pl" href="${siteOrigin}/pl/"></head>`,
  );
  writeFileSync(
    join(fixture, 'pl/index.html'),
    `<head><link rel="canonical" href="${siteOrigin}/en/"></head>`,
  );
  writeFileSync(
    join(fixture, 'sitemap-0.xml'),
    `<urlset><loc>${siteOrigin}/pl/</loc></urlset>`,
  );
  const failures = verifyIndexingBuild(fixture);
  assert.ok(
    failures.some((failure) => failure.includes('Sitemap: destination')),
  );
  assert.ok(
    failures.some((failure) => failure.includes('alternate pl: destination')),
  );
  assert.ok(failures.some((failure) => failure.includes('non-reciprocal')));
});

function indexingFixture(
  pages: Record<string, { lang: string; head: string; body: string }>,
) {
  const fixture = temporaryDirectory('indexing-regression-');
  for (const [route, { lang, head, body }] of Object.entries(pages)) {
    mkdirSync(join(fixture, route), { recursive: true });
    writeFileSync(
      join(fixture, route, 'index.html'),
      `<html lang="${lang}"><head><link rel="canonical" href="${siteOrigin}${route}">${head}</head><body>${body}</body></html>`,
    );
  }
  writeFileSync(
    join(fixture, 'sitemap-0.xml'),
    `<urlset>${Object.keys(pages)
      .map((route) => `<loc>${siteOrigin}${route}</loc>`)
      .join('')}</urlset>`,
  );
  return fixture;
}

const alternates = (languages: string[], route: string) =>
  languages
    .map(
      (language) =>
        `<link rel="alternate" hreflang="${language}" href="${siteOrigin}/${language === 'x-default' ? 'en' : language}${route}">`,
    )
    .join('');

test('every indexable page has exactly one main landmark for IndexNow fingerprints', () => {
  const fixture = indexingFixture({
    '/en/guides/': { lang: 'en', head: '', body: '<main></main><main></main>' },
    '/pl/guides/': { lang: 'pl', head: '', body: '<div></div>' },
    '/en/articles/': { lang: 'en', head: '', body: '<main></main>' },
  });
  assert.deepEqual(verifyIndexingBuild(fixture), [
    '/en/guides/: expected one <main>, found 2',
    '/pl/guides/: expected one <main>, found 0',
  ]);
});

test('language alternates include x-default and lead to pages in the declared language', () => {
  const head = alternates(['en', 'pl'], '/articles/tag/cqrs/');
  const fixture = indexingFixture({
    '/en/articles/tag/cqrs/': { lang: 'en', head, body: '<main></main>' },
    '/pl/articles/tag/cqrs/': { lang: 'en', head, body: '<main></main>' },
  });
  assert.deepEqual(verifyIndexingBuild(fixture), [
    '/en/articles/tag/cqrs/: alternates without x-default',
    '/en/articles/tag/cqrs/: alternate pl leads to a page in en',
    '/pl/articles/tag/cqrs/: alternates without x-default',
    '/pl/articles/tag/cqrs/: alternate pl leads to a page in en',
  ]);
});

test('reciprocal guide alternates with x-default pass', () => {
  const head = alternates(['x-default', 'en', 'pl'], '/guides/cqrs/');
  const fixture = indexingFixture({
    '/en/guides/cqrs/': { lang: 'en', head, body: '<main></main>' },
    '/pl/guides/cqrs/': { lang: 'pl', head, body: '<main></main>' },
  });
  assert.deepEqual(verifyIndexingBuild(fixture), []);
});
