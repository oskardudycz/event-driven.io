import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { restoreProductionBaseline } from '../scripts/indexnow.mts';
import {
  origin,
  productionUrl,
  fingerprint,
  changedUrls,
  type Manifest,
} from '../scripts/indexnow/manifest.mts';
import { notify } from '../scripts/indexnow/submission.mts';

const key = 'test-indexnow-key';
const article = `${origin}/en/example/`;
const removed = `${origin}/pl/deleted/`;
function page(text = 'Content', extraHead = '') {
  return `<html lang="en"><head><title>Example</title><link rel="canonical" href="${article}">${extraHead}</head><body><main><h1>Example</h1><p>${text}</p></main></body></html>`;
}
function manifest(pages: Record<string, string>): Manifest {
  return { version: 1, origin, pages };
}
const current = manifest({ [article]: fingerprint(page(), article) });

function fakeProduction({
  status = 200,
  deployed = current,
  html = page(),
  publishedKey = key,
  removedStatus = 404,
}: {
  status?: number;
  deployed?: Manifest;
  html?: string;
  publishedKey?: string;
  removedStatus?: number;
} = {}) {
  const calls: { url: string; options?: Parameters<typeof fetch>[1] }[] = [];
  const request: typeof fetch = async (input, options) => {
    const url = String(input);
    calls.push({ url, options });
    if (options?.method === 'POST') return new Response('', { status });
    if (url === `${origin}/${key}.txt`) return new Response(publishedKey);
    if (url === `${origin}/indexnow-manifest.json`) return Response.json(deployed);
    if (url === article) return new Response(html);
    if (url === removed) return new Response('', { status: removedStatus });
    throw new Error(`Unexpected request: ${url}`);
  };
  return { calls, request };
}

test('URLs are restricted to canonical production destinations', () => {
  assert.equal(productionUrl('/en/example/'), article);
  for (const url of [
    'https://preview.netlify.app/en/example/',
    'https://event-driven.io.evil.test/en/example/',
    '//evil.test/en/example/',
    '/en/example/?utm_source=email',
    '/en/example/#anchor',
    '/en/example',
    'https://user@event-driven.io/en/example/',
  ])
    assert.throws(() => productionUrl(url));
});
test('content fingerprints ignore CSS/classes and detect meaningful page changes', () => {
  assert.equal(
    fingerprint(page(), article),
    fingerprint(
      page()
        .replace('<head>', '<head><style>.x{color:red}</style>')
        .replace('<main>', '<main class="new-class">'),
      article,
    ),
  );
  assert.notEqual(fingerprint(page(), article), fingerprint(page('Updated'), article));
  assert.throws(() =>
    fingerprint(page('Content', '<meta name="robots" content="noindex">'), article),
  );
  assert.throws(() => fingerprint(page().replace(article, `${origin}/pl/example/`), article));
});
test('diffs include added, updated and deleted URLs, but not unchanged pages', () => {
  const unchanged = `${origin}/en/unchanged/`;
  const before = manifest({
    [article]: 'a'.repeat(64),
    [removed]: 'b'.repeat(64),
    [unchanged]: 'c'.repeat(64),
  });
  const after = manifest({
    ...current.pages,
    [unchanged]: 'c'.repeat(64),
    [`${origin}/pl/new/`]: 'd'.repeat(64),
  });
  assert.deepEqual(changedUrls(before, after), [article, `${origin}/pl/new/`, removed].sort());
});
test('dry runs perform no network requests or state writes', async () => {
  await notify({
    current,
    previous: manifest({}),
    key,
    request: async () => {
      throw new Error('Network used');
    },
    save: async () => {
      throw new Error('State written');
    },
  });
});
test('first production run verifies publication and records a baseline without bulk submission', async () => {
  const { request, calls } = fakeProduction();
  let saved;
  await notify({
    current,
    key,
    submit: true,
    request,
    save: async (value) => {
      saved = value;
    },
  });
  assert.equal(saved, current);
  assert.equal(calls.length, 2);
  assert(calls.every((call) => !call.options?.method));
});
test('production changes and deletions are verified, submitted once and acknowledged on 200/202', async () => {
  for (const status of [200, 202]) {
    const { request, calls } = fakeProduction({ status });
    let saved;
    await notify({
      current,
      previous: manifest({ [removed]: 'a'.repeat(64) }),
      key,
      submit: true,
      request,
      save: async (value) => {
        saved = value;
      },
    });
    const posts = calls.filter((call) => call.options?.method === 'POST');
    assert.equal(posts.length, 1);
    assert.equal(posts[0].url, 'https://api.indexnow.org/indexnow');
    assert.deepEqual(JSON.parse(String(posts[0].options?.body)), {
      host: 'event-driven.io',
      key,
      keyLocation: `${origin}/${key}.txt`,
      urlList: [article, removed],
    });
    assert.equal(saved, current);
  }
});
test('wrong deployment, invalid key, stale pages, live deletions and API errors retain pending state', async () => {
  for (const input of [
    { deployed: manifest({}) },
    { publishedKey: 'wrong-key' },
    { html: page('Old content') },
    { removedStatus: 200 },
    { status: 429 },
    { status: 500 },
  ]) {
    const { request } = fakeProduction(input);
    await assert.rejects(
      notify({
        current,
        previous: manifest({ [removed]: 'a'.repeat(64) }),
        key,
        submit: true,
        request,
        save: async () => {
          assert.fail('State advanced on failure');
        },
      }),
    );
  }
});
test('one-off submissions preserve the automatic acknowledgement state', async () => {
  const { request } = fakeProduction();
  await notify({
    current,
    key,
    submit: true,
    urls: [article, article],
    request,
    save: async () => {
      assert.fail('Unrelated changes acknowledged');
    },
  });
});
test('large changes are split at the protocol limit and state is saved only after every batch succeeds', async () => {
  const previous = manifest(
    Object.fromEntries(
      Array.from({ length: 10001 }, (_, index) => [
        `${origin}/en/deleted-${index}/`,
        'a'.repeat(64),
      ]),
    ),
  );
  const empty = manifest({});
  for (const failLastBatch of [false, true]) {
    const batches: number[] = [];
    let saved = false;
    const request: typeof fetch = async (input, options) => {
      if (options?.method === 'POST') {
        batches.push(JSON.parse(String(options.body)).urlList.length);
        return new Response('', { status: failLastBatch && batches.length === 2 ? 429 : 200 });
      }
      if (String(input).endsWith('/indexnow-manifest.json')) return Response.json(empty);
      if (String(input).endsWith(`/${key}.txt`)) return new Response(key);
      return new Response('', { status: 404 });
    };
    const result = notify({
      current: empty,
      previous,
      key,
      submit: true,
      request,
      save: async () => {
        saved = true;
      },
    });
    if (failLastBatch) await assert.rejects(result, /HTTP 429/);
    else await result;
    assert.deepEqual(batches, [10000, 1]);
    assert.equal(saved, !failLastBatch);
  }
});
test('the static verification file contains the configured public key', () => {
  const settings = JSON.parse(readFileSync('data/indexnow.json', 'utf8'));
  assert.match(settings.key, /^[a-zA-Z0-9-]{8,128}$/);
  assert.equal(readFileSync(`static/${settings.key}.txt`, 'utf8').trim(), settings.key);
});
test('expired acknowledgement caches use the previous deployment, while retained state avoids requests', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'indexnow-state-'));
  const file = join(directory, 'submitted.json');
  try {
    await restoreProductionBaseline(file, async () => Response.json(current));
    assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), current);
    await restoreProductionBaseline(file, async () => {
      throw new Error('Retained state should not fetch');
    });
    await rm(file);
    await restoreProductionBaseline(file, async () => new Response('', { status: 404 }));
    await assert.rejects(readFile(file), { code: 'ENOENT' });
    await assert.rejects(
      restoreProductionBaseline(file, async () => new Response('', { status: 500 })),
    );
    await assert.rejects(readFile(file), { code: 'ENOENT' });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
