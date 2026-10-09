import type { IGatsbyImageData } from 'gatsby-plugin-image';
import type { SearchResult } from 'minisearch';
export type SearchDocument = {
  id: string;
  title: string;
  path: string;
  langKey: string;
  source: string;
  category: string;
  date: string;
  content: string;
  cover?: IGatsbyImageData | null;
};
export type SearchHit = Omit<SearchDocument, 'id' | 'date' | 'category'> &
  Partial<Pick<SearchDocument, 'id' | 'date'>> & { category?: string | string[]; terms: string[] };
export type IndexedSearchResult = SearchResult & SearchDocument;
