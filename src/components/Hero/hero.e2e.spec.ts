import { test, expect } from '../../../tests/helpers/browser/fixtures.ts';
import {
  expectFonts,
  expectStyles,
  expectImageLoaded,
} from '../../../tests/helpers/browser/readiness.ts';
import { expectArtworkClearOfCopy } from '../../../tests/helpers/browser/hero-geometry.ts';

import english from '../../i18n/locales/en/translation.json' with { type: 'json' };
import polish from '../../i18n/locales/pl/translation.json' with { type: 'json' };

const viewports = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  // Effective CSS viewport of a 1280×900 window at 200% browser zoom.
  { width: 640, height: 450 },
  { width: 768, height: 1024 },
  { width: 1024, height: 600 },
  { width: 1263, height: 900 },
  { width: 1264, height: 720 },
  // Reported screenshot dimensions.
  { width: 1264, height: 679 },
  { width: 1264, height: 1000 },
  { width: 1280, height: 720 },
  { width: 1280, height: 1000 },
  { width: 1440, height: 900 },
  { width: 1519, height: 900 },
  { width: 1520, height: 900 },
  { width: 1920, height: 1080 },
];

for (const language of ['en', 'pl']) {
  test(`${language} reduced motion keeps article navigation still`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${language}/`);
    await expectFonts(page);
    const position = await page.locator('.hero button').evaluate((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error('The article cue must be a button');
      }
      button.click();
      return {
        scroll: window.scrollY,
        viewportHeight: window.innerHeight,
        target: document
          .querySelector('#latest-articles')!
          .getBoundingClientRect().top,
      };
    });
    expect(position.scroll).toBeGreaterThan(0);
    expect(position.target).toBeGreaterThanOrEqual(0);
    expect(position.target).toBeLessThan(position.viewportHeight);
    const card = page.locator('.latestArticles li').first();
    await card.hover();
    await expect(card.locator('.responsive-image')).toHaveCSS(
      'transform',
      'none',
    );
    await page.setViewportSize({ width: 390, height: 844 });
    const disclosure = page.getByRole('button', {
      name: /More links|Więcej linków/,
    });
    await disclosure.click();
    await expect(
      page.getByRole('banner').getByRole('navigation'),
    ).toHaveAttribute('data-open');
    await expect(disclosure.locator('svg')).toHaveCSS(
      'transition-duration',
      '0s',
    );
    await expect(page.getByRole('banner').getByRole('navigation')).toHaveCSS(
      'transition-duration',
      '0s',
    );
  });
  const copy = language === 'pl' ? polish : english;
  for (const destination of ['articles', 'talks']) {
    test(`${language} hero lead opens ${destination} in the selected language`, async ({
      page,
    }) => {
      await page.goto(`/${language}/`);
      await expectFonts(page);
      const lead = page.locator('.hero p').first();
      const link = lead.locator(`a[href="/${language}/${destination}/"]`);
      await expect(link).toHaveCSS('text-decoration-line', 'underline');
      await link.click();
      await expect(page).toHaveURL(`/${language}/${destination}/`);
      await expect(
        page.getByRole('heading', {
          name:
            destination === 'articles' ? copy.blog.allTitle : copy.talks.title,
          exact: true,
        }),
      ).toBeVisible();
    });
  }

  test(`${language} hero article cue reaches the latest articles`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${language}/`);
    await expectFonts(page);
    await page.locator('.hero').getByRole('button').click();
    await expect(
      page.getByRole('heading', {
        name: language === 'pl' ? 'Najnowsze artykuły' : 'Latest articles',
        exact: true,
      }),
    ).toBeInViewport();
    await expect(page).toHaveURL(`/${language}/`);
  });

  test(`${language} homepage reflows on a narrow screen when web fonts are unavailable`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.route('**/fonts/open-sans/**', (route) => route.abort());
    await page.goto(`/${language}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    const hero = (await page.locator('.hero').boundingBox())!;
    const heading = (await page.locator('.hero h1').boundingBox())!;
    expect(heading.x).toBeGreaterThanOrEqual(hero.x);
    expect(heading.x + heading.width).toBeLessThanOrEqual(hero.x + hero.width);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(320);
  });

  for (const javaScriptEnabled of [false, true]) {
    test.describe(`${language} hero, JavaScript ${javaScriptEnabled}`, () => {
      test.use({ javaScriptEnabled });

      for (const viewport of viewports) {
        test(`copy stays readable and the portrait fits at ${viewport.width}×${viewport.height}`, async ({
          page,
        }) => {
          await page.setViewportSize(viewport);
          await page.goto(`/${language}/`, { waitUntil: 'domcontentloaded' });
          await expectStyles(page);
          if (javaScriptEnabled) await expectFonts(page);
          const hero = page.locator('.hero');
          const heroBounds = (await hero.boundingBox())!;
          expect(heroBounds.height).toBeGreaterThanOrEqual(viewport.height);
          const header = page.getByRole('banner');
          await expect(header).toHaveCSS('background-color', 'rgb(12, 12, 12)');
          await expect(header).toHaveCSS('height', '80px');
          const heading = (await hero.locator('h1').boundingBox())!;
          const headerBounds = (await header.boundingBox())!;
          expect(heading.y).toBeGreaterThanOrEqual(
            headerBounds.y + headerBounds.height,
          );
          const topInset = heading.y - headerBounds.y - headerBounds.height;
          expect(topInset).toBeGreaterThanOrEqual(20);
          const services = (await hero.getByRole('navigation').boundingBox())!;
          const articleCue = (await hero.getByRole('button').boundingBox())!;
          expect(articleCue.x).toBe(heading.x);
          expect(articleCue.y).toBeGreaterThanOrEqual(
            services.y + services.height,
          );
          expect(
            articleCue.y - services.y - services.height,
          ).toBeLessThanOrEqual(24);
          expect(articleCue.y + articleCue.height).toBeLessThanOrEqual(
            heroBounds.y + heroBounds.height - 20,
          );

          // The responsive image includes a no-JavaScript fallback.
          const portrait = hero.locator('img[data-main-image]').last();
          if (viewport.width < 1264) {
            await expect(portrait).not.toBeVisible();
          } else {
            await expectImageLoaded(portrait);
            await expect(portrait).toBeVisible();
            const photo = (await portrait.boundingBox())!;
            const bounds = (await hero.boundingBox())!;
            expect(photo.x + photo.width).toBeLessThanOrEqual(viewport.width);
            expect(photo.y).toBeGreaterThanOrEqual(headerBounds.height);
            expect(photo.y + photo.height).toBeLessThanOrEqual(
              bounds.y + bounds.height,
            );
            await expectArtworkClearOfCopy(hero, portrait);
            const ratio = await portrait.evaluate(
              (image: HTMLImageElement) =>
                image.naturalWidth / image.naturalHeight,
            );
            expect(photo.width / photo.height).toBeCloseTo(ratio, 2);
          }
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
          ).toBeLessThanOrEqual(viewport.width);
        });
      }
    });
  }
}

for (const language of ['en', 'pl']) {
  test(`${language} artwork keeps its scale when the desktop becomes narrower`, async ({
    page,
  }) => {
    await page.goto(`/${language}/`);
    await expectFonts(page);
    const portrait = page.locator('.hero img[data-main-image]');
    let originalSize: { width: number; height: number } | undefined;
    for (const width of [1920, 1440, 1280, 1264]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect(portrait).toBeVisible();
      const bounds = (await portrait.boundingBox())!;
      const size = { width: bounds.width, height: bounds.height };
      originalSize ??= size;
      expect(size).toEqual(originalSize);
      expect(bounds.x + bounds.width).toBe(width - 40);
    }
  });
}
