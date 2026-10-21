import type { InlineCode, Html } from 'mdast';
import { embedVideo } from './markdown/video-embed.ts';
import * as cheerio from 'cheerio';
import { visit } from 'unist-util-visit';

function startSeconds(value: string) {
  if (/^\d+$/.test(value)) return value;
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return match && match[0]
    ? String(
        Number(match[1] || 0) * 3600 +
          Number(match[2] || 0) * 60 +
          Number(match[3] || 0),
      )
    : undefined;
}

// Keep source URL parameters and configure the shared video renderer
// with privacy-preserving YouTube URLs and accessible lazy players.
function videoPlugin(
  args: Parameters<typeof embedVideo>[0],
  options: Parameters<typeof embedVideo>[1],
) {
  const sources: { node: InlineCode | Html; source: URL }[] = [];
  visit(args.markdownAST, 'inlineCode', (node: InlineCode) => {
    const match = node.value.match(/^(?:youtube|video):\s*(.*)$/i);
    if (!match?.[1]) return;
    const titleLink = match[1].match(/\[.*\]\((.*)\)/);
    try {
      const source = new URL(titleLink?.[1] || match[1]);
      if (
        /^(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)$/.test(
          source.hostname,
        )
      )
        sources.push({ node, source });
    } catch {
      /* Bare video IDs are handled by the upstream plugin. */
    }
  });
  embedVideo(args, options);
  visit(args.markdownAST, 'html', (node: Html) => {
    if (!node.value.includes('embedVideo-iframe')) return;
    const $ = cheerio.load(node.value, null, false);
    $('iframe').each((_, element) => {
      const frame = $(element),
        url = new URL(frame.attr('src')!);
      if (!/^(www\.)?(youtube\.com|youtube-nocookie\.com)$/.test(url.hostname))
        return;
      const original = sources.find((item) => item.node === node)?.source;
      if (original) {
        for (const [key, value] of original.searchParams) {
          if (key === 'v') continue;
          if (key === 't') {
            const seconds = startSeconds(value);
            if (seconds !== undefined) url.searchParams.set('start', seconds);
          } else url.searchParams.set(key, value);
        }
      }
      frame.attr({
        src: url.href,
        title: frame.attr('title') || 'Embedded video',
        referrerpolicy: 'strict-origin-when-cross-origin',
        loading: 'lazy',
        allow:
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      });
      frame.removeAttr('sandbox');
    });
    node.value = $.html();
  });
}
export default videoPlugin;
