export const normalizeTerm = (term) =>
  term.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/\p{M}/gu, '');
export const tokenize = (text) => text.split(/[^\p{L}\p{N}_]+/u).filter(Boolean);
export const indexOptions = {
  fields: ['title', 'category', 'content'],
  storeFields: ['title', 'path', 'langKey', 'source', 'category', 'date', 'content'],
  processTerm: normalizeTerm,
  tokenize,
  searchOptions: {
    boost: { title: 6, category: 3 },
    prefix: true,
    fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
    combineWith: 'AND',
  },
};
