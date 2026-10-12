import { test, expect } from './fixtures.ts';
import { expectFonts, expectImageLoaded } from './readiness.ts';
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
  for (const width of [320, 390, 768, 1280]) {
    test(`${language} header portrait fits and stays centered at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      for (const path of [`/${language}/`, `/${language}/articles/`]) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await expectFonts(page);
        const header = page.locator('header.header');
        const portrait = header.locator('.logo');
        const image = portrait.locator('img');
        await expectImageLoaded(image);
        await page.evaluate(() => window.scrollTo(0, 0));
        await expect(header).not.toHaveClass(/\bfixed\b/);

        for (const scroll of [0, 600]) {
          await page.evaluate((offset) => window.scrollTo(0, offset), scroll);
          if (scroll > 0) await expect(header).toHaveClass(/\bfixed\b/);
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
