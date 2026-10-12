import { test, expect } from './fixtures.ts';
import { expectFonts } from './readiness.ts';
import type { Locator } from '@playwright/test';

async function expectMatchingActions(search: Locator, theme: Locator) {
  await expect(search).toBeInViewport();
  await expect(theme).toBeInViewport();
  for (const control of [search, theme]) {
    const bounds = (await control.boundingBox())!;
    expect(bounds.width).toBe(44);
    expect(bounds.height).toBe(44);
    await expect(control.locator('svg')).toHaveCSS('width', '20px');
    await expect(control.locator('svg')).toHaveCSS('height', '20px');
  }
  const searchBox = (await search.boundingBox())!;
  const themeBox = (await theme.boundingBox())!;
  expect(themeBox.y).toBe(searchBox.y);
  expect(themeBox.x - searchBox.x - searchBox.width).toBe(10);
}

for (const javaScriptEnabled of [false, true]) {
  test.describe(`persistent navigation actions, JavaScript ${javaScriptEnabled}`, () => {
    test.use({ javaScriptEnabled });
    for (const language of ['en', 'pl']) {
      for (const width of [320, 1280]) {
        test(`${language} search stays beside appearance at ${width}px`, async ({
          page,
        }) => {
          await page.setViewportSize({ width, height: 844 });
          await page.goto(`/${language}/`, { waitUntil: 'domcontentloaded' });
          if (javaScriptEnabled) await expectFonts(page);
          const menu = page.locator('nav.menu');
          const search = menu.getByRole('link', {
            name: language === 'pl' ? 'Szukaj' : 'Search',
            exact: true,
          });
          const theme = menu.locator('summary');
          await expect(search).toHaveCount(1);
          await expect(search).toHaveAttribute('href', `/${language}/search/`);
          await expectMatchingActions(search, theme);
          await search.click({ trial: true });

          if (javaScriptEnabled) {
            await menu
              .getByRole('button', { name: /More links|Więcej linków/ })
              .click();
            await expectMatchingActions(search, theme);
            await search.click({ trial: true });
            await theme.click();
            await expect(menu.getByRole('radio').first()).toBeInViewport();
            await page.keyboard.press('Escape');
            await page.evaluate(() => window.scrollTo(0, 600));
            await expect(page.locator('header.header')).toHaveClass(/fixed/);
            await expectMatchingActions(search, theme);
          }

          await search.click();
          await expect(page).toHaveURL(`/${language}/search/`);
          await expect(page.locator('h1')).toHaveText(
            language === 'pl' ? 'Szukaj' : 'Search',
          );
        });
      }
    }
  });
}
