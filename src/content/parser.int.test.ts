import { expect, test } from 'vitest';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { load } from 'cheerio';
import { editorialParser } from './parser.ts';
const processor = createMarkdownProcessor({
  gfm: false,
  syntaxHighlight: false,
  remarkPlugins: [editorialParser],
});
test('editorial lists retain lazy paragraph continuation and table cells', async () => {
  const result = await (
    await processor
  ).render(
    '2. First\n– Business\n4. More\n– Backend\n\n| Name | Value |\n| --- | --- |\n| one | two |',
  );
  const $ = load(result.code);
  expect($('ol').attr('start')).toBe('2');
  expect($('li').text()).toBe('First');
  expect($('p').text()).toContain('4. More');
  expect(
    $('td')
      .map((_, cell) => $(cell).text())
      .get(),
  ).toEqual(['one', 'two']);
});
test('inline and referenced notes have working references and rendered definitions', async () => {
  const result = await (
    await processor
  ).render('Text^[an inline note].\n\nAnother[^one].\n\n[^one]: A footnote.');
  const $ = load(result.code);
  expect($('a[data-footnote-ref]').length).toBe(2);
  for (const link of $('a[data-footnote-ref]').toArray()) {
    const target = $(link).attr('href')!.slice(1);
    expect($(`[id="${target}"]`).length).toBe(1);
  }
  expect($('.footnotes').text()).toContain('an inline note');
  expect($('.footnotes').text()).toContain('A footnote.');
});
