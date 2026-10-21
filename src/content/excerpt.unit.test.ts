import { expect, test } from 'vitest';
import { articleExcerpt } from './excerpt.ts';
import type { Root } from 'mdast';

const tree: Root = {
  type: 'root',
  children: [
    {
      type: 'paragraph',
      children: [
        { type: 'text', value: 'An example with ' },
        { type: 'inlineCode', value: 'inline code' },
      ],
    },
    { type: 'html', value: '<div>Generated image or highlighted code</div>' },
    {
      type: 'paragraph',
      children: [{ type: 'text', value: 'and another paragraph.' }],
    },
  ],
};

test('plain excerpts preserve inline code and word boundaries while omitting transformed HTML', () => {
  expect(articleExcerpt(tree)).toBe(
    'An example with inline code and another paragraph.',
  );
  expect(articleExcerpt(tree, 20)).toBe('An example with…');
});
