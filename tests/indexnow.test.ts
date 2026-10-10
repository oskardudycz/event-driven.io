import { temporaryDirectory } from './helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { restoreProductionBaseline } from '../scripts/indexnow.ts';
import {
  origin,
  productionUrl,
  fingerprint,
  changedUrls,
  type Manifest,
} from '../scripts/indexnow/manifest.ts';
import { notify } from '../scripts/indexnow/submission.ts';

function requestUrl(input: Parameters<typeof fetch>[0]): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

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
  const request: typeof fetch = (input, options) => {
    const url = requestUrl(input);
    calls.push({ url, options });
    if (options?.method === 'POST')
      return Promise.resolve(new Response('', { status }));
    if (url === `${origin}/${key}.txt`)
      return Promise.resolve(new Response(publishedKey));
    if (url === `${origin}/indexnow-manifest.json`)
      return Promise.resolve(Response.json(deployed));
    if (url === article) return Promise.resolve(new Response(html));
    if (url === removed)
      return Promise.resolve(new Response('', { status: removedStatus }));
    return Promise.reject(new Error(`Unexpected request: ${url}`));
  };
  return { calls, request };
}

void test('URLs are restricted to canonical production destinations', () => {
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
void test('content fingerprints ignore CSS/classes and detect meaningful page changes', () => {
  assert.equal(
    fingerprint(page(), article),
    fingerprint(
      page()
        .replace('<head>', '<head><style>.x{color:red}</style>')
        .replace('<main>', '<main class="new-class">'),
      article,
    ),
  );
  assert.notEqual(
    fingerprint(page(), article),
    fingerprint(page('Updated'), article),
  );
  assert.throws(() =>
    fingerprint(
      page('Content', '<meta name="robots" content="noindex">'),
      article,
    ),
  );
  assert.throws(() =>
    fingerprint(page().replace(article, `${origin}/pl/example/`), article),
  );
});
void test('diffs include added, updated and deleted URLs, but not unchanged pages', () => {
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
  assert.deepEqual(
    changedUrls(before, after),
    [article, `${origin}/pl/new/`, removed].sort(),
  );
});
void test('dry runs perform no network requests or state writes', async () => {
  await notify({
    current,
    previous: manifest({}),
    key,
    request: () => {
      return Promise.reject(new Error('Network used'));
    },
    save: () => {
      return Promise.reject(new Error('State written'));
    },
  });
});
void test('first production run verifies publication and records a baseline without bulk submission', async () => {
  const { request, calls } = fakeProduction();
  let saved;
  await notify({
    current,
    key,
    submit: true,
    request,
    save: (value) => {
      saved = value;
      return Promise.resolve();
    },
  });
  assert.equal(saved, current);
  assert.equal(calls.length, 2);
  assert(calls.every((call) => !call.options?.method));
});
void test('production changes and deletions are verified, submitted once and acknowledged on 200/202', async () => {
  for (const status of [200, 202]) {
    const { request, calls } = fakeProduction({ status });
    let saved;
    await notify({
      current,
      previous: manifest({ [removed]: 'a'.repeat(64) }),
      key,
      submit: true,
      request,
      save: (value) => {
        saved = value;
        return Promise.resolve();
      },
    });
    const posts = calls.filter((call) => call.options?.method === 'POST');
    assert.equal(posts.length, 1);
    assert.ok(posts[0]);
    assert.equal(posts[0].url, 'https://api.indexnow.org/indexnow');
    const body = posts[0].options?.body;
    assert.equal(typeof body, 'string');
    assert.deepEqual(JSON.parse(body as string), {
      host: 'event-driven.io',
      key,
      keyLocation: `${origin}/${key}.txt`,
      urlList: [article, removed],
    });
    assert.equal(saved, current);
  }
});
void test('wrong deployment, invalid key, stale pages, live deletions and API errors retain pending state', async () => {
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
        save: () => {
          return Promise.reject(new Error('State advanced on failure'));
        },
      }),
    );
  }
});
void test('one-off submissions preserve the automatic acknowledgement state', async () => {
  const { request } = fakeProduction();
  await notify({
    current,
    key,
    submit: true,
    urls: [article, article],
    request,
    save: () => {
      return Promise.reject(new Error('Unrelated changes acknowledged'));
    },
  });
});
void test('large changes are split at the protocol limit and state is saved only after every batch succeeds', async () => {
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
    const request: typeof fetch = (input, options) => {
      if (options?.method === 'POST') {
        assert.equal(typeof options.body, 'string');
        const body = JSON.parse(options.body as string) as {
          urlList: string[];
        };
        batches.push(body.urlList.length);
        return Promise.resolve(
          new Response('', {
            status: failLastBatch && batches.length === 2 ? 429 : 200,
          }),
        );
      }
      if (requestUrl(input).endsWith('/indexnow-manifest.json'))
        return Promise.resolve(Response.json(empty));
      if (requestUrl(input).endsWith(`/${key}.txt`))
        return Promise.resolve(new Response(key));
      return Promise.resolve(new Response('', { status: 404 }));
    };
    const result = notify({
      current: empty,
      previous,
      key,
      submit: true,
      request,
      save: () => {
        saved = true;
        return Promise.resolve();
      },
    });
    if (failLastBatch) await assert.rejects(result, /HTTP 429/);
    else await result;
    assert.deepEqual(batches, [10000, 1]);
    assert.equal(saved, !failLastBatch);
  }
});
void test('the static verification file contains the configured public key', () => {
  const settings = JSON.parse(readFileSync('data/indexnow.json', 'utf8')) as {
    key: string;
  };
  assert.match(settings.key, /^[a-zA-Z0-9-]{8,128}$/);
  assert.equal(
    readFileSync(`static/${settings.key}.txt`, 'utf8').trim(),
    settings.key,
  );
});
void test('expired acknowledgement caches use the previous deployment, while retained state avoids requests', async (t) => {
  const directory = temporaryDirectory(t, 'indexnow-state-');
  const file = join(directory, 'submitted.json');
  await restoreProductionBaseline(file, () =>
    Promise.resolve(Response.json(current)),
  );
  assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), current);
  await restoreProductionBaseline(file, () => {
    return Promise.reject(new Error('Retained state should not fetch'));
  });
  await rm(file);
  await restoreProductionBaseline(file, () =>
    Promise.resolve(new Response('', { status: 404 })),
  );
  await assert.rejects(readFile(file), { code: 'ENOENT' });
  await assert.rejects(
    restoreProductionBaseline(file, () =>
      Promise.resolve(new Response('', { status: 500 })),
    ),
  );
  await assert.rejects(readFile(file), { code: 'ENOENT' });
});
