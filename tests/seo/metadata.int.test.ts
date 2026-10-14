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
    'Missing generated file: public/pl/guides/index.html',
    'Missing generated file: public/en/guides/event-sourcing-foundations/index.html',
    'Missing generated file: public/pl/guides/event-sourcing-foundations/index.html',
    'Missing generated file: public/pl/articles/tag/event-sourcing/index.html',
    'sitemap does not contain: <loc>https://event-driven.io/en/guides/</loc>',
    'sitemap does not contain: <loc>https://event-driven.io/pl/guides/event-sourcing-foundations/</loc>',
    'sitemap does not contain: <loc>https://event-driven.io/pl/articles/tag/event-sourcing/</loc>',
  ])
    assert.ok(failures.includes(expected), `Not reported: ${expected}`);
});
