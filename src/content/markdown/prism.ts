// Preserves gatsby-remark-prismjs 7.16.0 markup using Prism's public API.
// Adapted under MIT; see LICENSE.gatsby-prism.
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';
import 'prismjs/components/prism-diff.js';
import 'prismjs/plugins/diff-highlight/prism-diff-highlight.js';
import escape from 'escape-html';
import range from 'parse-numeric-range';
import { lineDirectives } from './line-directives.ts';

const aliases: Record<string, string> = { sh: 'bash', env: 'bash' };
const normalize = (language: string) =>
  aliases[language.toLowerCase()] || language.toLowerCase();
function options(value: string) {
  const [language = '', ...settings] = value.split('{');
  let highlights: number[] = [],
    output: number[] = [];
  let numbering: number | undefined;
  let user: string | undefined, host: string | undefined;
  for (let setting of settings) {
    setting = setting.slice(0, -1);
    const [key = '', value] = setting.replace(/ /g, '').split(':');
    if (value === undefined)
      highlights = range(setting).filter((number) => number > 0);
    else if (key === 'numberLines') {
      if (value === 'true') numbering = 1;
      else if (Number.isInteger(parseInt(value, 10)))
        numbering = parseInt(value, 10);
    } else if (key === 'outputLines')
      output = range(value).filter((number) => number > 0);
    else if (key === 'promptUser') user = value;
    else if (key === 'promptHost') host = value;
  }
  return { language, highlights, numbering, output, user, host };
}
function highlight(
  language: string,
  code: string,
  lines: number[] = [],
  diff?: string,
) {
  if (!Prism.languages[language]) loadLanguages(language);
  if (diff && !Prism.languages[diff]) loadLanguages(diff);
  const grammar = Prism.languages[language];
  if (!grammar) return language === 'none' ? code : escape(code);
  return lineDirectives(
    Prism.highlight(code, grammar, diff ? `${language}-${diff}` : language),
    lines,
  );
}
export function highlightCode(tree: Root) {
  visit(tree, 'code', (node) => {
    const settings = options(`${node.lang || ''}${node.meta || ''}`);
    const match = /^(diff)-([\w-]+)/i.exec(settings.language);
    const language = normalize(match ? match[1]! : settings.language || 'text');
    const diff = match ? normalize(match[2]!) : undefined;
    const className = `language-${language}${diff ? '-' + diff : ''}`;
    const highlighted = highlight(
      language,
      node.value,
      settings.highlights,
      diff,
    );
    let style = '',
      numbers = '',
      numberClass = '';
    if (settings.numbering !== undefined) {
      style = ` style="counter-reset: linenumber ${settings.numbering - 1}"`;
      numberClass = ' line-numbers';
      const count = highlighted
        ? highlighted.split('\n').length +
          (highlighted.match(/code-highlight-code-line/g) || []).length
        : 0;
      numbers = `<span aria-hidden="true" class="line-numbers-rows" style="white-space: normal; width: auto; left: 0;">${'<span></span>'.repeat(count)}</span>`;
    }
    let prompts = '';
    if (
      ['bash', 'shell'].includes(language) &&
      (settings.output.length || settings.user || settings.host)
    ) {
      const user = escape(settings.user || 'root'),
        host = escape(settings.host || 'localhost');
      prompts =
        '<span class="command-line-prompt">' +
        node.value
          .split('\n')
          .map((_, index) =>
            settings.output.includes(index + 1)
              ? '<span></span>'
              : `<span data-user=${user} data-host=${host}></span>`,
          )
          .join('') +
        '</span>';
    }
    const wrapper = `code-highlight${settings.highlights.length ? ' has-highlighted-lines' : ''}`;
    Object.assign(node, {
      type: 'html',
      value: `<div class="${wrapper}" data-language="${language}"><pre${style} class="${className}${numberClass}"><code class="${className}">${prompts}${highlighted}</code>${numbers}</pre></div>`,
    });
  });
  visit(tree, 'inlineCode', (node) => {
    Object.assign(node, {
      type: 'html',
      value: `<code class="language-text">${highlight('text', node.value)}</code>`,
    });
  });
}
