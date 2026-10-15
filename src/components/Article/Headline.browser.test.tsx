import React from 'react';
import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import Headline from './Headline.tsx';

for (const width of [390, 866]) {
  test(`guide icon shares the first title line at ${width}px`, async () => {
    await page.viewport(width, 900);
    const screen = await render(
      <Headline>
        <span aria-hidden="true">🧱</span> Events on the inside, events on the
        outside
      </Headline>,
    );
    const heading = screen.getByRole('heading').element();
    const icon = heading.querySelector('span')!.getBoundingClientRect();
    const title = Array.from(heading.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
    )!;
    const range = document.createRange();
    range.setStart(title, title.textContent!.search(/\S/));
    range.setEnd(title, title.textContent!.search(/\S/) + 1);
    const firstLetter = range.getBoundingClientRect();
    expect(firstLetter.top).toBeLessThan(icon.bottom);
    expect(firstLetter.bottom).toBeGreaterThan(icon.top);
    expect(firstLetter.left).toBeGreaterThanOrEqual(icon.right);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
  });
}
