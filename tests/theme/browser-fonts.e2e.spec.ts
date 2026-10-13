import { test, expect } from '../helpers/browser/fixtures.ts';
import { expectFonts } from '../helpers/browser/readiness.ts';
import { expectArtworkClearOfCopy } from '../helpers/browser/hero-geometry.ts';

// Browser preferences are worker options, so this case has its own test file.
test.use({
  launchOptions: {
    firefoxUserPrefs: { 'font.size.variable.x-western': 24 },
  },
  viewport: { width: 1100, height: 900 },
});

test('header navigation and theme control share their desktop threshold with larger browser fonts', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'firefox',
    'Firefox exposes browser font preferences through launch options.',
  );
  await page.goto('/en/contact/');
  await expectFonts(page);
  await expect(page.locator('body')).toHaveCSS('font-size', '24px');
  const header = page.getByRole('banner');
  const menu = header.locator('nav.menu');
  const theme = header.getByLabel('Theme', { exact: true });
  await expect(theme).toHaveAttribute('aria-disabled', 'false');
  await expect(theme).toBeInViewport();
  const language = menu.getByRole('link', { name: 'Change language to pl' });
  await expect
    .poll(async () => {
      const languageBounds = (await language.boundingBox())!;
      const themeBounds = (await theme.boundingBox())!;
      return themeBounds.x - (languageBounds.x + languageBounds.width);
    })
    .toBeGreaterThanOrEqual(0);
  await theme.click({ trial: true });
});

test('homepage copy and artwork stay separate with larger browser fonts in both languages', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'firefox',
    'Firefox exposes browser font preferences through launch options.',
  );
  for (const language of ['en', 'pl']) {
    await page.goto(`/${language}/`);
    await expectFonts(page);
    await expect(page.locator('body')).toHaveCSS('font-size', '24px');
    const hero = page.locator('.hero');
    // This width cannot fit the original-scale artwork beside enlarged prose.
    await expect(hero.locator('img[data-main-image]')).not.toBeVisible();
    const header = page.getByRole('banner');
    const headerBounds = (await header.boundingBox())!;
    const title = (await header.locator('a.logoType').boundingBox())!;
    expect(title.y).toBeGreaterThanOrEqual(headerBounds.y);
    expect(title.y + title.height).toBeLessThanOrEqual(
      headerBounds.y + headerBounds.height,
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(1100);
    await page.setViewportSize({ width: 1920, height: 1080 });
    const portrait = hero.locator('img[data-main-image]');
    await expect(portrait).toBeVisible();
    await expectArtworkClearOfCopy(hero, portrait);
    await page.setViewportSize({ width: 1100, height: 900 });
  }
});
