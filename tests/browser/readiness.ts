import { expect, type Locator, type Page } from '@playwright/test';

export async function expectFonts(page: Page) {
  await expect(page.locator('body')).toHaveCSS('font-family', /Open Sans/);
  await page.evaluate(() => document.fonts.ready);
}

export async function expectImageLoaded(image: Locator, minimumWidth = 1) {
  await expect
    .poll(
      () =>
        image.evaluate(
          (element: HTMLImageElement, width) => element.complete && element.naturalWidth >= width,
          minimumWidth,
        ),
      { timeout: 15_000 },
    )
    .toBe(true);
}
