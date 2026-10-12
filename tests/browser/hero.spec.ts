import { test, expect } from './fixtures.ts';
import { expectFonts } from './readiness.ts';

for (const language of ['en', 'pl']) {
  for (const viewport of [
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'tall-desktop', width: 1280, height: 1000 },
  ]) {
    test(`${language} hero keeps the text readable in a ${viewport.name} window`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(`/${language}/`, { waitUntil: 'domcontentloaded' });
      await expectFonts(page);
      await expect(page.locator('html')).toHaveAttribute(
        'data-font600',
        'loaded',
      );
      const hero = page.locator('.hero');
      await hero.evaluate(async (element) => {
        const background = getComputedStyle(element).backgroundImage;
        const source = background.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
        if (!source) throw new Error('Hero background is missing');
        const image = new Image();
        image.src = source;
        await image.decode();
      });
      await expect(hero.locator('h1')).toBeVisible();
      await expect(hero.locator('nav a')).toHaveCount(2);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await expect(hero).toHaveScreenshot(
        `hero-${language}-${viewport.name}.png`,
        { animations: 'disabled' },
      );
    });
  }
}
