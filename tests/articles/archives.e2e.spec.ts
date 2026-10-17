import type { Locator } from '@playwright/test';
import { test, expect } from '../helpers/browser/fixtures.ts';
import {
  expectFonts,
  expectImageLoaded,
} from '../helpers/browser/readiness.ts';

test('article archive hydrates once and displays its real cover image', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  });
  const response = await page.goto('/en/articles/', {
    waitUntil: 'domcontentloaded',
  });
  expect(response?.status()).toBe(200);
  const firstCover = page
    .locator('.gatsby-image-wrapper img[data-main-image]')
    .first();
  await expectImageLoaded(firstCover, 200);
  await expect(firstCover).toHaveCSS('opacity', '1');
  await expectFonts(page);
  await expect(page.locator('h1')).toHaveCount(1);
  expect(
    await page
      .locator('h1')
      .evaluate((heading) => heading.getBoundingClientRect().top),
  ).toBeGreaterThanOrEqual(80);
  await expect(page.locator('footer')).toHaveCount(1);
});

const browseLabels: Record<string, string> = {
  en: 'Browse articles by tag',
  pl: 'Przeglądaj artykuły według tagów',
};

for (const [language, browse] of Object.entries(browseLabels)) {
  for (const width of [390, 1280]) {
    test(`${language} archive tag chips open the tag page at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${language}/articles/`, {
        waitUntil: 'domcontentloaded',
      });
      const chip = page
        .getByRole('navigation', { name: browse })
        .getByRole('link', { name: 'Event Sourcing', exact: true });
      await expect(chip).toBeVisible();
      await chip.click();
      await page.waitForURL(`**/${language}/articles/tag/event-sourcing/`);
      await expect(
        page.getByRole('heading', { level: 1, name: 'Event Sourcing' }),
      ).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', language);
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('li > a.link').first()).toHaveAttribute(
        'href',
        new RegExp(`^/${language}/`),
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
    });
  }
}

test('client-side archive navigation keeps a single page at the top', async ({
  page,
}) => {
  test.setTimeout(30_000);
  await page.setViewportSize({
    width: 1440,
    height: 900,
  });
  await page.goto('/en/', {
    waitUntil: 'domcontentloaded',
  });
  await page.locator('a[href="/en/articles/"]').first().click();
  await page.waitForURL('**/en/articles/');
  await page
    .locator('.gatsby-image-wrapper img[data-main-image]')
    .first()
    .waitFor();
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
});

test('a tag page switches to the same tag in Polish and keeps Polish article links', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  });
  await page.goto('/en/articles/tag/event-sourcing/');
  const cards = page.locator('li > a.link');
  expect(await articleSlugs(cards)).toContain('introduction_to_event_sourcing');
  await page
    .getByRole('link', {
      name: 'Change language to Polish',
    })
    .click();
  await page.waitForURL('**/pl/articles/tag/event-sourcing/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  await expect(page.getByText(/^\d+ artykuł(y|ów|u)?$/)).toBeVisible();
  expect(await articleSlugs(cards)).toContain('introduction_to_event_sourcing');
  const card = cards.first();
  const target = await card.getAttribute('href');
  expect(target).toMatch(/^\/pl\//);
  await card.click();
  await page.waitForURL(`**${target}`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  await expect(page.locator('h1')).toHaveCount(1);
});

async function articleSlugs(cards: Locator): Promise<string[]> {
  return cards.evaluateAll((links) =>
    links.map(
      (link) =>
        new URL(
          link.getAttribute('href')!,
          window.location.href,
        ).pathname.split('/')[2] || '',
    ),
  );
}

for (const javaScriptEnabled of [true, false]) {
  test.describe(`Polish archive, JavaScript ${javaScriptEnabled ? 'enabled' : 'disabled'}`, () => {
    test.use({ javaScriptEnabled });
    test('article cards retain the selected interface language', async ({
      page,
    }) => {
      await page.goto('/pl/articles/', { waitUntil: 'domcontentloaded' });
      const card = page.locator('li > a.link').first();
      await expect(card).toHaveAttribute('href', /^\/pl\//);
      const destination = await card.getAttribute('href');
      await card.click();
      await page.waitForURL(`**${destination}`);
      await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
      await expect(
        page.getByRole('link', { name: 'Zmień język na angielski' }),
      ).toBeVisible();
      await expect(page.locator('h1')).toHaveCount(1);
    });
  });
}
