import remark from 'remark';
import escapeHtml from 'escape-html';

type MarkdownNode = {
  type: string;
  value?: string;
  url?: string;
  alt?: string;
  children?: MarkdownNode[];
  position?: { start: { offset: number }; end: { offset: number } };
};

export function youtubeVideoUrl(input: string): string | undefined {
  try {
    const url = new URL(input);
    if (!['https:', 'http:'].includes(url.protocol)) return;
    const host = url.hostname.replace(/^www\./, '');
    let id: string | undefined;
    if (host === 'youtu.be') id = url.pathname.slice(1);
    else if (
      ['youtube.com', 'youtube-nocookie.com', 'm.youtube.com'].includes(host)
    ) {
      if (url.pathname === '/watch')
        id = url.searchParams.get('v') || undefined;
      else
        id = url.pathname.match(
          /^\/(?:embed|shorts|live)\/([\w-]{11})\/?$/,
        )?.[1];
    }
    if (!id || !/^[\w-]{11}$/.test(id)) return;
    const result = new URL('https://www.youtube.com/watch');
    result.search = url.search;
    result.searchParams.set('v', id);
    if (/^#t=/.test(url.hash) && !result.searchParams.has('t'))
      result.searchParams.set('t', url.hash.slice(3));
    return result.href;
  } catch {
    return;
  }
}

function label(node: MarkdownNode): string {
  return node.value || node.alt || node.children?.map(label).join('') || '';
}

function embed(url: string, title: string): string {
  const safeTitle = escapeHtml(
    title.replace(/[[\]`\r\n]/g, ' ').trim() || 'Embedded video',
  );
  return `\`youtube: [${safeTitle}](${url})\``;
}

// Only standalone linked images become players. Text links, including reading
// lists and bare URLs, preserve their original Markdown and punctuation.
export function normalizeYouTubeEmbeds(markdown: string): string {
  const tree = remark().parse(markdown) as MarkdownNode;
  const edits: { start: number; end: number; text: string }[] = [];
  function walk(node: MarkdownNode) {
    if (node.type === 'paragraph' && node.position) {
      let children = (node.children || []).filter(
        (child) => child.type !== 'text' || !/^\s*$/.test(child.value || ''),
      );
      while (children.length === 1) {
        const first = children[0];
        if (!first || !['strong', 'emphasis'].includes(first.type)) break;
        children = first.children || [];
      }
      const child = children.length === 1 ? children[0] : undefined;
      if (child) {
        const image = child.children?.[0];
        const url =
          child.type === 'link' ? youtubeVideoUrl(child.url || '') : undefined;
        if (url && child.children?.length === 1 && image?.type === 'image') {
          edits.push({
            start: node.position.start.offset,
            end: node.position.end.offset,
            text: embed(url, label(image)),
          });
          return;
        }
      }
    }
    for (const child of node.children || []) walk(child);
  }
  walk(tree);
  let result = markdown;
  for (const edit of edits.sort((a, b) => b.start - a.start))
    result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
  return result;
}
