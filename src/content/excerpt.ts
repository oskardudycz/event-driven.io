import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import prune from 'underscore.string/prune.js';

// Match the existing plain excerpt contract: transformed HTML/code is omitted,
// paragraph/heading/table boundaries supply spaces, and words are never cut.
export function articleText(tree: Root) {
  const fragments: string[] = [];
  const boundaries = new Set(['paragraph', 'heading', 'tableCell', 'break']);
  visit(tree, (node) => {
    if (node.type === 'text' || node.type === 'inlineCode')
      fragments.push(node.value);
    else if (node.type === 'image') fragments.push(node.alt || '');
    else if (boundaries.has(node.type)) fragments.push(' ');
  });
  return fragments.join('').trim();
}

export function articleExcerpt(tree: Root, length = 170) {
  return prune(articleText(tree), length, '…');
}
