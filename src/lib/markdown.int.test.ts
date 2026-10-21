import { expect, test } from 'vitest';
import { renderExcerpt } from './markdown.ts';
test('excerpts retain native vector/animated/remote image alternatives while generated raster markup is omitted', async () => {
  const text = await renderExcerpt(
    '![vector](diagram.svg)\n\n![animation](motion.gif)\n\n![local raster](photo.png)\n\n![remote](https://example.com/photo.png)\n\nArticle introduction.',
    'content/posts/fixture/index.en.md',
    140,
  );
  expect(text).toBe('vector animation  remote Article introduction.');
});
