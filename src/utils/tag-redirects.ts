import { tagSlug } from './tag-slug.ts';
import { tagDestination, tagRoute } from './tag-routes.ts';

export type TagRedirect = { fromPath: string; toPath: string };
export type TagPage = { language: string; slug: string };

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

const legacyTagRoute = (language: string, slug: string) =>
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

// Former category URLs, including merged tags, lead to the tag page in one hop.
// A language without the tag page falls back to the default language, as the
// legacy Polish topic redirects already do.
export function legacyTagRedirects(
  tagPages: TagPage[],
  languages: string[],
  defaultLanguage: string,
): TagRedirect[] {
  const routes = new Set(
    tagPages.map(({ language, slug }) => tagRoute(language, slug)),
  );
  const legacySlugs = new Map<string, string>([
    ...tagPages.map(({ slug }): [string, string] => [slug, slug]),
    ...mergedSlugs(),
  ]);
  return languages.flatMap((language) =>
    [...legacySlugs].flatMap(([legacySlug, slug]) => {
      const toPath = tagDestination(routes, language, slug, defaultLanguage);
      return toPath
        ? [{ fromPath: legacyTagRoute(language, legacySlug), toPath }]
        : [];
    }),
  );
}
