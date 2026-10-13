import { tagSlug } from './tag-slug.ts';

export type TagRedirect = { fromPath: string; toPath: string };

// Approved merges: each former value now belongs to its canonical tag.
export const mergedTags: Record<string, string> = {
  Tests: 'Testing',
  PostgreSql: 'PostgreSQL',
  Postgres: 'PostgreSQL',
  'Java Script': 'JavaScript',
  'Coding life': 'Coding Life',
  'Wzorce projektowe': 'Design Patterns',
  'Wzorce Projektowe': 'Design Patterns',
  'Software Architecture': 'Architecture',
};

const tagRoute = (language: string, slug: string) =>
  `/${language}/category/${slug}/`;

function mergedSlugs(): [string, string][] {
  const slugs = new Map<string, string>();
  for (const [former, canonical] of Object.entries(mergedTags)) {
    const formerSlug = tagSlug(former);
    const canonicalSlug = tagSlug(canonical);
    if (formerSlug !== canonicalSlug) slugs.set(formerSlug, canonicalSlug);
  }
  return [...slugs];
}

// A language without the canonical tag page falls back to the default
// language, as the legacy Polish topic redirects already do.
export function mergedTagRedirects(
  tagRoutes: Set<string>,
  languages: string[],
  defaultLanguage: string,
): TagRedirect[] {
  return languages.flatMap((language) =>
    mergedSlugs().flatMap(([formerSlug, canonicalSlug]) => {
      const toPath = [language, defaultLanguage]
        .map((candidate) => tagRoute(candidate, canonicalSlug))
        .find((route) => tagRoutes.has(route));
      return toPath
        ? [{ fromPath: tagRoute(language, formerSlug), toPath }]
        : [];
    }),
  );
}
