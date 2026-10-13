import { beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import '../../../src/theme/tokens.css';
import '../../../src/theme/tailwind.css';
import '../../../src/theme/global.css';
import '../../gallery/gallery.css';

const fontStylesheet = document.createElement('link');
fontStylesheet.rel = 'stylesheet';
fontStylesheet.href = '/fonts/open-sans/index.css';

beforeAll(async () => {
  await new Promise<void>((resolve, reject) => {
    fontStylesheet.onload = () => resolve();
    fontStylesheet.onerror = () =>
      reject(new Error('Open Sans stylesheet did not load'));
    document.head.append(fontStylesheet);
  });
});
afterAll(() => fontStylesheet.remove());

// React's renderer unmounts components automatically. Document-level appearance
// belongs to the host and needs its own cleanup between cases in the shared page.
beforeEach(async () => {
  document.documentElement.lang = 'en';
  document.documentElement.dataset.theme = 'light';
  for (const weight of [400, 600]) {
    const fonts = await document.fonts.load(`${weight} 1em "Open Sans"`);
    if (!fonts.length) throw new Error(`Open Sans ${weight} did not load`);
    document.documentElement.dataset[`font${weight}`] = 'loaded';
  }
});

afterEach(() => {
  document.documentElement.removeAttribute('lang');
  for (const name of ['theme', 'font400', 'font600'])
    delete document.documentElement.dataset[name];
});
