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
  mkdirSync(join(fixture, 'sitemap'));
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
    join(fixture, 'sitemap/sitemap-0.xml'),
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

test('published page/post collisions fail instead of silently changing the route canonical', async () => {
  const { createPages } = await import('../../site/node.ts');
  const node = (source: string) => ({
    node: {
      id: source,
      fields: { slug: '/collision/', source, langKey: 'en' },
      frontmatter: { title: 'Collision', related: [] },
    },
  });
  await assert.rejects(
    Promise.resolve(
      createPages(
        {
          actions: { createPage: () => {}, createRedirect: () => {} },
          graphql: () =>
            Promise.resolve({
              data: {
                searchCovers: { nodes: [] },
                learningPaths: { nodes: [] },
                allMarkdownRemark: { edges: [node('posts'), node('pages')] },
              },
            }),
        } as unknown as Parameters<typeof createPages>[0],
        { plugins: [] },
        () => {},
      ),
    ),
    /Multiple published documents claim \/en\/collision\//,
  );
});
