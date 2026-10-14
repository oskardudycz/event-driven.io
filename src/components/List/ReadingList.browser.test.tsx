import React from 'react';
import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import ReadingList from './ReadingList.tsx';

function contrastRatio(foreground: string, background: string, opacity = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is required to measure contrast');

  function luminance() {
    const [red, green, blue] = Array.from(
      context!.getImageData(0, 0, 1, 1).data,
    )
      .slice(0, 3)
      .map((channel) => {
        const value = channel / 255;
        if (value <= 0.04045) return value / 12.92;
        return ((value + 0.055) / 1.055) ** 2.4;
      });
    return red! * 0.2126 + green! * 0.7152 + blue! * 0.0722;
  }

  context.fillStyle = background;
  context.fillRect(0, 0, 1, 1);
  const backgroundLuminance = luminance();
  context.globalAlpha = opacity;
  context.fillStyle = foreground;
  context.fillRect(0, 0, 1, 1);
  const foregroundLuminance = luminance();
  return (
    (Math.max(backgroundLuminance, foregroundLuminance) + 0.05) /
    (Math.min(backgroundLuminance, foregroundLuminance) + 0.05)
  );
}

for (const theme of ['light', 'dark']) {
  for (const language of ['en', 'pl']) {
    for (const width of [390, 1440]) {
      test(`${language} reading dates and order numbers have normal-text contrast in ${theme} at ${width}px`, async () => {
        await page.viewport(width, 900);
        document.documentElement.lang = language;
        document.documentElement.dataset.theme = theme;
        const screen = await render(
          <ReadingList
            ordered
            showImages
            items={[
              {
                id: 'events',
                href: `/${language}/example/`,
                title:
                  language === 'pl'
                    ? 'Niezawodne zdarzenia: żółć'
                    : 'Reliable events',
                date: '2026-01-15',
                image: {
                  src: new URL(
                    '../../../tests/gallery/cover.svg',
                    import.meta.url,
                  ).href,
                },
              },
            ]}
          />,
        );
        const item = screen.getByRole('listitem').element();
        const number = getComputedStyle(item, '::before');
        const date = getComputedStyle(item.querySelector('small')!);
        const card = getComputedStyle(item.querySelector('a')!);
        expect
          .soft(
            contrastRatio(
              number.color,
              number.backgroundColor,
              Number(number.opacity),
            ),
          )
          .toBeGreaterThanOrEqual(4.5);
        expect
          .soft(
            contrastRatio(
              date.color,
              card.backgroundColor,
              Number(date.opacity),
            ),
          )
          .toBeGreaterThanOrEqual(4.5);
      });
    }
  }
}
