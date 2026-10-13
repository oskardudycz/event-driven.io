import { test, expect } from '../../../tests/helpers/browser/fixtures.ts';
import {
  expectFonts,
  expectImageLoaded,
} from '../../../tests/helpers/browser/readiness.ts';
import { expectArtworkClearOfCopy } from '../../../tests/helpers/browser/hero-geometry.ts';

const viewports = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  // Effective CSS viewport of a 1280×900 window at 200% browser zoom.
  { width: 640, height: 450 },
  { width: 768, height: 1024 },
  { width: 1024, height: 600 },
  { width: 1263, height: 900 },
  { width: 1264, height: 720 },
  // Reported screenshot dimensions.
  { width: 1264, height: 679 },
  { width: 1264, height: 1000 },
  { width: 1280, height: 720 },
  { width: 1280, height: 1000 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

for (const language of ['en', 'pl']) {
  test(`${language} homepage reflows on a narrow screen when web fonts are unavailable`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.route('**/fonts/open-sans/**', (route) => route.abort());
    await page.goto(`/${language}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    const hero = (await page.locator('.hero').boundingBox())!;
    const heading = (await page.locator('.hero h1').boundingBox())!;
    expect(heading.x).toBeGreaterThanOrEqual(hero.x);
    expect(heading.x + heading.width).toBeLessThanOrEqual(hero.x + hero.width);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(320);
  });

  for (const javaScriptEnabled of [false, true]) {
    test.describe(`${language} hero, JavaScript ${javaScriptEnabled}`, () => {
      test.use({ javaScriptEnabled });

      for (const viewport of viewports) {
        test(`copy stays readable and the portrait fits at ${viewport.width}×${viewport.height}`, async ({
          page,
        }) => {
          await page.setViewportSize(viewport);
          await page.goto(`/${language}/`, { waitUntil: 'domcontentloaded' });
          if (javaScriptEnabled) await expectFonts(page);
          const hero = page.locator('.hero');
          const header = page.getByRole('banner');
          await expect(header).toHaveCSS('background-color', 'rgb(12, 12, 12)');
          await expect(header).toHaveCSS('height', '80px');
          const heading = (await hero.locator('h1').boundingBox())!;
          const headerBounds = (await header.boundingBox())!;
          expect(heading.y).toBeGreaterThanOrEqual(
            headerBounds.y + headerBounds.height,
          );
          const topInset = heading.y - headerBounds.y - headerBounds.height;
          expect(topInset).toBeGreaterThanOrEqual(24);
          expect(topInset).toBeLessThanOrEqual(48);

          // Gatsby also renders a noscript fallback when JavaScript is disabled.
          const portrait = hero.locator('img[data-main-image]').last();
          if (viewport.width < 1264) {
            await expect(portrait).not.toBeVisible();
          } else {
            await expectImageLoaded(portrait);
            await expect(portrait).toBeVisible();
            const photo = (await portrait.boundingBox())!;
            const bounds = (await hero.boundingBox())!;
            expect(photo.x + photo.width).toBeLessThanOrEqual(viewport.width);
            expect(photo.y).toBeGreaterThanOrEqual(headerBounds.height);
            expect(photo.y + photo.height).toBeLessThanOrEqual(
              bounds.y + bounds.height,
            );
            await expectArtworkClearOfCopy(hero, portrait);
            const ratio = await portrait.evaluate(
              (image: HTMLImageElement) =>
                image.naturalWidth / image.naturalHeight,
            );
            expect(photo.width / photo.height).toBeCloseTo(ratio, 2);
          }
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
          ).toBeLessThanOrEqual(viewport.width);
        });
      }
    });
  }
}

for (const language of ['en', 'pl']) {
  test(`${language} artwork keeps its scale when the desktop becomes narrower`, async ({
    page,
  }) => {
    await page.goto(`/${language}/`);
    await expectFonts(page);
    const portrait = page.locator('.hero img[data-main-image]');
    let originalSize: { width: number; height: number } | undefined;
    for (const width of [1920, 1440, 1280, 1264]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect(portrait).toBeVisible();
      const bounds = (await portrait.boundingBox())!;
      const size = { width: bounds.width, height: bounds.height };
      originalSize ??= size;
      expect(size).toEqual(originalSize);
      expect(bounds.x + bounds.width).toBe(width - 40);
    }
  });
}
