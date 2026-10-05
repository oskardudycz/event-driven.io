import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import cheerio from 'cheerio';
import imagePriority from '../plugins/gatsby-remark-image-priority/index.js';

const html = (route) => cheerio.load(readFileSync(join('public', route, 'index.html'), 'utf8'));

for (const lang of ['en', 'pl']) {
  test(`${lang} Introduction has a priority cover, WebP fallback and lazy later images`, () => {
    const $ = html(`${lang}/introduction_to_event_sourcing`);
    const images = $('img.gatsby-resp-image-image');
    assert.ok(images.length >= 1);
    assert.equal(images.first().attr('loading'), 'eager');
    assert.equal(images.first().attr('fetchpriority'), 'high');
    assert.equal($('img[fetchpriority=high]').length, 1);
    images.slice(1).each((_, image) => assert.equal($(image).attr('loading'), 'lazy'));
    const picture = images.first().closest('picture');
    assert.ok(picture.find('source[type="image/webp"]').attr('srcset'));
    assert.ok(picture.find('source[type="image/png"]').attr('srcset'));
  });

  for (const page of ['', 'articles', 'newsletter-pl', 'training']) {
    test(`${lang}/${page} preloads only existing body/heading fonts and keeps intrinsic portrait dimensions`, () => {
      const $ = html(`${lang}/${page}`);
      const fonts = $('link[rel="preload"][as="font"]');
      assert.equal(fonts.length, 2);
      fonts.each((_, font) => {
        assert.equal($(font).attr('crossorigin'), 'anonymous');
        assert.ok(existsSync(join('public', $(font).attr('href'))));
      });
      const portrait = $('header .logo img');
      assert.equal(portrait.attr('width'), '180');
      assert.equal(portrait.attr('height'), '180');
    });
  }
}

test('image priority ignores unrelated articles, external HTML and later images', () => {
  const value =
    '<picture><img class="gatsby-resp-image-image" src="/2022-03-16-cover.png" loading="lazy"></picture>';
  const ast = { type: 'root', children: [{ type: 'html', value }] };
  imagePriority({ markdownAST: ast, markdownNode: { fileAbsolutePath: '/other/index.en.md' } });
  assert.equal(ast.children[0].value, value);
  const external = '<iframe src="https://example.com"></iframe>';
  ast.children.unshift({ type: 'html', value: external });
  ast.children.push({ type: 'html', value });
  imagePriority({
    markdownAST: ast,
    markdownNode: { fileAbsolutePath: '/2022-03-16--introduction_to_event_sourcing/index.en.md' },
  });
  assert.equal(ast.children[0].value, external);
  assert.match(ast.children[1].value, /fetchpriority="high"/);
  assert.equal(ast.children[2].value, value);
});

test('menu measures every item before hiding overflow and preserves exact-fit/more items', async () => {
  const { getOverflowedItems } = await import('../src/components/Menu/overflow.mjs');
  for (const reservedWidth of [0, 60]) {
    const operations = [];
    const items = [40, 40, 30, 20].map((width, index) => ({
      get offsetWidth() {
        operations.push(`read:${index}`);
        return width;
      },
      classList: {
        add: (name) => operations.push(`write:${index}:${name}`),
        remove: (name) => operations.push(`write:${index}:${name}`),
        contains: (name) => name === 'more' && index === 3,
      },
      querySelector: () => ({ getAttribute: () => `/item-${index}/`, text: `Item ${index}` }),
    }));
    const hidden = getOverflowedItems({ offsetWidth: 80 + reservedWidth }, items, reservedWidth);
    assert.deepEqual(hidden, [{ to: '/item-2/', label: 'Item 2' }]);
    const firstRead = operations.findIndex((operation) => operation.startsWith('read:'));
    assert.deepEqual(operations.slice(firstRead, firstRead + items.length), [
      'read:0',
      'read:1',
      'read:2',
      'read:3',
    ]);
    assert.ok(operations.slice(0, firstRead).every((operation) => operation.startsWith('write:')));
    assert.ok(
      operations
        .slice(firstRead + items.length)
        .every((operation) => operation.startsWith('write:')),
    );
  }
});

test('all other Markdown images retain lazy loading and WebP with a fallback', () => {
  let checked = 0;
  for (const entry of readdirSync('public', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || entry.name !== 'index.html' || entry.parentPath.includes('_gatsby'))
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
      if (!/\.webp(?:$|\?)/i.test(img.attr('src'))) {
        assert.ok(sources.filter('[type="image/png"], [type="image/jpeg"]').length, path);
      }
      checked++;
    });
  }
  assert.ok(checked > 100, 'must inspect real generated image output');
});

test("Introduction WebP preserves the PNG cover's dimensions and visual detail while reducing bytes", async () => {
  const { default: sharp } = await import('sharp');
  const { default: pixelmatch } = await import('pixelmatch');
  const $ = html('en/introduction_to_event_sourcing');
  const picture = $('img.gatsby-resp-image-image').first().closest('picture');
  const asset = (type) => {
    const candidate = picture
      .find(`source[type="${type}"]`)
      .attr('srcset')
      .split(',')
      .map((value) => value.trim().split(/\s+/))
      .find(([, width]) => width === '800w');
    assert.ok(candidate, `${type} 800px candidate`);
    return readFileSync(join('public', candidate[0]));
  };
  const png = asset('image/png');
  const webp = asset('image/webp');
  assert.ok(webp.length < png.length, 'optimized cover must actually save bytes');
  const original = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const optimized = await sharp(webp).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual(optimized.info, original.info);
  const { width, height } = original.info;
  const differences = pixelmatch(original.data, optimized.data, null, width, height, {
    threshold: 0.2,
  });
  assert.ok(
    differences / (width * height) <= 0.03,
    'cover detail must remain within existing screenshot tolerance',
  );
});

test('font CSS includes basic and extended Latin files for every weight/style', () => {
  const css = readFileSync('public/fonts/open-sans/index.css', 'utf8');
  const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map((match) => match[1]);
  assert.equal(faces.length, 20);
  for (const weight of [300, 400, 600, 700, 800]) {
    for (const style of ['normal', 'italic']) {
      const matching = faces.filter(
        (face) =>
          face.includes(`font-weight: ${weight};`) && face.includes(`font-style: ${style};`),
      );
      assert.equal(matching.length, 2);
      assert.ok(matching.some((face) => /open-sans-latin-ext-/.test(face)));
      assert.ok(matching.every((face) => /unicode-range:/.test(face) && !/local\(/.test(face)));
      for (const face of matching) {
        for (const [, file] of face.matchAll(/url\('\.\/(.*?)'\)/g)) {
          assert.ok(existsSync(join('public/fonts/open-sans', file)), file);
        }
      }
    }
  }
});

test('publication metadata preserves legacy dates and accepts only real timezone timestamps', async () => {
  const { publicationDate } = await import('../src/utils/publication-date.mjs');
  assert.equal(publicationDate(undefined, '2022-03-16'), '2022-03-16');
  assert.equal(publicationDate(null, '2022-03-16'), '2022-03-16');
  for (const date of ['2026-10-05T12:34:56Z', '2026-10-05T12:34:56.123+02:00']) {
    assert.equal(publicationDate(date, '2022-03-16'), date);
  }
  for (const date of [
    '',
    '2026-10-05',
    '2026-10-05T12:34:56',
    '2026-02-30T12:34:56Z',
    '2026-10-05T25:00:00Z',
    'bad',
  ]) {
    assert.throws(() => publicationDate(date, '2022-03-16'), /publishedAt/);
  }
  for (const lang of ['en', 'pl']) {
    const $ = html(`${lang}/introduction_to_event_sourcing`);
    assert.equal(JSON.parse($('#page-schema').text()).datePublished, '2022-03-16');
    assert.equal($('meta[property="article:published_time"]').attr('content'), '2022-03-16');
    assert.equal($('#substack iframe[src]').length, 0);
    assert.equal($('#substack iframe').attr('height'), '320');
    assert.equal(
      $('#substack a.subscription-fallback').attr('href'),
      'https://www.architecture-weekly.com/subscribe',
    );
  }
});

test('contrast text tokens preserve decorative branding and meet 4.5:1 on white', async () => {
  const { default: yaml } = await import('js-yaml');
  const theme = yaml.load(readFileSync('src/theme/theme.yaml', 'utf8'));
  assert.equal(theme.background.color.brand, '#709425');
  assert.equal(theme.color.brand.primary, '#709425');
  assert.equal(theme.icon.color, '#709425');
  assert.equal(theme.text.color.brand, '#55701c');
  assert.equal(theme.blog.h1.hoverColor, '#55701c');
  const contrast = (color) => {
    const channels = color
      .slice(1)
      .match(/../g)
      .map((value) => parseInt(value, 16) / 255);
    const linear = channels.map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
    return 1.05 / (linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722 + 0.05);
  };
  assert.ok(contrast(theme.text.color.brand) >= 4.5);
  assert.ok(contrast(theme.color.neutral.gray.h) >= 4.5);
});

test('article Head emits the actual timestamp in both schema and Open Graph', async () => {
  const { createRequire, Module } = await import('node:module');
  const { resolve } = await import('node:path');
  const require = createRequire(resolve('src/components/Seo/Seo.js'));
  const { transformSync } = require('@babel/core');
  const { renderToStaticMarkup } = require('react-dom/server');
  const React = require('react');
  const filename = resolve('src/components/Seo/Seo.test.cjs');
  const compiled = new Module(filename);
  compiled.filename = filename;
  compiled.require = (id) => {
    if (id === 'gatsby') return { withPrefix: (value) => value };
    if (id === '../../i18n/constants')
      return { DEFAULT_OPTIONS: { i18nextConfig: { resources: {}, fallbackLng: 'en' } } };
    return require(id);
  };
  compiled._compile(
    transformSync(readFileSync('src/components/Seo/Seo.js', 'utf8'), {
      babelrc: false,
      configFile: false,
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
        '@babel/preset-react',
      ],
    }).code,
    compiled.filename,
  );
  const timestamp = '2026-10-05T12:34:56+02:00';
  const render = (publishedAt) =>
    cheerio.load(
      renderToStaticMarkup(
        React.createElement(compiled.exports.default, {
          pageContext: { lang: 'en', originalPath: '/example/', supportedLanguages: ['en', 'pl'] },
          schemaType: 'BlogPosting',
          data: {
            fields: { prefix: '2022-03-16', source: 'posts' },
            frontmatter: { title: 'Example', description: 'Example article', publishedAt },
          },
        }),
      ),
    );
  const $ = render(timestamp);
  assert.equal(JSON.parse($('#page-schema').text()).datePublished, timestamp);
  assert.equal($('meta[property="article:published_time"]').attr('content'), timestamp);
  const legacy = render(undefined);
  assert.equal(JSON.parse(legacy('#page-schema').text()).datePublished, '2022-03-16');
  assert.throws(() => render('2026-10-05T12:34:56'), /publishedAt/);
});
