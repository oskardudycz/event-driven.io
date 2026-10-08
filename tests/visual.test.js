import { afterAll, beforeAll, expect, test } from 'vitest';
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const baseUrl = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:9000';
const updateSnapshots = process.env.UPDATE_VISUAL_SNAPSHOTS === '1';
const artifacts = join(process.cwd(), 'visual-artifacts');
const snapshots = join(process.cwd(), 'tests', 'fixtures', 'visual');
let browser;

beforeAll(async () => {
  await mkdir(artifacts, { recursive: true });
  browser = await chromium.launch();
}, 30_000);

afterAll(async () => {
  await browser?.close();
});

test('persistent menu keeps current language, page destinations and overflow icons after navigation and resizing', async () => {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    try {
      await page.route('**/*', (route) => {
        const request = new URL(route.request().url());
        return request.origin === new URL(baseUrl).origin ? route.continue() : route.abort();
      });
      await page.goto(new URL('/en/articles/', baseUrl).href, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForFunction(() => document.documentElement.dataset.font400 === 'loaded');
      const menu = page.locator('nav.menu');
      const expand = menu.getByRole('button', { name: 'expand' });
      await expand.waitFor();
      await expand.click();
      await expect.poll(() => expand.getAttribute('aria-expanded')).toBe('true');

      await menu.getByRole('link', { name: 'Change language to pl' }).click();
      await page.waitForURL('**/pl/articles/');
      await expect.poll(() => page.locator('html').getAttribute('lang')).toBe('pl');
      await expect.poll(() => expand.getAttribute('aria-expanded')).toBe('false');
      await expand.click();

      const visibleItems =
        width < 1024 ? menu.locator('.itemList') : menu.locator('.hiddenItemList');
      const talks = visibleItems.locator('a[data-slug="/talks/"]');
      await expect.poll(async () => (await talks.innerText()).trim()).toBe('Wystąpienia');
      expect(await talks.getAttribute('href')).toBe('/pl/talks/');
      for (const host of ['linkedin.com', 'github.com', 'hachyderm.io', 'bsky.app']) {
        const social = visibleItems.locator(`a[href*="${host}"]`);
        expect(await social.isVisible()).toBe(true);
        expect(await social.locator('svg').count()).toBe(1);
      }

      await expand.click();
      await expect.poll(() => expand.getAttribute('aria-expanded')).toBe('false');
      await page.setViewportSize({ width: width < 1024 ? 1280 : 390, height: 900 });
      await expect.poll(() => talks.isVisible()).toBe(false);
      await expand.click();
      const resizedItems =
        width < 1024 ? menu.locator('.hiddenItemList') : menu.locator('.itemList');
      const consulting = menu.locator('.itemList a[href="/pl/consulting/"]');
      expect(await consulting.getAttribute('href')).toBe('/pl/consulting/');
      await expect
        .poll(async () => (await resizedItems.locator('a[data-slug="/talks/"]').innerText()).trim())
        .toBe('Wystąpienia');

      await menu.getByRole('link', { name: 'Change language to en' }).click();
      await page.waitForURL('**/en/articles/');
      await expect.poll(() => page.locator('html').getAttribute('lang')).toBe('en');
      await expect.poll(() => expand.getAttribute('aria-expanded')).toBe('false');
      await expand.click();
      await expect
        .poll(async () =>
          (await menu.getByRole('link', { name: 'Talks', exact: true }).innerText()).trim(),
        )
        .toBe('Talks');
      expect(await menu.locator('.itemList a[href="/en/consulting/"]').getAttribute('href')).toBe(
        '/en/consulting/',
      );
    } finally {
      await page.close();
    }
  }
}, 60_000);

test('article video references remain links and players have accessible titles in both languages', async () => {
  const page = await browser.newPage();
  try {
    await page.route('**/*', (route) => {
      const request = new URL(route.request().url());
      return request.origin === new URL(baseUrl).origin ? route.continue() : route.abort();
    });
    for (const path of ['/en/women_in_it/', '/pl/mezczyzna_w_it/']) {
      await page.goto(new URL(path, baseUrl).href, { waitUntil: 'domcontentloaded' });
      const reference = page.getByRole('link', {
        name: 'Heather Wilde - How to Close the Diversity Gap',
      });
      await reference.waitFor();
      expect(await reference.getAttribute('href')).toBe(
        'https://www.youtube.com/watch?v=JQL4doMy73w',
      );
      expect(await page.locator('iframe[src*="JQL4doMy73w"]').count()).toBe(0);
      expect(await page.locator('.bodytext').innerText()).not.toContain('youtube:');
    }
    for (const language of ['en', 'pl']) {
      await page.goto(
        new URL(
          `/${language}/what_does_mr_bean_opening_the_car_have_to_do_with_programming/`,
          baseUrl,
        ).href,
        {
          waitUntil: 'domcontentloaded',
        },
      );
      const player = page.locator('iframe[src*="youtube-nocookie.com/embed/GOd7oj1AT00"]');
      await player.waitFor({ state: 'attached' });
      expect(await player.count()).toBe(1);
      expect(await player.getAttribute('title')).toBe('Mr Bean');
    }
  } finally {
    await page.close();
  }
}, 60_000);

test('normalized article links hydrate with clean canonicals and keep existing comment IDs', async () => {
  const page = await browser.newPage();
  try {
    await page.route('**/*', (route) => {
      const request = new URL(route.request().url());
      return request.origin === new URL(baseUrl).origin ? route.continue() : route.abort();
    });
    await page.goto(new URL('/en/testing_event_sourcing_emmett_edition/', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForFunction(() => document.documentElement.dataset.font400 === 'loaded');
    const link = page
      .locator('.bodytext a[href="/en/type_script_node_js_event_sourcing/"]')
      .first();
    // Follow a real Markdown link through Gatsby's client-side navigation.
    await link.click();
    await page.waitForURL('**/en/type_script_node_js_event_sourcing/');
    await expect.poll(() => page.locator('html').getAttribute('lang')).toBe('en');
    await expect
      .poll(() => page.locator('head link[rel="canonical"]').getAttribute('href'))
      .toBe('https://event-driven.io/en/type_script_node_js_event_sourcing/');
    expect(await page.locator('h1').count()).toBe(1);
    await page.waitForFunction(() => typeof window.disqus_config === 'function');
    const identifier = await page.evaluate(() => {
      const config = { page: {}, callbacks: {} };
      window.disqus_config.call(config);
      return config.page.identifier;
    });
    expect(identifier).toBe('/type_script_node_Js_event_sourcing/');
    expect(await page.locator('link#site-fonts').count()).toBe(1);
  } finally {
    await page.close();
  }
}, 60_000);

test('Introduction newsletter defers its request and loads automatically on scroll', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const requests = [];
  let pendingRequestStarted = false;
  let releasePendingRequest;
  let pendingRequestFinished;
  const pendingRequest = new Promise((resolve) => {
    releasePendingRequest = resolve;
  });
  try {
    // Keep a request open to reproduce the CI failure: readiness must not
    // depend on analytics/comments or any other network activity stopping.
    await page.route('**/__visual_pending_request__', async (route) => {
      pendingRequestStarted = true;
      pendingRequestFinished = pendingRequest.then(() => route.fulfill({ body: 'ready' }));
      await pendingRequestFinished;
    });
    await page.addInitScript(() => {
      if (window !== window.top) return;
      document.addEventListener(
        'DOMContentLoaded',
        () => {
          fetch('/__visual_pending_request__').catch(() => {});
        },
        { once: true },
      );
    });
    await page.route('https://www.architecture-weekly.com/embed', async (route) => {
      requests.push(route.request().url());
      await route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><html><body>Newsletter form</body></html>',
      });
    });
    await page.goto(new URL('/en/introduction_to_event_sourcing/', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      getComputedStyle(document.body).fontFamily.includes('Open Sans'),
    );
    await expect.poll(() => pendingRequestStarted).toBe(true);
    const iframe = page.locator('#substack iframe');
    await iframe.waitFor({ state: 'attached' });
    expect(await iframe.getAttribute('loading')).toBe('lazy');
    expect(await iframe.getAttribute('title')).toBe('Subscribe to Architecture Weekly');
    expect(requests).toHaveLength(0);
    await iframe.scrollIntoViewIfNeeded();
    await expect.poll(() => requests.length).toBe(1);
    await expect
      .poll(() => page.frameLocator('#substack iframe').locator('body').innerText())
      .toBe('Newsletter form');
  } finally {
    releasePendingRequest();
    await pendingRequestFinished;
    await page.close();
  }
}, 60_000);

test('training pages retain one main heading after hydration and language navigation', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(new URL('/pl/training/', baseUrl).href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() =>
      getComputedStyle(document.body).fontFamily.includes('Open Sans'),
    );
    expect(await page.locator('h1').count()).toBe(1);
    expect(await page.locator('h1').innerText()).toBe('Szkolenie');
    await page.locator('a[href="/en/training/"]').first().click();
    await page.waitForURL('**/en/training/');
    await expect.poll(() => page.locator('h1').allTextContents()).toEqual(['Training']);
    await page.reload({ waitUntil: 'domcontentloaded' });
    expect(await page.locator('h1').count()).toBe(1);
    expect(await page.locator('h1').innerText()).toBe('Training');
  } finally {
    await page.close();
  }
}, 60_000);

async function compareScreenshot(page, name, options = {}) {
  const screenshot = await page.screenshot(options);
  await writeFile(join(artifacts, `${name}.png`), screenshot);
  const referencePath = join(snapshots, `${name}.png`);
  if (updateSnapshots) {
    await mkdir(snapshots, { recursive: true });
    await writeFile(referencePath, screenshot);
    return;
  }

  const expected = PNG.sync.read(await readFile(referencePath));
  const current = PNG.sync.read(screenshot);
  expect([current.width, current.height]).toEqual([expected.width, expected.height]);
  const difference = new PNG({ width: current.width, height: current.height });
  const differentPixels = pixelmatch(
    expected.data,
    current.data,
    difference.data,
    current.width,
    current.height,
    { threshold: 0.2 },
  );
  const differenceRatio = differentPixels / (current.width * current.height);
  if (differenceRatio > 0.03) {
    await writeFile(join(artifacts, `${name}-diff.png`), PNG.sync.write(difference));
  }
  expect(differenceRatio).toBeLessThanOrEqual(0.03);
}

async function inspectArchive() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    const response = await page.goto(new URL('/en/articles/', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBe(200);
    const firstCover = page.locator('.gatsby-image-wrapper img[data-main-image]').first();
    await firstCover.waitFor();
    await page.waitForFunction(
      (image) => image.complete && image.naturalWidth >= 200,
      await firstCover.elementHandle(),
      { timeout: 15_000 },
    );
    await page.waitForFunction(
      (image) => getComputedStyle(image).opacity === '1',
      await firstCover.elementHandle(),
      { timeout: 5_000 },
    );
    await page.waitForFunction(() =>
      getComputedStyle(document.body).fontFamily.includes('Open Sans'),
    );
    await page.evaluate(() => document.fonts.ready);
    if (updateSnapshots) {
      // Require an explicit content expectation before replacing this moving baseline.
      expect(
        process.env.ARCHIVE_SNAPSHOT_SLUG,
        'Set ARCHIVE_SNAPSHOT_SLUG to the reviewed newest article slug',
      ).toBeTruthy();
      expect(await page.locator('.main li a.link').first().getAttribute('href')).toBe(
        `/en/${process.env.ARCHIVE_SNAPSHOT_SLUG}/`,
      );
    }
    await compareScreenshot(page, 'articles-desktop');
    return {
      headings: await page.locator('h1').count(),
      headingTop: await page
        .locator('h1')
        .first()
        .evaluate((heading) => heading.getBoundingClientRect().top),
      footers: await page.locator('footer').count(),
      firstCoverWidth: await firstCover.evaluate((image) => image.naturalWidth),
    };
  } finally {
    await page.screenshot({ path: join(artifacts, 'articles-desktop.png') }).catch(() => {});
    await page.close();
  }
}

test('article archive hydrates once and displays its real cover image', async () => {
  const current = await inspectArchive();
  expect(current.headings).toBe(1);
  expect(current.headingTop).toBeGreaterThanOrEqual(80);
  expect(current.footers).toBe(1);
  expect(current.firstCoverWidth).toBeGreaterThanOrEqual(200);
}, 60_000);

async function inspectCategories() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    const response = await page.goto(new URL('/en/category/', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBe(200);
    await page.locator('.categoryGrid section').first().waitFor({ state: 'visible' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);
    await compareScreenshot(page, 'category-desktop');
    return {
      headings: await page.locator('h1').count(),
      footers: await page.locator('footer').count(),
      cards: await page.locator('.categoryGrid section').count(),
      scrollY: await page.evaluate(() => window.scrollY),
    };
  } finally {
    await page.screenshot({ path: join(artifacts, 'category-desktop.png') }).catch(() => {});
    await page.close();
  }
}

test('category index hydrates once and starts at the top', async () => {
  const current = await inspectCategories();
  expect(current.headings).toBe(1);
  expect(current.footers).toBe(1);
  expect(current.cards).toBeGreaterThan(2);
  expect(current.scrollY).toBeLessThan(5);
}, 60_000);

test('client-side archive navigation keeps a single page at the top', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(new URL('/en/', baseUrl).href, { waitUntil: 'domcontentloaded' });
    await page.locator('a[href="/en/articles/"]').first().click();
    await page.waitForURL('**/en/articles/');
    await page.locator('.gatsby-image-wrapper img[data-main-image]').first().waitFor();
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
    expect(await page.locator('h1').count()).toBe(1);
    expect(await page.locator('footer').count()).toBe(1);
  } finally {
    await page.close();
  }
}, 30_000);

test('article footer shows the author bio and links to further reading', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    const response = await page.goto(
      new URL('/en/vertical-slices-and-dependencies/', baseUrl).href,
      { waitUntil: 'domcontentloaded' },
    );
    expect(response?.status()).toBe(200);
    const author = page.locator('.author');
    await author.waitFor({ state: 'visible' });
    await page.waitForFunction(
      () =>
        getComputedStyle(document.body).fontFamily.includes('Open Sans') &&
        getComputedStyle(document.querySelector('.related h2')).fontWeight === '600',
    );
    await page.evaluate(() => document.fonts.ready);
    const bio = await author.locator('.note').innerText();
    expect(bio).toContain('Oskar Dudycz is an independent software architect');
    expect(bio).not.toContain('Through my window');
    expect(bio.length).toBeLessThan(500);
    const furtherReading = page.locator('.author + .links');
    expect(await page.locator('article footer > .substack + .related').count()).toBe(1);
    const spacing = await page.evaluate(() => {
      const iframe = document.querySelector('.substack iframe');
      const related = document.querySelector('.related');
      return {
        gap: related.getBoundingClientRect().top - iframe.getBoundingClientRect().bottom,
        border: getComputedStyle(related).borderTopWidth,
      };
    });
    expect(spacing.border).toBe('0px');
    expect(spacing.gap).toBeGreaterThanOrEqual(0);
    expect(spacing.gap).toBeLessThanOrEqual(30);
    expect(
      await page
        .locator('.related a')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
    ).toEqual(['/en/how_to_slice_the_codebase_effectively/', '/en/vertical_slices_in_practice/']);
    const firstCover = page.locator('.related img').first();
    expect(await firstCover.getAttribute('alt')).toBe('');
    await page.locator('.related').scrollIntoViewIfNeeded();
    await page.waitForFunction(
      (image) => image.complete && image.naturalWidth >= 200,
      await firstCover.elementHandle(),
    );
    await page.evaluate(() => {
      const top = document.querySelector('.related').getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - 100);
    });
    await compareScreenshot(page, 'article-related-desktop', { animations: 'disabled' });
    expect(await furtherReading.locator('a').count()).toBeGreaterThan(0);
    expect(await furtherReading.locator('a').first().getAttribute('href')).toMatch(/^\/en\//);
    expect(await furtherReading.getAttribute('aria-label')).toBe('Articles by publication date');
    expect(await furtherReading.innerText()).toContain('Earlier article');
    const relatedLink = page.locator('.related a').first();
    await relatedLink.focus();
    expect(await relatedLink.evaluate((link) => getComputedStyle(link).outlineStyle)).toBe('solid');
    await compareScreenshot(author, 'article-footer-desktop', { animations: 'disabled' });
  } finally {
    await page.close();
  }
}, 60_000);

test('articles without curated recommendations do not show a related block', async () => {
  const page = await browser.newPage();
  try {
    const response = await page.goto(
      new URL('/en/checkpointing_message_processing/', baseUrl).href,
      { waitUntil: 'domcontentloaded' },
    );
    expect(response?.status()).toBe(200);
    expect(await page.locator('.related').count()).toBe(0);
  } finally {
    await page.close();
  }
}, 30_000);

test('curated article links fit on a narrow screen', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(new URL('/en/vertical-slices-and-dependencies/', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });
    await page.locator('.related a').first().waitFor({ state: 'visible' });
    await page.waitForFunction(
      () =>
        getComputedStyle(document.body).fontFamily.includes('Open Sans') &&
        getComputedStyle(document.querySelector('.related h2')).fontWeight === '600',
    );
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(390);
    expect(await page.locator('.related a').count()).toBe(2);
    await page.locator('.related img').last().scrollIntoViewIfNeeded();
    await page.locator('.related img').first().scrollIntoViewIfNeeded();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.querySelectorAll('.related img'), (image) => image.decode()),
      );
    });
    await page.evaluate(() => {
      const top = document.querySelector('.related').getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - 80);
    });
    await compareScreenshot(page, 'article-related-mobile', { animations: 'disabled' });
  } finally {
    await page.close();
  }
}, 30_000);

for (const language of ['en', 'pl']) {
  test(`${language} homepage renders one complete hero`, async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      const response = await page.goto(new URL(`/${language}/`, baseUrl).href, {
        waitUntil: 'domcontentloaded',
      });
      expect(response?.status()).toBe(200);
      await page.locator('.hero h1').waitFor({ state: 'visible' });
      expect(await page.locator('.hero h1 > u').textContent()).toBe(
        language === 'pl' ? 'architekturze oprogramowania?' : 'software architecture?',
      );
      expect(await page.locator('.hero h2 > span.yellow').textContent()).toBe(
        language === 'pl' ? 'od artykułów po wideo' : 'from articles to videos',
      );
      await page.evaluate(async () => {
        await document.fonts.ready;
        const background = getComputedStyle(document.querySelector('.hero')).backgroundImage;
        const url = background.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
        if (!url) throw new Error('Homepage hero background is missing');
        const image = new Image();
        image.src = url;
        await image.decode();
      });
      await page.waitForTimeout(1000);
      await compareScreenshot(page, `home-${language}-desktop`, { animations: 'disabled' });
      expect(await page.locator('.hero h1').count()).toBe(1);
      expect(await page.locator('footer').count()).toBe(1);
      expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
    } finally {
      await page
        .screenshot({
          path: join(artifacts, `home-${language}-desktop.png`),
          animations: 'disabled',
        })
        .catch(() => {});
      await page.close();
    }
  }, 60_000);
}

test('Gatsby Head replaces metadata during navigation and keeps language-specific titles', async () => {
  const page = await browser.newPage();
  try {
    for (const [language, title] of [
      ['en', 'All articles'],
      ['pl', 'Wszystkie artykuły'],
    ]) {
      await page.goto(new URL(`/${language}/articles/`, baseUrl).href, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForFunction((expected) => document.title.startsWith(expected), title);
      expect(await page.locator('head link[rel="canonical"]').count()).toBe(1);
      expect(await page.locator('head link[rel="canonical"]').getAttribute('href')).toBe(
        `https://event-driven.io/${language}/articles/`,
      );
      expect(await page.locator('html').getAttribute('lang')).toBe(language);
      expect(await page.locator('h1').innerText()).toBe(title);
      expect(await page.locator('head script[type="application/ld+json"]').count()).toBe(1);
    }
    await page.goto(new URL('/en/articles/', baseUrl).href, { waitUntil: 'domcontentloaded' });
    const link = page.locator('.main li a.link').first();
    const articlePath = await link.getAttribute('href');
    await link.click();
    await page.waitForURL(`**${articlePath}`);
    await page.waitForFunction(() => {
      const script = document.querySelector('head script[type="application/ld+json"]');
      return script && JSON.parse(script.textContent)['@type'] === 'BlogPosting';
    });
    expect(await page.locator('head link[rel="canonical"]').count()).toBe(1);
    expect(await page.locator('head link[rel="canonical"]').getAttribute('href')).toBe(
      `https://event-driven.io${articlePath}`,
    );
    expect(await page.locator('head meta[name="description"]').count()).toBe(1);
    expect(await page.locator('head link[href="/fonts/open-sans/index.css"]').count()).toBe(1);
    expect(await page.title()).not.toContain('All articles');
  } finally {
    await page.close();
  }
}, 60_000);

test('layout keeps fonts, sticky header and mobile navigation after resizing', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(new URL('/en/articles/', baseUrl).href);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      getComputedStyle(document.body).fontFamily.includes('Open Sans'),
    );
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForFunction(() => document.querySelector('header').classList.contains('fixed'));
    await page.setViewportSize({ width: 390, height: 844 });
    const expand = page.getByRole('button', { name: 'expand' });
    await expand.waitFor({ state: 'visible' });
    await expand.click();
    expect(await page.locator('nav.menu').evaluate((menu) => menu.classList.contains('open'))).toBe(
      true,
    );
    await page.locator('nav.menu a[data-slug="/contact/"]').click();
    await page.waitForURL('**/en/contact/');
    await page.waitForFunction(
      () => !document.querySelector('nav.menu').classList.contains('open'),
    );
    expect(await page.locator('h1').count()).toBe(1);
    expect(await page.locator('footer').count()).toBe(1);
  } finally {
    await page.close();
  }
}, 60_000);

test('article language switch stays visible before and after scrolling', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    const slug = 'fractal-architecture-cognitive-load';
    await page.goto(new URL(`/en/${slug}/`, baseUrl).href);
    const polish = page.getByRole('link', { name: 'Change language to pl' });
    await polish.waitFor({ state: 'visible' });
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForFunction(() => document.querySelector('header').classList.contains('fixed'));
    expect(await polish.isVisible()).toBe(true);
    await polish.click();
    await page.waitForURL(`**/pl/${slug}/`);
    await page.waitForFunction(() => document.documentElement.lang === 'pl');
    const english = page.getByRole('link', { name: 'Change language to en' });
    await english.waitFor({ state: 'visible' });
    await page.setViewportSize({ width: 390, height: 844 });
    await english.waitFor({ state: 'visible' });
    await english.click();
    await page.waitForURL(`**/en/${slug}/`);
    expect(await page.locator('h1').count()).toBe(1);
  } finally {
    await page.close();
  }
}, 60_000);

test('imported TypeScript examples display syntax colors', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(
      new URL(
        '/en/keep-your-streams-short-temporal-modelling-for-fast-reads-and-optimal-data-retention/',
        baseUrl,
      ).href,
    );
    const keyword = page.locator('pre.language-typescript .token.keyword').first();
    await keyword.waitFor({ state: 'visible' });
    const colors = await keyword.evaluate((token) => ({
      keyword: getComputedStyle(token).color,
      code: getComputedStyle(token.closest('code')).color,
    }));
    expect(colors.keyword).not.toBe(colors.code);
  } finally {
    await page.close();
  }
}, 60_000);

for (const language of ['en', 'pl']) {
  test(`${language} searches local content with lazy indexes, fallback links and pagination`, async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const indexRequests = [];
    const engineRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('/local-search-engine-')) engineRequests.push(request.url());
      if (request.url().includes('/search-index/')) indexRequests.push(request.url());
    });
    try {
      await page.goto(new URL(`/${language}/articles/`, baseUrl).href, {
        waitUntil: 'domcontentloaded',
      });
      expect(indexRequests).toHaveLength(0);
      expect(engineRequests).toHaveLength(0);
      await page.goto(new URL(`/${language}/search/`, baseUrl).href, {
        waitUntil: 'domcontentloaded',
      });
      const input = page.getByPlaceholder(language === 'pl' ? 'Szukaj' : 'Search', { exact: true });
      await input.waitFor();
      await page.waitForFunction(() =>
        getComputedStyle(document.body).fontFamily.includes('Open Sans'),
      );
      expect(await page.locator('h1').count()).toBe(1);
      expect(indexRequests).toHaveLength(0);
      expect(engineRequests).toHaveLength(0);
      expect(await page.locator('.search-message').innerText()).toBe(
        language === 'pl' ? 'Wpisz wyszukiwaną frazę.' : 'Start typing to search.',
      );
      await input.fill('introduction event sourcing');
      const result = page
        .locator('.search-hit')
        .filter({ has: page.locator('a[href="/en/introduction_to_event_sourcing/"]') });
      await result.waitFor();
      expect(await result.locator('h2').innerText()).toContain('Introduction to Event Sourcing');
      expect(await result.locator('mark').count()).toBeGreaterThan(0);
      const cover = result.locator('.search-hit-cover img[data-main-image]');
      await cover.waitFor({ state: 'visible' });
      await expect
        .poll(() => cover.evaluate((image) => image.complete && image.naturalWidth > 0))
        .toBe(true);
      expect(await cover.getAttribute('alt')).toBe('');
      expect(await cover.getAttribute('sizes')).toBe('(max-width: 599px) 88px, 180px');
      const colors = await result
        .locator('mark')
        .first()
        .evaluate((mark) => ({
          color: getComputedStyle(mark).color,
          background: getComputedStyle(mark).backgroundColor,
        }));
      expect(colors.color).toBe('rgb(85, 112, 28)');
      expect(colors.background).toBe('rgba(112, 148, 37, 0.094)');
      await result.locator('a').hover();
      expect(
        await result.locator('h2').evaluate((heading) => getComputedStyle(heading).color),
      ).toBe('rgb(85, 112, 28)');
      expect(
        await result
          .locator('.search-hit-cover')
          .evaluate((element) => Math.round(element.getBoundingClientRect().width)),
      ).toBe(88);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      if (language === 'en')
        await compareScreenshot(result, 'search-card-en-mobile', { animations: 'disabled' });
      await result.locator('a').focus();
      expect(
        await result.locator('a').evaluate((link) => getComputedStyle(link).outlineStyle),
      ).toBe('solid');
      await page.setViewportSize({ width: 1440, height: 1000 });
      expect(
        await result
          .locator('.search-hit-cover')
          .evaluate((element) => Math.round(element.getBoundingClientRect().width)),
      ).toBe(180);
      if (language === 'en')
        await compareScreenshot(result, 'search-card-en-desktop', { animations: 'disabled' });
      await page.setViewportSize({ width: 390, height: 844 });

      expect(await result.locator('.search-hit-meta').innerText()).toContain('2022-03-16');
      if (language === 'pl')
        expect(await result.locator('.search-hit-meta').innerText()).toContain('PO ANGIELSKU');
      expect(indexRequests).toHaveLength(2);
      expect(engineRequests).toHaveLength(1);
      expect(indexRequests[1]).toMatch(new RegExp(`/search-index/${language}\\.[a-f0-9]+\\.json`));
      await input.fill('event sourcing');
      await expect.poll(() => page.locator('.search-hit').count()).toBe(10);
      const first = await page.locator('.search-hit a').first().getAttribute('href');
      await page
        .getByRole('button', { name: language === 'pl' ? 'Następna' : 'Next', exact: true })
        .click();
      expect(await page.locator('.search-hit a').first().getAttribute('href')).not.toBe(first);
      await input.fill('zzzznotarealwordxyz');
      await expect
        .poll(() => page.locator('.search-message').innerText())
        .toBe(
          language === 'pl' ? 'Nie znaleziono pasujących wyników.' : 'No matching results found.',
        );
      await input.fill('appendToStream');
      await expect.poll(() => page.locator('.search-hit').count()).toBeGreaterThan(0);
      await page.getByRole('button', { name: language === 'pl' ? 'Wyczyść' : 'Clear' }).click();
      expect(await input.inputValue()).toBe('');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    } finally {
      await page.close();
    }
  }, 60_000);
}

test('local search reports load failures and retries successfully', async () => {
  const page = await browser.newPage();
  let requests = 0;
  try {
    await page.route('**/search-index/manifest.json', async (route) => {
      requests++;
      if (requests === 1) await route.fulfill({ status: 503, body: 'Unavailable' });
      else await route.continue();
    });
    await page.goto(new URL('/en/search/', baseUrl).href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() =>
      getComputedStyle(document.body).fontFamily.includes('Open Sans'),
    );
    await page.getByPlaceholder('Search', { exact: true }).fill('event sourcing');
    await page.getByRole('button', { name: 'Try again', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await page.locator('.search-hit').first().waitFor();
    expect(requests).toBe(2);
  } finally {
    await page.close();
  }
}, 60_000);

test('Event Sourcing keeps shared membership and reading order when switching to Polish', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(new URL('/en/category/event-sourcing/', baseUrl).href);
    const slugs = await page
      .locator('a.readingCard')
      .evaluateAll((cards) =>
        cards.map((card) => new URL(card.href).pathname.split('/')[2]).sort(),
      );
    const readingOrder = await page
      .locator('ol.ordered a.readingCard')
      .evaluateAll((cards) => cards.map((card) => new URL(card.href).pathname.split('/')[2]));
    await page.getByRole('link', { name: 'Change language to pl' }).click();
    await page.waitForURL('**/pl/category/event-sourcing/');
    await page.waitForFunction(() => document.documentElement.lang === 'pl');
    await page.getByRole('heading', { name: 'Polecana kolejność czytania', exact: true }).waitFor();
    expect(
      await page
        .locator('a.readingCard')
        .evaluateAll((cards) =>
          cards.map((card) => new URL(card.href).pathname.split('/')[2]).sort(),
        ),
    ).toEqual(slugs);
    expect(
      await page
        .locator('ol.ordered a.readingCard')
        .evaluateAll((cards) => cards.map((card) => new URL(card.href).pathname.split('/')[2])),
    ).toEqual(readingOrder);
    expect(readingOrder).toHaveLength(8);
    const fallback = page.locator('ol.ordered a.readingCard[href^="/en/"]').first();
    const target = await fallback.getAttribute('href');
    await fallback.click();
    await page.waitForURL(`**${target}`);
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    expect(await page.locator('h1').count()).toBe(1);
  } finally {
    await page.close();
  }
}, 60_000);

test('responsive covers match actual card widths across breakpoints and device pixel ratios', async () => {
  for (const deviceScaleFactor of [1, 2]) {
    const page = await browser.newPage({ deviceScaleFactor });
    try {
      for (const width of [390, 600, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(new URL('/en/articles/', baseUrl).href);
        await page.waitForFunction(() => document.documentElement.dataset.font400 === 'loaded');
        const image = page.locator('img[data-main-image]').first();
        // Wait for the hydrated, visible lazy image rather than relying on
        // load timing while the CI runner is also checking the built output.
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() => image.evaluate((e) => e.complete && e.naturalWidth > 0), { timeout: 10_000 })
          .toBe(true);
        const result = await image.evaluate((e) => {
          const picture = e.closest('picture');
          const sizes = picture.querySelector('source').sizes || e.sizes;
          const slots = sizes.split(',').map((s) => s.trim());
          let slot;
          for (const candidate of slots) {
            const conditional = candidate.match(/^(\([^)]*\)) (.+)$/);
            if (!conditional || matchMedia(conditional[1]).matches) {
              slot = conditional ? conditional[2] : candidate;
              break;
            }
          }
          const probe = document.createElement('div');
          probe.style.cssText = `position:absolute;width:${slot};height:0`;
          document.body.append(probe);
          const declared = probe.getBoundingClientRect().width;
          probe.remove();
          return { declared, actual: e.getBoundingClientRect().width, src: e.currentSrc };
        });
        expect(Math.abs(result.declared - result.actual)).toBeLessThanOrEqual(2);
        expect(result.src).toContain('.webp');
      }
    } finally {
      await page.close();
    }
  }
}, 60_000);

test('Polish diacritics use the web Open Sans face across weights and italics', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(new URL('/pl/training/', baseUrl).href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() =>
      getComputedStyle(document.body).fontFamily.includes('Open Sans'),
    );
    await page.evaluate(async () => {
      for (const weight of [300, 400, 600, 700, 800]) {
        for (const style of ['normal', 'italic']) {
          const probe = document.createElement('span');
          probe.id = `polish-font-${weight}-${style}`;
          probe.style.cssText = `display:block;font: ${style} ${weight} 24px "Open Sans", sans-serif`;
          probe.textContent = 'ĄĆĘŁŃÓŚŹŻ ąćęłńóśźż';
          document.body.append(probe);
          await document.fonts.load(`${style} ${weight} 24px "Open Sans"`, probe.textContent);
        }
      }
      await document.fonts.ready;
    });
    const session = await page.context().newCDPSession(page);
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    for (const weight of [300, 400, 600, 700, 800]) {
      for (const style of ['normal', 'italic']) {
        const { nodeId } = await session.send('DOM.querySelector', {
          nodeId: root.nodeId,
          selector: `#polish-font-${weight}-${style}`,
        });
        const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId });
        expect(fonts.length, `${weight} ${style}`).toBeGreaterThan(0);
        for (const font of fonts) {
          expect(font.familyName, `${weight} ${style}: ${font.glyphCount} glyphs`).toMatch(
            /^Open Sans/,
          );
          expect(font.isCustomFont, `${weight} ${style}: ${font.familyName}`).toBe(true);
        }
      }
    }
  } finally {
    await page.close();
  }
}, 60_000);

for (const lang of ['en', 'pl']) {
  test(`${lang} desktop newsletter waits for viewport and keeps its reserved height`, async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const requests = [];
    try {
      await page.route('https://www.architecture-weekly.com/embed', async (route) => {
        requests.push(route.request().url());
        await route.fulfill({ contentType: 'text/html', body: '<p>Newsletter form</p>' });
      });
      await page.goto(new URL(`/${lang}/introduction_to_event_sourcing/`, baseUrl).href, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForFunction(() =>
        getComputedStyle(document.body).fontFamily.includes('Open Sans'),
      );
      const iframe = page.locator('#substack iframe');
      expect(await iframe.getAttribute('src')).toBeNull();
      expect(requests).toHaveLength(0);
      const before = await iframe.boundingBox();
      expect(before.height).toBe(320);
      await page.locator('#substack').scrollIntoViewIfNeeded();
      await expect.poll(() => requests.length).toBe(1);
      expect((await iframe.boundingBox()).height).toBe(before.height);
      await page.evaluate(() => window.scrollTo(0, 0));
      await iframe.scrollIntoViewIfNeeded();
      expect(requests).toHaveLength(1);
    } finally {
      await page.close();
    }
  }, 60_000);
}

test('newsletter fallback works without JavaScript and unsupported observers load automatically', async () => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto(new URL('/en/introduction_to_event_sourcing/', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });
    expect(await page.locator('#substack .subscription-fallback').getAttribute('href')).toBe(
      'https://www.architecture-weekly.com/subscribe',
    );
    expect(await page.locator('#substack iframe').getAttribute('src')).toBeNull();
  } finally {
    await context.close();
  }
  const supportedFallback = await browser.newPage();
  try {
    await supportedFallback.addInitScript(() => {
      delete window.IntersectionObserver;
    });
    await supportedFallback.route('https://www.architecture-weekly.com/embed', (route) =>
      route.fulfill({ body: 'Newsletter' }),
    );
    await supportedFallback.goto(new URL('/en/introduction_to_event_sourcing/', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });
    await supportedFallback.waitForFunction(
      () => document.documentElement.dataset.font400 === 'loaded',
    );
    await expect
      .poll(() => supportedFallback.locator('#substack iframe').getAttribute('src'), {
        timeout: 10_000,
      })
      .toBe('https://www.architecture-weekly.com/embed');
  } finally {
    await supportedFallback.close();
  }
}, 60_000);

test('newsletter disconnects its viewport observer when navigating away', async () => {
  const page = await browser.newPage();
  try {
    await page.addInitScript(() => {
      const NativeObserver = window.IntersectionObserver;
      window.newsletterObservers = [];
      window.IntersectionObserver = class extends NativeObserver {
        constructor(callback, options) {
          super(callback, options);
          if (options?.rootMargin === '200px 0px') window.newsletterObservers.push(this);
        }
        disconnect() {
          this.disconnected = true;
          super.disconnect();
        }
      };
    });
    await page.goto(new URL('/en/introduction_to_event_sourcing/', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForFunction(() => window.newsletterObservers.length === 1);
    await page.locator('header a[href="/en/articles/"]').first().click();
    await page.waitForURL('**/en/articles/');
    await page.waitForFunction(() =>
      window.newsletterObservers.every((observer) => observer.disconnected),
    );
  } finally {
    await page.close();
  }
}, 60_000);

test('approved text colors maintain contrast on actual white surfaces and interaction states', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(new URL('/en/introduction_to_event_sourcing/', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });
    const link = page.locator('.bodytext p a').first();
    await link.scrollIntoViewIfNeeded();
    const colors = async (locator) =>
      locator.evaluate((node) => {
        let background = node;
        while (background && getComputedStyle(background).backgroundColor === 'rgba(0, 0, 0, 0)')
          background = background.parentElement;
        return {
          color: getComputedStyle(node).color,
          background: background
            ? getComputedStyle(background).backgroundColor
            : 'rgb(255, 255, 255)',
        };
      });
    const expected = { color: 'rgb(85, 112, 28)', background: 'rgb(255, 255, 255)' };
    expect(await colors(link)).toEqual(expected);
    await link.hover();
    expect(await colors(link)).toEqual(expected);
    await link.focus();
    expect(await colors(link)).toEqual(expected);
    expect(await colors(page.locator('footer li').first())).toEqual({
      color: 'rgb(112, 110, 107)',
      background: 'rgb(255, 255, 255)',
    });
  } finally {
    await page.close();
  }
}, 60_000);

test('CSS Module summaries and site footers preserve styles and respond to theme variables', async () => {
  for (const [language, javaScriptEnabled] of [
    ['en', true],
    ['pl', true],
    ['en', false],
    ['pl', false],
  ]) {
    const page = await browser.newPage({
      javaScriptEnabled,
      viewport: { width: 1023, height: 900 },
    });
    try {
      await page.goto(new URL(`/${language}/introduction_to_event_sourcing/`, baseUrl).href, {
        waitUntil: 'domcontentloaded',
      });
      const summary = page.locator('.standfirst');
      const footer = page.locator('footer.footer');
      if (language === 'en') await summary.waitFor();
      else expect(await summary.count()).toBe(0);
      const values = (element) => {
        const style = getComputedStyle(element);
        return {
          color: style.color,
          background: style.backgroundColor,
          size: style.fontSize,
          lineHeight: style.lineHeight,
          bottom: style.marginBottom,
          padding: style.paddingBottom,
        };
      };
      if (language === 'en')
        expect(await summary.evaluate(values)).toMatchObject({
          color: 'rgb(62, 62, 60)',
          size: '21.6px',
          lineHeight: '30.24px',
          bottom: '40px',
        });
      expect(await footer.evaluate(values)).toMatchObject({
        background: 'rgb(255, 255, 255)',
        padding: '120px',
      });
      expect(await footer.locator('li').first().evaluate(values)).toMatchObject({
        color: 'rgb(112, 110, 107)',
        size: '12.8px',
      });
      await page.setViewportSize({ width: 1024, height: 900 });
      await expect.poll(() => footer.evaluate(values)).toMatchObject({ padding: '24px' });
      await page.evaluate(() => {
        document.documentElement.style.setProperty('--color-text', '#123456');
        document.documentElement.style.setProperty('--color-surface', '#234567');
      });
      if (language === 'en')
        expect(await summary.evaluate(values)).toMatchObject({ color: 'rgb(18, 52, 86)' });
      expect(await footer.evaluate(values)).toMatchObject({ background: 'rgb(35, 69, 103)' });
      expect(await footer.count()).toBe(1);
    } finally {
      await page.close();
    }
  }
}, 60_000);

test('separate English and Polish pages keep their locale while following reciprocal article links', async () => {
  const pages = await Promise.all([browser.newPage(), browser.newPage()]);
  const slug = 'open-source-a-relict-a-charity-or';
  try {
    await Promise.all(
      pages.map((page, index) =>
        page.goto(new URL(`/${index === 0 ? 'en' : 'pl'}/${slug}/`, baseUrl).href, {
          waitUntil: 'domcontentloaded',
        }),
      ),
    );
    for (const [index, page] of pages.entries()) {
      const language = index === 0 ? 'en' : 'pl';
      const other = language === 'en' ? 'pl' : 'en';
      const switcher = page.getByRole('link', { name: `Change language to ${other}` });
      await switcher.waitFor({ state: 'visible' });
      expect(await page.locator('html').getAttribute('lang')).toBe(language);
      expect(await page.locator('.related h2').innerText()).toBe(
        language === 'en' ? 'Related articles' : 'Powiązane artykuły',
      );
      expect(await page.locator('link[rel=canonical]').getAttribute('href')).toBe(
        `https://event-driven.io/en/${slug}/`,
      );
      expect(await switcher.getAttribute('href')).toBe(`/${other}/${slug}/`);
      await page.locator('.related a[href="/en/why-open-source-isnt-always-fair/"]').click();
      await page.waitForURL('**/en/why-open-source-isnt-always-fair/');
      const returnLink = page.locator(`.related a[href="/en/${slug}/"]`);
      await returnLink.waitFor({ state: 'visible' });
      await returnLink.click();
      await page.waitForURL(`**/en/${slug}/`);
      // The URL changes before Gatsby Head commits the next page's attributes.
      await expect.poll(() => page.locator('html').getAttribute('lang')).toBe('en');
      await expect.poll(() => page.locator('.related h2').innerText()).toBe('Related articles');
      await expect
        .poll(() => page.locator('link[rel=canonical]').getAttribute('href'))
        .toBe(`https://event-driven.io/en/${slug}/`);
      expect(await page.locator('h1').count()).toBe(1);
      await page.getByRole('link', { name: 'Change language to pl' }).click();
      await page.waitForURL(`**/pl/${slug}/`);
      await expect.poll(() => page.locator('.related h2').innerText()).toBe('Powiązane artykuły');
      await expect.poll(() => page.locator('html').getAttribute('lang')).toBe('pl');
      expect(await page.locator('footer.footer').count()).toBe(1);
    }
  } finally {
    await Promise.all(pages.map((page) => page.close()));
  }
}, 60_000);

test('reading CSS Modules preserve bilingual server styles, responsive cards and navigation', async () => {
  for (const language of ['en', 'pl']) {
    for (const javaScriptEnabled of [true, false]) {
      const page = await browser.newPage({
        javaScriptEnabled,
        viewport: { width: 599, height: 900 },
      });
      try {
        await page.goto(new URL(`/${language}/open-source-a-relict-a-charity-or/`, baseUrl).href, {
          waitUntil: 'domcontentloaded',
        });
        const related = page.locator('.related');
        const navigation = page.locator('article footer nav.links');
        const grid = related.locator('.withImages');
        const style = (element) => {
          const css = getComputedStyle(element);
          return {
            marginTop: css.marginTop,
            marginBottom: css.marginBottom,
            paddingBottom: css.paddingBottom,
            direction: css.flexDirection,
            border: css.borderBottomColor,
            columns: css.gridTemplateColumns.split(' ').length,
            color: css.color,
          };
        };
        expect(await related.evaluate(style)).toMatchObject({
          marginTop: '20px',
          marginBottom: '40px',
        });
        expect(await navigation.evaluate(style)).toMatchObject({
          direction: 'column',
          paddingBottom: '40px',
          border: 'rgb(236, 235, 234)',
        });
        expect(await navigation.locator('a').count()).toBeGreaterThan(0);
        expect(
          await navigation
            .locator('svg')
            .first()
            .evaluate((element) => getComputedStyle(element).fill),
        ).toBe('rgb(255, 165, 0)');
        expect(await grid.evaluate(style)).toMatchObject({ columns: 1 });
        await page.setViewportSize({ width: 600, height: 900 });
        await expect.poll(() => grid.evaluate(style)).toMatchObject({ columns: 2 });
        await page.setViewportSize({ width: 1024, height: 900 });
        await expect
          .poll(() => navigation.evaluate(style))
          .toMatchObject({ direction: 'row-reverse' });
        const card = related.locator('a.readingCard').first();
        await card.focus();
        expect(await card.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe(
          'solid',
        );
        await page.evaluate(() =>
          document.documentElement.style.setProperty('--color-border', '#123456'),
        );
        expect(await navigation.evaluate(style)).toMatchObject({ border: 'rgb(18, 52, 86)' });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await card.hover();
        expect(await card.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe(
          '0s',
        );
        expect(await card.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
        await navigation.locator('a').first().hover();
        expect(
          await navigation
            .locator('svg')
            .first()
            .evaluate((element) => getComputedStyle(element).transform),
        ).toBe('none');
        await page.goto(new URL(`/${language}/category/event-sourcing/`, baseUrl).href, {
          waitUntil: 'domcontentloaded',
        });
        const ordered = page.locator('ol.ordered');
        expect(await ordered.count()).toBe(1);
        expect(
          await ordered
            .locator('li')
            .first()
            .evaluate((element) => getComputedStyle(element).counterIncrement),
        ).toContain('reading-order');
        expect(
          await ordered
            .locator('li')
            .first()
            .evaluate((element) => getComputedStyle(element, '::before').backgroundColor),
        ).toBe('rgb(112, 148, 37)');
      } finally {
        await page.close();
      }
    }
  }
}, 60_000);

test('layout loads fonts silently and navigation dates have readable contrast', async () => {
  const page = await browser.newPage();
  const messages = [];
  page.on('console', (message) => messages.push(message.text()));
  try {
    await page.goto(`${baseUrl}/en/open-source-a-relict-a-charity-or/`, {
      waitUntil: 'domcontentloaded',
    });
    await expect
      .poll(() => page.locator('h1').evaluate((element) => getComputedStyle(element).fontWeight))
      .toBe('600');
    await expect
      .poll(() => page.locator('body').evaluate((element) => getComputedStyle(element).fontFamily))
      .toContain('Open Sans');
    expect(
      messages.filter((message) => /font(?:400|600) is (?:not )?available/.test(message)),
    ).toEqual([]);
    const dates = await page.locator('nav.links time').all();
    expect(dates.length).toBeGreaterThan(0);
    for (const date of dates) {
      const contrast = await date.evaluate((element) => {
        const channels = getComputedStyle(element).color.match(/\d+/g).slice(0, 3).map(Number);
        const linear = channels.map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
        // Current article/navigation surface is white.
        return 1.05 / (luminance + 0.05);
      });
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    }
  } finally {
    await page.close();
  }
});

test('native article and hero styles work before hydration and across breakpoints', async () => {
  for (const language of ['en', 'pl']) {
    for (const javaScriptEnabled of [false, true]) {
      const context = await browser.newContext({
        javaScriptEnabled,
        viewport: { width: 390, height: 844 },
      });
      const page = await context.newPage();
      try {
        await page.goto(new URL(`/${language}/introduction_to_event_sourcing/`, baseUrl).href, {
          waitUntil: 'domcontentloaded',
        });
        if (javaScriptEnabled) {
          await expect
            .poll(() => page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily))
            .toContain('Open Sans');
        } else {
          expect(
            await page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily),
          ).toContain('Arial');
        }
        const article = page.locator('main > article');
        const dimensions = () =>
          article.evaluate((el) => {
            const css = getComputedStyle(el);
            return { top: css.paddingTop, left: css.paddingLeft, maxWidth: css.maxWidth };
          });
        expect(await dimensions()).toMatchObject({ top: '20px', left: '20px' });
        const paragraph = page.locator('.bodytext > p').first();
        expect(await paragraph.evaluate((el) => getComputedStyle(el).fontSize)).toBe('17.6px');
        await page.setViewportSize({ width: 600, height: 900 });
        await expect
          .poll(dimensions)
          .toMatchObject({ top: '20px', left: '40px', maxWidth: '650px' });
        await page.setViewportSize({ width: 1024, height: 900 });
        await expect
          .poll(dimensions)
          .toMatchObject({ top: '130px', left: '0px', maxWidth: '850px' });
        await page.goto(new URL(`/${language}/`, baseUrl).href, { waitUntil: 'domcontentloaded' });
        const hero = page.locator('.hero');
        const backgrounds = new Set();
        for (const width of [390, 600, 1024]) {
          await page.setViewportSize({ width, height: 900 });
          const image = await hero.evaluate((el) => getComputedStyle(el).backgroundImage);
          expect(image).toMatch(/^url\(/);
          backgrounds.add(image);
        }
        expect(backgrounds.size).toBe(3);
        expect(await hero.locator('h1').count()).toBe(1);
        expect(await hero.locator('h1 > u').count()).toBe(1);
        expect(await hero.locator('h2 > span.yellow').count()).toBe(1);
      } finally {
        await context.close();
      }
    }
  }
}, 60_000);

test('404 pages offer bilingual recovery with and without JavaScript', async () => {
  for (const javaScriptEnabled of [false, true]) {
    for (const language of ['en', 'pl']) {
      const context = await browser.newContext({
        javaScriptEnabled,
        viewport: { width: 390, height: 844 },
      });
      const page = await context.newPage();
      try {
        await page.goto(new URL(`/${language}/404/`, baseUrl).href, {
          waitUntil: 'domcontentloaded',
        });
        const heading = page.locator('h1');
        expect(await heading.count()).toBe(1);
        expect(await heading.innerText()).toContain(language === 'pl' ? 'Ups!' : 'Oops!');
        expect(await heading.isVisible()).toBe(true);
        const recovery = page.locator('article nav');
        expect(await recovery.locator('a').count()).toBe(3);
        await recovery.locator('a').first().click();
        await page.waitForURL(`**/${language}/`);
        await expect
          .poll(() => page.locator('html').getAttribute('lang'), { timeout: 10_000 })
          .toBe(language);
        expect(await page.locator('h1').count()).toBe(1);
      } finally {
        await context.close();
      }
    }
  }
}, 60_000);

test('unknown URLs use the root fallback and localized Gatsby error routes', async () => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const plain = await context.newPage();
  try {
    const response = await plain.goto(new URL('/__missing_page__/', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });
    expect(response.status()).toBe(404);
    expect(new URL(plain.url()).pathname).toBe('/__missing_page__/');
    expect(await plain.locator('h1').innerText()).toContain('Oops!');
  } finally {
    await context.close();
  }
  for (const language of ['en', 'pl']) {
    const page = await browser.newPage();
    try {
      const response = await page.goto(new URL(`/${language}/__missing_page__/`, baseUrl).href, {
        waitUntil: 'domcontentloaded',
      });
      // Gatsby serve serves matchPath fallbacks with 200. Netlify uses the
      // explicit 404 rewrites verified by test:404; check that deployed contract.
      const localGatsby = ['127.0.0.1', 'localhost'].includes(new URL(baseUrl).hostname);
      expect(response.status()).toBe(localGatsby ? 200 : 404);
      await expect
        .poll(() => page.locator('h1').innerText(), { timeout: 10_000 })
        .toContain(language === 'pl' ? 'Ups!' : 'Oops!');
      await expect
        .poll(() => page.locator('html').getAttribute('lang'), { timeout: 10_000 })
        .toBe(language);
      expect(new URL(page.url()).pathname).toBe(`/${language}/__missing_page__/`);
      await page.locator('article nav a').nth(2).click();
      await page.waitForURL(`**/${language}/search/`);
      expect(await page.locator('h1').count()).toBe(1);
    } finally {
      await page.close();
    }
  }
}, 60_000);
