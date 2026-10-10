import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const source = 'src/images/app-icons/favicon.png';
const destination = process.argv[2] || 'static/icons';
const sizes = {
  favicon: [16, 32, 96],
  icon: [48, 96, 144, 192, 256, 384, 512],
  'apple-icon': [57, 60, 72, 76, 114, 120, 144, 152, 180],
};

await mkdir(destination, { recursive: true });
for (const [prefix, dimensions] of Object.entries(sizes)) {
  for (const size of dimensions) {
    await sharp(source)
      .resize(size, size)
      .png()
      .toFile(join(destination, `${prefix}-${size}x${size}.png`));
  }
}
console.log(`Generated PNG icons in ${destination}`);
