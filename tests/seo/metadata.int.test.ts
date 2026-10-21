import { temporaryDirectory } from '../helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import { verifySeoBuild } from '../../scripts/seo-build-verifier.ts';

test('SEO verification covers the guide index, guides and tag pages in both languages', () => {
  const fixture = temporaryDirectory('seo-regression-');
  mkdirSync(join(fixture, 'en/guides'), { recursive: true });
  writeFileSync(
    join(fixture, 'en/guides/index.html'),
    '<html><head><link rel="canonical" href="https://event-driven.io/en/guides/"><meta name="description" content="Guides"><script type="application/ld+json">{"@type":"WebPage"}</script></head><body><h1>Guides</h1></body></html>',
  );
  const failures = verifySeoBuild(fixture);
  for (const expected of [
    'en/guides/index.html does not contain: "@type":"CollectionPage"',
    'Missing generated file: dist/pl/guides/index.html',
    'Missing generated file: dist/en/guides/event-sourcing-foundations/index.html',
    'Missing generated file: dist/pl/guides/event-sourcing-foundations/index.html',
    'Missing generated file: dist/pl/articles/tag/event-sourcing/index.html',
    'sitemap does not contain: <loc>https://event-driven.io/en/guides/</loc>',
    'sitemap does not contain: <loc>https://event-driven.io/pl/guides/event-sourcing-foundations/</loc>',
    'sitemap does not contain: <loc>https://event-driven.io/pl/articles/tag/event-sourcing/</loc>',
  ])
    assert.ok(failures.includes(expected), `Not reported: ${expected}`);
});

test('language alternates are checked as HTML regardless of attribute spelling', () => {
  const fixture = temporaryDirectory('seo-serialization-');
  const check = (attribute: string) => {
    for (const language of ['en', 'pl']) {
      mkdirSync(join(fixture, language, 'consulting'), { recursive: true });
      writeFileSync(
        join(fixture, language, 'consulting/index.html'),
        `<html><head>${['en', 'pl', 'x-default'].map((locale) => `<link rel="alternate" ${attribute}="${locale}" href="https://event-driven.io/${locale}/consulting/">`).join('')}</head><body><h1>Consulting</h1></body></html>`,
      );
    }
    return verifySeoBuild(fixture).filter((failure) =>
      failure.includes('language alternates'),
    );
  };
  assert.deepEqual(check('hrefLang'), []);
  assert.deepEqual(check('hreflang'), []);
});
