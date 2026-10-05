const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

function isSubscriptionPromotion(text) {
  return /The next part of the article is for paid users|Become a paid subscriber|^👋 Before I move on.*besides the paid content|^I have a special offer for you: a FREE 30.day trial|^You’ll be able to try the Architecture Weekly, read the old paid content|use a free month[’']s trial|^👋 This Friday is Black Friday/i.test(
    text.replace(/[*_]/g, '').trim(),
  );
}

function youtubeMarkdown(input, title = 'Embedded video') {
  const url = new URL(input);
  if (
    !/^(www\.)?(youtube\.com|youtube-nocookie\.com)$/.test(url.hostname) ||
    !url.pathname.startsWith('/embed/')
  )
    return undefined;
  const id = url.pathname.split('/')[2];
  if (!/^[\w-]{11}$/.test(id)) return undefined;
  url.hostname = 'www.youtube.com';
  url.pathname = '/watch';
  url.searchParams.set('v', id);
  const safeTitle = title
    .replace(/[[\]`\r\n]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
  return `\n\n\`youtube: [${safeTitle}](${url.href})\`\n\n`;
}

function sourceKey(input) {
  const url = new URL(
    String(input).replace(/^https?:\/\/web\.archive\.org\/web\/\d+(?:[a-z]+_)?\//, ''),
  );
  const host = url.hostname.replace(/^www\./, '');
  const site =
    /^(?:eventstore\.com|eventstore\.io|kurrent\.io|kurrentdb\.kurrent\.io)$/.test(host) &&
    url.pathname.startsWith('/blog/')
      ? 'eventstore-blog'
      : host;
  return `${site}${url.pathname.replace(/\/$/, '')}`;
}

function buildArticleLinks(root = path.resolve(__dirname, '../content/posts'), entries = []) {
  const map = new Map();
  const add = (url, slug) => map.set(sourceKey(url), `/en/${slug}/`);
  for (const directory of fs.readdirSync(root, { withFileTypes: true })) {
    if (!directory.isDirectory()) continue;
    const slug = directory.name.split('--')[1];
    const file = path.join(root, directory.name, 'index.en.md');
    if (!slug || !fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const fm = yaml.load(text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '') || {};
    add(`https://www.architecture-weekly.com/p/${slug}`, slug);
    for (const alias of [fm.redirectFrom, ...(fm.redirectAliases || [])].filter(Boolean)) {
      add(
        `https://www.architecture-weekly.com/p/${alias.replace(/^\/en\//, '/').replace(/^\/|\/$/g, '')}`,
        slug,
      );
    }
    for (const metadata of ['substack-source.txt', 'article-source.txt']) {
      const source = path.join(root, directory.name, metadata);
      if (!fs.existsSync(source)) continue;
      const data = JSON.parse(fs.readFileSync(source, 'utf8'));
      add(data.originalUrl || data.url, slug);
    }
  }
  // Resolve links to other entries even before those later batch entries exist.
  for (const entry of entries)
    add(entry.url, entry.slug || new URL(entry.url).pathname.split('/').filter(Boolean).pop());
  const aliases = path.join(__dirname, 'architecture-weekly-link-aliases.json');
  if (fs.existsSync(aliases)) {
    for (const [url, target] of Object.entries(JSON.parse(fs.readFileSync(aliases, 'utf8')))) {
      const slug = target.split('/').filter(Boolean).pop();
      if (fs.readdirSync(root).some((name) => name.endsWith(`--${slug}`)))
        map.set(sourceKey(url), target);
    }
  }
  const externalAliases = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'article-link-aliases.json'), 'utf8'),
  );
  for (const [url, target] of Object.entries(externalAliases)) {
    const slug = target.split('/').filter(Boolean).pop();
    if (fs.readdirSync(root).some((name) => name.endsWith(`--${slug}`)))
      map.set(sourceKey(url), target);
  }
  return map;
}

function relativeArticleLink(input, base, links) {
  const duplicated = input.match(
    /^(https?:\/\/(?:www\.)?architecture-weekly\.com\/p\/[a-z0-9-]+)\1$/,
  );
  if (duplicated) input = duplicated[1];
  const url = new URL(input, base);
  const target = links.get(sourceKey(url));
  if (!target && url.hostname !== 'event-driven.io' && url.hostname !== 'www.event-driven.io')
    return url.href;
  for (const key of [...url.searchParams.keys()])
    if (/^utm_|^(r|s|publication_id)$/.test(key)) url.searchParams.delete(key);
  return `${target || url.pathname}${url.search}${url.hash}`;
}

module.exports = {
  isSubscriptionPromotion,
  youtubeMarkdown,
  sourceKey,
  buildArticleLinks,
  relativeArticleLink,
};
