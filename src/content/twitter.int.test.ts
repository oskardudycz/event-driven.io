import { afterEach, expect, test, vi } from 'vitest';
import { remark } from 'remark';
import { editorialParser } from './parser.ts';
import { twitterRemark } from './twitter.ts';
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
test('standalone tweets use the provider embed while ordinary article links stay unchanged', async () => {
  const request = vi.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        html: '<blockquote class="twitter-tweet">Provider text</blockquote>',
      }),
  });
  vi.stubGlobal('fetch', request);
  const processor = remark().use(editorialParser).use(twitterRemark);
  const tree = processor.parse(
    'https://twitter.com/example/status/10001\n\nSee [a tweet](https://twitter.com/example/status/10002).',
  );
  await processor.run(tree);
  expect(tree.children[0]).toMatchObject({
    type: 'html',
    value: '<blockquote class="twitter-tweet">Provider text</blockquote>',
  });
  expect(tree.children[1]?.type).toBe('paragraph');
  expect(request).toHaveBeenCalledTimes(1);
  const url = request.mock.calls[0]![0] as URL;
  expect(url.origin).toBe('https://publish.twitter.com');
  expect(url.searchParams.get('omit_script')).toBe('true');
  expect(url.searchParams.get('dnt')).toBe('true');
});
test('provider failures retain the authored link and do not send requests to lookalike hosts', async () => {
  const request = vi.fn().mockResolvedValue({ ok: false, status: 503 });
  vi.stubGlobal('fetch', request);
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const processor = remark().use(editorialParser).use(twitterRemark);
  const tree = processor.parse(
    'https://twitter.com/example/status/10003\n\nhttps://twitter.com.evil.test/example/status/10004',
  );
  await processor.run(tree);
  expect(tree.children.map((node) => node.type)).toEqual([
    'paragraph',
    'paragraph',
  ]);
  expect(request).toHaveBeenCalledTimes(1);
  expect(warning).toHaveBeenCalledWith(
    expect.stringContaining('keeping article link'),
  );
});

test('excerpt rendering avoids providers beyond its text boundary and retains leading embeds', async () => {
  const request = vi.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({ html: '<blockquote>Leading tweet</blockquote>' }),
  });
  vi.stubGlobal('fetch', request);
  const processor = remark()
    .use(editorialParser)
    .use(twitterRemark, { excerptLength: 170 });
  const tree = processor.parse(
    'https://twitter.com/example/status/10005\n\n' +
      'Introductory words. '.repeat(20) +
      '\n\nhttps://twitter.com/example/status/10006',
  );
  await processor.run(tree);
  expect(tree.children[0]?.type).toBe('html');
  expect(tree.children[2]?.type).toBe('paragraph');
  expect(request).toHaveBeenCalledTimes(1);
});
