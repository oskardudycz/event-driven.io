import { normalizeTerm, tokenize } from './options.ts';
export function highlightParts(text: string, terms: string[]) {
  const words = text.split(/([\p{L}\p{N}_]+)/u);
  const matches = new Set(terms.map(normalizeTerm));
  return words.map((value) => ({ text: value, highlighted: matches.has(normalizeTerm(value)) }));
}
export function snippet(content: string, terms: string[], length = 220) {
  const normalized = normalizeTerm(content);
  const positions = terms
    .map((term) => normalized.indexOf(normalizeTerm(term)))
    .filter((index) => index >= 0);
  const position = positions.length ? Math.min(...positions) : 0;
  let start = Math.max(0, position - 65);
  if (start) {
    const boundary = content.indexOf(' ', start);
    if (boundary >= 0 && boundary < position) start = boundary + 1;
  }
  return `${start ? '…' : ''}${content.slice(start, start + length)}${start + length < content.length ? '…' : ''}`;
}
export const queryTerms = (query: string) => tokenize(query).map(normalizeTerm);
