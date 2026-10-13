import assert from 'node:assert/strict';
import { test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

test('every generated page has explicit image alternatives and named image-only links', () => {
  const directory = 'public';
  const pages = readdirSync(directory, {
    recursive: true,
    withFileTypes: true,
  }).filter((entry) => entry.isFile() && entry.name.endsWith('.html'));
  assert(pages.length > 0, 'Build the site first');
  for (const page of pages) {
    const file = join(page.parentPath, page.name);
    const $ = cheerio.load(readFileSync(file, 'utf8'));
    $('img').each((_, image) => {
      assert(
        Object.hasOwn(image.attribs, 'alt'),
        `Missing alt: ${file}: ${$(image).attr('src')}`,
      );
      const link = $(image).closest('a');
      if (!link.length || link.attr('aria-label')?.trim() || link.text().trim())
        return;
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
