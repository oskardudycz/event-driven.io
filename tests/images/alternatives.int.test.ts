import { temporaryDirectory } from '../helpers/temporary-directory.ts';
import { lintTsxFixtures } from '../helpers/lint-tsx-fixtures.ts';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'vitest';
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readdir, readFile, rm } from 'node:fs/promises';
import {
  imageIssues,
  importedAlternative,
} from '../../scripts/image-alternatives.ts';
import * as importer from '../../import/import-substack.ts';

test('Markdown images require descriptions, with explicit decorative exceptions and reference support', () => {
  const markdown =
    '---\ntitle: Example\ndecorativeImages:\n  - spacer.png\n---\n\n![Queue flow](queue.png)\n![](spacer.png)\n![][missing]\n\n[missing]: diagram.png\n\n```markdown\n![](not-an-image.png)\n```\n';
  assert.deepEqual(imageIssues(markdown), [
    {
      line: 9,
      url: 'diagram.png',
      message:
        'Describe this image, or explicitly list its path in decorativeImages frontmatter',
    },
  ]);
  assert.equal(imageIssues('<img src="x.png" alt="">').length, 0);
  assert.equal(imageIssues('<img src="x.png">')[0]?.url, 'x.png');
  assert.equal(imageIssues('![\n](x.png)').length, 1);
});
test('the image check reports content Markdown but skips installed dependencies of article code', () => {
  const root = temporaryDirectory('image-check-');
  const post = join(root, 'content/posts/2026-01-01--post');
  const dependency = join(post, 'code/node_modules/pkg');
  mkdirSync(dependency, { recursive: true });
  writeFileSync(join(post, 'index.md'), '![](diagram.png)\n');
  writeFileSync(join(dependency, 'README.md'), '![](badge.png)\n');

  const result = spawnSync(
    process.execPath,
    [join(import.meta.dirname, '../../scripts/check-image-alternatives.ts')],
    { cwd: root, encoding: 'utf8' },
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /2026-01-01--post\/index\.md:1: .*diagram\.png/);
  assert.doesNotMatch(result.stderr, /node_modules/);
  assert.match(
    result.stdout,
    /Checked image alternatives in 1 Markdown files; 1 errors\./,
  );
});

test('import alternatives preserve descriptions and require intentional overrides for missing/decorative images', () => {
  assert.deepEqual(importedAlternative('A pipeline', undefined, 'source.png'), {
    alt: 'A pipeline',
    decorative: false,
  });
  assert.deepEqual(importedAlternative('', 'A queue', 'source.png'), {
    alt: 'A queue',
    decorative: false,
  });
  assert.deepEqual(importedAlternative(undefined, '', 'source.png'), {
    alt: '',
    decorative: true,
  });
  assert.throws(
    () => importedAlternative('', undefined, 'source.png'),
    /Image needs a description/,
  );
  assert.throws(
    () => importedAlternative('A queue', null, 'source.png'),
    /must be strings/,
  );
});
test('image component linting requires explicit alt on native and responsive images', async () => {
  const component = path.resolve('src/components/Image/ResponsiveImage.tsx');
  const source = `import React from 'react';
import ResponsiveImage from '${component}';
const image = {
  layout: 'fullWidth' as const,
  width: 100,
  height: 100,
  images: { fallback: { src: 'photo.jpg' } },
};
export const Example = () => (
  <>
    <img src="photo.jpg" />
    <ResponsiveImage image={image} />
  </>
);
`;
  const [invalid, valid] = await lintTsxFixtures({
    'Invalid.tsx': source,
    'Valid.tsx': source
      .replace('src="photo.jpg"', 'src="photo.jpg" alt="A workshop"')
      .replace('image={image}', 'image={image} alt=""'),
  });
  assert.ok(invalid);
  assert.equal(invalid.fatalErrorCount, 0, JSON.stringify(invalid.messages));
  assert.equal(
    invalid.messages.filter((message) => message.ruleId === 'jsx-a11y/alt-text')
      .length,
    2,
    JSON.stringify(invalid.messages),
  );
  assert.ok(valid);
  assert.equal(valid.errorCount, 0, JSON.stringify(valid.messages));
});
test('imports reject undescribed images without partial posts; manifest overrides survive in both languages', async () => {
  const output = temporaryDirectory('image-description-import-');
  const url = 'https://example.substack.com/p/descriptions';
  const imageUrl = 'https://example.substack.com/diagram.png';
  const html = `<meta property="og:title" content="Image alternatives"><script type="application/ld+json">{"@type":"NewsArticle","datePublished":"2026-10-08"}</script><div class="available-content"><div class="body markup"><p>A queue diagram.</p><img src="${imageUrl}" alt=""></div></div>`;
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=',
    'base64',
  );
  const download = () => Promise.resolve(new Response(png));
  await assert.rejects(
    importer.importPost({ url }, { html, output, download }),
    /Image needs a description/,
  );
  assert.deepEqual(await readdir(output), []);
  const directory = await importer.importPost(
    {
      url,
      imageAlts: {
        [imageUrl]: 'Requests enter a FIFO queue before processing.',
      },
    },
    { html, output, download },
  );
  for (const language of ['en', 'pl']) {
    const markdown = await readFile(
      join(directory, `index.${language}.md`),
      'utf8',
    );
    assert.match(
      markdown,
      /!\[Requests enter a FIFO queue before processing\.\]/,
    );
    assert.deepEqual(imageIssues(markdown), []);
  }
  await rm(directory, { recursive: true });
  const decorative = await importer.importPost(
    { url, imageAlts: { [imageUrl]: '' } },
    { html, output, download },
  );
  const markdown = await readFile(join(decorative, 'index.en.md'), 'utf8');
  assert.match(markdown, /decorativeImages:/);
  assert.deepEqual(imageIssues(markdown), []);
});
