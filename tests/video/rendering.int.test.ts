import type { Root, Html } from 'mdast';
import videoPlugin from '../../src/content/video.ts';
import { videoOptions } from '../../src/content/remark.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';
test('video directives renders bare IDs and preserves URL timestamps and titles', () => {
  const render = videoPlugin;
  const ast: Root = {
    type: 'root',
    children: [
      { type: 'inlineCode', value: 'youtube: sQbkUl7-z_U' },
      {
        type: 'inlineCode',
        value:
          'youtube: [A titled video](https://www.youtube.com/watch?v=sQbkUl7-z_U&t=1m30s&end=120)',
      },
      {
        type: 'inlineCode',
        value:
          'youtube: [Another position](https://www.youtube-nocookie.com/embed/sQbkUl7-z_U?start=30)',
      },
    ],
  };
  render({ markdownAST: ast }, videoOptions);
  for (const child of ast.children) {
    const node = child as Html;
    assert.equal(node.type, 'html');
    assert.match(node.value, /youtube-nocookie\.com\/embed\/sQbkUl7-z_U/);
    assert.match(
      node.value,
      /referrerpolicy="strict-origin-when-cross-origin"/,
    );
    assert.match(node.value, /loading="lazy"/);
    assert.doesNotMatch(node.value, /Error:|sandbox=/);
  }
  assert.match((ast.children[1] as Html).value, /start=90/);
  assert.match((ast.children[1] as Html).value, /end=120/);
  assert.match((ast.children[1] as Html).value, /title="A titled video"/);
  assert.match((ast.children[2] as Html).value, /start=30/);
});
