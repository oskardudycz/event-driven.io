import MiniSearch from 'minisearch';
import { createHash } from 'node:crypto';
import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import { searchDocuments } from '../src/search/documents.mjs';
import { indexOptions } from '../src/search/options.mjs';

export async function writeSearchIndexes(
  nodes,
  publicDirectory,
  languages = ['en', 'pl'],
  covers = new Map(),
) {
  const directory = join(publicDirectory, 'search-index');
  await mkdir(directory, { recursive: true });
  const manifest = {};
  const metrics = {};
  for (const language of languages) {
    const documents = searchDocuments(nodes, language, 'en', covers);
    const index = new MiniSearch(indexOptions);
    index.addAll(documents);
    const json = JSON.stringify(index);
    const hash = createHash('sha256').update(json).digest('hex').slice(0, 16);
    const file = `${language}.${hash}.json`;
    await writeFile(join(directory, file), json);
    manifest[language] = `/search-index/${file}`;
    metrics[language] = {
      documents: documents.length,
      bytes: Buffer.byteLength(json),
      gzip: gzipSync(json).length,
      brotli: brotliCompressSync(json, { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } }).length,
    };
  }
  await writeFile(join(directory, 'manifest.json'), JSON.stringify(manifest));
  const current = new Set([
    'manifest.json',
    ...Object.values(manifest).map((value) => value.split('/').pop()),
  ]);
  for (const file of await readdir(directory)) {
    if (/^(?:en|pl)\.[a-f0-9]+\.json$/.test(file) && !current.has(file))
      await unlink(join(directory, file));
  }
  return metrics;
}
