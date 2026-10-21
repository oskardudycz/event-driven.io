import React from 'react';
import { expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import Bodytext from './Bodytext.tsx';

for (const width of [390, 1280]) {
  test(`heading permalinks stay outside the text and appear for keyboard focus at ${width}px`, async () => {
    await page.viewport(width, 900);
    const screen = await render(
      <>
        <button type="button">Before heading</button>
        <Bodytext html='<h2 id="example" style="position:relative;"><a href="#example" class="anchor before" aria-label="example permalink"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path d="M0 0h16v16H0z" /></svg></a>Example heading</h2>' />
      </>,
    );
    await screen.getByRole('button', { name: 'Before heading' }).click();
    const link = screen.getByRole('link', { name: 'example permalink' });
    const icon = link.element().querySelector('svg')!;
    expect(getComputedStyle(icon).visibility).toBe('hidden');
    const heading = screen.getByRole('heading').element();
    expect(link.element().getBoundingClientRect().right).toBeLessThanOrEqual(
      heading.getBoundingClientRect().left,
    );
    await userEvent.tab();
    await expect.element(link).toHaveFocus();
    expect(getComputedStyle(icon).visibility).toBe('visible');
  });
}
