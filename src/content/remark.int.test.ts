import { test, expect } from 'vitest';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { load } from 'cheerio';
import { editorialRemark } from './remark.ts';

const processor = createMarkdownProcessor({
  syntaxHighlight: false,
  smartypants: false,
  remarkPlugins: [editorialRemark],
});

test('headings retain unique accessible permalink controls and smart typography', async () => {
  const { code } = await (
    await processor
  ).render('## Hello world\n\n"A quote" -- example\n\n## Hello world');
  const $ = load(code);
  expect(
    $('h2')
      .map((_, heading) => $(heading).attr('id'))
      .get(),
  ).toEqual(['hello-world', 'hello-world-1']);
  expect(
    $('a.anchor')
      .map((_, anchor) => $(anchor).attr('href'))
      .get(),
  ).toEqual(['#hello-world', '#hello-world-1']);
  expect($('a.anchor').first().attr('aria-label')).toBe(
    'hello world permalink',
  );
  expect($('a.anchor svg').attr('aria-hidden')).toBe('true');
  expect($('p').text()).toBe('“A quote” — example');
});

test('code aliases and highlighted lines retain the existing Prism markup', async () => {
  const { code } = await (
    await processor
  ).render(
    '```sh\necho "hello"\n```\n\n```csharp{2}\nvar first = 1;\nvar second = 2;\n```',
  );
  const $ = load(code);
  expect(
    $('.gatsby-highlight[data-language="bash"] code.language-bash').text(),
  ).toContain('echo "hello"');
  expect(
    $('.gatsby-highlight[data-language="csharp"] .gatsby-highlight-code-line'),
  ).toHaveLength(1);
  expect($('.token')).not.toHaveLength(0);
});

test('YouTube embeds retain start parameters, privacy host and responsive accessible markup', async () => {
  const { code } = await (
    await processor
  ).render('`youtube: https://www.youtube.com/watch?v=abc123&t=1m30s`');
  const $ = load(code);
  const frame = $('iframe');
  expect(frame.attr('src')).toContain(
    'https://www.youtube-nocookie.com/embed/abc123',
  );
  expect(new URL(frame.attr('src')!).searchParams.get('start')).toBe('90');
  expect(frame.attr('title')).toBeTruthy();
  expect(frame.attr('referrerpolicy')).toBe('strict-origin-when-cross-origin');
  expect(frame.attr('loading')).toBe('lazy');
  expect(frame.closest('.gatsby-resp-iframe-wrapper')).toHaveLength(1);
});
