import { expect, type Locator, type Page } from '@playwright/test';

export async function expectStyles(page: Page) {
  // DOMContentLoaded does not wait for CSS when JavaScript is disabled.
  await expect
    .poll(() =>
      page
        .locator('link[rel="stylesheet"]')
        .evaluateAll(
          (links) =>
            links.length > 0 &&
            links.every((link) => (link as HTMLLinkElement).sheet !== null),
        ),
    )
    .toBe(true);
  await expect
    .poll(() => page.evaluate(() => document.fonts.status))
    .toBe('loaded');
}

export async function expectFonts(page: Page) {
  await expectStyles(page);
  await expect(page.locator('body')).toHaveCSS('font-family', /Open Sans/);
  await expect(page.locator('html')).toHaveAttribute('data-font600', 'loaded');
  await expect
    .poll(() => page.evaluate(() => document.fonts.status))
    .toBe('loaded');
}

export async function expectImageLoaded(image: Locator, minimumWidth = 1) {
  await expect
    .poll(
      () =>
        image.evaluate(
          (element: HTMLImageElement, width) =>
            element.complete && element.naturalWidth >= width,
          minimumWidth,
        ),
      { timeout: 15_000 },
    )
    .toBe(true);
}
