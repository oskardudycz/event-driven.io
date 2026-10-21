import { expect, test } from 'vitest';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

test('every published raster image is nonempty and decodes with valid dimensions', async () => {
  const images = (await readdir('public/_astro')).filter((file) =>
    /\.(png|jpe?g|webp|avif|gif)$/i.test(file),
  );
  expect(images.length).toBeGreaterThan(0);
  for (let offset = 0; offset < images.length; offset += 8) {
    await Promise.all(
      images.slice(offset, offset + 8).map(async (file) => {
        const published = path.join('public/_astro', file);
        expect((await stat(published)).size, published).toBeGreaterThan(0);
        const metadata = await sharp(published).metadata();
        expect(metadata.width, published).toBeGreaterThan(0);
        expect(metadata.height, published).toBeGreaterThan(0);
      }),
    );
  }
}, 60000);
