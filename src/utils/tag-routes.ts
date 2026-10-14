export const tagRoute = (language: string, slug: string) =>
  `/${language}/articles/tag/${slug}/`;

// A tag without a page in the requested language leads to the default
// language's page, so links and redirects never point at a missing route.
export const tagDestination = (
  tagRoutes: Set<string>,
  language: string,
  slug: string,
  defaultLanguage: string,
): string | undefined =>
  [language, defaultLanguage]
    .map((candidate) => tagRoute(candidate, slug))
    .find((route) => tagRoutes.has(route));
