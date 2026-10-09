import type { SearchDocument, IndexedSearchResult } from './types.ts';
import MiniSearch from 'minisearch';
import { indexOptions } from './options.ts';
export const loadIndex = (json: string) =>
  MiniSearch.loadJSONAsync<SearchDocument>(json, indexOptions);
export const searchIndex = (index: MiniSearch<SearchDocument>, query: string) =>
  index
    .search(query.slice(0, 160))
    .map((result) => result as IndexedSearchResult)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.date.localeCompare(a.date) ||
        a.path.localeCompare(b.path),
    );
