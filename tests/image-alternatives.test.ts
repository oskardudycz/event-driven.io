import { temporaryDirectory } from './helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { readdir, readFile, rm } from 'node:fs/promises';
import cheerio from 'cheerio';
import { imageIssues, importedAlternative } from '../scripts/image-alternatives.ts';
import * as importer from '../import/import-substack.ts';
import { ESLint } from 'eslint';

void test('Markdown images require descriptions, with explicit decorative exceptions and reference support', () => {
  const markdown =
    '---\ntitle: Example\ndecorativeImages:\n  - spacer.png\n---\n\n![Queue flow](queue.png)\n![](spacer.png)\n![][missing]\n\n[missing]: diagram.png\n\n```markdown\n![](not-an-image.png)\n```\n';
  assert.deepEqual(imageIssues(markdown), [
    {
      line: 9,
      url: 'diagram.png',
      message: 'Describe this image, or explicitly list its path in decorativeImages frontmatter',
    },
  ]);
  assert.equal(imageIssues('<img src="x.png" alt="">').length, 0);
  assert.equal(imageIssues('<img src="x.png">')[0].url, 'x.png');
  assert.equal(imageIssues('![\n](x.png)').length, 1);
});
void test('import alternatives preserve descriptions and require intentional overrides for missing/decorative images', () => {
  assert.deepEqual(importedAlternative('A pipeline', undefined, 'source.png'), {
    alt: 'A pipeline',
    decorative: false,
  });
  assert.deepEqual(importedAlternative('', 'A queue', 'source.png'), {
    alt: 'A queue',
    decorative: false,
  });
  assert.deepEqual(importedAlternative(undefined, '', 'source.png'), { alt: '', decorative: true });
  assert.throws(
    () => importedAlternative('', undefined, 'source.png'),
    /Image needs a description/,
  );
  assert.throws(() => importedAlternative('A queue', null, 'source.png'), /must be strings/);
});
void test('image component linting requires explicit alt on native and Gatsby images', async () => {
  const eslint = new ESLint();
  const source =
    'import React from "react"; import { GatsbyImage, StaticImage } from "gatsby-plugin-image"; export const Example = () => <><img src="photo.jpg" /><GatsbyImage image={{}} /><StaticImage src="photo.jpg" /></>;';
  const [invalid] = await eslint.lintText(source, { filePath: 'src/components/ImageExample.tsx' });
  assert.equal(
    invalid.messages.filter((message) => message.ruleId === 'jsx-a11y/alt-text').length,
    3,
  );
  const [valid] = await eslint.lintText(
    source
      .replaceAll('src="photo.jpg"', 'src="photo.jpg" alt="A workshop"')
      .replace('image={{}}', 'image={{}} alt=""'),
    { filePath: 'src/components/ImageExample.tsx' },
  );
  assert.equal(
    valid.messages.filter((message) => message.ruleId === 'jsx-a11y/alt-text').length,
    0,
  );
});
void test('imports reject undescribed images without partial posts; manifest overrides survive in both languages', async (t) => {
  const output = temporaryDirectory(t, 'image-description-import-');
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
    { url, imageAlts: { [imageUrl]: 'Requests enter a FIFO queue before processing.' } },
    { html, output, download },
  );
  for (const language of ['en', 'pl']) {
    const markdown = await readFile(join(directory, `index.${language}.md`), 'utf8');
    assert.match(markdown, /!\[Requests enter a FIFO queue before processing\.\]/);
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
void test('every generated page has explicit image alternatives and named image-only links', () => {
  const directory = 'public';
  const pages = readdirSync(directory, { recursive: true, withFileTypes: true }).filter(
    (entry) => entry.isFile() && entry.name.endsWith('.html'),
  );
  assert(pages.length > 0, 'Build the site first');
  for (const page of pages) {
    const file = join(page.parentPath, page.name);
    const $ = cheerio.load(readFileSync(file, 'utf8'));
    $('img').each((_, image) => {
      assert(Object.hasOwn(image.attribs, 'alt'), `Missing alt: ${file}: ${$(image).attr('src')}`);
      const link = $(image).closest('a');
      if (!link.length || link.attr('aria-label')?.trim() || link.text().trim()) return;
      const labelled = (link.attr('aria-labelledby') || '')
        .split(/\s+/)
        .some((id) => id && $(`[id="${id}"]`).text().trim());
      assert(
        labelled ||
          link
            .find('img')
            .toArray()
            .some((img) => $(img).attr('alt')?.trim()),
        `Unnamed image-only link: ${file}: ${link.attr('href')}`,
      );
    });
  }
});
