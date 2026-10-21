import assert from 'node:assert/strict';
import { existsSync, globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import * as cheerio from 'cheerio';
import i18next from 'i18next';
import en from '../../src/i18n/locales/en/translation.json' with { type: 'json' };
import pl from '../../src/i18n/locales/pl/translation.json' with { type: 'json' };
import legacyCategoryUrls from '../fixtures/legacy-category-urls.json' with { type: 'json' };
import { tagDescription, tagLabel } from '../../src/utils/tag-label.ts';
import { tagSlug } from '../../src/utils/tag-slug.ts';
import { mergedTags } from '../../src/utils/tag-redirects.ts';
import { collectBuildContract } from '../../scripts/build-contract.ts';
import { builtRedirects, firstRedirect } from '../helpers/redirects.ts';
import {
  publishedContent,
  publishedTagFile,
  type PublishedDocument,
} from '../helpers/published-content.ts';

const origin = 'https://event-driven.io';
const languages = ['en', 'pl'];
const posts = publishedContent('posts');
const translations = i18next.createInstance();
await translations.init({
  resources: { en: { translation: en }, pl: { translation: pl } },
  fallbackLng: 'en',
});
const readBuild = (file: string) => readFileSync(join('dist', file), 'utf8');
const page = (route: string) => cheerio.load(readBuild(`${route}index.html`));
const routes = new Set(collectBuildContract('dist').routes);
const articleSlug = (post: PublishedDocument) => post.route.split('/')[2]!;

type ExpectedTagPage = {
  language: string;
  slug: string;
  tag: string;
  route: string;
  listed: PublishedDocument[];
};

// Read from source: a tag's articles are the canonical versions carrying it;
// each language lists those articles that have a route in that language.
function expectedTagPages(): ExpectedTagPage[] {
  const members = new Map<string, { tag: string; articles: Set<string> }>();
  for (const post of posts) {
    if (post.metadata.useDefaultLangCanonical) continue;
    for (const tag of post.metadata.tags || []) {
      const member = members.get(tagSlug(tag)) || { tag, articles: new Set() };
      member.articles.add(articleSlug(post));
      members.set(tagSlug(tag), member);
    }
  }
  return languages.flatMap((language) =>
    [...members].flatMap(([slug, { tag, articles }]) => {
      const listed = posts.filter(
        (post) => post.language === language && articles.has(articleSlug(post)),
      );
      return listed.length
        ? [
            {
              language,
              slug,
              tag,
              route: `/${language}/articles/tag/${slug}/`,
              listed,
            },
          ]
        : [];
    }),
  );
}
const tagPages = expectedTagPages();
const tagRoutes = new Set(tagPages.map(({ route }) => route));

const countLabel = (count: number, language: string) => {
  const words: Record<string, Record<string, string>> = {
    en: { one: 'article', other: 'articles' },
    pl: { one: 'artykuł', few: 'artykuły', many: 'artykułów' },
  };
  const form = new Intl.PluralRules(language).select(count);
  return `${count} ${words[language]![form]}`;
};

test('exactly the tags with an article route in a language have a tag page there', () => {
  assert.ok(tagPages.length > 0, 'No tag pages expected from source');
  assert.deepEqual(
    [...routes].filter((route) => route.includes('/articles/tag/')).sort(),
    [...tagRoutes].sort(),
  );
  for (const post of posts) {
    if (post.metadata.useDefaultLangCanonical) continue;
    for (const tag of post.metadata.tags || [])
      assert.ok(
        tagRoutes.has(`/${post.language}/articles/tag/${tagSlug(tag)}/`),
        `Missing tag page for ${post.route}: ${tag}`,
      );
  }
});

test('every tag page lists its articles newest first with its heading, description, count and metadata', () => {
  for (const { language, slug, tag, route, listed } of tagPages) {
    const t = translations.getFixedT(language);
    const $ = page(route);
    assert.equal($('html').attr('lang'), language, route);
    assert.equal($('main').length, 1, route);
    assert.equal($('h1').length, 1, route);
    assert.equal($('h1').text().trim(), tagLabel(t, tag), route);
    const tagFile = publishedTagFile(slug, language);
    const description = tagDescription(t, tag, tagFile?.description);
    if (tagFile?.body.trim())
      assert.equal($('main .bodytext').length, 1, `${route}: intro`);
    else assert.ok($('main').text().includes(description), route);
    assert.equal($('meta[name=description]').attr('content'), description);
    assert.ok(
      $('main').text().includes(countLabel(listed.length, language)),
      `${route}: ${countLabel(listed.length, language)}`,
    );
    const cards = $('.main li > a.link')
      .map((_, card) => $(card).attr('href'))
      .get();
    assert.deepEqual(
      [...cards].sort(),
      listed.map((post) => post.route).sort(),
      route,
    );
    const dates = cards.map(
      (card) => listed.find((post) => post.route === card)!.date,
    );
    assert.deepEqual(dates, [...dates].sort().reverse(), `${route}: order`);
    assert.equal($('main ol').length, 0, `${route}: no numbered list`);
    assert.equal($('link[rel=canonical]').attr('href'), `${origin}${route}`);
    assert.equal($('meta[name=robots]').length, 0, route);
    const alternates = $('link[rel=alternate][hreflang]')
      .map((_, link) => `${$(link).attr('hreflang')} ${$(link).attr('href')}`)
      .get();
    const both = languages.every((candidate) =>
      tagRoutes.has(`/${candidate}/articles/tag/${slug}/`),
    );
    assert.deepEqual(
      alternates,
      both
        ? [
            `x-default ${origin}/en/articles/tag/${slug}/`,
            `en ${origin}/en/articles/tag/${slug}/`,
            `pl ${origin}/pl/articles/tag/${slug}/`,
          ]
        : [],
      route,
    );
    assert.equal(
      (JSON.parse($('#page-schema').text()) as { '@type': string })['@type'],
      'CollectionPage',
      route,
    );
  }
});

test('tag pages are in the sitemap and no category URL is published', () => {
  const sitemap = collectBuildContract('dist').sitemapUrls;
  for (const route of tagRoutes)
    assert.ok(
      sitemap.includes(`${origin}${route}`),
      `Not in sitemap: ${route}`,
    );
  assert.deepEqual(
    sitemap.filter((url) => url.includes('/category/')),
    [],
  );
  assert.deepEqual(
    [...routes].filter((route) => route.includes('/category/')),
    [],
  );
});

const searchPaths = (language: string) => {
  const manifest = JSON.parse(
    readBuild('search-index/manifest.json'),
  ) as Record<string, string>;
  const index = JSON.parse(readBuild(manifest[language]!)) as {
    storedFields: Record<string, { path: string }>;
  };
  return new Set(Object.values(index.storedFields).map(({ path }) => path));
};

test('tag files publish no page, sitemap entry or search document of their own', () => {
  const sitemap = new Set(collectBuildContract('dist').sitemapUrls);
  const documents = new Set(
    [...posts, ...publishedContent('pages')].map(({ route }) => route),
  );
  for (const language of languages) {
    const searchable = searchPaths(language);
    for (const { slug } of tagPages.filter(
      (tagPage) => tagPage.language === language,
    )) {
      const route = `/${language}/${slug}/`;
      if (documents.has(route)) continue;
      assert.ok(!routes.has(route), `Tag file published: ${route}`);
      assert.ok(
        !sitemap.has(`${origin}${route}`),
        `Tag file in sitemap: ${route}`,
      );
      assert.ok(!searchable.has(route), `Tag file searchable: ${route}`);
    }
  }
});

test('every former category URL redirects permanently, in one hop, to a built page', async () => {
  const rules = await builtRedirects();
  const formerMerged = Object.entries(mergedTags).flatMap(
    ([former, canonical]) =>
      languages.map((language) => ({
        url: `/${language}/category/${tagSlug(former)}/`,
        slug: tagSlug(canonical),
        language,
      })),
  );
  const formerTags = tagPages.map(({ language, slug }) => ({
    url: `/${language}/category/${slug}/`,
    slug,
    language,
  }));
  for (const url of [
    ...legacyCategoryUrls,
    ...formerMerged.map(({ url }) => url),
  ]) {
    assert.ok(!routes.has(url), `Still published: ${url}`);
    for (const language of [undefined, ...languages]) {
      const rule = firstRedirect(rules, url, { language });
      assert.ok(rule, `No redirect for ${url}`);
      assert.equal(rule.status, 301, url);
      assert.ok(routes.has(rule.to), `${url} -> ${rule.to} is not a page`);
    }
  }
  // The tag page of the same language wins; otherwise the English one.
  for (const { url, slug, language } of [...formerTags, ...formerMerged]) {
    const own = `/${language}/articles/tag/${slug}/`;
    const english = `/en/articles/tag/${slug}/`;
    if (!tagRoutes.has(own) && !tagRoutes.has(english)) continue;
    assert.equal(
      firstRedirect(rules, url)?.to,
      tagRoutes.has(own) ? own : english,
      url,
    );
  }
  for (const language of languages)
    assert.equal(
      firstRedirect(rules, `/${language}/category/`)?.to,
      `/${language}/guides/`,
    );
  assert.equal(firstRedirect(rules, '/category/')?.to, '/en/guides/');
  assert.equal(
    firstRedirect(rules, '/category/', { language: 'pl' })?.to,
    '/pl/guides/',
  );
  assert.equal(
    firstRedirect(rules, '/guides/', { language: 'pl' })?.to,
    '/pl/guides/',
  );
});

test('legacy category queries reach their tag page directly, ahead of the index redirect', async () => {
  const rules = await builtRedirects();
  const queries = rules.filter((rule) => rule.query.category);
  assert.ok(queries.length > 0, 'Expected legacy category query redirects');
  for (const rule of queries) {
    assert.equal(firstRedirect(rules, rule.from, { query: rule.query }), rule);
    const language = rule.from.split('/')[1]!;
    const canonical = mergedTags[rule.query.category!] || rule.query.category!;
    const slug = tagSlug(canonical);
    const own = `/${language}/articles/tag/${slug}/`;
    assert.ok(routes.has(rule.to), `${rule.to} is not a page`);
    assert.ok(rule.to.endsWith(`/articles/tag/${slug}/`), rule.to);
    if (tagRoutes.has(own)) assert.equal(rule.to, own, rule.query.category);
  }
});

test('every internal tag link in the built site leads to a built tag page, and authored category links redirect to one', async () => {
  const rules = await builtRedirects();
  let links = 0;
  for (const file of globSync([
    'dist/en/**/index.html',
    'dist/pl/**/index.html',
  ])) {
    const $ = cheerio.load(readFileSync(file, 'utf8'));
    $('a[href]').each((_, link) => {
      const href = $(link).attr('href')!;
      const path = href.split('#')[0]!;
      if (path.includes('/category/')) {
        const target = firstRedirect(rules, path)?.to;
        assert.ok(target && routes.has(target), `${file}: ${href}`);
        return;
      }
      if (!/^\/(en|pl)\/articles\/tag\//.test(href)) return;
      links++;
      assert.ok(
        existsSync(join('dist', href, 'index.html')),
        `${file}: ${href}`,
      );
    });
  }
  assert.ok(links > 0, 'Expected tag links');
});

test('the article archive offers every tag page of its language, most used first', () => {
  for (const language of languages) {
    const t = translations.getFixedT(language);
    const $ = page(`/${language}/articles/`);
    const expected = tagPages
      .filter((tagPage) => tagPage.language === language)
      .map(({ tag, route, listed }) => ({
        route,
        label: tagLabel(t, tag),
        count: listed.length,
      }))
      .sort(
        (left, right) =>
          right.count - left.count ||
          left.label.localeCompare(right.label, language),
      );
    assert.deepEqual(
      $(`nav[aria-label="${t('tags.browse')}"] a`)
        .map((_, link) => `${$(link).attr('href')} ${$(link).text().trim()}`)
        .get(),
      expected.map(({ route, label }) => `${route} ${label}`),
      language,
    );
  }
});

test('tags are searchable and lead to their tag page', () => {
  const manifest = JSON.parse(
    readBuild('search-index/manifest.json'),
  ) as Record<string, string>;
  for (const language of languages) {
    const index = JSON.parse(readBuild(manifest[language]!)) as {
      storedFields: Record<string, { source: string; path: string }>;
    };
    const searchable = new Set(
      Object.values(index.storedFields)
        .filter(({ source }) => source === 'tags')
        .map(({ path }) => path),
    );
    for (const { route } of tagPages.filter(
      (tagPage) => tagPage.language === language,
    ))
      assert.ok(searchable.has(route), `Not searchable: ${route}`);
    for (const path of searchable)
      assert.ok(tagRoutes.has(path), `Search leads nowhere: ${path}`);
  }
});
