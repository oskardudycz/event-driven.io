import type { ArticleNode, ArticleEdge } from '../types/content.ts';
import type { SourceDocument } from './catalog.ts';
import { readFile } from 'node:fs/promises';
import { renderMarkdown, renderExcerpt } from './markdown.ts';
import { imageFile, socialImage, responsiveImage } from './images.ts';

const rendered = new Map<string, Promise<ArticleNode>>();
export function renderDocument(node: SourceDocument, coverWidth = 600) {
  const key = `${node.id}:${coverWidth}`;
  let work = rendered.get(key);
  if (!work) {
    work = (async () => {
      const { html, excerpt } = await renderMarkdown(node.body, node.file);
      const cover = node.coverFile
        ? { src: await socialImage(node.coverFile, coverWidth) }
        : undefined;
      return {
        id: node.id,
        fields: node.fields,
        frontmatter: { ...node.frontmatter, ...(cover ? { cover } : {}) },
        html,
        excerpt,
      };
    })();
    rendered.set(key, work);
  }
  return work;
}
const cards = new Map<string, Promise<ArticleEdge>>();
export function renderCard(
  node: SourceDocument,
  length = 170,
): Promise<ArticleEdge> {
  const key = `${node.id}:${length}`;
  let pending = cards.get(key);
  if (!pending) {
    pending = createCard(node, length);
    cards.set(key, pending);
  }
  return pending;
}
async function createCard(
  node: SourceDocument,
  length: number,
): Promise<ArticleEdge> {
  const excerpt = await renderExcerpt(node.body, node.file, length);
  const cover = node.coverFile
    ? {
        src: await imageFile(node.coverFile, 420, { height: 240, quality: 78 }),
      }
    : undefined;
  return {
    node: {
      id: node.id,
      fields: node.fields,
      frontmatter: { ...node.frontmatter, ...(cover ? { cover } : {}) },
      excerpt,
    },
  };
}

const parts = new Map<string, Promise<string>>();
export function renderPart(name: string, language: string) {
  const file = `content/parts/${name}.${language}.md`;
  let work = parts.get(file);
  if (!work) {
    work = readFile(file, 'utf8').then(
      async (raw) =>
        (
          await renderMarkdown(
            raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ''),
            file,
          )
        ).html,
    );
    parts.set(file, work);
  }
  return work;
}

const listings = new Map<string, Promise<ArticleEdge>>();
export function renderListing(node: SourceDocument): Promise<ArticleEdge> {
  let work = listings.get(node.id);
  if (!work) {
    work = (async () => {
      const original = await renderCard(node, 140);
      const card = {
        node: {
          ...original.node,
          frontmatter: { ...original.node.frontmatter },
        },
      };
      const cover = card.node.frontmatter.cover;
      if (node.coverFile && cover)
        card.node.frontmatter.cover = {
          ...cover,
          responsive: await responsiveImage(node.coverFile, 'archive'),
        };
      return card;
    })();
    listings.set(node.id, work);
  }
  return work;
}

export function resetRendering() {
  rendered.clear();
  listings.clear();
  parts.clear();
  cards.clear();
}

let developmentRevision: string | undefined;
export function refreshDevelopmentRendering(revision: string) {
  if (revision === developmentRevision) return;
  resetRendering();
  developmentRevision = revision;
}
