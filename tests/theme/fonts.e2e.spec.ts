import { test, expect } from '../helpers/browser/fixtures.ts';
import { expectFonts } from '../helpers/browser/readiness.ts';

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

for (const language of ['en', 'pl']) {
  test(`${language} fonts and navigation work before external JavaScript loads`, async ({
    page,
  }) => {
    let blockedScripts = 0;
    await page.route('**/*', (route) => {
      if (route.request().resourceType() === 'script') {
        blockedScripts++;
        return route.abort();
      }
      return route.fallback();
    });
    await page.goto(`/${language}/`, { waitUntil: 'domcontentloaded' });
    await expectFonts(page);
    await expect.poll(() => blockedScripts).toBeGreaterThan(0);
    await page
      .locator(`header a[href="/${language}/articles/"]`)
      .first()
      .click();
    await page.waitForURL(`**/${language}/articles/`);
    await expectFonts(page);
    await expect(page.locator('main h1')).toHaveCount(1);
  });
}
