import rss from '@astrojs/rss';
import escape from 'escape-html';
import staticRules from '../../../data/redirects.txt?raw';
import { sitePages } from './site.ts';
import { readCatalog } from './catalog.ts';
import { renderDocument } from './render-content.ts';
import { renderExcerpt } from './markdown.ts';
import { redirectRules } from '../../../src/content/redirects.ts';
import config from '../../../content/meta/config.ts';

export async function feed(source: string, title: string) {
  const items = [];
  for (const node of await readCatalog()) {
    if (node.fields.source !== source || node.fields.langKey !== 'en') continue;
    const document = await renderDocument(node);
    items.push({
      title: node.frontmatter.title,
      link: `/en${node.fields.slug}`,
      description: await renderExcerpt(node.body, node.file, 140),
      content: document.html || '',
      customData: `<guid isPermaLink="false">${escape(`${config.siteUrl}/en${node.fields.originalSlug || node.fields.slug}`)}</guid>`,
    });
  }
  return rss({
    site: config.siteUrl,
    title,
    description: config.siteDescription,
    items,
  });
}

export async function redirects() {
  const pages = await sitePages();
  return new Response(
    redirectRules(
      pages
        .filter((page) => page.document.fields.source === 'posts')
        .map((page) => page.document),
      pages
        .filter((page) => page.kind === 'tags')
        .map((page) => ({
          language: page.context.lang,
          slug: page.context.tagSlug!,
        })),
      staticRules,
    ),
  );
}

export async function sitemap() {
  const pages = (await sitePages()).filter(
    (page) =>
      !['notFound', 'search'].includes(page.kind) &&
      !page.document.frontmatter.useDefaultLangCanonical &&
      page.context.originalPath !== '/success/',
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((page) => `<url><loc>${config.siteUrl}${escape(page.route)}</loc></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
}

export function manifest() {
  return Response.json({
    name: config.manifestName,
    short_name: config.manifestShortName,
    start_url: config.manifestStartUrl,
    background_color: config.manifestBackgroundColor,
    theme_color: config.manifestThemeColor,
    display: config.manifestDisplay,
    icons: [48, 96, 144, 192, 256, 384, 512].map((size) => ({
      src: `/icons/icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
    })),
  });
}
