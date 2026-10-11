import { test, expect } from './fixtures';
import { expectFonts } from './readiness';

for (const language of ['en', 'pl']) {
  for (const width of [390, 1280]) {
    test(`${language} interface controls use the page font at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['', 'search/', 'introduction_to_event_sourcing/']) {
        await page.goto(`/${language}/${path}`);
        await expectFonts(page);
        const controls = page.locator('button, input, select, textarea');
        expect(await controls.count()).toBeGreaterThan(0);
        for (const control of await controls.all()) {
          await expect(control).toHaveCSS('font-family', /Open Sans/);
        }
      }
    });
  }
}
