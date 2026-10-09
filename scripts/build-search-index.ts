import type { ArticleNode } from '../src/types/content.ts';
import type { IGatsbyImageData } from 'gatsby-plugin-image';
import MiniSearch from 'minisearch';
import { createHash } from 'node:crypto';
import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import { searchDocuments } from '../src/search/documents.ts';
import { indexOptions } from '../src/search/options.ts';

export async function writeSearchIndexes(
  nodes: ArticleNode[],
  publicDirectory: string,
  languages = ['en', 'pl'],
  covers: Map<string, IGatsbyImageData> = new Map(),
) {
  const directory = join(publicDirectory, 'search-index');
  await mkdir(directory, { recursive: true });
  const manifest: Record<string, string> = {};
  const metrics: Record<
    string,
    { documents: number; bytes: number; gzip: number; brotli: number }
  > = {};
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
