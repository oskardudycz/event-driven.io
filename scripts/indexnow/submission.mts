import {
  origin,
  productionUrl,
  validateManifest,
  changedUrls,
  fingerprint,
  type Manifest,
} from './manifest.mts';

const endpoint = 'https://api.indexnow.org/indexnow';
const batchSize = 10000;
const acceptedStatuses = [200, 202];
const removedPageStatuses = [301, 302, 307, 308, 404, 410];

type NotificationOptions = {
  current: Manifest;
  previous?: Manifest;
  key: string;
  submit?: boolean;
  urls?: string[];
  request?: typeof fetch;
  save?: (_manifest: Manifest) => Promise<void>;
};

function urlsToNotify(options: NotificationOptions): string[] {
  if (options.urls) return [...new Set(options.urls.map(productionUrl))].sort();
  if (options.previous) return changedUrls(options.previous, options.current);
  return [];
}

function getProductionResource(url: string, request: typeof fetch) {
  return request(url, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
}

async function verifyDeployment(current: Manifest, key: string, request: typeof fetch) {
  const keyResponse = await getProductionResource(`${origin}/${key}.txt`, request);
  if (keyResponse.status !== 200 || (await keyResponse.text()).trim() !== key)
    throw new Error('Production IndexNow key is not published correctly; deploy first');

  const response = await getProductionResource(`${origin}/indexnow-manifest.json`, request);
  if (response.status !== 200) throw new Error('Production manifest unavailable; deploy first');
  const deployed = validateManifest(await response.json());
  if (changedUrls(current, deployed).length)
    throw new Error('Production manifest differs from this build; deploy first');
}

async function verifyChangedPages(current: Manifest, urls: string[], request: typeof fetch) {
  for (const url of urls) {
    const response = await getProductionResource(url, request);
    const expected = current.pages[url];

    if (!expected) {
      await response.body?.cancel();
      if (!removedPageStatuses.includes(response.status))
        throw new Error(`Deleted/moved URL still returns ${response.status}: ${url}`);
      continue;
    }

    if (response.status !== 200)
      throw new Error(`Production page is unavailable: ${url} (${response.status})`);
    if (/\bnoindex\b/i.test(response.headers.get('x-robots-tag') || ''))
      throw new Error(`Production page is marked noindex: ${url}`);
    if (fingerprint(await response.text(), url) !== expected)
      throw new Error(`Production page differs from this build: ${url}`);
  }
}

async function submitBatches(urls: string[], key: string, request: typeof fetch) {
  for (let offset = 0; offset < urls.length; offset += batchSize) {
    const batch = urls.slice(offset, offset + batchSize);
    const response = await request(endpoint, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(30000),
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(origin).host,
        key,
        keyLocation: `${origin}/${key}.txt`,
        urlList: batch,
      }),
    });
    await response.body?.cancel();
    if (!acceptedStatuses.includes(response.status))
      throw new Error(
        `IndexNow returned HTTP ${response.status}; state was not advanced. Retry later.`,
      );
    console.log(
      `IndexNow received ${batch.length} URLs (HTTP ${response.status}); indexing is not guaranteed.`,
    );
  }
}

export async function notify(options: NotificationOptions): Promise<string[]> {
  const { current, key, request = fetch } = options;
  validateManifest(current);
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) throw new Error('Invalid IndexNow key');

  const urls = urlsToNotify(options);
  const firstRun = !options.previous && !options.urls;
  if (firstRun) console.log('First run: establish a baseline without submitting historical URLs.');
  else console.log(`${urls.length} added, changed or deleted URLs:\n${urls.join('\n')}`);

  if (!options.submit) {
    console.log('Dry run: no requests or state changes. Use --submit after production deployment.');
    return urls;
  }

  await verifyDeployment(current, key, request);
  await verifyChangedPages(current, urls, request);
  await submitBatches(urls, key, request);

  // One-off submissions must not acknowledge other pending content changes.
  if (!options.urls) await options.save?.(current);
  return urls;
}
