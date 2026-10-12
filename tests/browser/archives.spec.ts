import type { Locator } from '@playwright/test';
import { test, expect } from './fixtures';
import { expectFonts, expectImageLoaded } from './readiness';

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

test('representative archive card retains its reviewed appearance', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/articles/');
  // Select a specimen by identity, independently of new posts or its list position.
  const card = page.locator('.main li').filter({
    has: page.locator('a.link[href="/en/open-source-a-relict-a-charity-or/"]'),
  });
  await card.scrollIntoViewIfNeeded();
  await expectImageLoaded(card.locator('img[data-main-image]'), 200);
  await expect(card.locator('img[data-main-image]')).toHaveCSS('opacity', '1');
  await expectFonts(page);
  await expect(card).toHaveScreenshot('archive-card-desktop.png');
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
  await expectFonts(page);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
  const cards = page.locator('.categoryGrid section');
  expect(await cards.count()).toBeGreaterThan(0);
  const boxes = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    }),
  );
  expect(new Set(boxes.map((box) => box.x)).size).toBeGreaterThan(1);
  for (const box of boxes) {
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1440);
  }
  for (let index = 1; index < boxes.length; index++) {
    const previous = boxes[index - 1]!;
    const current = boxes[index]!;
    expect(current.y).toBeGreaterThanOrEqual(previous.y);
    if (current.y === previous.y)
      expect(current.x).toBeGreaterThanOrEqual(previous.x + previous.width);
    else expect(current.y).toBeGreaterThanOrEqual(previous.y + previous.height);
  }
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
});

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
  const recommendation = page.locator('ol.ordered a.readingCard').first();
  const target = await recommendation.getAttribute('href');
  await recommendation.click();
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
        page.getByRole('link', { name: 'Change language to en' }),
      ).toBeVisible();
      await expect(page.locator('h1')).toHaveCount(1);
    });
  });
}
