import type { ArticleNode, Frontmatter } from '../src/types/content.ts';
import { readFrontmatter } from './helpers/frontmatter.mts';
import categoryGuides from '../data/category-guides.json' with { type: 'json' };
import buildContractFixture from './fixtures/build-contract.json' with { type: 'json' };
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import cheerio from 'cheerio';
import {
  buildArticleLinks,
  sourceKey,
  isSubscriptionPromotion,
} from '../import/article-content.mts';
const publicRoot = path.resolve(import.meta.dirname, '../public');
const articles = fs
  .readdirSync(path.join(publicRoot, 'page-data'), { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name === 'page-data.json')
  .flatMap((entry) => {
    const { path: route, result } = JSON.parse(
      fs.readFileSync(path.join(entry.parentPath, entry.name), 'utf8'),
    );
    if (result.data?.post?.fields.source !== 'posts') return [];
    const related = result.pageContext.relatedIds.map((id: string) => {
      const post = result.data.relatedPosts.edges.find(
        ({ node }: { node: ArticleNode }) => node.id === id,
      )?.node;
      assert(post, `Missing related article data: ${route}: ${id}`);
      return `/${post.fields.langKey}${post.fields.slug}`;
    });
    return [{ route, language: result.data.post.fields.langKey, related }];
  });

test('published articles have localized metadata, blog cross-links and working video markup', () => {
  assert(articles.length > 0, 'Expected published article output');
  const links = buildArticleLinks();
  for (const { route, language } of articles) {
    const file = path.join(publicRoot, route, 'index.html');
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
    assert.equal($('html').attr('lang'), language, `Wrong document language: ${route}`);
    assert.equal($('head title').length, 1, `Duplicate/missing title: ${route}`);
    assert.equal($('head link[rel=canonical]').length, 1, `Duplicate/missing canonical: ${route}`);
    assert.equal(
      $('head meta[name=description]').length,
      1,
      `Duplicate/missing description: ${route}`,
    );
    const schemas = $('head script[type="application/ld+json"]');
    assert.equal(schemas.length, 1, `Duplicate/missing schema: ${route}`);
    assert.equal(JSON.parse(schemas.text())['@type'], 'BlogPosting');
    const body = $('.bodytext');
    assert(body.text().trim().length > 0, `Empty article: ${route}`);
    body
      .find('p, h2')
      .each((_, element) =>
        assert(!isSubscriptionPromotion($(element).text()), `Paid prompt: ${route}`),
      );
    body.find('a[href]').each((_, element) => {
      const href = $(element).attr('href')!;
      if (!/^https?:\/\//.test(href)) return;
      const url = new URL(href);
      assert(!links.has(sourceKey(url)), `Unlocalized source link: ${route}: ${href}`);
    });
    body.find('iframe[src]').each((_, element) => {
      const player = $(element);
      const url = new URL(player.attr('src')!);
      if (!['www.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname)) return;
      assert.equal(url.hostname, 'www.youtube-nocookie.com');
      assert.match(url.pathname, /^\/embed\/[\w-]{11}$/);
      assert(player.attr('title')?.trim(), `Missing player title: ${route}`);
      assert.equal(player.attr('referrerpolicy'), 'strict-origin-when-cross-origin');
      assert.equal(player.attr('loading'), 'lazy');
      assert.equal(player.attr('sandbox'), undefined);
    });
    assert(
      !body.text().includes('Error: VideoService could not be found'),
      `Invalid video: ${route}`,
    );
  }
});

test('category pages render configured reading order, excerpts and local covers', () => {
  const guides = categoryGuides;
  const routes = new Set(buildContractFixture.routes);
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
        ).result.data.posts.edges.find(
          ({ node }: { node: ArticleNode }) => node.fields.slug === `/${slug}/`,
        );
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
      assert(fs.existsSync(path.join(publicRoot, image!)), `Missing generated cover: ${image}`);
    });
  }
});

test('article navigation includes existing placeholder languages without advertising duplicate translations', () => {
  for (const { route, language } of articles) {
    const $ = cheerio.load(fs.readFileSync(path.join(publicRoot, route, 'index.html'), 'utf8'));
    const target = language === 'en' ? 'pl' : 'en';
    const destination = route.replace(`/${language}/`, `/${target}/`);
    assert.equal(
      $(`.language-selector-container a[href="${destination}"]`).length,
      fs.existsSync(path.join(publicRoot, destination, 'index.html')) ? 1 : 0,
      `Incorrect language destination: ${route}`,
    );
  }
});

test('Event Sourcing category languages share all articles and curated reading order', () => {
  const expected = new Map<string, { language: string; metadata: Frontmatter }[]>();
  for (const directory of fs.readdirSync(path.join(import.meta.dirname, '../content/posts'))) {
    const versions = [];
    for (const language of ['en', 'pl']) {
      const file = path.join(
        import.meta.dirname,
        '../content/posts',
        directory,
        `index.${language}.md`,
      );
      if (!fs.existsSync(file)) continue;
      const metadata = readFrontmatter(fs.readFileSync(file, 'utf8').split('---')[1]);
      versions.push({ language, metadata });
    }
    if (
      !versions.some(
        ({ metadata }) =>
          !metadata.useDefaultLangCanonical &&
          [metadata.category, ...(metadata.categories || [])].includes('Event Sourcing'),
      )
    )
      continue;
    // Hosted document URLs normalize case; original folder names retain
    // publication/feed/comment identities.
    expected.set(directory.split('--')[1].toLowerCase(), versions);
  }
  const guide = categoryGuides.find(
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
      new Set(cards.map((_, card) => $(card).attr('href')!.split('/')[2]).get()).size,
      expected.size,
    );
    cards.each((_, card) => {
      const href = $(card).attr('href')!;
      const slug = href.split('/')[2];
      const versions = expected.get(slug);
      assert(versions, `Unexpected article ${href}`);
      const target =
        versions.find((version) => version.language === language) ||
        versions.find(
          (version) => version.language === 'en' && !version.metadata.useDefaultLangCanonical,
        ) ||
        versions.find((version) => !version.metadata.useDefaultLangCanonical);
      assert.equal(
        href,
        `/${target!.language}/${slug}/`,
        `Incorrect fallback for ${language}/${slug}`,
      );
      assert(
        fs.existsSync(path.join(publicRoot, href, 'index.html')),
        `Broken category link ${href}`,
      );
    });
    assert.deepEqual(
      $('ol.ordered a.readingCard')
        .map((_, card) => $(card).attr('href')!.split('/')[2])
        .get(),
      guide!.recommended,
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
  visit(path.join(import.meta.dirname, '../content'));
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

test('related article cards follow current editorial data and preserve available locale routes with valid canonical identities', () => {
  for (const { route, related } of articles) {
    const $ = cheerio.load(fs.readFileSync(path.join(publicRoot, route, 'index.html'), 'utf8'));
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
      if (fs.existsSync(path.join(publicRoot, localDestination, 'index.html'))) {
        assert.equal(destination, localDestination, `Related link changes locale: ${route}`);
      }
      const target = cheerio.load(
        fs.readFileSync(path.join(publicRoot, destination, 'index.html'), 'utf8'),
      );
      const pageData = JSON.parse(
        fs.readFileSync(path.join(publicRoot, 'page-data', destination, 'page-data.json'), 'utf8'),
      );
      let canonicalPath = destination;
      if (pageData.result.data.post.frontmatter.useDefaultLangCanonical) {
        canonicalPath = destination.replace(/^\/pl\//, '/en/');
      }
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
      fs.readFileSync(path.join(publicRoot, language, 'articles/index.html'), 'utf8'),
    );
    const cards = $('li > a.link');
    assert(cards.length > 0, `${language}: expected archive cards`);
    cards.each((_, card) => {
      const destination = $(card).attr('href')!;
      assert(
        destination.startsWith(`/${language}/`),
        `Archive link changes locale: ${destination}`,
      );
      assert(fs.existsSync(path.join(publicRoot, destination, 'index.html')), destination);
    });
  }
});
