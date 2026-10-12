import { expect, type Locator } from '@playwright/test';
import { expectImageLoaded } from './readiness.ts';

// The authored triangle has a large transparent canvas. Rectangle intersection
// alone cannot tell whether text is being painted over the visible artwork.
export async function expectArtworkClearOfCopy(hero: Locator, image: Locator) {
  await expectImageLoaded(image);
  const section = await hero.elementHandle();
  const collisions = await image.evaluate(
    (image: HTMLImageElement, section) => {
      if (!section) throw new Error('Hero section is missing');
      const photo = image.getBoundingClientRect();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const scaleX = canvas.width / photo.width;
      const scaleY = canvas.height / photo.height;

      function touchesArtwork(rect: DOMRect) {
        const left = Math.max(0, Math.floor((rect.left - photo.left) * scaleX));
        const right = Math.min(
          canvas.width,
          Math.ceil((rect.right - photo.left) * scaleX),
        );
        const top = Math.max(0, Math.floor((rect.top - photo.top) * scaleY));
        const bottom = Math.min(
          canvas.height,
          Math.ceil((rect.bottom - photo.top) * scaleY),
        );
        for (let y = top; y < bottom; y++) {
          for (let x = left; x < right; x++) {
            if (data[(y * canvas.width + x) * 4 + 3]! > 0) return true;
          }
        }
        return false;
      }

      const collisions: string[] = [];
      const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        if (Array.from(range.getClientRects()).some(touchesArtwork)) {
          collisions.push(node.textContent.trim());
        }
      }
      for (const control of section.querySelectorAll('nav a, button')) {
        if (touchesArtwork(control.getBoundingClientRect())) {
          collisions.push(`Control: ${control.textContent?.trim()}`);
        }
      }
      return collisions;
    },
    section,
  );
  expect(collisions, 'Visible artwork must not cover text or controls').toEqual(
    [],
  );
}
