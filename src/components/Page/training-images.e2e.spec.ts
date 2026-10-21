import { test, expect } from '../../../tests/helpers/browser/fixtures.ts';
import { expectImageLoaded } from '../../../tests/helpers/browser/readiness.ts';
import sharp from 'sharp';
import type { Locator } from '@playwright/test';

async function expectClearCorner(
  image: Locator,
  colorScheme: 'dark' | 'light',
) {
  const screenshot = await image.screenshot();
  if (colorScheme === 'dark') {
    await test.info().attach((await image.getAttribute('alt')) || 'artwork', {
      body: screenshot,
      contentType: 'image/png',
    });
  }
  const { data } = await sharp(screenshot)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  expect([...data]).toEqual(
    colorScheme === 'dark' ? [20, 24, 27] : [255, 255, 255],
  );
}

for (const locale of ['en', 'pl']) {
  for (const width of [390, 1280]) {
    for (const hydrated of [false, true]) {
      test.describe(`${locale} training images at ${width}px, React hydration ${hydrated}`, () => {
        test.use({ viewport: { width, height: 900 } });

        test('artwork has clear corners and no blurred layer in either theme', async ({
          page,
        }) => {
          // Keep the first-paint theme bootstrap, but test SSR without React.
          if (!hydrated) await page.route('**/*.js', (route) => route.abort());
          for (const colorScheme of ['dark', 'light'] as const) {
            await page.emulateMedia({ colorScheme });
            for (const workshop of [
              'szkolenie-event-sourcing',
              'szkolenie-granice-spojnosci-i-modelowanie_eda',
            ]) {
              await page.goto(`/${locale}/${workshop}/`);
              const signUp = page.getByRole('img', {
                name: locale === 'en' ? 'Sign up!' : 'Zapisz się!',
                exact: true,
              });
              const count = await signUp.count();
              await expect(
                page
                  .getByRole('link', {
                    name: locale === 'en' ? /Sign up/ : /Zapisz się/,
                  })
                  .first(),
              ).toHaveAttribute('href', 'https://forms.gle/YxfhZ9wUQetX9iue8');
              if (
                workshop === 'szkolenie-granice-spojnosci-i-modelowanie_eda'
              ) {
                expect(count).toBeGreaterThan(0);
              }
              for (let index = 0; index < count; index++) {
                const image = signUp.nth(index);
                await image.scrollIntoViewIfNeeded();
                await expectImageLoaded(image);
                await expect(image).toHaveCSS(
                  'background-color',
                  'rgba(0, 0, 0, 0)',
                );
                await expect(image).toHaveCSS('filter', 'none');
                await expect(
                  image.locator('xpath=ancestor::a[1]'),
                ).toHaveAttribute(
                  'href',
                  'https://forms.gle/YxfhZ9wUQetX9iue8',
                );
                const dimensions = await image.evaluate(
                  (element: HTMLImageElement) => ({
                    rendered: element.getBoundingClientRect().width,
                    natural: element.naturalWidth,
                  }),
                );
                expect(dimensions.rendered).toBeLessThanOrEqual(
                  dimensions.natural,
                );
                if (index === 0) await expectClearCorner(image, colorScheme);
              }
              const portrait = page.getByRole('img', {
                name: 'Jakub Pilimon',
                exact: true,
              });
              if (await portrait.count()) {
                await portrait.scrollIntoViewIfNeeded();
                await expectImageLoaded(portrait);
                await expect(portrait).toHaveCSS(
                  'background-color',
                  'rgba(0, 0, 0, 0)',
                );
                await expectClearCorner(portrait, colorScheme);
              }
              const artwork = page.locator('.article-image').filter({
                has: page.locator(
                  'img[alt="Jakub Pilimon"], img[alt="Sign up!"], img[alt="Zapisz się!"]',
                ),
              });
              const backgrounds = artwork.locator('.article-image-placeholder');
              for (const background of await backgrounds.all()) {
                await expect(background).toHaveCSS('background-image', 'none');
              }
            }
          }
        });
      });
    }
  }
}

test('training artwork remains transparent across locale navigation', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/en/szkolenie-granice-spojnosci-i-modelowanie_eda/');
  for (const locale of ['pl', 'en']) {
    await page
      .getByRole('link', {
        name:
          locale === 'pl'
            ? 'Change language to Polish'
            : 'Zmień język na angielski',
      })
      .click();
    await expect(page).toHaveURL(
      `/${locale}/szkolenie-granice-spojnosci-i-modelowanie_eda/`,
    );
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    const button = page
      .getByRole('img', {
        name: locale === 'en' ? 'Sign up!' : 'Zapisz się!',
        exact: true,
      })
      .first();
    await button.scrollIntoViewIfNeeded();
    await expectImageLoaded(button);
    await expectClearCorner(button, 'dark');
  }
});
