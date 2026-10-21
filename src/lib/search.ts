import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { readCatalog } from './catalog.ts';
import { responsiveImage } from './images.ts';
import { createSearchIndex } from '../search/build.ts';
import type { ImageData } from '../types/image.ts';

export async function searchManifest() {
  const hash = createHash('sha256');
  for (const node of await readCatalog()) {
    hash.update(
      JSON.stringify({
        id: node.id,
        fields: node.fields,
        frontmatter: node.frontmatter,
        body: node.body,
      }),
    );
    if (node.coverFile) hash.update(await readFile(node.coverFile));
  }
  const version = hash.digest('hex').slice(0, 16);
  return Object.fromEntries(
    ['en', 'pl'].map((language) => [
      language,
      `/search-index/${language}.${version}.json`,
    ]),
  );
}

export async function searchIndex(language: string) {
  const nodes = await readCatalog();
  const covers = new Map<string, ImageData>();
  for (const node of nodes) {
    if (node.coverFile && !node.frontmatter.useDefaultLangCanonical)
      covers.set(node.id, await responsiveImage(node.coverFile, 'search'));
  }
  return createSearchIndex(
    nodes.map((node) => ({ ...node, rawMarkdownBody: node.body })),
    language,
    covers,
  ).json;
}
