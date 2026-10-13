import assert from 'node:assert/strict';
import { test } from 'vitest';

import config from './config.ts';
const plugin = config.plugins.find(
  (entry) =>
    typeof entry === 'object' &&
    entry.resolve === 'gatsby-plugin-react-i18next',
);
assert.ok(plugin && typeof plugin === 'object');
const options = plugin.options;
import {
  onCreatePage,
  type LocalizedPage,
} from 'gatsby-plugin-react-i18next/gatsby-node.js';

test('the locale plugin decorates existing routes without generating duplicate language pages', async () => {
  for (const path of [
    '/en/',
    '/pl/',
    '/en/articles/',
    '/pl/404/',
    '/en/open-source-a-relict-a-charity-or/',
  ]) {
    const created: LocalizedPage[] = [];
    await onCreatePage(
      {
        page: { path, context: {} },
        actions: {
          createPage: (page) => created.push(page),
          deletePage: () => {},
        },
      },
      options,
    );
    assert.equal(created.length, 1);
    assert.ok(created[0]);
    assert.equal(created[0].path, path);
    assert.equal(created[0].context.language, path.split('/')[1]);
  }
  const created: LocalizedPage[] = [];
  await onCreatePage(
    {
      page: { path: '/articles/', context: {} },
      actions: {
        createPage: (page) => created.push(page),
        deletePage: () => {},
      },
    },
    options,
  );
  assert.deepEqual(
    created.map(({ path }) => path),
    ['/articles/'],
  );
});
