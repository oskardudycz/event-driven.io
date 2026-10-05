import cheerio from 'cheerio';
import visit from 'unist-util-visit';

// This article's leading cover is a measured LCP element. Do not promote
// the first image in every article: it may occur far below the viewport.
export default function imagePriority({ markdownAST, markdownNode }) {
  if (!/--introduction_to_event_sourcing\//.test(markdownNode.fileAbsolutePath || '')) return;
  let promoted = false;
  visit(markdownAST, 'html', (node) => {
    if (promoted || !node.value.includes('gatsby-resp-image-image')) return;
    const $ = cheerio.load(node.value, null, false);
    const cover = $('img.gatsby-resp-image-image[src*="2022-03-16-cover"]');
    if (!cover.length) return;
    cover.first().attr('loading', 'eager').attr('fetchpriority', 'high');
    node.value = $.html();
    promoted = true;
  });
}
