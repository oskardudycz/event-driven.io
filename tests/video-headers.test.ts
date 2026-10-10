import type { Root, Html } from 'mdast';
import netlifyHeaders from 'gatsby-plugin-netlify/build-headers-program.js';
import videoPlugin from '../plugins/gatsby-remark-video/index.ts';
import { temporaryDirectory } from './helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import config from '../site/config.ts';
const buildHeaders = netlifyHeaders.default;
import { DEFAULT_OPTIONS } from 'gatsby-plugin-netlify/constants.js';

void test('Netlify output sends the referrer YouTube requires and keeps other headers', async (t) => {
  const directory = temporaryDirectory(t, 'video-headers-');
  const plugin = config.plugins.find(
    (entry) =>
      typeof entry === 'object' && entry.resolve === 'gatsby-plugin-netlify',
  );
  await buildHeaders(
    {
      manifest: {},
      pages: [],
      pathPrefix: '',
      publicFolder: (file) => path.join(directory, file),
    },
    {
      ...DEFAULT_OPTIONS,
      ...(plugin && typeof plugin === 'object' ? plugin.options : {}),
    },
    {
      warn: (message) => {
        throw new Error(message);
      },
    },
  );
  const headers = await fs.readFile(path.join(directory, '_headers'), 'utf8');
  assert.match(
    headers,
    /\/\*\n(?: {2}[^\n]+\n)* {2}Referrer-Policy: strict-origin-when-cross-origin\n/,
  );
  assert.doesNotMatch(headers, /Referrer-Policy: same-origin/);
  assert.equal((headers.match(/Referrer-Policy:/g) || []).length, 1);
  assert.match(headers, /X-Frame-Options: DENY/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /Content-Type: text\/plain; charset=UTF-8/);
});

void test('Gatsby video plugin renders bare IDs and preserves URL timestamps and titles', () => {
  const render = videoPlugin;
  const remark = config.plugins.find(
    (p) => typeof p === 'object' && p.resolve === 'gatsby-transformer-remark',
  );
  assert.ok(remark && typeof remark === 'object' && remark.options.plugins);
  const video = remark.options.plugins.find(
    (p) => typeof p === 'object' && p.resolve.includes('gatsby-remark-video'),
  );
  const ast: Root = {
    type: 'root',
    children: [
      { type: 'inlineCode', value: 'youtube: sQbkUl7-z_U' },
      {
        type: 'inlineCode',
        value:
          'youtube: [A titled video](https://www.youtube.com/watch?v=sQbkUl7-z_U&t=1m30s&end=120)',
      },
      {
        type: 'inlineCode',
        value:
          'youtube: [Another position](https://www.youtube-nocookie.com/embed/sQbkUl7-z_U?start=30)',
      },
    ],
  };
  assert.ok(video && typeof video === 'object');
  render({ markdownAST: ast }, video.options || {});
  for (const child of ast.children) {
    const node = child as Html;
    assert.equal(node.type, 'html');
    assert.match(node.value, /youtube-nocookie\.com\/embed\/sQbkUl7-z_U/);
    assert.match(
      node.value,
      /referrerpolicy="strict-origin-when-cross-origin"/,
    );
    assert.match(node.value, /loading="lazy"/);
    assert.doesNotMatch(node.value, /Error:|sandbox=/);
  }
  assert.match((ast.children[1] as Html).value, /start=90/);
  assert.match((ast.children[1] as Html).value, /end=120/);
  assert.match((ast.children[1] as Html).value, /title="A titled video"/);
  assert.match((ast.children[2] as Html).value, /start=30/);
});
