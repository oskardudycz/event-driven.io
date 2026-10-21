// Adapted from gatsby-remark-embed-video 3.2.1 (MIT), Neal Bürger.
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import identifyVideo from 'get-video-id';

// This CommonJS package declares an ESM default export. Its runtime export is
// the function itself; describe that boundary for both NodeNext and Vite.
const getVideoId = identifyVideo as unknown as (input: string) => {
  id: string | null;
  service: string | null;
};
import escape from 'escape-html';
export type VideoOptions = {
  width?: number;
  height?: number;
  ratio?: number;
  related?: boolean;
  noIframeBorder?: boolean;
  loadingStrategy?: string;
  urlOverrides?: { id: string; embedURL: (id: string) => string }[];
};
const services: Record<string, (id: string) => string> = {
  youtube: (id) => `https://www.youtube.com/embed/${id}`,
  vimeo: (id) => `https://player.vimeo.com/video/${id}`,
  videopress: (id) => `https://videopress.com/embed/${id}`,
  twitch: (id) => `https://player.twitch.tv/?autoplay=false&video=${id}`,
  twitchlive: (id) => `https://player.twitch.tv/?channel=${id}`,
  niconico: (id) => `https://embed.nicovideo.jp/watch/${id}`,
};
function identity(type: string, input: string) {
  const detected = getVideoId(input);
  if (detected.id && detected.service)
    return { id: detected.id, service: detected.service };
  try {
    const url = new URL(input);
    if (['www.twitch.tv', 'twitch.tv'].includes(url.hostname)) {
      const parts = url.pathname.split('/');
      if (parts[1] === 'videos' && parts[2])
        return { id: 'v' + parts[2], service: 'twitch' };
      if (parts[1]) return { id: parts[1], service: 'twitchlive' };
    }
    if (url.hostname === 'player.twitch.tv') {
      const video = url.searchParams.get('video'),
        channel = url.searchParams.get('channel');
      if (video) return { id: video, service: 'twitch' };
      if (channel) return { id: channel, service: 'twitchlive' };
    }
    if (/(^|\.)nicovideo\.jp$/.test(url.hostname) && url.pathname.split('/')[2])
      return { id: url.pathname.split('/')[2]!, service: 'niconico' };
  } catch {
    /* A provider directive may contain a bare ID. */
  }
  if (type === 'video') return undefined;
  return { id: input, service: type };
}
export function embedVideo(
  { markdownAST }: { markdownAST: Root },
  options: VideoOptions,
) {
  visit(markdownAST, 'inlineCode', (node) => {
    const match =
      /^(youtube|vimeo|videopress|twitch|twitchlive|niconico|video):\s*(.*)/i.exec(
        node.value,
      );
    if (!match) return;
    const title = /\[(.*)\]\((.*)\)/.exec(match[2]!);
    const input = title ? title[2]! : match[2]!.trim();
    const video = identity(match[1]!.toLowerCase(), input);
    if (!video) return;
    const renderer =
      options.urlOverrides?.find((item) => item.id === video.service)
        ?.embedURL || services[video.service];
    if (!renderer) return;
    const url = new URL(renderer(video.id));
    if (video.service === 'youtube' && !options.related)
      url.searchParams.set('rel', '0');
    const width = options.width || 560;
    const height =
      options.height || Math.round(width / (options.ratio || 1.77));
    const html = `<div class="embedVideo-container"><iframe title="${escape(title?.[1] || '')}" width="${width}" height="${height}" src="${escape(url.href)}" class="embedVideo-iframe" ${options.noIframeBorder !== false ? 'style="border:0"' : ''} loading="${escape(options.loadingStrategy || 'eager')}" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups"></iframe></div>`;
    Object.assign(node, {
      type: 'html',
      value:
        html +
        (video.service === 'videopress'
          ? '<script src="https://videopress.com/videopress-iframe.js"></script>'
          : ''),
    });
  });
}
