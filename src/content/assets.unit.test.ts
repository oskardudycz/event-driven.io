import { expect, test } from 'vitest';
import path from 'node:path';
import { localAssetPath } from './assets.ts';

test('local attachments resolve relative to their article while URL fragments stay outside the filename', () => {
  expect(
    localAssetPath(
      '../shared/file%20name.pdf#page=2',
      'content/posts/article/index.en.md',
    ),
  ).toBe(path.resolve('content/posts/shared/file name.pdf'));
});
test.each(['../../../secret', '..%2f..%2f..%2fsecret'])(
  'attachments cannot escape the content root: %s',
  (url) => {
    expect(() =>
      localAssetPath(url, 'content/posts/article/index.en.md'),
    ).toThrow('Asset outside content directory');
  },
);
test.each([
  '/images/example.svg',
  '#heading',
  'https://example.com/image.png',
  '//example.com/image.png',
  'data:image/png;base64,xyz',
])('public and remote URLs stay native: %s', (url) => {
  expect(
    localAssetPath(url, 'content/posts/article/index.en.md'),
  ).toBeUndefined();
});

test('empty links remain native and configured artwork roots do not permit arbitrary repository files', () => {
  expect(
    localAssetPath('', 'content/posts/article/index.en.md'),
  ).toBeUndefined();
  expect(
    localAssetPath(
      '../../../src/images/recommendations/r02.png',
      'content/pages/workshop/index.en.md',
      'content',
      ['src/images'],
    ),
  ).toBe(path.resolve('src/images/recommendations/r02.png'));
  expect(() =>
    localAssetPath(
      '../../../package.json',
      'content/pages/workshop/index.en.md',
      'content',
      ['src/images'],
    ),
  ).toThrow('Asset outside content directory');
});
