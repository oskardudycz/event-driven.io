import type { RemarkPlugin } from '@astrojs/markdown-remark';
import unified from 'unified';
import parse from 'remark-parse';
import gfm from 'remark-gfm';
import footnotes from 'remark-footnotes';
import type { Root, PhrasingContent, FootnoteDefinition } from 'mdast';
import { visit } from 'unist-util-visit';

// Preserve the author's existing Markdown interpretation (including lazy list
// continuation and inline notes). Astro still owns the rendering pipeline;
// this parser has no filesystem or Gatsby APIs.
const parser = unified()
  .use(parse)
  .use(gfm)
  .use(footnotes, { inlineNotes: true });
export const editorialParser: RemarkPlugin = function () {
  this.parser = (document) => {
    const tree = parser.parse(document) as Root;
    const definitions: FootnoteDefinition[] = [];
    const identifiers = new Set(
      tree.children
        .filter((node) => node.type === 'footnoteDefinition')
        .map((node) => node.identifier),
    );
    let sequence = 0;
    visit(
      tree,
      (node) => node.type === 'footnote',
      (node) => {
        const inline = node as unknown as { children: PhrasingContent[] };
        let identifier = `inline-note-${++sequence}`;
        while (identifiers.has(identifier))
          identifier = `inline-note-${++sequence}`;
        identifiers.add(identifier);
        definitions.push({
          type: 'footnoteDefinition',
          identifier,
          label: identifier,
          children: [{ type: 'paragraph', children: inline.children }],
        });
        Object.assign(node, {
          type: 'footnoteReference',
          identifier,
          label: identifier,
        });
        Reflect.deleteProperty(node, 'children');
      },
    );
    tree.children.push(...definitions);
    return tree;
  };
};
