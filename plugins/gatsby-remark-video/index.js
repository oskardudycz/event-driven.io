const embedVideo = require('gatsby-remark-embed-video');
const cheerio = require('cheerio');
const visit = require('unist-util-visit');

function startSeconds(value) {
  if (/^\d+$/.test(value)) return value;
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return match && match[0] ? String(Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0)) : undefined;
}

// Delegate rendering and Markdown syntax to Gatsby's recommended plugin.
// Its 3.2.1 renderer loses source URL parameters during video-ID extraction;
// retain those parameters and configure the resulting YouTube players here.
function videoPlugin(args, options) {
  const sources = [];
  visit(args.markdownAST, 'inlineCode', node => {
    const match = node.value.match(/^(?:youtube|video):\s*(.*)$/i);
    if (!match) return;
    const titleLink = match[1].match(/\[.*\]\((.*)\)/);
    try {
      const source = new URL(titleLink ? titleLink[1] : match[1]);
      if (/^(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)$/.test(source.hostname)) sources.push({ node, source });
    } catch { /* Bare video IDs are handled by the upstream plugin. */ }
  });
  embedVideo(args, options);
  visit(args.markdownAST, 'html', node => {
    if (!node.value.includes('embedVideo-iframe')) return;
    const $ = cheerio.load(node.value, null, false);
    $('iframe').each((_, element) => {
      const frame = $(element), url = new URL(frame.attr('src'));
      if (!/^(www\.)?(youtube\.com|youtube-nocookie\.com)$/.test(url.hostname)) return;
      const original = sources.find(item => item.node === node)?.source;
      if (original) {
        for (const [key, value] of original.searchParams) {
          if (key === 'v') continue;
          if (key === 't') {
            const seconds = startSeconds(value);
            if (seconds !== undefined) url.searchParams.set('start', seconds);
          } else url.searchParams.set(key, value);
        }
      }
      frame.attr({ src: url.href, title: frame.attr('title') || 'Embedded video',
        referrerpolicy: 'strict-origin-when-cross-origin', loading: 'lazy',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' });
      frame.removeAttr('sandbox');
    });
    node.value = $.html();
  });
}
videoPlugin.setParserPlugins = embedVideo.setParserPlugins;
module.exports = videoPlugin;
