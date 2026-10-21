// Uses the same retext smartypants rules as the previous Markdown publisher.
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import retext from 'retext';
import smartypants from 'retext-smartypants';
const typography = retext().use(smartypants);
export function smartTypography(tree: Root) {
  visit(tree, 'text', (node) => {
    node.value = String(typography.processSync(node.value));
  });
}
