import type { Page } from '@playwright/test';
import { test, expect } from '../helpers/browser/fixtures.ts';
import { expectFonts } from '../helpers/browser/readiness.ts';

// Each page template ships its own stylesheet. Client navigation loads the
// destination's stylesheet after the shared one; the result must match a
// server-rendered visit to the same page.
const journeys = [
  {
    name: 'archive card to article',
    from: '/en/articles/tag/event-sourcing/',
    link: (page: Page) => page.locator('main li > a.link').first(),
  },
  {
    name: 'article tag to tag archive',
    from: '/en/idempotent_command_handling/',
    link: (page: Page) => page.locator('main header .meta a').first(),
  },
  {
    name: 'guide list to guide',
    from: '/en/guides/',
    link: (page: Page) =>
      page.locator('main a[href="/en/guides/event-driven-architecture/"]'),
  },
  {
    name: 'article to homepage',
    from: '/en/idempotent_command_handling/',
    link: (page: Page) =>
      page
        .getByRole('banner')
        .getByRole('navigation')
        .locator('a[data-slug="/"]'),
  },
];

const properties = [
  'display',
  'position',
  'color',
  'background-color',
  'font-size',
  'font-weight',
  'line-height',
  'margin-top',
  'margin-bottom',
  'padding-top',
  'padding-left',
  'border-top-width',
  'border-left-width',
  'grid-template-columns',
  'max-width',
];

async function renderedStyles(page: Page) {
  await expectFonts(page);
  // Fonts initialize before React. Compare hydrated visits on both paths;
  // the theme fieldset becomes enabled when its real client state is ready.
  await expect(page.locator('header fieldset')).toBeEnabled();
  await page.mouse.move(0, 0);
  return page.evaluate((properties) => {
    for (const animation of document.getAnimations()) {
      try {
        animation.finish();
      } catch {
        animation.cancel();
      }
    }
    // Images and third-party embeds change as they load, not with stylesheets.
    const changing = '[data-gatsby-image-wrapper], iframe, #disqus_thread';
    return Array.from(
      document.querySelectorAll('header, main, footer, main *, header *'),
    )
      .filter((element) => !element.closest(changing))
      .map((element) => {
        const style = getComputedStyle(element);
        return [
          element.tagName,
          ...properties.map((property) => style.getPropertyValue(property)),
        ].join('|');
      });
  }, properties);
}

for (const { name, from, link } of journeys) {
  for (const width of [390, 1280]) {
    test(`${name} keeps server-rendered styles after client navigation at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(from);
      await expectFonts(page);
      await page.evaluate(() => {
        (window as Window & { clientVisit?: boolean }).clientVisit = true;
      });
      const target = link(page);
      const destination = (await target.getAttribute('href'))!;
      await target.click();
      await expect(page).toHaveURL(destination);
      await expect(page.locator('main h1, main h2').first()).toBeVisible();
      expect(
        await page.evaluate(
          () => (window as Window & { clientVisit?: boolean }).clientVisit,
        ),
      ).toBe(true);
      await expect
        .poll(async () => (await renderedStyles(page)).length)
        .toBeGreaterThan(20);
      const afterNavigation = await renderedStyles(page);

      await page.goto(destination);
      expect(await renderedStyles(page)).toEqual(afterNavigation);
    });
  }
}
