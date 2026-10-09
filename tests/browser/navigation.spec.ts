type DisqusConfig = { page: { identifier?: string }; callbacks: Record<string, unknown> };
declare global {
  interface Window {
    disqus_config?: (this: DisqusConfig) => void;
  }
}

import { test, expect } from './fixtures';
import { expectFonts } from './readiness';

for (const width of [390, 1280]) {
  test.describe(`menu at ${width}px`, () => {
    test.use({
      viewport: {
        width,
        height: 900,
      },
    });
    test('persistent menu keeps current language, page destinations and overflow icons after navigation and resizing', async ({
      page,
    }) => {
      await page.goto('/en/articles/', {
        waitUntil: 'domcontentloaded',
      });
      await expect(page.locator('html')).toHaveAttribute('data-font400', 'loaded');
      const menu = page.locator('nav.menu');
      const expand = menu.getByRole('button', {
        name: 'expand',
      });
      await expand.waitFor();
      await expand.click();
      await expect(expand).toHaveAttribute('aria-expanded', 'true');
      await menu
        .getByRole('link', {
          name: 'Change language to pl',
        })
        .click();
      await page.waitForURL('**/pl/articles/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
      await expect(expand).toHaveAttribute('aria-expanded', 'false');
      await expand.click();
      const visibleItems =
        width < 1024 ? menu.locator('.itemList') : menu.locator('.hiddenItemList');
      const talks = visibleItems.locator('a[data-slug="/talks/"]');
      await expect(talks).toHaveText('Wystąpienia');
      await expect(talks).toHaveAttribute('href', '/pl/talks/');
      for (const host of ['linkedin.com', 'github.com', 'hachyderm.io', 'bsky.app']) {
        const social = visibleItems.locator(`a[href*="${host}"]`);
        await expect(social).toBeVisible();
        await expect(social.locator('svg')).toHaveCount(1);
      }
      await expand.click();
      await expect(expand).toHaveAttribute('aria-expanded', 'false');
      await page.setViewportSize({
        width: width < 1024 ? 1280 : 390,
        height: 900,
      });
      await expect(talks).not.toBeVisible();
      await expand.click();
      const resizedItems =
        width < 1024 ? menu.locator('.hiddenItemList') : menu.locator('.itemList');
      const consulting = menu.locator('.itemList a[href="/pl/consulting/"]');
      await expect(consulting).toHaveAttribute('href', '/pl/consulting/');
      await expect(resizedItems.locator('a[data-slug="/talks/"]').first()).toHaveText(
        'Wystąpienia',
      );
      await menu
        .getByRole('link', {
          name: 'Change language to en',
        })
        .click();
      await page.waitForURL('**/en/articles/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(expand).toHaveAttribute('aria-expanded', 'false');
      await expand.click();
      await expect(
        menu.getByRole('link', {
          name: 'Talks',
          exact: true,
        }),
      ).toHaveText('Talks');
      await expect(menu.locator('.itemList a[href="/en/consulting/"]')).toHaveAttribute(
        'href',
        '/en/consulting/',
      );
    });
  });
}

test('desktop menu adapts to container resizing without a viewport resize', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/pl/articles/', { waitUntil: 'domcontentloaded' });
  await expectFonts(page);
  for (const weight of [400, 600]) {
    await expect(page.locator('html')).toHaveAttribute(`data-font${weight}`, 'loaded');
  }
  const menu = page.locator('nav.menu');
  const consulting = menu.locator('.itemList a[href="/pl/consulting/"]');
  await expect(consulting).toBeVisible();

  // Header padding transitions and translated labels also change this available
  // width without another window resize. Exercise that layout boundary directly.
  await page.locator('header.header').evaluate((header) => {
    header.style.width = '800px';
  });
  await expect(consulting).not.toBeVisible();
  await menu.getByRole('button', { name: 'expand' }).click();
  await expect(menu.locator('.hiddenItemList a[href="/pl/consulting/"]')).toBeVisible();
  await page.locator('header.header').evaluate((header) => {
    header.style.width = '';
  });
  await expect(consulting).toBeVisible();
  await expect(menu.locator('.hiddenItemList a[href="/pl/consulting/"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('article video references remain links and players have accessible titles in both languages', async ({
  page,
}) => {
  for (const path of ['/en/women_in_it/', '/pl/mezczyzna_w_it/']) {
    await page.goto(path, {
      waitUntil: 'domcontentloaded',
    });
    const reference = page.getByRole('link', {
      name: 'Heather Wilde - How to Close the Diversity Gap',
    });
    await reference.waitFor();
    await expect(reference).toHaveAttribute('href', 'https://www.youtube.com/watch?v=JQL4doMy73w');
    await expect(page.locator('iframe[src*="JQL4doMy73w"]')).toHaveCount(0);
    await expect(page.locator('.bodytext')).not.toContainText('youtube:');
  }
  for (const language of ['en', 'pl']) {
    await page.goto(`/${language}/what_does_mr_bean_opening_the_car_have_to_do_with_programming/`, {
      waitUntil: 'domcontentloaded',
    });
    const player = page.locator('iframe[src*="youtube-nocookie.com/embed/GOd7oj1AT00"]');
    await player.waitFor({
      state: 'attached',
    });
    await expect(player).toHaveCount(1);
    await expect(player).toHaveAttribute('title', 'Mr Bean');
  }
});

test('normalized article links hydrate with clean canonicals and keep existing comment IDs', async ({
  page,
}) => {
  await page.goto('/en/testing_event_sourcing_emmett_edition/', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('html')).toHaveAttribute('data-font400', 'loaded');
  const link = page.locator('.bodytext a[href="/en/type_script_node_js_event_sourcing/"]').first();
  // Follow a real Markdown link through Gatsby's client-side navigation.
  await link.click();
  await page.waitForURL('**/en/type_script_node_js_event_sourcing/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://event-driven.io/en/type_script_node_js_event_sourcing/',
  );
  await expect(page.locator('h1')).toHaveCount(1);
  await page.waitForFunction(() => typeof window.disqus_config === 'function');
  const identifier = await page.evaluate(() => {
    const config: DisqusConfig = {
      page: {},
      callbacks: {},
    };
    window.disqus_config!.call(config);
    return config.page.identifier;
  });
  expect(identifier).toBe('/type_script_node_Js_event_sourcing/');
  await expect(page.locator('link#site-fonts')).toHaveCount(1);
});

test('training pages retain one main heading after hydration and language navigation', async ({
  page,
}) => {
  await page.goto('/pl/training/', {
    waitUntil: 'domcontentloaded',
  });
  await expectFonts(page);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Szkolenie');
  await page.locator('a[href="/en/training/"]').first().click();
  await page.waitForURL('**/en/training/');
  await expect(page.locator('h1')).toHaveText(['Training']);
  await page.reload({
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Training');
});

for (const language of ['en', 'pl']) {
  test(`${language} homepage renders one complete hero`, async ({ page }) => {
    await page.setViewportSize({
      width: 1440,
      height: 900,
    });
    const response = await page.goto(`/${language}/`, {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBe(200);
    await page.locator('.hero h1').waitFor({
      state: 'visible',
    });
    await expect(page.locator('.hero h1 > u')).toHaveText(
      language === 'pl' ? 'architekturze oprogramowania?' : 'software architecture?',
    );
    await expect(page.locator('.hero h2 > span.yellow')).toHaveText(
      language === 'pl' ? 'od artykułów po wideo' : 'from articles to videos',
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      const background = getComputedStyle(document.querySelector('.hero')!).backgroundImage;
      const url = background.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
      if (!url) throw new Error('Homepage hero background is missing');
      const image = new Image();
      image.src = url;
      await image.decode();
    });
    await expect(page).toHaveScreenshot(`home-${language}-desktop.png`, {
      animations: 'disabled',
    });
    await expect(page.locator('.hero h1')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
  });
}

test('Gatsby Head replaces metadata during navigation and keeps language-specific titles', async ({
  page,
}) => {
  for (const [language, title] of [
    ['en', 'All articles'],
    ['pl', 'Wszystkie artykuły'],
  ]) {
    await page.goto(`/${language}/articles/`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page).toHaveTitle(new RegExp(`^${title}`));
    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://event-driven.io/${language}/articles/`,
    );
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('h1')).toHaveText(title);
    await expect(page.locator('head script[type="application/ld+json"]')).toHaveCount(1);
  }
  await page.goto('/en/articles/', {
    waitUntil: 'domcontentloaded',
  });
  const link = page.locator('.main li a.link').first();
  const articlePath = await link.getAttribute('href');
  await link.click();
  await page.waitForURL(`**${articlePath}`);
  await page.waitForFunction(() => {
    const script = document.querySelector('head script[type="application/ld+json"]');
    return (
      script &&
      (JSON.parse(script.textContent) as Record<string, unknown>)['@type'] === 'BlogPosting'
    );
  });
  await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
    'href',
    `https://event-driven.io${articlePath}`,
  );
  await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
  await expect(page.locator('head link[href="/fonts/open-sans/index.css"]')).toHaveCount(1);
  expect(await page.title()).not.toContain('All articles');
});

test('layout keeps fonts, sticky header and mobile navigation after resizing', async ({ page }) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  });
  await page.goto('/en/articles/');
  await page.evaluate(() => document.fonts.ready);
  await expectFonts(page);
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect(page.locator('header.header')).toHaveClass(/fixed/);
  await page.setViewportSize({
    width: 390,
    height: 844,
  });
  const expand = page.getByRole('button', {
    name: 'expand',
  });
  await expand.waitFor({
    state: 'visible',
  });
  await expand.click();
  await expect(page.locator('nav.menu')).toHaveClass(/open/);
  await page.locator('nav.menu a[data-slug="/contact/"]').click();
  await page.waitForURL('**/en/contact/');
  await expect(page.locator('nav.menu')).not.toHaveClass(/open/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
});

test('article language switch stays visible before and after scrolling', async ({ page }) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  });
  const slug = 'fractal-architecture-cognitive-load';
  await page.goto(`/en/${slug}/`);
  const polish = page.getByRole('link', {
    name: 'Change language to pl',
  });
  await polish.waitFor({
    state: 'visible',
  });
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect(page.locator('header.header')).toHaveClass(/fixed/);
  await expect(polish).toBeVisible();
  await polish.click();
  await page.waitForURL(`**/pl/${slug}/`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  const english = page.getByRole('link', {
    name: 'Change language to en',
  });
  await english.waitFor({
    state: 'visible',
  });
  await page.setViewportSize({
    width: 390,
    height: 844,
  });
  await english.waitFor({
    state: 'visible',
  });
  await english.click();
  await page.waitForURL(`**/en/${slug}/`);
  await expect(page.locator('h1')).toHaveCount(1);
});
