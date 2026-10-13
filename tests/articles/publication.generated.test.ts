import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import * as cheerio from 'cheerio';
import MiniSearch from 'minisearch';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import { loadIndex } from '../../src/search/runtime.ts';
import { builtRedirects } from '../helpers/redirects.ts';
import { publishedContent } from '../helpers/published-content.ts';

const posts = publishedContent('posts');
const readBuild = (file: string) => readFileSync(join('public', file), 'utf8');

test('every source article is published with its current title, locale and canonical', () => {
  assert.ok(posts.length, 'No source articles found');
  for (const post of posts) {
    const $ = cheerio.load(readBuild(`${post.route}index.html`));
    assert.equal($('h1').text().trim(), post.metadata.title, post.route);
    assert.ok($('head title').text().includes(post.metadata.title), post.route);
    const schema = JSON.parse($('#page-schema').text()) as { headline: string };
    assert.equal(schema.headline, post.metadata.title, post.route);
    assert.equal($('html').attr('lang'), post.language, post.route);
    const canonical = post.metadata.useDefaultLangCanonical
      ? post.route.replace(/^\/pl\//, '/en/')
      : post.route;
    assert.equal(
      $('link[rel=canonical]').attr('href'),
      `https://event-driven.io${canonical}`,
      post.route,
    );
  }
});

for (const language of ['en', 'pl']) {
  test(`${language} archive contains every current article once, newest first, with current metadata and covers`, () => {
    const expected = posts.filter((post) => post.language === language);
    const byRoute = new Map(expected.map((post) => [post.route, post]));
    const $ = cheerio.load(readBuild(`${language}/articles/index.html`));
    const cards = $('.main li > a.link');
    const routes = cards.map((_, card) => $(card).attr('href')!).get();
    assert.deepEqual([...routes].sort(), [...byRoute.keys()].sort());
    const dates = routes.map((route) => byRoute.get(route)!.date);
    assert.deepEqual(dates, [...dates].sort().reverse(), 'Newest first');
    cards.each((_, element) => {
      const card = $(element);
      const post = byRoute.get(card.attr('href')!)!;
      assert.equal(
        card.find('h2').text().trim(),
        post.metadata.title,
        post.route,
      );
      assert.ok(card.find('.meta').text().includes(post.date), post.route);
      const cover = card.find('img[data-main-image]');
      assert.equal(cover.length, 1, post.route);
      assert.equal(cover.attr('alt'), post.metadata.title, post.route);
      const source = cover.attr('src') || cover.attr('data-src');
      assert.ok(source?.startsWith('/static/'), post.route);
      assert.ok(
        statSync(join('public', decodeURI(source!))).size > 0,
        `Missing cover: ${post.route}`,
      );
    });
  });

  test(`${language} search includes every article and preserves available locale routes`, async () => {
    const manifest = JSON.parse(
      readBuild('search-index/manifest.json'),
    ) as Record<string, string>;
    const index = await loadIndex(readBuild(manifest[language]!));
    const documents = index.search(MiniSearch.wildcard);
    const paths = new Set(documents.map((document) => document.path as string));
    for (const post of posts.filter((post) => post.language === language)) {
      assert.ok(
        paths.has(post.route),
        `Missing search document: ${post.route}`,
      );
    }
  });
}

test('every canonical article is discoverable and every English article is in RSS', () => {
  const discovery = readBuild('llms.txt');
  const destinations = [
    ...discovery.matchAll(
      /^- \[[^\n]*\]\((https:\/\/event-driven\.io\/[^)]+)\)/gm,
    ),
  ].map((match) => match[1]!);
  assert.equal(
    new Set(destinations).size,
    destinations.length,
    'Duplicate discovery URL',
  );
  const feed = cheerio.load(readBuild('rss.xml'), { xml: true });
  const feedLinks = new Set(
    feed('item > link')
      .map((_, link) => feed(link).text())
      .get(),
  );
  for (const post of [...posts, ...publishedContent('pages')]) {
    if (post.route.endsWith('/success/')) continue;
    const url = `https://event-driven.io${post.route}`;
    assert.equal(
      destinations.includes(url),
      !post.metadata.useDefaultLangCanonical,
      post.route,
    );
  }
  for (const post of posts.filter((post) => post.language === 'en')) {
    assert.ok(
      feedLinks.has(`https://event-driven.io${post.route}`),
      `Missing RSS entry: ${post.route}`,
    );
  }
});

test('authored local and YouTube text links keep their destinations in rendered content', () => {
  const parser = remark();
  for (const document of [...posts, ...publishedContent('pages')]) {
    const $ = cheerio.load(readBuild(`${document.route}index.html`));
    const destinations = new Set(
      $('a[href]')
        .map((_, link) => $(link).attr('href'))
        .get(),
    );
    visit(parser.parse(document.body), 'link', (link) => {
      if (link.children.some((child) => child.type === 'image')) return;
      let url: URL;
      try {
        url = new URL(link.url, 'https://event-driven.io');
      } catch {
        return;
      }
      const localArticle = /^\/(?:en|pl)\//.test(link.url);
      const youtube = [
        'youtube.com',
        'www.youtube.com',
        'youtu.be',
        'www.youtube-nocookie.com',
      ].includes(url.hostname);
      if (!localArticle && !youtube) return;
      assert.ok(
        destinations.has(link.url),
        `Text link lost: ${document.route}: ${link.url}`,
      );
    });
  }
});

test('current source aliases have one permanent redirect to their English article', async () => {
  const redirects = await builtRedirects();
  for (const post of posts.filter((post) => post.language === 'en')) {
    const aliases = new Set([
      post.metadata.redirectFrom,
      ...(post.metadata.redirectAliases || []),
    ]);
    aliases.delete(undefined);
    aliases.delete(post.route);
    for (const alias of aliases) {
      const rules = redirects.filter((rule) => rule.from === alias);
      assert.equal(rules.length, 1, `Missing/duplicate alias: ${alias}`);
      assert.equal(rules[0]!.to, post.route, alias);
      assert.equal(rules[0]!.status, 301, alias);
    }
  }
});

test('article author biographies render the current author source, not an unrelated article', () => {
  for (const language of ['en', 'pl']) {
    const post = posts.find((post) => post.language === language)!;
    const markdown = readFileSync(
      `content/parts/author.${language}.md`,
      'utf8',
    ).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    const text: string[] = [];
    visit(remark().parse(markdown), (node) => {
      if (node.type === 'paragraph') text.push(' ');
      if (node.type === 'text' || node.type === 'inlineCode')
        text.push(node.value);
    });
    // Smart typography changes punctuation, not the identity or wording of the note.
    const normalize = (value: string) =>
      value
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/…/g, '...')
        .replace(/[-–—]+/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
    const expected = normalize(text.join(''));
    const $ = cheerio.load(readBuild(`${post.route}index.html`));
    assert.ok(expected);
    assert.equal(normalize($('.author .note').text()), expected, post.route);
  }
});
