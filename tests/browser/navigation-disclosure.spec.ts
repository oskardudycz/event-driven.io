import { test, expect } from './fixtures.ts';
import { expectFonts } from './readiness.ts';

for (const language of ['en', 'pl']) {
  for (const width of [1024, 1280]) {
    test(`${language} overflow navigation is readable and keyboard accessible at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 600 });
      await page.goto(`/${language}/`);
      await expectFonts(page);
      const menu = page.locator('nav.menu');
      const button = menu.getByRole('button', {
        name: /More links|Więcej linków/,
      });
      const panel = menu.locator('.hiddenItemList');
      await button.focus();
      await page.keyboard.press('Enter');
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await expect(button).toHaveAttribute(
        'aria-controls',
        (await panel.getAttribute('id'))!,
      );
      await expect(panel).toHaveCSS('background-color', 'rgb(12, 12, 12)');
      await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
      await expect(button).toHaveCSS('background-color', 'rgb(12, 12, 12)');

      for (const link of await panel.getByRole('link').all()) {
        await link.click({ trial: true, timeout: 5000 });
        await expect(link).toHaveText(/\S/);
        await expect(link).toHaveCSS('color', 'rgb(255, 255, 255)');
        const bounds = (await link.boundingBox())!;
        expect(bounds.width).toBeGreaterThan(180);
        expect(bounds.height).toBeGreaterThanOrEqual(44);
      }
      for (const name of [
        'LinkedIn',
        'GitHub',
        'Mastodon',
        'Bluesky',
        'YouTube',
        'RSS',
      ]) {
        await expect(panel.getByRole('link', { name, exact: true })).toHaveText(
          name,
        );
      }
      const bounds = (await panel.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(600);

      await page.keyboard.press('Tab');
      await expect(panel.getByRole('link').first()).toBeFocused();
      await expect(panel.getByRole('link').first()).toHaveCSS(
        'outline-style',
        'solid',
      );
      await page.keyboard.press('Escape');
      await expect(panel).not.toBeVisible();
      await expect(button).toBeFocused();

      await button.click();
      await menu.getByRole('link', { name: /Change language/ }).focus();
      await page.keyboard.press('Tab');
      await expect(panel).not.toBeVisible();

      await button.click();
      await page.locator('.hero h1').click();
      await expect(panel).not.toBeVisible();

      // The same disclosure follows the themed, compact header after scrolling.
      await page.evaluate(() => window.scrollTo(0, 1000));
      await expect(page.getByRole('banner')).toHaveCSS('height', '50px');
      await button.click();
      await expect(panel).toBeVisible();
      const textColor = await panel.evaluate(
        (element) => getComputedStyle(element).color,
      );
      await expect(button).toHaveCSS('color', textColor);
      const sticky = (await panel.boundingBox())!;
      expect(sticky.y).toBeGreaterThanOrEqual(0);
      expect(sticky.y + sticky.height).toBeLessThanOrEqual(600);
      expect(
        await panel.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        ),
      ).toMatch(/^rgb\(/);
    });
  }
}
