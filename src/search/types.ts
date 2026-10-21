import type { ImageData } from '../types/image.ts';
import type { SearchResult } from 'minisearch';
export type SearchDocument = {
  id: string;
  title: string;
  path: string;
  langKey: string;
  source: string;
  tags: string;
  date: string;
  content: string;
  cover?: ImageData | null;
};
export type SearchHit = Omit<SearchDocument, 'id' | 'date' | 'tags'> &
  Partial<Pick<SearchDocument, 'id' | 'date'>> & {
    tags?: string | string[];
    terms: string[];
  };
export type IndexedSearchResult = Pick<
  SearchResult,
  'score' | 'terms' | 'queryTerms' | 'match'
> &
  SearchDocument;
