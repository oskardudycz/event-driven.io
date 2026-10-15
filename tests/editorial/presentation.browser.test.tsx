import React from 'react';
import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { English, Polish } from '../gallery/editorial.story.tsx';

for (const language of ['en', 'pl']) {
  for (const width of [390, 1440]) {
    test(`${language} editorial components at ${width}px`, async () => {
      await page.viewport(width, 900);
      document.documentElement.lang = language;
      const screen = await render(language === 'pl' ? <Polish /> : <English />);
      for (const name of ['Author', 'Archive', 'Related', 'Search']) {
        const section = screen.getByRole('region', { name, exact: true });
        for (const image of section.element().querySelectorAll('img')) {
          await expect
            .poll(() => image.complete && image.naturalWidth > 0)
            .toBe(true);
        }
        await expect
          .element(section)
          .toMatchScreenshot(`${name.toLowerCase()}-${language}-${width}.png`);
      }
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
        window.innerWidth,
      );
      const highlight = page.elementLocator(
        screen.container.querySelector('.search-highlight')!,
      );
      await expect
        .element(highlight)
        .toHaveStyle({ color: 'rgb(146, 64, 14)' });
      const searchLink = screen
        .getByRole('region', { name: 'Search', exact: true })
        .getByRole('link');
      (searchLink.element() as HTMLElement).focus();
      await expect.element(searchLink).toHaveStyle({ outlineStyle: 'solid' });
    });
  }
}

test('editorial components inherit dark theme roles', async () => {
  document.documentElement.lang = 'pl';
  document.documentElement.dataset.theme = 'dark';
  const screen = await render(<Polish />);
  await expect
    .element(document.body)
    .toHaveStyle({ backgroundColor: 'rgb(20, 24, 27)' });
  const link = screen
    .getByRole('region', { name: 'Search', exact: true })
    .getByRole('link');
  await expect.element(link).toHaveStyle({ color: 'rgb(229, 231, 235)' });
  await expect
    .element(screen.getByRole('region', { name: 'Author', exact: true }))
    .toMatchTextContent(/Zażółć gęślą jaźń/);
});
