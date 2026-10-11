import { test, expect } from './fixtures';
import { expectFonts } from './readiness';

// Browser preferences are worker options, so this case has its own test file.
test.use({
  launchOptions: {
    firefoxUserPrefs: { 'font.size.variable.x-western': 24 },
  },
  viewport: { width: 1100, height: 900 },
});

test('header navigation and theme control share their desktop threshold with larger browser fonts', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'firefox',
    'Firefox exposes browser font preferences through launch options.',
  );
  await page.goto('/en/contact/');
  await expectFonts(page);
  await expect(page.locator('body')).toHaveCSS('font-size', '24px');
  const header = page.getByRole('banner');
  const menu = header.locator('nav.menu');
  const theme = header.getByLabel('Theme', { exact: true });
  await expect(theme).toHaveAttribute('aria-disabled', 'false');
  await expect(theme).toBeInViewport();
  await expect
    .poll(async () => {
      const menuBounds = (await menu.boundingBox())!;
      const themeBounds = (await theme.boundingBox())!;
      return themeBounds.x - (menuBounds.x + menuBounds.width);
    })
    .toBeGreaterThanOrEqual(0);
});
