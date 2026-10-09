import escapeHtml from 'escape-html';

// URL validation and Markdown escaping are separate: a permitted URL can still
// contain punctuation that would close a Markdown link and inject new markup.
export function markdownLinkDestination(destination: string, base: string) {
  const ambiguous = Array.from(destination).some(
    (character) =>
      character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127 || character === '\\',
  );
  if (ambiguous || destination.startsWith('//'))
    throw new Error(`Unsupported article link: ${destination}`);
  const url = new URL(destination, base);
  if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol))
    throw new Error(`Unsupported article link: ${destination}`);
  const value = destination.startsWith('#')
    ? url.hash || '#'
    : destination.startsWith('/')
      ? `${url.pathname}${url.search}${url.hash}`
      : url.href;
  return value.replace(/[<>"'()\s]/g, (character) =>
    Array.from(Buffer.from(character), (byte) => `%${byte.toString(16).toUpperCase()}`).join(''),
  );
}

export function markdownLinkTitle(title: string | null) {
  if (!title) return '';
  return ` "${escapeHtml(title.replace(/\s+/g, ' ').replace(/\\/g, '\\\\'))}"`;
}
