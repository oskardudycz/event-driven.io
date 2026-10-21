import type { ImageMetadata } from 'astro';
import { assetFile } from './asset-file.ts';
import path from 'node:path';
import escape from 'escape-html';
import sharp from 'sharp';

// Vite imports make Astro own image identities, transforms, caching and serving.
const images = import.meta.glob<ImageMetadata>(
  [
    '/content/**/*.{png,jpg,jpeg,webp,avif}',
    '!/content/**/code/**',
    '/src/images/**/*.{png,jpg,jpeg,webp,avif}',
  ],
  { import: 'default' },
);

export async function importedImage(file: string): Promise<ImageMetadata> {
  const resolved = await assetFile(file);
  const relative =
    '/' + path.relative(process.cwd(), resolved).split(path.sep).join('/');
  const load = images[relative];
  if (!load)
    throw new Error(`Image is not an imported editorial asset: ${relative}`);
  return load();
}

type ImageFormat = 'png' | 'jpg' | 'webp';
export async function imageFile(
  file: string,
  width: number,
  options: {
    height?: number;
    quality?: number;
    format?: ImageFormat;
    position?: string;
  } = {},
) {
  const { getImage } = await import('astro:assets');
  const result = await getImage({
    src: await importedImage(file),
    width,
    ...options,
    quality: options.quality ?? 80,
    format: options.format ?? 'webp',
    ...(options.height ? { fit: 'cover' } : {}),
  });
  return result.src;
}

export async function socialImage(file: string, width: number) {
  const image = await importedImage(file);
  const format =
    image.format === 'jpg' || image.format === 'jpeg'
      ? 'jpg'
      : image.format === 'png'
        ? 'png'
        : 'webp';
  return imageFile(file, width, { quality: 50, format });
}

export async function markdownImage(
  file: string,
  alt: string,
  title?: string | null,
  linked = false,
) {
  file = await assetFile(file);
  const metadata = await importedImage(file);
  if (!metadata.width || !metadata.height)
    throw new Error(`Image has no dimensions: ${file}`);
  const alternative =
    alt === 'GATSBY_EMPTY_ALT'
      ? ''
      : alt || path.parse(file).name.replace(/[^A-Z0-9]/gi, ' ');
  const width = Math.min(800, metadata.width);
  const widths = [
    ...new Set([
      Math.min(200, width),
      Math.min(400, width),
      width,
      Math.min(1200, metadata.width),
      Math.min(1600, metadata.width),
      metadata.width,
    ]),
  ];
  const sources = await Promise.all(
    widths.map(async (size) => `${await imageFile(file, size)} ${size}w`),
  );
  const originalFormat: ImageFormat =
    metadata.format === 'jpeg' || metadata.format === 'jpg'
      ? 'jpg'
      : metadata.format === 'webp'
        ? 'webp'
        : 'png';
  const fallbackSources = await Promise.all(
    widths.map(
      async (size) =>
        `${await imageFile(file, size, { format: originalFormat })} ${size}w`,
    ),
  );
  const src = await imageFile(file, width, {
    format: originalFormat,
  });
  const full = await imageFile(file, metadata.width, {
    format: originalFormat,
  });
  // The published fluid wrapper uses the rounded dimensions of its smallest
  // responsive variant. Retain that ratio to avoid shifting following content.
  const smallestWidth = widths[0]!;
  const smallestHeight = Math.round(
    (smallestWidth * metadata.height) / metadata.width,
  );
  const padding = (smallestHeight / smallestWidth) * 100;
  const transparent = (await sharp(file).metadata()).hasAlpha;
  const placeholder = transparent
    ? ''
    : `background-image: url('${await imageFile(file, 20, { quality: 50 })}'); background-size: cover;`;
  const linkStart = linked
    ? ''
    : `<a class="article-image-link" href="${full}" style="display: block" target="_blank" rel="noopener">`;
  const linkEnd = linked ? '' : '</a>';
  return `<span class="article-image" style="position: relative; display: block; margin-left: auto; margin-right: auto; max-width: ${width}px; height: auto">${linkStart}<span class="article-image-placeholder" style="padding-bottom: ${padding}%; position: relative; bottom: 0; left: 0; ${placeholder} display: block;"></span><picture><source srcset="${sources.join(', ')}" sizes="(max-width: ${width}px) 100vw, ${width}px" type="image/webp"><source srcset="${fallbackSources.join(', ')}" sizes="(max-width: ${width}px) 100vw, ${width}px" type="image/${originalFormat === 'jpg' ? 'jpeg' : originalFormat}"><img class="article-image-content" src="${src}" alt="${escape(alternative)}" title="${escape(title || '')}" loading="lazy" decoding="async" style="width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0;"></picture>${linkEnd}</span>`;
}

export async function responsiveImage(
  file: string,
  purpose: 'archive' | 'search' | 'hero',
) {
  file = await assetFile(file);
  const metadata = await importedImage(file);
  if (!metadata.width || !metadata.height)
    throw new Error(`Missing image dimensions: ${file}`);
  const fixed = purpose === 'hero';
  const width = fixed
    ? 772
    : purpose === 'search'
      ? Math.min(240, metadata.width)
      : metadata.width;
  const ratio =
    purpose === 'archive'
      ? metadata.width / Math.round(metadata.width / 2.2222222222)
      : metadata.width / metadata.height;
  const requested =
    purpose === 'archive'
      ? [360, 610, 850, 1220, 1700]
      : purpose === 'hero'
        ? [772, 1544]
        : [240, 480];
  const widths = [
    ...new Set(requested.map((size) => Math.min(size, metadata.width))),
  ].sort((a, b) => a - b);
  const quality = fixed ? 90 : 50;
  const variant = (size: number, format: ImageFormat) =>
    imageFile(file, size, {
      quality,
      position: 'attention',
      height: Math.round(size / ratio),
      format,
    });
  const webpSet = (
    await Promise.all(
      widths.map(async (size) => `${await variant(size, 'webp')} ${size}w`),
    )
  ).join(', ');
  const fallbackFormat = fixed ? 'png' : 'webp';
  const srcSet = fixed
    ? (
        await Promise.all(
          widths.map(async (size) => `${await variant(size, 'png')} ${size}w`),
        )
      ).join(', ')
    : webpSet;
  const src = await variant(
    purpose === 'archive' ? widths.at(-1)! : widths[0]!,
    fallbackFormat,
  );
  const placeholder =
    purpose === 'archive' && !(await sharp(file).metadata()).hasAlpha
      ? {
          fallback: await imageFile(file, 20, {
            height: Math.round(20 / ratio),
            quality: 50,
            position: 'attention',
          }),
        }
      : undefined;

  return {
    layout: fixed ? ('fixed' as const) : ('fullWidth' as const),
    width,
    height: Math.round(width / ratio),
    ...(placeholder ? { placeholder } : {}),
    images: {
      fallback: { src, srcSet, sizes: fixed ? '772px' : '100vw' },
      sources: [
        {
          type: 'image/webp',
          srcSet: webpSet,
          sizes: fixed ? '772px' : '100vw',
        },
      ],
    },
  };
}
