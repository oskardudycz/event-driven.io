import { test, expect } from '../../../tests/helpers/browser/fixtures.ts';

for (const language of ['en', 'pl']) {
  for (const theme of ['light', 'dark']) {
    for (const width of [390, 1280]) {
      test(`${language} ${theme} search field remains identifiable at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript((preference) => {
          localStorage.setItem('color-theme', preference);
        }, theme);
        await page.goto(`/${language}/search/`);
        const field = page.getByRole('searchbox', {
          name: language === 'pl' ? 'Szukaj' : 'Search',
        });
        const form = field.locator('..');
        const contrast = async () =>
          form.evaluate((element) => {
            const style = getComputedStyle(element);
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
                  if (value <= 0.04045) return value / 12.92;
                  return ((value + 0.055) / 1.055) ** 2.4;
                });
              return (
                channels[0]! * 0.2126 +
                channels[1]! * 0.7152 +
                channels[2]! * 0.0722
              );
            }
            const background = luminance(style.backgroundColor);
            const border = luminance(style.borderTopColor);
            return (
              (Math.max(background, border) + 0.05) /
              (Math.min(background, border) + 0.05)
            );
          });
        await expect(field).toBeVisible();
        expect.soft(await contrast()).toBeGreaterThanOrEqual(3);
        await field.focus();
        await expect(form).toHaveCSS('outline-style', 'solid');
        expect.soft(await contrast()).toBeGreaterThanOrEqual(3);
        await field.fill('events');
        await page.locator('h1').click();
        await expect(field).toHaveValue('events');
        expect.soft(await contrast()).toBeGreaterThanOrEqual(3);
      });
    }
  }
}
