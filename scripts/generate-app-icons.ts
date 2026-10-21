import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const source = 'src/images/app-icons/favicon.png';
const destination = process.argv[2] || 'public/icons';
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

// ICO directory followed by one PNG image; reuse the generated 16px artwork.
const png = await readFile(join(destination, 'favicon-16x16.png'));
const directory = Buffer.alloc(22);
directory.writeUInt16LE(1, 2); // Icon resource.
directory.writeUInt16LE(1, 4); // One image.
directory[6] = directory[7] = 16;
directory.writeUInt16LE(1, 10); // Colour planes.
directory.writeUInt16LE(32, 12); // Bits per pixel.
directory.writeUInt32LE(png.length, 14);
directory.writeUInt32LE(directory.length, 18);
const favicon = Buffer.concat([directory, png]);
await writeFile(join(destination, 'favicon.ico'), favicon);
if (process.argv[2] === undefined) {
  await writeFile('public/favicon.ico', favicon);
}
console.log(`Generated PNG and ICO icons in ${destination}`);
