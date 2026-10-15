import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import * as cheerio from 'cheerio';
import MiniSearch from 'minisearch';
import { loadIndex } from '../../src/search/runtime.ts';
import {
  publishedContent,
  publishedGuides,
} from '../helpers/published-content.ts';

const origin = 'https://event-driven.io';
const languages = ['en', 'pl'];
const guides = publishedGuides();
const readBuild = (file: string) => readFileSync(join('public', file), 'utf8');
const page = (route: string) => cheerio.load(readBuild(`${route}index.html`));
const published = (route: string) =>
  existsSync(join('public', route, 'index.html'));

// A guide links to the article in its own language, or to the English original.
const articleRoute = (slug: string, language: string) =>
  published(`/${language}/${slug}/`) ? `/${language}/${slug}/` : `/en/${slug}/`;

const countLabel = (count: number, language: string) => {
  const words: Record<string, Record<string, string>> = {
    en: { one: 'article', other: 'articles' },
    pl: { one: 'artykuł', few: 'artykuły', many: 'artykułów' },
  };
  const form = new Intl.PluralRules(language).select(count);
  return `${count} ${words[language]![form]}`;
};

const labels: Record<
  string,
  { box: string; guide: string; step: string; next: string }
> = {
  en: {
    box: 'Guides with this article',
    guide: 'Guide',
    step: 'step {step} of {total}',
    next: 'Next',
  },
  pl: {
    box: 'Przewodniki z tym artykułem',
    guide: 'Przewodnik',
    step: 'krok {step} z {total}',
    next: 'Dalej',
  },
};

test('every guide is published in both languages with its articles in order and self-canonical metadata', () => {
  assert.ok(guides.length, 'No guides found');
  for (const guide of guides) {
    const { route, slug, language, metadata } = guide;
    const $ = page(route);
    assert.equal($('main').length, 1, route);
    assert.equal($('html').attr('lang'), language, route);
    assert.equal($('h1').length, 1, route);
    assert.equal(
      $('h1').text().trim(),
      `${metadata.icon} ${metadata.title}`,
      route,
    );
    assert.ok($('main .bodytext').text().trim(), `${route}: no intro`);
    assert.equal(
      $('meta[name=description]').attr('content'),
      metadata.description,
      route,
    );
    assert.equal($('link[rel=canonical]').attr('href'), `${origin}${route}`);
    assert.equal($('meta[name=robots]').length, 0, route);
    assert.deepEqual(
      $('link[rel=alternate][hreflang]')
        .map((_, link) => `${$(link).attr('hreflang')} ${$(link).attr('href')}`)
        .get(),
      [
        `x-default ${origin}/en/guides/${slug}/`,
        `en ${origin}/en/guides/${slug}/`,
        `pl ${origin}/pl/guides/${slug}/`,
      ],
      route,
    );
    const image = $('meta[property="og:image"]').attr('content') || '';
    assert.ok(image.startsWith(`${origin}/static/`), `${route}: ${image}`);
    assert.ok(
      existsSync(join('public', decodeURI(image.slice(origin.length)))),
      `${route}: missing ${image}`,
    );
    assert.equal(
      (JSON.parse($('#page-schema').text()) as { '@type': string })['@type'],
      'CollectionPage',
      route,
    );
    const numbered = $('main ol.ordered > li');
    assert.equal(numbered.length, metadata.articles.length, route);
    assert.deepEqual(
      numbered
        .find('a')
        .map((_, link) => $(link).attr('href'))
        .get(),
      metadata.articles.map((article) => articleRoute(article, language)),
      route,
    );
  }
});

test('the guide index lists every guide in order with its icon, cover, description and article count', () => {
  for (const language of languages) {
    const route = `/${language}/guides/`;
    const $ = page(route);
    const expected = guides.filter((guide) => guide.language === language);
    assert.equal($('main').length, 1, route);
    assert.equal($('h1').length, 1, route);
    assert.equal($('link[rel=canonical]').attr('href'), `${origin}${route}`);
    assert.equal(
      $('link[rel=alternate][hreflang=x-default]').attr('href'),
      `${origin}/en/guides/`,
    );
    const tiles = $('main li a');
    assert.deepEqual(
      tiles.map((_, tile) => $(tile).attr('href')).get(),
      expected.map((guide) => guide.route),
    );
    tiles.each((index, tile) => {
      const { metadata } = expected[index]!;
      assert.equal(
        $(tile).find('h2').text().trim(),
        `${metadata.icon} ${metadata.title}`,
      );
      assert.ok($(tile).text().includes(metadata.description), metadata.title);
      assert.ok(
        $(tile).text().includes(countLabel(metadata.articles.length, language)),
        `${route}: ${metadata.title} count`,
      );
      const cover = $(tile).find('img').attr('src') || '';
      assert.ok(cover.startsWith('/static/'), `${metadata.title}: ${cover}`);
      assert.ok(existsSync(join('public', decodeURI(cover))), cover);
    });
  }
});

test('guides are discoverable through the sitemap, search and llms.txt', async () => {
  const sitemap = readBuild('sitemap/sitemap-0.xml');
  const llms = readBuild('llms.txt');
  const manifest = JSON.parse(
    readBuild('search-index/manifest.json'),
  ) as Record<string, string>;
  for (const language of languages) {
    assert.ok(sitemap.includes(`<loc>${origin}/${language}/guides/</loc>`));
    const index = await loadIndex(readBuild(manifest[language]!));
    const searchable = new Set(
      index
        .search(MiniSearch.wildcard)
        .filter((document) => document.source === 'paths')
        .map((document) => document.path as string),
    );
    for (const guide of guides.filter((guide) => guide.language === language))
      assert.ok(searchable.has(guide.route), `Not searchable: ${guide.route}`);
  }
  for (const guide of guides) {
    assert.ok(
      sitemap.includes(`<loc>${origin}${guide.route}</loc>`),
      `Not in sitemap: ${guide.route}`,
    );
    assert.ok(
      llms.includes(`(${origin}${guide.route})`),
      `Not in llms.txt: ${guide.route}`,
    );
  }
});

test('article pages show their step in every guide that lists them and link to the next article', () => {
  const listed = new Set(guides.flatMap((guide) => guide.metadata.articles));
  for (const language of languages) {
    const { box, guide: guideLabel, step, next: nextLabel } = labels[language]!;
    for (const slug of listed) {
      const route = `/${language}/${slug}/`;
      if (!published(route)) continue;
      const containing = guides.filter(
        (guide) =>
          guide.language === language && guide.metadata.articles.includes(slug),
      );
      const $ = page(route);
      const lines = $(`main footer aside[aria-label="${box}"] li`);
      assert.equal(lines.length, containing.length, route);
      lines.each((index, line) => {
        const { metadata, route: guideRoute } = containing[index]!;
        const position = metadata.articles.indexOf(slug);
        const links = $(line).find('a');
        assert.equal(links.eq(0).attr('href'), guideRoute, route);
        assert.ok(
          $(line)
            .text()
            .startsWith(
              `${guideLabel}: ${metadata.title} — ${step
                .replace('{step}', String(position + 1))
                .replace('{total}', String(metadata.articles.length))}`,
            ),
          `${route}: ${$(line).text()}`,
        );
        const nextSlug = metadata.articles[position + 1];
        assert.equal(links.length, nextSlug ? 2 : 1, route);
        if (!nextSlug) return;
        const nextRoute = articleRoute(nextSlug, language);
        assert.equal(links.eq(1).attr('href'), nextRoute, route);
        assert.equal(
          links.eq(1).text(),
          `${nextLabel}: ${page(nextRoute)('h1').text().trim()}`,
          route,
        );
      });
    }
  }
  const unlisted = publishedContent('posts').find(
    (post) => !listed.has(post.route.split('/')[2]!),
  );
  assert.ok(unlisted);
  assert.equal(
    page(unlisted.route)(
      `main footer aside[aria-label="${labels[unlisted.language]!.box}"]`,
    ).length,
    0,
    unlisted.route,
  );
});
