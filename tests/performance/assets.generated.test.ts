import type { BuildPageData } from '../helpers/build-output.ts';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import * as cheerio from 'cheerio';
import postcss from 'postcss';

const html = (route: string) =>
  cheerio.load(readFileSync(join('public', route, 'index.html'), 'utf8'));

for (const lang of ['en', 'pl']) {
  test(`${lang} Introduction has a priority cover, WebP fallback and lazy later images`, () => {
    const $ = html(`${lang}/introduction_to_event_sourcing`);
    const images = $('img.gatsby-resp-image-image');
    assert.ok(images.length >= 1);
    assert.equal(images.first().attr('loading'), 'eager');
    assert.equal(images.first().attr('fetchpriority'), 'high');
    assert.equal($('img[fetchpriority=high]').length, 1);
    images
      .slice(1)
      .each((_, image) => assert.equal($(image).attr('loading'), 'lazy'));
    const picture = images.first().closest('picture');
    assert.ok(picture.find('source[type="image/webp"]').attr('srcset'));
    assert.ok(picture.find('source[type="image/png"]').attr('srcset'));
  });

  for (const page of ['', 'articles', 'newsletter-pl', 'training']) {
    test(`${lang}/${page} preloads only existing body/heading fonts and keeps intrinsic portrait dimensions`, () => {
      const $ = html(`${lang}/${page}`);
      const fonts = $('link[rel="preload"][as="font"]');
      assert.equal(fonts.length, lang === 'pl' ? 4 : 2);
      const extended = fonts.filter((_, font) =>
        $(font).attr('href')!.includes('-latin-ext-'),
      );
      assert.equal(extended.length, lang === 'pl' ? 2 : 0);
      fonts.each((_, font) => {
        assert.equal($(font).attr('crossorigin'), 'anonymous');
        assert.ok(existsSync(join('public', $(font).attr('href')!)));
      });
      const portrait = $('header img[alt="Event-Driven by Oskar Dudycz"]');
      assert.equal(portrait.attr('width'), '180');
      assert.equal(portrait.attr('height'), '180');
    });
  }
}

test('all other Markdown images retain lazy loading and WebP with a fallback', () => {
  let checked = 0;
  for (const entry of readdirSync('public', {
    recursive: true,
    withFileTypes: true,
  })) {
    if (
      !entry.isFile() ||
      entry.name !== 'index.html' ||
      entry.parentPath.includes('_gatsby')
    )
      continue;
    const path = join(entry.parentPath, entry.name);
    const $ = cheerio.load(readFileSync(path, 'utf8'));
    $('img.gatsby-resp-image-image').each((_, image) => {
      const img = $(image);
      if (img.attr('fetchpriority') === 'high') {
        assert.match(path, /introduction_to_event_sourcing/);
      } else {
        assert.equal(img.attr('loading'), 'lazy', path);
      }
      const sources = img.closest('picture').find('source');
      assert.ok(sources.filter('[type="image/webp"]').length, path);
      assert.ok(img.attr('src'), `fallback img src: ${path}`);
      if (!/\.webp(?:$|\?)/i.test(img.attr('src')!)) {
        assert.ok(
          sources.filter('[type="image/png"], [type="image/jpeg"]').length,
          path,
        );
      }
      checked++;
    });
  }
  assert.ok(checked > 0, 'must inspect real generated image output');
});

test('article card covers are published only as WebP', () => {
  const srcsetUrls = (srcset = '') =>
    srcset
      .split(',')
      .map((candidate) => candidate.trim().split(/\s+/)[0])
      .filter((url): url is string => !!url);
  const pages = new Set<string>();
  let checked = 0;
  for (const entry of readdirSync('public', {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile() || entry.name !== 'index.html') continue;
    const path = join(entry.parentPath, entry.name);
    const $ = cheerio.load(readFileSync(path, 'utf8'));
    $('a.link [data-gatsby-image-wrapper]').each((_, wrapper) => {
      const picture = $(wrapper);
      const image = picture.find('img[data-main-image]');
      const urls = [
        image.attr('src') || image.attr('data-src'),
        ...srcsetUrls(image.attr('srcset') || image.attr('data-srcset')),
        ...picture
          .find('source')
          .map((_, source) =>
            srcsetUrls(
              $(source).attr('srcset') || $(source).attr('data-srcset'),
            ),
          )
          .get(),
      ];
      assert.ok(urls.length > 1, path);
      for (const url of urls) assert.match(url ?? '', /\.webp$/, path);
      pages.add(entry.parentPath);
      checked++;
    });
  }
  assert.ok(checked > 0, 'must inspect real generated cover output');
  for (const listing of [
    'public/en',
    'public/en/articles',
    'public/pl/articles/tag/event-sourcing',
  ])
    assert.ok(pages.has(listing), `${listing} must show covers`);
});

test("Introduction WebP preserves the PNG cover's dimensions and visual detail while reducing bytes", async () => {
  const { default: sharp } = await import('sharp');
  const { default: pixelmatch } = await import('pixelmatch');
  const $ = html('en/introduction_to_event_sourcing');
  const picture = $('img.gatsby-resp-image-image').first().closest('picture');
  const asset = (type: string) => {
    const candidate = picture
      .find(`source[type="${type}"]`)
      .attr('srcset')!
      .split(',')
      .map((value) => value.trim().split(/\s+/))
      .find(([, width]) => width === '800w');
    assert.ok(candidate?.[0], `${type} 800px candidate`);
    return readFileSync(join('public', candidate[0]));
  };
  const png = asset('image/png');
  const webp = asset('image/webp');
  assert.ok(
    webp.length < png.length,
    'optimized cover must actually save bytes',
  );
  const original = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const optimized = await sharp(webp)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.deepEqual(optimized.info, original.info);
  const { width, height } = original.info;
  const differences = pixelmatch(
    original.data,
    optimized.data,
    undefined,
    width,
    height,
    {
      threshold: 0.2,
    },
  );
  assert.ok(
    differences / (width * height) <= 0.03,
    'cover detail must remain within existing screenshot tolerance',
  );
});

test('font CSS includes basic and extended Latin files for every weight/style', () => {
  const css = readFileSync('public/fonts/open-sans/index.css', 'utf8');
  const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(
    (match) => match[1] || '',
  );
  assert.equal(faces.length, 20);
  for (const weight of [300, 400, 600, 700, 800]) {
    for (const style of ['normal', 'italic']) {
      const matching = faces.filter(
        (face) =>
          face.includes(`font-weight: ${weight};`) &&
          face.includes(`font-style: ${style};`),
      );
      assert.equal(matching.length, 2);
      assert.ok(matching.some((face) => /open-sans-latin-ext-/.test(face)));
      assert.ok(
        matching.every(
          (face) => /unicode-range:/.test(face) && !/local\(/.test(face),
        ),
      );
      for (const face of matching) {
        for (const [, file] of face.matchAll(/url\('\.\/(.*?)'\)/g)) {
          assert.ok(file);
          assert.ok(existsSync(join('public/fonts/open-sans', file)), file);
        }
      }
    }
  }
});

test('published metadata matches article dates and newsletter defers its iframe', async () => {
  const { publicationDate } =
    await import('../../src/utils/publication-date.ts');
  for (const lang of ['en', 'pl']) {
    const $ = html(`${lang}/introduction_to_event_sourcing`);
    const data = JSON.parse(
      readFileSync(
        `public/page-data/${lang}/introduction_to_event_sourcing/page-data.json`,
        'utf8',
      ),
    ) as BuildPageData;
    assert.equal(
      (JSON.parse($('#page-schema').text()) as { datePublished: string })
        .datePublished,
      publicationDate(
        data.result.data.post.frontmatter.publishedAt,
        data.result.data.post.fields.prefix,
      ),
    );
    assert.equal(
      $('meta[property="article:published_time"]').attr('content'),
      publicationDate(
        data.result.data.post.frontmatter.publishedAt,
        data.result.data.post.fields.prefix,
      ),
    );
    assert.equal($('#substack iframe[src]').length, 0);
    assert.equal($('#substack iframe').attr('height'), '320');
    assert.equal(
      $('#substack a.subscription-fallback').attr('href'),
      'https://www.architecture-weekly.com/subscribe',
    );
  }
});

for (const theme of ['light', 'dark'])
  test(`${theme} brand and muted text meet 4.5:1 against the page background`, () => {
    const stylesheet = postcss.parse(html('en')('style[data-href]').text());
    const tokens = new Map<string, string>();
    stylesheet.walkDecls((declaration) => {
      if (
        declaration.parent?.type === 'rule' &&
        (declaration.parent.selector === ':root' ||
          (theme === 'dark' &&
            declaration.parent.selector.replace(/["']/g, '') ===
              ':root[data-theme=dark]')) &&
        declaration.prop.startsWith('--')
      )
        tokens.set(declaration.prop, declaration.value);
    });
    const luminance = (name: string) => {
      let color = tokens.get(name);
      const reference = color?.match(/^var\((--[\w-]+)\)$/);
      if (reference) color = tokens.get(reference[1]!);
      assert.ok(color && /^#[a-f0-9]{3}(?:[a-f0-9]{3})?$/i.test(color), name);
      const hex = color.slice(1);
      const expanded =
        hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
      const channels = expanded
        .match(/../g)!
        .map((value) => parseInt(value, 16) / 255);
      const linear = channels.map((value) =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
      );
      const [red, green, blue] = linear;
      if (red === undefined || green === undefined || blue === undefined)
        throw new Error('Expected three RGB channels');
      return red * 0.2126 + green * 0.7152 + blue * 0.0722;
    };
    const background = luminance('--color-surface');
    for (const name of ['--text-color-brand', '--color-text-muted']) {
      const foreground = luminance(name);
      const contrast =
        (Math.max(background, foreground) + 0.05) /
        (Math.min(background, foreground) + 0.05);
      assert.ok(contrast >= 4.5, `${name}: ${contrast}`);
    }
  });

test('generated pages never reference local filesystem URLs in resource/link attributes', () => {
  const pages = readdirSync('public', { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => join(entry.parentPath, entry.name));
  assert.ok(pages.length > 0, 'build the production site first');
  for (const file of pages) {
    const $ = cheerio.load(readFileSync(file, 'utf8'));
    $('[href],[src],[data]').each((_, element) => {
      for (const attribute of ['href', 'src', 'data']) {
        const value = $(element).attr(attribute);
        assert.ok(
          !value || !/^\s*file:/i.test(value),
          `${file}: ${attribute}=${value}`,
        );
      }
    });
  }
});
