import type { Locator } from '@playwright/test';
import { test, expect } from './fixtures';
import { expectFonts, expectImageLoaded } from './readiness';

test('article archive hydrates once and displays its real cover image', async ({ page }) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  });
  const response = await page.goto('/en/articles/', {
    waitUntil: 'domcontentloaded',
  });
  expect(response?.status()).toBe(200);
  const firstCover = page.locator('.gatsby-image-wrapper img[data-main-image]').first();
  await expectImageLoaded(firstCover, 200);
  await expect(firstCover).toHaveCSS('opacity', '1');
  await expectFonts(page);
  if (test.info().config.updateSnapshots !== 'none') {
    // Archive content changes require an explicit, reviewed first-card expectation.
    expect(
      process.env.ARCHIVE_SNAPSHOT_SLUG,
      'Set ARCHIVE_SNAPSHOT_SLUG to the reviewed newest article slug',
    ).toBeTruthy();
    await expect(page.locator('.main li a.link').first()).toHaveAttribute(
      'href',
      `/en/${process.env.ARCHIVE_SNAPSHOT_SLUG}/`,
    );
  }
  await expect(page).toHaveScreenshot('articles-desktop.png');
  await expect(page.locator('h1')).toHaveCount(1);
  expect(
    await page.locator('h1').evaluate((heading) => heading.getBoundingClientRect().top),
  ).toBeGreaterThanOrEqual(80);
  await expect(page.locator('footer')).toHaveCount(1);
});

test('category index hydrates once and starts at the top', async ({ page }) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  });
  const response = await page.goto('/en/category/', {
    waitUntil: 'domcontentloaded',
  });
  expect(response?.status()).toBe(200);
  await expect(page.locator('.categoryGrid section').first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('category-desktop.png');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
  expect(await page.locator('.categoryGrid section').count()).toBeGreaterThan(2);
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
});

test('client-side archive navigation keeps a single page at the top', async ({ page }) => {
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
  await page.locator('.gatsby-image-wrapper img[data-main-image]').first().waitFor();
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
});

test('Event Sourcing keeps shared membership and reading order when switching to Polish', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  });
  await page.goto('/en/category/event-sourcing/');
  const cards = page.locator('a.readingCard');
  const orderedCards = page.locator('ol.ordered a.readingCard');
  const slugs = (await articleSlugs(cards)).sort();
  const readingOrder = await articleSlugs(orderedCards);
  await page
    .getByRole('link', {
      name: 'Change language to pl',
    })
    .click();
  await page.waitForURL('**/pl/category/event-sourcing/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  await page
    .getByRole('heading', {
      name: 'Polecana kolejność czytania',
      exact: true,
    })
    .waitFor();
  expect((await articleSlugs(cards)).sort()).toEqual(slugs);
  expect(await articleSlugs(orderedCards)).toEqual(readingOrder);
  expect(readingOrder.length).toBeGreaterThan(0);
  expect(new Set(readingOrder).size).toBe(readingOrder.length);
  const fallback = page.locator('ol.ordered a.readingCard[href^="/en/"]').first();
  const target = await fallback.getAttribute('href');
  await fallback.click();
  await page.waitForURL(`**${target}`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveCount(1);
});

async function articleSlugs(cards: Locator): Promise<string[]> {
  return cards.evaluateAll((links) =>
    links.map(
      (link) => new URL(link.getAttribute('href')!, window.location.href).pathname.split('/')[2],
    ),
  );
}
