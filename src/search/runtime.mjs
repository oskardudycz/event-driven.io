import MiniSearch from 'minisearch';
import { indexOptions } from './options.mjs';
export const loadIndex = (json) => MiniSearch.loadJSONAsync(json, indexOptions);
export const searchIndex = (index, query) =>
  index
    .search(query.slice(0, 160))
    .sort(
      (a, b) => b.score - a.score || b.date.localeCompare(a.date) || a.path.localeCompare(b.path),
    );
