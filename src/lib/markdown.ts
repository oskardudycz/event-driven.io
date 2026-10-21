import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import type { Root, Image, Link } from 'mdast';
import { visit } from 'unist-util-visit';
import { readFile, mkdir, stat, writeFile, rename } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { assetFile } from './asset-file.ts';
import { localAssetPath } from '../content/assets.ts';
import { articleExcerpt } from '../content/excerpt.ts';
import { editorialParser } from '../content/parser.ts';
import { twitterRemark } from '../content/twitter.ts';
import { editorialRemark } from '../content/remark.ts';
import imagePriority from '../content/image-priority.ts';
import { markdownImage } from './images.ts';

const attachments = import.meta.glob<string>(
  [
    '/content/**/*',
    '!/content/**/code/**',
    '!/content/**/*.md',
    '/src/images/**/*',
  ],
  { query: '?url', import: 'default' },
);

async function attachmentUrl(source: string) {
  const resolved = await assetFile(source);
  const relative =
    '/' + path.relative(process.cwd(), resolved).split(path.sep).join('/');
  const load = attachments[relative];
  if (!load)
    throw new Error(
      `Attachment is not an imported editorial asset: ${relative}`,
    );
  return load();
}

function assets() {
  return async (tree: Root, file: { path: string }) => {
    const images: { node: Image; linked: boolean }[] = [];
    visit(tree, 'image', (node, _, parent) => {
      images.push({ node, linked: parent?.type === 'link' });
    });
    for (const { node: image, linked } of images) {
      const source = localAssetPath(image.url, file.path, 'content', [
        'src/images',
      ]);
      if (!source) continue;
      if (/\.(svg|gif)$/i.test(source)) {
        image.url = await attachmentUrl(source);
        continue;
      }
      const html = await markdownImage(
        source,
        image.alt || '',
        image.title,
        linked,
      );
      Object.assign(image, { type: 'html', value: html });
    }
    const links: Link[] = [];
    visit(tree, 'link', (node) => {
      links.push(node);
    });
    for (const link of links) {
      const source = localAssetPath(link.url, file.path, 'content', [
        'src/images',
      ]);
      if (!source || /\.md$/i.test(source)) continue;
      const details = await stat(source).catch(
        (error: NodeJS.ErrnoException) => {
          if (error.code === 'ENOENT') return undefined;
          throw error;
        },
      );
      if (!details?.isFile()) continue;
      const suffix = link.url.match(/[?#].*$/)?.[0] || '';
      link.url = `${await attachmentUrl(source)}${suffix}`;
    }
    imagePriority({
      markdownAST: tree,
      markdownNode: { fileAbsolutePath: file.path },
    });
  };
}

function excerpt() {
  return (
    tree: Root,
    file: { data: { astro?: { frontmatter?: Record<string, unknown> } } },
  ) => {
    file.data.astro ??= {};
    file.data.astro.frontmatter ??= {};
    file.data.astro.frontmatter.excerpt = articleExcerpt(tree);
    file.data.astro.frontmatter.listingExcerpt = articleExcerpt(tree, 140);
  };
}

const processor = createMarkdownProcessor({
  syntaxHighlight: false,
  gfm: false,
  smartypants: false,
  remarkPlugins: [
    editorialParser,
    assets,
    editorialRemark,
    twitterRemark,
    excerpt,
  ],
});

export async function renderMarkdown(body: string, file: string) {
  const rendered = await (
    await processor
  ).render(body, { fileURL: pathToFileURL(path.resolve(file)) });
  return {
    html: rendered.code,
    excerpt: String(rendered.metadata.frontmatter.excerpt || ''),
  };
}

function omitLocalImages() {
  return (tree: Root, file: { path: string }) => {
    visit(tree, 'image', (node) => {
      const source = localAssetPath(node.url, file.path, 'content', [
        'src/images',
      ]);
      if (source && !/\.(svg|gif)$/i.test(source))
        Object.assign(node, { type: 'html', value: '' });
    });
  };
}
const excerptProcessor = createMarkdownProcessor({
  syntaxHighlight: false,
  gfm: false,
  smartypants: false,
  remarkPlugins: [
    editorialParser,
    omitLocalImages,
    [editorialRemark, { excerpt: true }],
    [twitterRemark, { excerptLength: 170 }],
    excerpt,
  ],
});

// Preview output depends on source and the renderer, not on image dimensions.
// Persist it so restarting development does not reparse the complete archive.
const excerptRevision = Promise.all(
  [
    'package-lock.json',
    'src/lib/markdown.ts',
    'src/content/parser.ts',
    'src/content/remark.ts',
    'src/content/excerpt.ts',
    'src/content/twitter.ts',
    'src/content/video.ts',
    'src/content/markdown/typography.ts',
    'src/content/markdown/prism.ts',
    'src/content/markdown/video-embed.ts',
  ].map((file) => readFile(file)),
).then((sources) => {
  const hash = createHash('sha256');
  for (const source of sources) hash.update(source);
  return hash.digest('hex');
});

export async function renderExcerpt(body: string, file: string, length = 170) {
  const identity = createHash('sha256')
    .update(await excerptRevision)
    .update(file)
    .update(body)
    .digest('hex');
  const directory = path.resolve('.cache/astro/excerpts');
  const cache = path.join(directory, `${identity}.json`);
  const field = length === 140 ? 'listingExcerpt' : 'excerpt';
  try {
    const cached = JSON.parse(await readFile(cache, 'utf8')) as Record<
      string,
      unknown
    >;
    if (typeof cached[field] === 'string') return cached[field];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  const rendered = await (
    await excerptProcessor
  ).render(body, { fileURL: pathToFileURL(path.resolve(file)) });
  const previews = {
    excerpt: String(rendered.metadata.frontmatter.excerpt || ''),
    listingExcerpt: String(rendered.metadata.frontmatter.listingExcerpt || ''),
  };
  await mkdir(directory, { recursive: true });
  const temporary = `${cache}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(previews));
  await rename(temporary, cache);
  return previews[field];
}
