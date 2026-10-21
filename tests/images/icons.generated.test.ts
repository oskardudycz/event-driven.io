import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import sharp from 'sharp';
import { expect, test } from 'vitest';

async function expectPublishedIcon(href: string, sizes: string) {
  const url = new URL(href, 'https://event-driven.io');
  expect(url.origin).toBe('https://event-driven.io');
  const image = await sharp(join('dist', url.pathname)).metadata();
  const [width, height] = sizes.split('x').map(Number);
  expect(image.width).toBe(width);
  expect(image.height).toBe(height);
}

for (const language of ['en', 'pl']) {
  test(`${language} document icons exist at their advertised sizes`, async () => {
    const $ = load(readFileSync(`dist/${language}/index.html`, 'utf8'));
    const icons = $('link[rel="icon"], link[rel="apple-touch-icon"]');
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons.toArray()) {
      await expectPublishedIcon($(icon).attr('href')!, $(icon).attr('sizes')!);
    }
  });
}

test('installable app icons exist at their advertised sizes', async () => {
  const manifest = JSON.parse(
    readFileSync('dist/manifest.webmanifest', 'utf8'),
  ) as {
    icons: { src: string; sizes: string }[];
  };
  expect(manifest.icons.length).toBeGreaterThan(0);
  for (const icon of manifest.icons) {
    await expectPublishedIcon(icon.src, icon.sizes);
  }
});
