const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const cheerio = require('cheerio');
const { buildArticleLinks, sourceKey, isSubscriptionPromotion } = require('../import/article-content');
const sources = [...require('../import/architecture-weekly-audit.json').posts, ...require('../import/eventstore-posts.json')];
const publicRoot = path.resolve(__dirname, '../public');

// Verify the built pages, not only the Markdown: plugin configuration and
// Gatsby's HTML cache must preserve the migrated links and recording players.
test('all 192 requested language pages build with local article links and working video markup', () => {
  const links = buildArticleLinks();
  for (const source of sources) {
    const slug = source.directory?.split('--')[1] || source.slug || source.url.replace(/\/$/, '').split('/').pop();
    for (const language of ['en', 'pl']) {
      const file = path.join(publicRoot, language, slug, 'index.html');
      const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
      const body = $('.bodytext');
      assert(body.text().trim().length > 0, `Empty article: ${language}/${slug}`);
      body.find('p, h2').each((_, element) => assert(!isSubscriptionPromotion($(element).text()), `Paid prompt: ${language}/${slug}`));
      body.find('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (!/^https?:\/\//.test(href)) return;
        const url = new URL(href);
        assert(!links.has(sourceKey(url)), `Unlocalized source link: ${language}/${slug}: ${href}`);
        assert(!/^(www\.)?event-driven\.io$/.test(url.hostname), `Absolute blog link: ${language}/${slug}: ${href}`);
      });
      if (source.youtubeVideo) {
        const player = body.find(`iframe[src*="/embed/${source.youtubeVideo}"]`);
        assert.equal(player.length, 1, `Missing/duplicate recording: ${language}/${slug}`);
        assert(player.hasClass('embedVideo-iframe'));
        assert.equal(new URL(player.attr('src')).hostname, 'www.youtube-nocookie.com');
        assert.equal(player.attr('referrerpolicy'), 'strict-origin-when-cross-origin');
        assert.equal(player.attr('loading'), 'lazy');
        assert.equal(player.attr('sandbox'), undefined);
      }
      assert(!body.text().includes('Error: VideoService could not be found'), `Invalid video: ${language}/${slug}`);
    }
  }
});

// Category data now comes from template queries rather than serialized page
// context. Verify that the reading paths and their content survive that move.
test('category template queries preserve curated reading order, excerpts and local covers', () => {
  const guides = require('../data/category-guides.json');
  const routes = new Set(require('./fixtures/build-contract.json').routes);
  for (const guide of guides) {
    // Some guides are reserved for categories that have no articles in this locale yet.
    // The established route contract determines which pages must be present.
    if (!routes.has(`/${guide.language}/category/${guide.slug}/`)) continue;
    const $ = cheerio.load(fs.readFileSync(path.join(publicRoot, guide.language, 'category', guide.slug, 'index.html'), 'utf8'));
    const cards = $('ol.ordered .readingCard');
    assert.deepEqual(cards.map((_, card) => $(card).attr('href')).get(),
      guide.recommended.map(slug => `/${guide.language}/${slug}/`), `${guide.language}/${guide.slug}: reading order`);
    cards.each((_, card) => {
      assert($(card).find('h3').text().trim(), 'Missing recommendation title');
      assert($(card).find('.excerpt').text().trim(), 'Missing recommendation excerpt');
      const image = $(card).find('img.readingCardImage').attr('src');
      assert(image?.startsWith('/static/'), 'Missing local recommendation cover');
      assert(fs.existsSync(path.join(publicRoot, image)), `Missing generated cover: ${image}`);
    });
  }
});
