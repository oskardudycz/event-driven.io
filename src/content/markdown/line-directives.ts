// Adapted from gatsby-remark-prismjs 7.16.0 (MIT); see LICENSE.gatsby-prism.
import range from 'parse-numeric-range';
const jsxStart =
  '<span class="token punctuation">\\{<\\/span><span class="token comment">\\/\\*';
const jsxEnd = '\\*\\/<\\/span><span class="token punctuation">\\}</span>';
const spanStart = '(<span\\sclass="token\\scomment">)?';
const spanEnd = '(<\\/span>)?';
const commentStart = '(#|\\/\\/|\\{\\/\\*|\\/\\*+|&lt;!--)';
const commentEnd = '(-->|\\*\\/\\}|\\*\\/)?';
const directive =
  /(highlight|hide)-(next-line|line|start|end|range)({([^}]+)})?/;
const strip = new RegExp(
  `\\s*(${jsxStart}|${spanStart}${commentStart})\\s*${directive.source}\\s*(${jsxEnd}|${commentEnd}${spanEnd})`,
);
const multilineToken = /<span class="token ([^"]+)">[^<]*\n[^<]*<\/span>/g;
type Feature = 'highlight' | 'hide';
type Line = { code: string; highlight: boolean; hide: boolean };
export function lineDirectives(code: string, highlights: number[] = []) {
  if (
    highlights.length ||
    /highlight-(next-line|line|start|end|range)/.test(code)
  ) {
    code = code.replace(multilineToken, (match: string, token: string) =>
      match.replace(/\n/g, `</span>\n<span class="token ${token}">`),
    );
  }
  const lines: Line[] = code
    .split('\n')
    .map((code) => ({ code, highlight: false, hide: false }));
  function flag(feature: Feature, index: number) {
    const line = lines[index];
    if (line) line[feature] = true;
  }
  if (highlights.length) {
    for (const number of highlights) flag('highlight', number - 1);
  } else {
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index]!;
      const match = directive.exec(line.code);
      if (!match) continue;
      const feature = match[1] as Feature;
      const action = match[2];
      if (action === 'next-line') {
        flag(feature, index + 1);
        flag('hide', index);
      } else if (action === 'start') {
        let end = lines.findIndex(
          (other, position) =>
            position > index && other.code.includes(`${feature}-end`),
        );
        if (end < 0) end = lines.length;
        flag('hide', index);
        flag('hide', end);
        for (let position = index + 1; position < end; position++)
          flag(feature, position);
      } else if (action === 'line') {
        flag(feature, index);
        line.code = line.code.replace(strip, '');
      } else if (action === 'range') {
        flag('hide', index);
        const positions = range(match[4] || '');
        if (!positions.length)
          console.warn(`Invalid match specified: "${line.code.trim()}"`);
        for (const position of positions) flag(feature, index + position);
      }
    }
  }
  for (const [index, line] of lines.entries()) {
    if (line.hide && line.highlight)
      throw new Error(
        `Line ${index + 1} has been marked as both hidden and highlighted.`,
      );
  }
  return lines
    .filter((line) => !line.hide)
    .map((line, index, visible) =>
      line.highlight
        ? `<span class="gatsby-highlight-code-line">${line.code}</span>`
        : line.code + (index === visible.length - 1 ? '' : '\n'),
    )
    .join('');
}
