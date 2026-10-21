// Adapted from gatsby-remark-responsive-iframe 6.16.0 (MIT); see LICENSE.gatsby.
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { load } from 'cheerio';
function dimension(value: string | undefined) {
  if (!value || value.trim().endsWith('%')) return NaN;
  return parseInt(value, 10);
}
export function responsiveFrames(tree: Root) {
  visit(tree, 'html', (node) => {
    const $ = load(node.value);
    const frames = $('iframe, object');
    if (!frames.length) return;
    const width = dimension(frames.attr('width'));
    const height = dimension(frames.attr('height'));
    if (!Number.isFinite(width) || !Number.isFinite(height)) return;
    let style = $('iframe').attr('style') || '';
    if (style && !style.endsWith(';')) style += ';';
    frames
      .attr(
        'style',
        `${style} position: absolute; top: 0; left: 0; width: 100%; height: 100%; `,
      )
      .removeAttr('width')
      .removeAttr('height');
    node.value =
      `<div class="gatsby-resp-iframe-wrapper" style="padding-bottom: ${(height / width) * 100}%; position: relative; height: 0; overflow: hidden; margin-bottom: 2em"> ${$('body').html() || ''} </div>`
        .replace(/\s+/g, ' ')
        .trim();
  });
}
