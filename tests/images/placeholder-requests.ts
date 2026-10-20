// Requests one cover's blurred placeholder concurrently, as parallel listing
// page queries do, and records how many results gatsby-plugin-sharp cached.
// Gatsby's logger rewrites stdout, so the result is written to <output>.
// Usage: node tests/images/placeholder-requests.ts <cacheRoot> <image> <count> <output>
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

type GatsbyCache = {
  init: () => GatsbyCache;
  set: (key: string, value: unknown) => Promise<unknown>;
};
type ImageFile = {
  absolutePath: string;
  base: string;
  extension: string;
  internal: { contentDigest: string };
};
type SharpPlugin = {
  base64: (arg: {
    file: ImageFile;
    args: Record<string, unknown>;
    cache: GatsbyCache;
  }) => Promise<{ src: string } | null>;
};

const [cacheRoot = '', imagePath = '', count = '1', output = ''] =
  process.argv.slice(2);
const require = createRequire(import.meta.url);

function imageFile(absolutePath: string): ImageFile {
  return {
    absolutePath,
    base: path.basename(absolutePath),
    extension: path.extname(absolutePath).slice(1),
    internal: {
      contentDigest: createHash('md5')
        .update(readFileSync(absolutePath))
        .digest('hex'),
    },
  };
}

function countingCache(root: string) {
  // Gatsby's cache-manager store resolves its directory from the site root.
  Object.assign(globalThis, { __GATSBY: { root } });
  const { default: Cache } = require('gatsby/dist/utils/cache') as {
    default: new (options: { name: string }) => GatsbyCache;
  };
  const cache = new Cache({ name: 'gatsby-plugin-sharp' }).init();
  const store = cache.set.bind(cache);
  const counter = { writes: 0 };
  cache.set = (key, value) => {
    counter.writes += 1;
    return store(key, value);
  };
  return { cache, counter };
}

const sharp = require('gatsby-plugin-sharp') as SharpPlugin;
const { cache, counter } = countingCache(cacheRoot);
const file = imageFile(path.resolve(imagePath));
// image-data.js requests a 20px-wide placeholder for a 2.22 aspect-ratio cover.
const args = { width: 20, height: 9 };

const placeholders = await Promise.all(
  Array.from({ length: Number(count) }, () =>
    sharp.base64({ file, args, cache }),
  ),
);

writeFileSync(
  output,
  JSON.stringify({
    writes: counter.writes,
    sources: placeholders.map((placeholder) => placeholder?.src ?? null),
  }),
);
