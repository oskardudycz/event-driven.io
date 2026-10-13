import { test, expect } from '../../../tests/helpers/browser/fixtures.ts';
import { expectFonts } from '../../../tests/helpers/browser/readiness.ts';
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
  await expect
    .poll(async () => {
      const [searchBox, themeBox] = await Promise.all([
        search.boundingBox(),
        theme.boundingBox(),
      ]);
      if (!searchBox || !themeBox) return null;
      return {
        verticalOffset: themeBox.y - searchBox.y,
        gap: themeBox.x - searchBox.x - searchBox.width,
      };
    })
    .toEqual({ verticalOffset: 0, gap: 10 });
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
