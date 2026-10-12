import { test, expect } from '@playwright/test';

for (const language of ['en', 'pl']) {
  for (const width of [390, 1440]) {
    test(`${language} editorial components at ${width}px`, async ({
      mount,
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const component = await mount(
        `Editorial/${language === 'pl' ? 'Polish' : 'English'}`,
      );
      for (const name of ['Author', 'Archive', 'Related', 'Search']) {
        const section = component.getByRole('region', { name, exact: true });
        await section.scrollIntoViewIfNeeded();
        for (const image of await section.locator('img').all()) {
          await expect
            .poll(() =>
              image.evaluate(
                (element: HTMLImageElement) =>
                  element.complete && element.naturalWidth > 0,
              ),
            )
            .toBe(true);
        }
        await expect(section).toHaveScreenshot(
          `${name.toLowerCase()}-${language}-${width}.png`,
        );
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await expect(component.locator('.search-highlight').first()).toHaveCSS(
        'color',
        'rgb(85, 112, 28)',
      );
      await component.locator('.search-hit-link').focus();
      await expect(component.locator('.search-hit-link')).toHaveCSS(
        'outline-style',
        'solid',
      );
    });
  }
}

test('editorial components inherit dark theme roles', async ({
  mount,
  page,
}) => {
  const component = await mount('Editorial/Polish', { theme: 'dark' });
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(20, 24, 27)',
  );
  await expect(component.locator('.search-hit-link')).toHaveCSS(
    'color',
    'rgb(229, 231, 235)',
  );
  await expect(
    component.getByRole('region', { name: 'Author', exact: true }),
  ).toContainText('Zażółć gęślą jaźń');
});
