const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const cheerio = require('cheerio');
const {
  buildArticleLinks,
  sourceKey,
  isSubscriptionPromotion,
} = require('../import/article-content');
const sources = [
  ...require('../import/architecture-weekly-audit.json').posts,
  ...require('../import/eventstore-posts.json'),
];
const publicRoot = path.resolve(__dirname, '../public');

// Verify the built pages, not only the Markdown: plugin configuration and
// Gatsby's HTML cache must preserve the migrated links and recording players.
test('all 192 requested language pages build with local article links and working video markup', () => {
  const links = buildArticleLinks();
  for (const source of sources) {
    const slug =
      source.directory?.split('--')[1] ||
      source.slug ||
      source.url.replace(/\/$/, '').split('/').pop();
    for (const language of ['en', 'pl']) {
      const file = path.join(publicRoot, language, slug, 'index.html');
      const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
      assert.equal(
        $('html').attr('lang'),
        language,
        `Wrong document language: ${language}/${slug}`,
      );
      assert.equal($('head title').length, 1, `Duplicate/missing title: ${language}/${slug}`);
      assert.equal(
        $('head link[rel=canonical]').length,
        1,
        `Duplicate/missing canonical: ${language}/${slug}`,
      );
      assert.equal(
        $('head meta[name=description]').length,
        1,
        `Duplicate/missing description: ${language}/${slug}`,
      );
      const schemas = $('head script[type="application/ld+json"]');
      assert.equal(schemas.length, 1, `Duplicate/missing schema: ${language}/${slug}`);
      assert.equal(JSON.parse(schemas.text())['@type'], 'BlogPosting');
      const body = $('.bodytext');
      assert(body.text().trim().length > 0, `Empty article: ${language}/${slug}`);
      body
        .find('p, h2')
        .each((_, element) =>
          assert(!isSubscriptionPromotion($(element).text()), `Paid prompt: ${language}/${slug}`),
        );
      body.find('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (!/^https?:\/\//.test(href)) return;
        const url = new URL(href);
        assert(!links.has(sourceKey(url)), `Unlocalized source link: ${language}/${slug}: ${href}`);
        assert(
          !/^(www\.)?event-driven\.io$/.test(url.hostname),
          `Absolute blog link: ${language}/${slug}: ${href}`,
        );
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
      assert(
        !body.text().includes('Error: VideoService could not be found'),
        `Invalid video: ${language}/${slug}`,
      );
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
    const $ = cheerio.load(
      fs.readFileSync(
        path.join(publicRoot, guide.language, 'category', guide.slug, 'index.html'),
        'utf8',
      ),
    );
    const cards = $('ol.ordered .readingCard');
    assert.deepEqual(
      cards.map((_, card) => $(card).attr('href')).get(),
      guide.recommended.map((slug) => {
        const edge = JSON.parse(
          fs.readFileSync(
            path.join(
              publicRoot,
              'page-data',
              guide.language,
              'category',
              guide.slug,
              'page-data.json',
            ),
            'utf8',
          ),
        ).result.data.posts.edges.find(({ node }) => node.fields.slug === `/${slug}/`);
        assert(edge, `Missing recommended article ${guide.language}/${slug}`);
        return `/${edge.node.fields.langKey}/${slug}/`;
      }),
      `${guide.language}/${guide.slug}: reading order`,
    );
    cards.each((_, card) => {
      assert($(card).find('h3').text().trim(), 'Missing recommendation title');
      assert($(card).find('.excerpt').text().trim(), 'Missing recommendation excerpt');
      const image = $(card).find('img.readingCardImage').attr('src');
      assert(image?.startsWith('/static/'), 'Missing local recommendation cover');
      assert(fs.existsSync(path.join(publicRoot, image)), `Missing generated cover: ${image}`);
    });
  }
});

test('article navigation includes existing placeholder languages without advertising duplicate translations', () => {
  for (const source of sources) {
    const slug =
      source.directory?.split('--')[1] ||
      source.slug ||
      source.url.replace(/\/$/, '').split('/').pop();
    for (const language of ['en', 'pl']) {
      const $ = cheerio.load(
        fs.readFileSync(path.join(publicRoot, language, slug, 'index.html'), 'utf8'),
      );
      const target = language === 'en' ? 'pl' : 'en';
      assert.equal(
        $(`.language-selector-container a[href="/${target}/${slug}/"]`).length,
        1,
        `Missing language switch: ${language}/${slug}`,
      );
    }
  }
});

test('Event Sourcing category languages share all articles and curated reading order', () => {
  const yaml = require('js-yaml');
  const expected = new Map();
  for (const directory of fs.readdirSync(path.join(__dirname, '../content/posts'))) {
    const versions = [];
    for (const language of ['en', 'pl']) {
      const file = path.join(__dirname, '../content/posts', directory, `index.${language}.md`);
      if (!fs.existsSync(file)) continue;
      const metadata = yaml.load(fs.readFileSync(file, 'utf8').split('---')[1]);
      if (!metadata.useDefaultLangCanonical) versions.push({ language, metadata });
    }
    if (
      !versions.some(({ metadata }) =>
        [metadata.category, ...(metadata.categories || [])].includes('Event Sourcing'),
      )
    )
      continue;
    expected.set(directory.split('--')[1], versions);
  }
  const guide = require('../data/category-guides.json').find(
    (item) => item.language === 'en' && item.slug === 'event-sourcing',
  );
  for (const language of ['en', 'pl']) {
    const $ = cheerio.load(
      fs.readFileSync(
        path.join(publicRoot, language, 'category/event-sourcing/index.html'),
        'utf8',
      ),
    );
    const cards = $('a.readingCard');
    assert.equal(cards.length, expected.size, `${language}: missing category articles`);
    assert.equal(
      new Set(cards.map((_, card) => $(card).attr('href').split('/')[2]).get()).size,
      expected.size,
    );
    cards.each((_, card) => {
      const href = $(card).attr('href');
      const slug = href.split('/')[2];
      const versions = expected.get(slug);
      assert(versions, `Unexpected article ${href}`);
      const target =
        versions.find((version) => version.language === language) ||
        versions.find((version) => version.language === 'en') ||
        versions[0];
      assert.equal(
        href,
        `/${target.language}/${slug}/`,
        `Incorrect fallback for ${language}/${slug}`,
      );
      assert(
        fs.existsSync(path.join(publicRoot, href, 'index.html')),
        `Broken category link ${href}`,
      );
    });
    assert.deepEqual(
      $('ol.ordered a.readingCard')
        .map((_, card) => $(card).attr('href').split('/')[2])
        .get(),
      guide.recommended,
    );
    assert.equal(
      $('.moreArticles').length,
      1,
      'Expected one separator between recommended and remaining articles',
    );
    const index = cheerio.load(
      fs.readFileSync(path.join(publicRoot, language, 'category/index.html'), 'utf8'),
    );
    assert(
      index(`a[href="/${language}/category/event-sourcing/"] strong`)
        .text()
        .includes(String(expected.size)),
      'Index count differs from category detail',
    );
  }
});

test('Kurrent TypeScript examples render with Prism syntax tokens in both languages', () => {
  const slug =
    'keep-your-streams-short-temporal-modelling-for-fast-reads-and-optimal-data-retention';
  for (const language of ['en', 'pl']) {
    const $ = cheerio.load(
      fs.readFileSync(path.join(publicRoot, language, slug, 'index.html'), 'utf8'),
    );
    assert.equal($('.bodytext pre.language-typescript').length, 16);
    assert(
      $('.bodytext pre.language-typescript .token.keyword').length > 0,
      'Missing highlighted keywords',
    );
  }
});

test('known migrated source URLs are relative throughout blog content and social links use the requested order', () => {
  const links = buildArticleLinks();
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.name.endsWith('.md')) {
        for (const url of fs.readFileSync(file, 'utf8').match(/https?:\/\/[^\s)<>"\]]+/g) || []) {
          if (
            !/^https?:\/\/(?:www\.)?(?:architecture-weekly\.com|eventstore\.com|eventstore\.io|kurrent\.io|kurrentdb\.kurrent\.io|web\.archive\.org)\//.test(
              url,
            )
          )
            continue;
          assert(!links.has(sourceKey(url)), `Known source URL remains in ${file}: ${url}`);
        }
      }
    }
  }
  visit(path.join(__dirname, '../content'));
  const $ = cheerio.load(fs.readFileSync(path.join(publicRoot, 'en/articles/index.html'), 'utf8'));
  assert.deepEqual(
    $('nav .itemList a[href^="http"]')
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
