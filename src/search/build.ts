import type { ArticleNode } from '../types/content.ts';
import type { ImageData } from '../types/image.ts';
import MiniSearch from 'minisearch';
import i18next from 'i18next';
import { searchDocuments, tagSearchDocuments } from './documents.ts';
import { indexOptions } from './options.ts';
import en from '../i18n/locales/en/translation.json' with { type: 'json' };
import pl from '../i18n/locales/pl/translation.json' with { type: 'json' };

const translations = i18next.createInstance();
await translations.init({
  resources: { en: { translation: en }, pl: { translation: pl } },
  fallbackLng: 'en',
});

export function createSearchIndex(
  nodes: ArticleNode[],
  language: string,
  covers: Map<string, ImageData> = new Map(),
) {
  const documents = [
    ...searchDocuments(nodes, language, 'en', covers),
    ...tagSearchDocuments(nodes, language, translations.getFixedT(language)),
  ];
  const index = new MiniSearch(indexOptions);
  index.addAll(documents);
  const json = JSON.stringify(index);
  return { json, documents };
}
