import type { ImportEntry, ImportOptions, Download } from './types.ts';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import yaml from 'js-yaml';
import escapeHtml from 'escape-html';
import {
  isSubscriptionPromotion,
  youtubeMarkdown,
  buildArticleLinks,
  relativeArticleLink,
} from './article-content.ts';

import { publicationDate } from '../src/utils/publication-date.ts';
import { normalizeYouTubeEmbeds, youtubeVideoUrl } from './youtube-markdown.ts';

const postsDirectory = path.resolve(import.meta.dirname, '../content/posts');

function normalizeUrl(input: string): string {
  const url = new URL(input);
  if (url.hostname === 'web.archive.org') {
    const capture = url.pathname.match(
      /^\/web\/(\d{14})(?:id_|im_)?\/(https?:\/\/.+)$/,
    );
    if (!capture?.[2])
      throw new Error(`Expected a dated Wayback capture URL: ${input}`);
    const original = normalizeUrl(capture[2]);
    if (new URL(original).hostname === 'web.archive.org')
      throw new Error('Nested archive URL');
    return `https://web.archive.org/web/${capture[1]}id_/${original}`;
  }
  const isSubstack = /^\/p\/[a-z0-9-]+\/?$/i.test(url.pathname);
  const isBlog =
    /^(kurrentdb\.kurrent\.io|www\.eventstore\.com)$/.test(url.hostname) &&
    /^\/blog\/[a-z0-9-]+\/?$/i.test(url.pathname);
  if (!/^https?:$/.test(url.protocol) || !(isSubstack || isBlog)) {
    throw new Error(
      `Expected a Substack post or Kurrent/EventStore article URL: ${input}`,
    );
  }
  url.hash = '';
  url.search = '';
  url.pathname = url.pathname.replace(/\/$/, '');
  return url.href;
}

function sourceLocation(source: string) {
  const capture = source.match(
    /^https:\/\/web\.archive\.org\/web\/(\d{14})id_\/(https?:\/\/.+)$/,
  );
  return capture?.[2]
    ? {
        base: capture[2],
        archive: `https://web.archive.org/web/${capture[1]}id_/`,
      }
    : { base: source };
}

// Use the original asset rather than a CDN crop or a format negotiated as WebP.
function originalImageUrl(input: string, base: string): string {
  const url = new URL(input, base);
  const archived = url.href.match(
    /^https:\/\/web\.archive\.org\/web\/\d+(?:id_|im_)?\/(https?:\/\/.+)$/,
  );
  if (archived?.[1]) return originalImageUrl(archived[1], base);
  if (
    url.hostname === 'substackcdn.com' &&
    url.pathname.startsWith('/image/fetch/')
  ) {
    const original = url.pathname.match(/\/(https?(?:%3A|:).*)$/i);
    if (original?.[1]) return new URL(decodeURIComponent(original[1])).href;
  }
  return url.href;
}

function extractPost(html: string, source: string) {
  const $ = cheerio.load(html);
  const body = $(
    '.available-content .body.markup, .body.markup, #blog-post-content, #hs_cos_wrapper_post_body',
  ).first();
  if (!body.length || !body.text().trim())
    throw new Error(`Article body missing: ${source}`);
  let completePublicBody = false;
  // Previously paid posts can retain an empty paywall-jump after becoming
  // public. Only accept that marker when Substack explicitly exposes the full
  // public body and it matches the rendered article; never evaluate scripts.
  const preloads = html.match(
    /window\._preloads\s*=\s*JSON\.parse\(("(?:\\.|[^"\\])*")\)/,
  );
  if (preloads?.[1]) {
    try {
      const serialized: unknown = JSON.parse(preloads[1]);
      if (typeof serialized !== 'string')
        throw new Error('Invalid Substack preload');
      const data = JSON.parse(serialized) as {
        post?: { audience?: string; body_html?: string };
      };
      const text = (value: string) => value.replace(/\s+/g, ' ').trim();
      completePublicBody =
        data.post?.audience === 'everyone' &&
        typeof data.post.body_html === 'string' &&
        text(body.text()) === text(cheerio.load(data.post.body_html).text());
    } catch {
      /* A marker without verifiable public content remains blocked. */
    }
  }
  if (
    $('.paywall, .paywall-content').length ||
    ($('.paywall-jump').length && !completePublicBody)
  ) {
    throw new Error(
      `Paywalled article; refusing to import a preview: ${source}`,
    );
  }
  let article: { headline?: string; datePublished?: string } = {};
  $("script[type='application/ld+json']").each((_, node) => {
    try {
      type Article = {
        '@type'?: string;
        headline?: string;
        datePublished?: string;
      };
      const data = JSON.parse($(node).text()) as
        | Article
        | Article[]
        | { '@graph': Article[] };
      const entries = Array.isArray(data)
        ? data
        : '@graph' in data
          ? data['@graph']
          : [data];
      article =
        entries.find((entry: { '@type'?: string }) =>
          /^(NewsArticle|Article|BlogPosting)$/.test(entry['@type'] || ''),
        ) || article;
    } catch {
      /* Other structured data is not required for importing. */
    }
  });
  const title =
    $("meta[property='og:title']").attr('content') || article.headline;
  const published =
    article.datePublished ||
    $("meta[property='article:published_time']").attr('content') ||
    $('time[datetime]').first().attr('datetime');
  if (!title || !published || Number.isNaN(Date.parse(published))) {
    throw new Error(`Article title or publication date missing: ${source}`);
  }
  body
    .find(
      'script, style, button, .subscription-widget-wrap, .subscribe-widget, .share-post, .post-footer, .paywall-jump',
    )
    .remove();
  body.find('p, h2').each((_, node) => {
    if (isSubscriptionPromotion($(node).text())) $(node).remove();
  });
  body.find('pre[data-language] > code').each((_, node) => {
    $(node).attr('class', `language-${$(node).parent().attr('data-language')}`);
  });
  return {
    $,
    body,
    title,
    ...(typeof published === 'string' && published.includes('T')
      ? { publishedAt: publicationDate(published) }
      : {}),
    date: new Date(published).toISOString().slice(0, 10),
    cover: $('#blog-post-content').length
      ? $('article img').first().attr('src')
      : $("meta[property='og:image']").attr('content') ||
        body.find('img').first().attr('src'),
    coverIsBodyFallback:
      !$('#blog-post-content').length &&
      !$("meta[property='og:image']").attr('content'),
  };
}

async function request(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(60000),
    headers: {
      'User-Agent': 'event-driven.io article importer',
      Accept: '*/*',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${url}`);
  return response;
}

// Scan each prefix once; nested regex repetitions can backtrack exponentially.
function hasSvgRoot(text: string) {
  let cursor = 0;
  const skipWhitespace = () => {
    while (cursor < text.length && /\s/.test(text.charAt(cursor))) cursor++;
  };
  skipWhitespace();
  if (text.startsWith('<?xml', cursor)) {
    const end = text.indexOf('?>', cursor + 5);
    if (end === -1) return false;
    cursor = end + 2;
    skipWhitespace();
  }
  while (text.startsWith('<!--', cursor)) {
    const end = text.indexOf('-->', cursor + 4);
    if (end === -1) return false;
    cursor = end + 3;
    skipWhitespace();
  }
  return /^<svg[\s>]/i.test(text.slice(cursor, cursor + 5));
}

// Retain nested emphasis, but never copy source attributes or arbitrary HTML.
function safeEmphasis(node: Node): string {
  const tags: Record<string, string[]> = {
    EM: ['<em>', '</em>'],
    I: ['<i>', '</i>'],
    STRONG: ['<strong>', '</strong>'],
    B: ['<b>', '</b>'],
    CODE: ['<code>', '</code>'],
    SPAN: ['<span>', '</span>'],
  };
  const tag = tags[node.nodeName];
  if (!tag) return escapeHtml(node.textContent || '');
  return tag[0] + Array.from(node.childNodes, safeEmphasis).join('') + tag[1];
}

function imageExtension(bytes: Buffer) {
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])))
    return '.jpg';
  if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return '.png';
  if (/^GIF8[79]a/.test(bytes.subarray(0, 6).toString())) return '.gif';
  if (
    bytes.subarray(0, 4).toString() === 'RIFF' &&
    bytes.subarray(8, 12).toString() === 'WEBP'
  )
    return '.webp';
  if (hasSvgRoot(bytes.toString('utf8'))) return '.svg';
  throw new Error(
    'Unsupported image format or non-image download (expected JPEG, PNG, GIF, WebP or SVG)',
  );
}

function youtubeId(value: string) {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(value))
    throw new Error(`Invalid YouTube video ID: ${value}`);
  return value;
}

function applyRecordingEmbeds(
  post: ReturnType<typeof extractPost>,
  source: string,
  entry: Partial<ImportEntry>,
) {
  const { $, body } = post;
  const present = new Set<string>();
  body.find('iframe[src]').each((_, node) => {
    const url = new URL($(node).attr('src')!, sourceLocation(source).base);
    if (/^(www\.)?(youtube\.com|youtube-nocookie\.com)$/.test(url.hostname)) {
      const id = url.pathname.match(/^\/embed\/([^/]+)/)?.[1];
      if (id) present.add(id);
    }
  });
  const player = (id: string) =>
    $('<iframe>').attr({
      src: `https://www.youtube-nocookie.com/embed/${youtubeId(id)}`,
      title: 'Webinar recording',
      width: '728',
      height: '409',
      allow:
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowfullscreen: 'true',
      referrerpolicy: 'strict-origin-when-cross-origin',
    });
  if (entry.youtubeVideo && !present.has(youtubeId(entry.youtubeVideo))) {
    body.prepend(player(entry.youtubeVideo));
    present.add(entry.youtubeVideo);
  }
  const replacements = new Map(
    Object.entries(entry.recordingEmbeds || {}).map(([url, id]) => [
      normalizeUrl(url),
      youtubeId(id),
    ]),
  );
  body.find('a[href]').each((_, node) => {
    const link = $(node);
    let url;
    try {
      url = normalizeUrl(
        new URL(link.attr('href')!, sourceLocation(source).base).href,
      );
    } catch {
      return;
    }
    const id = replacements.get(url);
    if (!id) return;
    const card = link.closest(
      '.embedded-post-wrap, figure, .captioned-image-container',
    );
    if (card.length) {
      card.replaceWith(present.has(id) ? '' : player(id));
    } else {
      const paragraph = link.closest('p, li');
      if (!present.has(id))
        (paragraph.length ? paragraph : link).after(player(id));
      link.replaceWith(
        link
          .contents()
          .filter((_, child) => !('name' in child) || child.name !== 'img'),
      );
    }
    present.add(id);
  });
  if (post.coverIsBodyFallback)
    post.cover = body.find('img').first().attr('src');
}

async function convertPost(
  post: ReturnType<typeof extractPost>,
  source: string,
  directory: string,
  download: Download = request,
  entry: Partial<ImportEntry> = {},
  links: Map<string, string> = new Map(),
) {
  const { $, body } = post;
  // Replace recording thumbnails before downloading images; Substack's native
  // player often lives outside the article body and needs an explicit mapping.
  applyRecordingEmbeds(post, source, entry);
  const location = sourceLocation(source);
  const assets = new Map<string, string>();
  const decorativeImages: string[] = [];
  const { importedAlternative } =
    await import('../scripts/image-alternatives.ts');
  async function saveImage(input: string, isCover = false) {
    const original = originalImageUrl(input, location.base);
    const url = location.archive ? `${location.archive}${original}` : original;
    if (assets.has(url)) return assets.get(url)!;
    let response;
    try {
      response = await download(url);
    } catch (error) {
      // Some old Substack S3 assets are private now while the publication's
      // CDN still serves their cached image. Preserve that available image.
      const cdn = new URL(input, location.base);
      if (
        location.archive ||
        cdn.hostname !== 'substackcdn.com' ||
        cdn.href === url
      )
        throw error;
      response = await download(cdn.href);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    const filename = `${isCover ? `${post.date}-cover` : `image-${assets.size + 1}`}${imageExtension(bytes)}`;
    await fs.writeFile(path.join(directory, filename), bytes);
    assets.set(url, filename);
    return filename;
  }
  let cover = post.cover ? await saveImage(post.cover, true) : undefined;
  if (cover?.endsWith('.svg')) {
    const png = cover.replace(/\.svg$/, '.png');
    await sharp(path.join(directory, cover))
      .resize({ width: 1200 })
      .png()
      .toFile(path.join(directory, png));
    cover = png;
  }
  for (const image of body.find('img').toArray()) {
    const element = $(image);
    const src = element.attr('src') || element.attr('data-src');
    if (!src) throw new Error(`Image without a source in ${source}`);
    const original = originalImageUrl(src, location.base);
    const override = Object.hasOwn(entry.imageAlts || {}, src)
      ? entry.imageAlts![src]
      : entry.imageAlts?.[original];
    const alternative = importedAlternative(
      element.attr('alt'),
      override,
      original,
    );
    const filename = await saveImage(src);
    element.attr('src', filename).attr('alt', alternative.alt);
    if (alternative.decorative) decorativeImages.push(filename);
    element.removeAttr('srcset').removeAttr('sizes').removeAttr('style');
    // Gatsby provides image zoom itself. Unwrap Substack's block-level image
    // links so they don't become invalid multiline Markdown links.
    const anchor = element.closest('a.image-link');
    if (anchor.length && !youtubeVideoUrl(anchor.attr('href') || ''))
      anchor.replaceWith(anchor.contents());
  }
  body.find('picture source').remove();
  body.find('picture, .image2-inset').each((_, node) => {
    const element = $(node);
    element.replaceWith(element.contents());
  });
  const converter = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });
  converter.use(gfm);
  const { markdownLinkDestination, markdownLinkTitle } =
    await import('./markdown-links.ts');
  converter.addRule('articleLinks', {
    filter: (node) => node.nodeName === 'A' && node.hasAttribute('href'),
    replacement: (content, node) => {
      const href = node.getAttribute('href')!;
      let destination = href;
      const localAsset = [...assets.values()].includes(href);
      if (!href.startsWith('#') && !localAsset) {
        const resolved = new URL(href, location.base).href;
        const original = resolved.replace(
          /^https:\/\/web\.archive\.org\/web\/\d+(?:[a-z]+_)?\//,
          '',
        );
        destination = relativeArticleLink(original, location.base, links);
      }
      // Generate Markdown directly; stored mappings never become HTML attributes.
      const safeDestination = markdownLinkDestination(
        destination,
        location.base,
      );
      const target = localAsset ? href : safeDestination;
      return `[${content}](${target}${markdownLinkTitle(node.getAttribute('title'))})`;
    },
  });
  const { codeLanguage } = await import('./code-languages.ts');
  converter.addRule('sourceCodeLanguage', {
    filter: 'pre',
    replacement: (_, node) => {
      const code = node.querySelector('code') || node;
      const supplied =
        code.getAttribute('data-language') ||
        code.getAttribute('data-lang') ||
        node.getAttribute('data-language') ||
        node.getAttribute('data-lang') ||
        (code.className.match(/(?:language-|lang-)([\w#+-]+)/) || [])[1] ||
        (node.className.match(/(?:language-|lang-)([\w#+-]+)/) || [])[1] ||
        '';
      const text = (code.textContent || '').replace(/\n$/, '');
      const runs = text.match(/`+/g) || [];
      const fence = '`'.repeat(
        Math.max(3, ...runs.map((run) => run.length + 1)),
      );
      return `\n\n${fence}${codeLanguage(text, supplied, entry.codeLanguage)}\n${text}\n${fence}\n\n`;
    },
  });
  // Substack can put emphasis boundaries inside words (e.g. <em>you'</em>re).
  // Markdown delimiters cannot express every such boundary; retain inline HTML.
  converter.addRule('partialWordEmphasis', {
    filter: (node) =>
      ['EM', 'I', 'STRONG', 'B'].includes(node.nodeName) &&
      /[^\p{L}\p{N}\s]$/u.test(node.textContent || '') &&
      /^[\p{L}\p{N}]/u.test(node.nextSibling?.textContent || ''),
    replacement: (_, node) => safeEmphasis(node),
  });
  converter.addRule('caption', {
    filter: 'figcaption',
    replacement: (content) => `\n\n${content}\n\n`,
  });
  // Markdown cannot represent these players. Gatsby already handles raw iframes.
  converter.addRule('players', {
    filter: ['iframe', 'video', 'audio'],
    replacement: (_, node) => {
      const media = cheerio.load(node.outerHTML, null, false);
      const element = media(node.nodeName.toLowerCase()).first();
      if (node.nodeName === 'IFRAME' && element.attr('src')) {
        const youtube = youtubeMarkdown(
          new URL(element.attr('src')!, location.base).href,
          element.attr('title') || 'Embedded video',
        );
        if (youtube) return youtube;
      }
      element.find('script').remove();
      for (const child of [
        ...element.toArray(),
        ...element.find('*').toArray(),
      ]) {
        for (const attribute of Object.keys(
          'attribs' in child ? child.attribs : {},
        )) {
          if (/^on/i.test(attribute) || ['srcdoc', 'style'].includes(attribute))
            media(child).removeAttr(attribute);
        }
      }
      element
        .find('[src]')
        .addBack('[src]')
        .each((_, child) => {
          const src = new URL(media(child).attr('src')!, location.base);
          if (!/^https?:$/.test(src.protocol))
            throw new Error(`Unsupported embed URL: ${src}`);
          media(child).attr('src', src.href);
        });
      if (node.nodeName === 'IFRAME' && !element.attr('title'))
        element.attr('title', 'Embedded video');
      if (
        node.nodeName === 'IFRAME' &&
        /^(www\.)?(youtube\.com|youtube-nocookie\.com)$/.test(
          new URL(element.attr('src')!, location.base).hostname,
        )
      ) {
        element.attr('referrerpolicy', 'strict-origin-when-cross-origin');
      }
      return `\n\n${media.html()}\n\n`;
    },
  });
  converter.addRule('socialEmbeds', {
    filter: (node) =>
      node.nodeName === 'BLOCKQUOTE' &&
      /twitter-tweet|instagram-media/.test(node.getAttribute('class') || ''),
    replacement: (_, node) => `\n\n${node.outerHTML}\n\n`,
  });
  const markdown = normalizeYouTubeEmbeds(
    converter.turndown(body.html() || ''),
  );
  if (!markdown.trim())
    throw new Error(`Conversion produced an empty article: ${source}`);
  return {
    markdown,
    decorativeImages,
    cover,
    assets: Object.fromEntries(assets),
    embeds: body.find('iframe, video, audio').length,
  };
}

async function importPost(entry: ImportEntry, options: ImportOptions = {}) {
  const source = normalizeUrl(entry.url);
  const download = options.download || request;
  const html = options.html || (await (await download(source)).text());
  const post = extractPost(html, source);
  const sourceSlug = new URL(sourceLocation(source).base).pathname
    .split('/')
    .pop();
  const slug = entry.slug || sourceSlug || '';
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(slug))
    throw new Error(`Invalid slug: ${slug}`);
  const root = options.output || postsDirectory;
  const destination = path.join(root, `${post.date}--${slug}`);
  await fs.mkdir(root, { recursive: true });
  // Also prevent date changes or custom slugs from silently duplicating an article.
  for (const name of await fs.readdir(root)) {
    if (name.endsWith(`--${slug}`))
      throw new Error(
        `Article already exists: ${name}. Import never overwrites existing posts.`,
      );
  }
  const staging = await fs.mkdtemp(path.join(root, '.substack-import-'));
  try {
    const converted = await convertPost(
      post,
      source,
      staging,
      download,
      entry,
      options.links || buildArticleLinks(root, [entry]),
    );
    for (const language of ['en', 'pl']) {
      const frontmatter = {
        title: post.title,
        ...(post.publishedAt ? { publishedAt: post.publishedAt } : {}),
        category: entry.category || 'Software Architecture',
        ...(converted.cover ? { cover: converted.cover } : {}),
        author: 'oskar dudycz',
        ...(converted.decorativeImages.length
          ? { decorativeImages: converted.decorativeImages }
          : {}),
        ...(language === 'en'
          ? {
              redirectFrom: `/${slug}/`,
              ...(slug !== sourceSlug
                ? { redirectAliases: [`/${sourceSlug}/`, `/en/${sourceSlug}/`] }
                : {}),
            }
          : {}),
        ...(language === 'pl' ? { useDefaultLangCanonical: true } : {}),
      };
      await fs.writeFile(
        path.join(staging, `index.${language}.md`),
        `---\n${yaml.dump(frontmatter, { lineWidth: -1 })}---\n\n${converted.markdown}\n`,
      );
    }
    // .txt avoids gatsby-transformer-json treating source URLs as GraphQL fields.
    const provenance = new URL(sourceLocation(source).base).pathname.startsWith(
      '/p/',
    )
      ? 'substack-source.txt'
      : 'article-source.txt';
    await fs.writeFile(
      path.join(staging, provenance),
      `${JSON.stringify(
        {
          url: source,
          ...(sourceLocation(source).archive
            ? { originalUrl: sourceLocation(source).base }
            : {}),
          date: post.date,
          assets: converted.assets,
          embeds: converted.embeds,
          ...(entry.codeLanguage ? { codeLanguage: entry.codeLanguage } : {}),
          ...(entry.imageAlts ? { imageAlts: entry.imageAlts } : {}),
          ...(entry.youtubeVideo ? { youtubeVideo: entry.youtubeVideo } : {}),
          ...(entry.recordingEmbeds
            ? { recordingEmbeds: entry.recordingEmbeds }
            : {}),
        },
        null,
        2,
      )}\n`,
    );
    await fs.rename(staging, destination);
    console.log(
      `Imported ${post.title}\n  ${destination} (${Object.keys(converted.assets).length} images, ${converted.embeds} embeds)`,
    );
    return destination;
  } finally {
    await fs.rm(staging, { recursive: true, force: true });
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      manifest: { type: 'string' },
      category: { type: 'string' },
      html: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help || (!values.manifest && !positionals.length)) {
    console.log(
      "Usage: npm run import-articles -- URL [URL...] [--category 'Event Sourcing']\n       npm run import-articles -- --manifest import/eventstore-posts.json\n       npm run import-articles -- URL --html saved-page.html\nSupports Substack, Kurrent/EventStore and dated Wayback captures. Creates identical English and Polish articles with local images. Existing posts are never overwritten.",
    );
    if (!values.help) process.exitCode = 1;
    return;
  }
  if (values.html && (values.manifest || positionals.length !== 1))
    throw new Error('--html requires exactly one URL and no manifest');
  const entries: ImportEntry[] = values.manifest
    ? (JSON.parse(await fs.readFile(values.manifest, 'utf8')) as ImportEntry[])
    : [];
  if (!Array.isArray(entries))
    throw new Error('Manifest must contain an array of post entries');
  entries.push(
    ...positionals.map((url) => ({
      url,
      ...(values.category ? { category: values.category } : {}),
    })),
  );
  const html = values.html ? await fs.readFile(values.html, 'utf8') : undefined;
  const links = buildArticleLinks(postsDirectory, entries);
  for (const entry of entries)
    await importPost(
      { ...entry, ...(values.category ? { category: values.category } : {}) },
      { ...(html !== undefined ? { html } : {}), links },
    );
}

if (import.meta.main)
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
export {
  normalizeUrl,
  sourceLocation,
  originalImageUrl,
  imageExtension,
  extractPost,
  convertPost,
  importPost,
  main,
};
