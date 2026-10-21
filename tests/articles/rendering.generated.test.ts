import { publishedContent } from '../helpers/published-content.ts';
import { expectedArticleLinks } from '../helpers/article-expectations.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'vitest';
import * as cheerio from 'cheerio';
import {
  buildArticleLinks,
  sourceKey,
  isSubscriptionPromotion,
} from '../../import/article-content.ts';
const publicRoot = path.resolve(import.meta.dirname, '../../dist');
const articles = publishedContent('posts').map((post) => ({
  route: post.route,
  language: post.language,
  related: expectedArticleLinks(post.route).related,
}));

test('published articles have localized metadata, blog cross-links and working video markup', () => {
  assert(articles.length > 0, 'Expected published article output');
  const links = buildArticleLinks();
  for (const { route, language } of articles) {
    const file = path.join(publicRoot, route, 'index.html');
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
    assert.equal(
      $('html').attr('lang'),
      language,
      `Wrong document language: ${route}`,
    );
    assert.equal(
      $('head title').length,
      1,
      `Duplicate/missing title: ${route}`,
    );
    assert.equal(
      $('head link[rel=canonical]').length,
      1,
      `Duplicate/missing canonical: ${route}`,
    );
    assert.equal(
      $('head meta[name=description]').length,
      1,
      `Duplicate/missing description: ${route}`,
    );
    const schemas = $('head script[type="application/ld+json"]');
    assert.equal(schemas.length, 1, `Duplicate/missing schema: ${route}`);
    assert.equal(
      (JSON.parse(schemas.text()) as Record<string, unknown>)['@type'],
      'BlogPosting',
    );
    const body = $('.bodytext');
    assert(body.text().trim().length > 0, `Empty article: ${route}`);
    body
      .find('p, h2')
      .each((_, element) =>
        assert(
          !isSubscriptionPromotion($(element).text()),
          `Paid prompt: ${route}`,
        ),
      );
    body.find('a[href]').each((_, element) => {
      const href = $(element).attr('href')!;
      if (!/^https?:\/\//.test(href)) return;
      const url = new URL(href);
      assert(
        !links.has(sourceKey(url)),
        `Unlocalized source link: ${route}: ${href}`,
      );
    });
    body.find('iframe[src]').each((_, element) => {
      const player = $(element);
      const url = new URL(player.attr('src')!);
      if (
        !['www.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname)
      )
        return;
      assert.equal(url.hostname, 'www.youtube-nocookie.com');
      assert.match(url.pathname, /^\/embed\/[\w-]{11}$/);
      assert(player.attr('title')?.trim(), `Missing player title: ${route}`);
      assert.equal(
        player.attr('referrerpolicy'),
        'strict-origin-when-cross-origin',
      );
      assert.equal(player.attr('loading'), 'lazy');
      assert.equal(player.attr('sandbox'), undefined);
    });
    assert(
      !body.text().includes('Error: VideoService could not be found'),
      `Invalid video: ${route}`,
    );
  }
});

test('article navigation includes existing placeholder languages without advertising duplicate translations', () => {
  for (const { route, language } of articles) {
    const $ = cheerio.load(
      fs.readFileSync(path.join(publicRoot, route, 'index.html'), 'utf8'),
    );
    const target = language === 'en' ? 'pl' : 'en';
    const destination = route.replace(`/${language}/`, `/${target}/`);
    assert.equal(
      $(`header a[hreflang][href="${destination}"]`).length,
      fs.existsSync(path.join(publicRoot, destination, 'index.html')) ? 1 : 0,
      `Incorrect language destination: ${route}`,
    );
  }
});

test('Kurrent TypeScript examples render with Prism syntax tokens in both languages', () => {
  const slug =
    'keep-your-streams-short-temporal-modelling-for-fast-reads-and-optimal-data-retention';
  for (const language of ['en', 'pl']) {
    const $ = cheerio.load(
      fs.readFileSync(
        path.join(publicRoot, language, slug, 'index.html'),
        'utf8',
      ),
    );
    assert($('.bodytext pre.language-typescript').length > 0);
    assert(
      $('.bodytext pre.language-typescript .token.keyword').length > 0,
      'Missing highlighted keywords',
    );
  }
});

test('available blog references use relative URLs and social links follow the configured order', () => {
  const links = buildArticleLinks();
  function visit(directory: string) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.name.endsWith('.md')) {
        for (const url of fs
          .readFileSync(file, 'utf8')
          .match(/https?:\/\/[^\s)<>"\]]+/g) || []) {
          if (
            !/^https?:\/\/(?:www\.)?(?:architecture-weekly\.com|eventstore\.com|eventstore\.io|kurrent\.io|kurrentdb\.kurrent\.io|web\.archive\.org)\//.test(
              url,
            )
          )
            continue;
          assert(
            !links.has(sourceKey(url)),
            `Known source URL remains in ${file}: ${url}`,
          );
        }
      }
    }
  }
  visit(path.join(import.meta.dirname, '../../content'));
  const $ = cheerio.load(
    fs.readFileSync(path.join(publicRoot, 'en/articles/index.html'), 'utf8'),
  );
  assert.deepEqual(
    $('nav #navigation-links a[href^="http"]')
      .map((_, item) => $(item).attr('href'))
      .get(),
    [
      'https://www.linkedin.com/in/oskardudycz/',
      'https://github.com/oskardudycz',
      'https://hachyderm.io/@oskardudycz',
      'https://bsky.app/profile/oskardudycz.bsky.social',
      'https://www.youtube.com/channel/UC3M4_OgJS4lvZHVDzkOlxIg',
      'https://event-driven.io/rss.xml',
    ],
  );
});

test('related article cards follow current editorial data and preserve available locale routes with valid canonical identities', () => {
  for (const { route, related } of articles) {
    const $ = cheerio.load(
      fs.readFileSync(path.join(publicRoot, route, 'index.html'), 'utf8'),
    );
    assert.deepEqual(
      $('.related .readingCard')
        .map((_, card) => $(card).attr('href'))
        .get(),
      related,
      route,
    );
    for (const destination of related) {
      const slug = destination.split('/').slice(2).join('/');
      const localDestination = `/${route.split('/')[1]}/${slug}`;
      if (
        fs.existsSync(path.join(publicRoot, localDestination, 'index.html'))
      ) {
        assert.equal(
          destination,
          localDestination,
          `Related link changes locale: ${route}`,
        );
      }
      const target = cheerio.load(
        fs.readFileSync(
          path.join(publicRoot, destination, 'index.html'),
          'utf8',
        ),
      );
      const source = publishedContent('posts').find(
        (post) => post.route === destination,
      )!;
      let canonicalPath = destination;
      if (source.metadata.useDefaultLangCanonical)
        canonicalPath = destination.replace(/^\/pl\//, '/en/');
      assert.equal(
        target('head link[rel="canonical"]').attr('href'),
        `https://event-driven.io${canonicalPath}`,
        destination,
      );
    }
  }
});

test('archive cards preserve their page locale, including untranslated article copies', () => {
  for (const language of ['en', 'pl']) {
    const $ = cheerio.load(
      fs.readFileSync(
        path.join(publicRoot, language, 'articles/index.html'),
        'utf8',
      ),
    );
    const cards = $('li > a.link');
    assert(cards.length > 0, `${language}: expected archive cards`);
    cards.each((_, card) => {
      const destination = $(card).attr('href')!;
      assert(
        destination.startsWith(`/${language}/`),
        `Archive link changes locale: ${destination}`,
      );
      assert(
        fs.existsSync(path.join(publicRoot, destination, 'index.html')),
        destination,
      );
    });
  }
});
