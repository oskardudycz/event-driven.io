import type { VideoOptions } from './markdown/video-embed.ts';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { linkHeadings } from './markdown/headings.ts';
import { highlightCode } from './markdown/prism.ts';
import { smartTypography } from './markdown/typography.ts';
import { responsiveFrames } from './markdown/frames.ts';
import video from './video.ts';

// The editorial pipeline operates on mdast without framework APIs.
export const videoOptions: VideoOptions = {
  width: 800,
  ratio: 1.77,
  height: 400,
  related: false,
  noIframeBorder: true,
  loadingStrategy: 'lazy',
  urlOverrides: [
    {
      id: 'youtube',
      embedURL: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
    },
  ],
};

export function editorialRemark(options: { excerpt?: boolean } = {}) {
  return (tree: Root) => {
    // Fenced code is omitted from plain previews. Avoid syntax highlighting
    // every article's complete code listings when rendering archive cards.
    if (options.excerpt)
      visit(tree, 'code', (node) => {
        Object.assign(node, { type: 'html', value: '' });
      });
    video({ markdownAST: tree }, videoOptions);
    responsiveFrames(tree);
    linkHeadings(tree);
    highlightCode(tree);
    smartTypography(tree);
  };
}
