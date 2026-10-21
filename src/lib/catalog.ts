import { getCollection } from 'astro:content';
import { createHash } from 'node:crypto';
import type { ArticleNode, Frontmatter } from '../types/content.ts';
import { contentFields } from '../content/routing.ts';
import path from 'node:path';
import { glob } from 'node:fs/promises';

export type SourceDocument = ArticleNode & {
  id: string;
  file: string;
  body: string;
  coverFile?: string;
};

export async function readCatalog() {
  const documents: SourceDocument[] = [];
  for (const source of [
    'posts',
    'paths',
    'pages',
    'newsletter-pl',
    'tags',
  ] as const) {
    // The loader validates this schema before entries reach the collection.
    // Keep this boundary typed even in a cold checkout without .astro types.
    // Astro warns when querying an empty collection. The newsletter archive
    // currently has no source entries; an empty archive is valid publication.
    if (source === 'newsletter-pl') {
      const iterator = glob('**/index.{en,pl}.md', {
        cwd: 'content/newsletter-pl',
      });
      if ((await iterator.next()).done) continue;
    }
    const entries = (await getCollection(source)) as {
      id: string;
      filePath?: string;
      body?: string;
      data: Omit<Frontmatter, 'cover'> & { cover?: string };
    }[];
    for (const entry of entries) {
      if (!entry.filePath)
        throw new Error(`Missing source file: ${source}:${entry.id}`);
      const file = entry.filePath;
      const { cover, ...frontmatter } = entry.data;
      documents.push({
        id: `${source}:${entry.id}`,
        fields: contentFields(source, entry.id),
        frontmatter,
        file,
        body: entry.body || '',
        ...(cover
          ? { coverFile: path.resolve(path.dirname(file), cover) }
          : {}),
      });
    }
  }
  documents.sort((left, right) =>
    (right.fields.prefix || '').localeCompare(left.fields.prefix || ''),
  );
  return documents;
}

// Astro's glob loader owns source watching. Use current collection values to
// invalidate derived render caches; Vite owns imported image/part dependencies.
const parts = import.meta.glob('/content/parts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});
export async function catalogRevision() {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(parts));
  for (const document of await readCatalog())
    hash.update(JSON.stringify(document));
  return hash.digest('hex');
}
