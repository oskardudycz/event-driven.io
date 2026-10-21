import { test, expect } from '../../../tests/helpers/browser/fixtures.ts';
import {
  expectFonts,
  expectStyles,
  expectImageLoaded,
} from '../../../tests/helpers/browser/readiness.ts';
import type { Locator } from '@playwright/test';

async function expectCenteredInside(element: Locator, container: Locator) {
  const inner = await element.boundingBox();
  const outer = await container.boundingBox();
  expect(inner).not.toBeNull();
  expect(outer).not.toBeNull();
  if (!inner || !outer)
    throw new Error('Header portrait geometry is unavailable');

  expect(inner.x).toBeGreaterThanOrEqual(outer.x - 1);
  expect(inner.y).toBeGreaterThanOrEqual(outer.y - 1);
  expect(inner.x + inner.width).toBeLessThanOrEqual(outer.x + outer.width + 1);
  expect(inner.y + inner.height).toBeLessThanOrEqual(
    outer.y + outer.height + 1,
  );
  expect(
    Math.abs(inner.y + inner.height / 2 - (outer.y + outer.height / 2)),
  ).toBeLessThanOrEqual(1);
}

for (const language of ['en', 'pl']) {
  for (const javaScriptEnabled of [false, true]) {
    test.describe(`${language} enlarged branding, JavaScript ${javaScriptEnabled}`, () => {
      test.use({ javaScriptEnabled });

      test('header and hero stay clear at 200% text size', async ({ page }) => {
        for (const width of [320, 390, 640, 1280]) {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(`/${language}/`, { waitUntil: 'domcontentloaded' });
          await expectStyles(page);
          if (javaScriptEnabled) await expectFonts(page);
          await page.evaluate(() => {
            document.documentElement.style.fontSize = '200%';
          });
          const header = (await page.getByRole('banner').boundingBox())!;
          const brand = (await page
            .getByRole('banner')
            .getByRole('link', { name: 'Event-Driven by Oskar Dudycz' })
            .boundingBox())!;
          const heading = (await page.locator('.hero h1').boundingBox())!;
          expect(brand.y).toBeGreaterThanOrEqual(header.y);
          expect(brand.y + brand.height).toBeLessThanOrEqual(
            header.y + header.height,
          );
          expect(brand.x + brand.width).toBeLessThanOrEqual(width);
          expect(heading.y).toBeGreaterThanOrEqual(header.y + header.height);
          await expect
            .poll(() =>
              page.evaluate(() => document.documentElement.scrollWidth),
            )
            .toBe(width);
        }
      });
    });
  }
  for (const width of [320, 390, 768, 978, 1280]) {
    test(`${language} header portrait fits and stays centered at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      for (const path of [`/${language}/`, `/${language}/articles/`]) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await expectFonts(page);
        const header = page.getByRole('banner');
        const image = header.getByRole('img', {
          name: 'Event-Driven by Oskar Dudycz',
        });
        const portrait = image.locator('..');
        await expectImageLoaded(image);
        await page.evaluate(() => window.scrollTo(0, 0));
        await expect(header).not.toHaveAttribute('data-fixed');
        if (path === `/${language}/`) {
          const brand = (await header
            .getByRole('link', { name: 'Event-Driven by Oskar Dudycz' })
            .boundingBox())!;
          const heading = (await page.locator('.hero h1').boundingBox())!;
          expect(brand.x).toBeCloseTo(heading.x, 0);
        }

        for (const scroll of [0, 600]) {
          await page.evaluate((offset) => window.scrollTo(0, offset), scroll);
          if (scroll > 0) await expect(header).toHaveAttribute('data-fixed');
          await expect(async () => {
            await expectCenteredInside(portrait, header);
            await expectCenteredInside(image, portrait);
            const bounds = await image.boundingBox();
            const frame = await portrait.boundingBox();
            expect(
              Math.abs(bounds!.width - bounds!.height),
            ).toBeLessThanOrEqual(1);
            expect(
              Math.abs(
                bounds!.x + bounds!.width / 2 - (frame!.x + frame!.width / 2),
              ),
            ).toBeLessThanOrEqual(1);
          }).toPass({ timeout: 3000 });
        }
      }
    });
  }
}
