// Category routes and their links must use the same word boundaries.
export function categorySlug(category: string): string {
  return category
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/['’]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');
}
