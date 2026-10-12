import { test, expect } from './fixtures.ts';
import { expectFonts } from './readiness.ts';

test.describe('mobile navigation without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  for (const language of ['en', 'pl']) {
    for (const width of [320, 978]) {
      test(`${language} links stay in the lower bar and navigate at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 740 });
        await page.goto(`/${language}/`, { waitUntil: 'domcontentloaded' });
        const menu = page.locator('nav.menu');
        const bar = (await menu.boundingBox())!;
        const links = (await menu.locator('.itemList').boundingBox())!;
        expect(links.y).toBeGreaterThanOrEqual(bar.y);
        expect(links.y + links.height).toBeLessThanOrEqual(740);
        await menu.locator(`a[href="/${language}/articles/"]`).click();
        await expect(page).toHaveURL(`/${language}/articles/`);
      });
    }
  }
});

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
      const panelBackground = await panel.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      );

      for (const link of await panel.getByRole('link').all()) {
        await link.click({ trial: true, timeout: 5000 });
        await link.hover();
        await expect(link).toHaveText(/\S/);
        await expect(link).toHaveCSS('color', 'rgb(255, 255, 255)');
        // Composite the hover background onto its real surface before checking
        // contrast. A white overlay previously hid the panel's white text.
        const contrast = await link.evaluate((element, surface) => {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          const context = canvas.getContext('2d')!;
          function luminance(color: string) {
            context.fillStyle = color;
            context.fillRect(0, 0, 1, 1);
            const channels = Array.from(context.getImageData(0, 0, 1, 1).data)
              .slice(0, 3)
              .map((channel) => {
                const value = channel / 255;
                return value <= 0.04045
                  ? value / 12.92
                  : ((value + 0.055) / 1.055) ** 2.4;
              });
            return (
              channels[0]! * 0.2126 +
              channels[1]! * 0.7152 +
              channels[2]! * 0.0722
            );
          }
          luminance(surface);
          const style = getComputedStyle(element);
          const background = luminance(style.backgroundColor);
          const foreground = luminance(style.color);
          return (
            (Math.max(background, foreground) + 0.05) /
            (Math.min(background, foreground) + 0.05)
          );
        }, panelBackground);
        expect(contrast).toBeGreaterThanOrEqual(4.5);
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
      await expect(
        menu.getByRole('link', { name: /^(Search|Szukaj)$/ }),
      ).toBeFocused();
      await expect(panel).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(menu.locator('summary')).toBeFocused();
      await expect(panel).toBeVisible();
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

for (const language of ['en', 'pl']) {
  for (const width of [1024, 1280, 1440]) {
    test(`${language} header controls have separate targets and stay above passing hero actions at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${language}/`);
      await expectFonts(page);
      const header = page.getByRole('banner');
      const languageLink = header.getByRole('link', {
        name: /Change language/,
      });
      const theme = header.locator('summary');
      const more = header.getByRole('button', {
        name: /More links|Więcej linków/,
      });

      for (const scrolled of [false, true]) {
        if (scrolled) {
          await page.locator('.hero nav').evaluate((element) => {
            window.scrollTo(
              0,
              element.getBoundingClientRect().top + window.scrollY - 20,
            );
          });
          await expect(header).toHaveCSS('height', '50px');
        }
        await expect(async () => {
          const controls = [];
          if (await more.isVisible()) controls.push(more);
          controls.push(languageLink, theme);
          let previousRight: number | undefined;
          for (const control of controls) {
            const box = (await control.boundingBox())!;
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
            if (previousRight !== undefined)
              expect(box.x - previousRight).toBeGreaterThanOrEqual(9);
            previousRight = box.x + box.width;
          }
        }).toPass();

        if (scrolled) {
          const coveredActions = await page
            .locator('.hero nav a')
            .evaluateAll((links) => {
              const header = document.querySelector('header')!;
              const bar = header.getBoundingClientRect();
              return links.map((link) => {
                const box = link.getBoundingClientRect();
                const top = Math.max(box.top, bar.top);
                const bottom = Math.min(box.bottom, bar.bottom);
                if (bottom <= top)
                  throw new Error(
                    'Hero action does not cross the sticky header',
                  );
                const painted = document.elementFromPoint(
                  box.x + box.width / 2,
                  (top + bottom) / 2,
                );
                return header.contains(painted);
              });
            });
          expect(coveredActions).toEqual([true, true]);
          await header.locator('a.logoType').click({ trial: true });
        }
      }
    });
  }
}
