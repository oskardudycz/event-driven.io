import type { Root, Paragraph, PhrasingContent } from 'mdast';
import { visit } from 'unist-util-visit';
import { articleText } from './excerpt.ts';
const pending = new Map<string, Promise<string | undefined>>();
function linkText(children: PhrasingContent[]): string {
  return children
    .map((child) =>
      child.type === 'text'
        ? child.value
        : child.type === 'emphasis'
          ? `_${linkText(child.children)}_`
          : '',
    )
    .join('');
}
async function embed(url: string) {
  let result = pending.get(url);
  if (!result) {
    result = (async () => {
      const endpoint = new URL('https://publish.twitter.com/oembed');
      endpoint.search = new URLSearchParams({
        url,
        hide_thread: '1',
        align: '',
        hide_media: '0',
        theme: '',
        link_color: '',
        widget_type: '',
        omit_script: 'true',
        dnt: 'true',
        limit: '20',
        chrome: 'nofooter',
      }).toString();
      try {
        const response = await fetch(endpoint, {
          signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as { html?: unknown };
        if (typeof data.html === 'string') return data.html;
        throw new Error('Missing embed HTML');
      } catch (error) {
        console.warn(
          `Twitter embed unavailable; keeping article link: ${url} (${error instanceof Error ? error.message : String(error)})`,
        );
        return undefined;
      }
    })();
    pending.set(url, result);
  }
  return result;
}
export function twitterRemark(options: { excerptLength?: number } = {}) {
  return async (tree: Root) => {
    const paragraphs: { node: Paragraph; url: string }[] = [];
    visit(tree, 'paragraph', (node) => {
      const link = node.children.length === 1 ? node.children[0] : undefined;
      if (link?.type !== 'link' || linkText(link.children) !== link.url) return;
      if (
        !/^https:\/\/twitter\.com\/(?:[\w-]+\/status|i\/moments)\/\d+(?:[/?#].*)?$/.test(
          link.url,
        )
      )
        return;
      paragraphs.push({ node, url: link.url });
    });
    for (const { node, url } of paragraphs) {
      // An embed beyond the excerpt boundary cannot change the published
      // preview. Do not make archive navigation wait for unrelated providers.
      if (
        options.excerptLength !== undefined &&
        articleText(tree).indexOf(url) >= options.excerptLength
      )
        continue;
      const html = await embed(url);
      if (html)
        Object.assign(node, { type: 'html', value: html, children: undefined });
    }
  };
}
