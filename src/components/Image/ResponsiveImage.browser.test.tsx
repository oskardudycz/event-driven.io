import React from 'react';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import ResponsiveImage from './ResponsiveImage.tsx';

test('a fixed image reserves exactly its dimensions without an extra text baseline gap', async () => {
  const screen = await render(
    <div data-testid="frame" style={{ fontSize: 16, lineHeight: 'normal' }}>
      <ResponsiveImage
        image={{
          layout: 'fixed',
          width: 40,
          height: 30,
          images: {
            fallback: {
              src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="30"/%3E',
            },
          },
        }}
        alt="Fixed artwork"
      />
    </div>,
  );
  const frame = screen.getByTestId('frame').element();
  const image = screen.getByRole('img', { name: 'Fixed artwork' }).element();
  expect(frame.getBoundingClientRect().height).toBe(30);
  expect(image.getBoundingClientRect().height).toBe(30);
  expect(image.getBoundingClientRect().width).toBe(40);
});
