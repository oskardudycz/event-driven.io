import type { Locator } from '@playwright/test';
import { test, expect } from '../helpers/browser/fixtures.ts';
import { expectFonts } from '../helpers/browser/readiness.ts';

async function expectTextContrast(locator: Locator) {
  const ratio = await locator.evaluate((element) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d')!;
    const ancestors: Element[] = [];
    for (
      let ancestor: Element | null = element;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      ancestors.unshift(ancestor);
    }
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 1, 1);
    for (const ancestor of ancestors) {
      context.fillStyle = getComputedStyle(ancestor).backgroundColor;
      context.fillRect(0, 0, 1, 1);
    }
    function luminance() {
      const channels = Array.from(context.getImageData(0, 0, 1, 1).data)
        .slice(0, 3)
        .map((channel) => {
          const value = channel / 255;
          if (value <= 0.04045) return value / 12.92;
          return ((value + 0.055) / 1.055) ** 2.4;
        });
      return (
        channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
      );
    }
    const background = luminance();
    const style = getComputedStyle(element);
    context.globalAlpha = Number(style.opacity);
    context.fillStyle = style.color;
    context.fillRect(0, 0, 1, 1);
    const foreground = luminance();
    return (
      (Math.max(background, foreground) + 0.05) /
      (Math.min(background, foreground) + 0.05)
    );
  });
  expect(ratio).toBeGreaterThanOrEqual(4.5);
}

for (const language of ['en', 'pl']) {
  for (const theme of ['light', 'dark'] as const) {
    for (const width of [390, 1280]) {
      test(`${language} ${theme} palette stays readable before hydration and during search at ${width}px`, async ({
        page,
      }) => {
        const accent =
          theme === 'light' ? 'rgb(146, 64, 14)' : 'rgb(255, 216, 77)';
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript(
          (preference) => localStorage.setItem('color-theme', preference),
          theme,
        );
        // Retain the inline first-paint theme bootstrap, block React bundles.
        await page.route('**/*.js', (route) => route.abort());
        const article = `/${language}/introduction_to_event_sourcing/`;
        await page.goto(article);
        const link = page.locator('.bodytext p a:not(:has(img))').first();
        await expect(link).toHaveCSS('color', accent);
        await expect(link).toHaveCSS('text-decoration-line', 'underline');
        await expectTextContrast(link);
        await page.unroute('**/*.js');
        await page.goto(article);
        await expectFonts(page);
        await link.hover();
        await expect(link).toHaveCSS('color', accent);
        await expectTextContrast(link);
        await link.focus();
        await expectTextContrast(link);
        const navigationLink = page.locator('.itemList .item a').first();
        await navigationLink.hover();
        await navigationLink.evaluate(async (element) => {
          await Promise.all(
            element.getAnimations().map((animation) => animation.finished),
          );
        });
        await expectTextContrast(navigationLink);

        await page.goto(`/${language}/search/`);
        const input = page.getByRole('searchbox', {
          name: language === 'pl' ? 'Szukaj' : 'Search',
        });
        await input.fill('event sourcing');
        const result = page.locator('.search-hit').first();
        await expect(result).toBeVisible();
        const mark = result.locator('mark').first();
        await expect(mark).toHaveCSS('color', accent);
        await expectTextContrast(mark);
        const resultLink = result.getByRole('link').first();
        await resultLink.hover();
        await expect(resultLink).toHaveCSS(
          'background-color',
          theme === 'light' ? 'rgb(250, 250, 249)' : 'rgb(32, 38, 44)',
        );
        await expectTextContrast(mark);
        await resultLink.focus();
        await expect(resultLink).toHaveCSS('outline-style', 'solid');
        await expectTextContrast(mark);
        const selected = page.locator('button[aria-current="page"]');
        await expect(selected).toBeVisible();
        await expect(selected).toHaveCSS(
          'background-color',
          'rgb(255, 216, 77)',
        );
        await expectTextContrast(selected);
        await selected.hover();
        await expect(selected).toHaveCSS(
          'background-color',
          'rgb(255, 216, 77)',
        );
        await expectTextContrast(selected);
        await selected.focus();
        await expect(selected).toHaveCSS('outline-style', 'solid');
        await expectTextContrast(selected);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width);
        await page.emulateMedia({
          colorScheme: theme,
          forcedColors: 'active',
        });
        await expectTextContrast(mark);
      });
    }
  }
}
