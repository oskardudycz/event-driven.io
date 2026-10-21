import type { Html } from 'mdast';
import imagePriority from './image-priority.ts';
import assert from 'node:assert/strict';
import { test } from 'vitest';

test('image priority ignores unrelated articles, external HTML and later images', () => {
  const value =
    '<picture><img class="article-image-content" src="/2022-03-16-cover.png" loading="lazy"></picture>';
  const ast: { type: 'root'; children: Html[] } = {
    type: 'root',
    children: [{ type: 'html', value }],
  };
  imagePriority({
    markdownAST: ast,
    markdownNode: { fileAbsolutePath: '/other/index.en.md' },
  });
  assert.ok(ast.children[0]);
  assert.equal(ast.children[0].value, value);
  const external = '<iframe src="https://example.com"></iframe>';
  ast.children.unshift({ type: 'html', value: external });
  ast.children.push({ type: 'html', value });
  imagePriority({
    markdownAST: ast,
    markdownNode: {
      fileAbsolutePath:
        '/2022-03-16--introduction_to_event_sourcing/index.en.md',
    },
  });
  assert.ok(ast.children[0] && ast.children[1] && ast.children[2]);
  assert.equal(ast.children[0].value, external);
  assert.match(ast.children[1].value, /fetchpriority="high"/);
  assert.equal(ast.children[2].value, value);
});
