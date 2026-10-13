import type { ArticleFields, Frontmatter } from '../types/content.ts';

export type LearningPathNode = {
  fields: { pathSlug: string; langKey: string; prefix?: string };
  frontmatter: { title: string; articles?: string[] };
};

type PathArticle = {
  fields: Pick<ArticleFields, 'slug' | 'langKey' | 'source'>;
  frontmatter: Pick<Frontmatter, 'useDefaultLangCanonical'>;
};

// Same resolution as an article's `related` entries: the path's language
// first, then the canonical English article.
function pathArticle(
  posts: PathArticle[],
  slug: string,
  language: string,
  defaultLanguage: string,
) {
  const candidates = posts.filter(
    (post) =>
      post.fields.source === 'posts' && post.fields.slug === `/${slug}/`,
  );
  return (
    candidates.find((post) => post.fields.langKey === language) ||
    candidates.find(
      (post) =>
        post.fields.langKey === defaultLanguage &&
        !post.frontmatter.useDefaultLangCanonical,
    ) ||
    candidates.find((post) => !post.frontmatter.useDefaultLangCanonical)
  );
}

function unknownArticles(
  path: LearningPathNode,
  posts: PathArticle[],
  defaultLanguage: string,
) {
  const { pathSlug, langKey } = path.fields;
  return (path.frontmatter.articles || [])
    .filter((slug) => !pathArticle(posts, slug, langKey, defaultLanguage))
    .map(
      (slug) =>
        `Learning path "${pathSlug}" (${langKey}) lists unknown article "${slug}"`,
    );
}

function sameArticles(left: LearningPathNode, right: LearningPathNode) {
  return (
    (left.frontmatter.articles || []).join('\n') ===
    (right.frontmatter.articles || []).join('\n')
  );
}

function translationMismatches(
  paths: LearningPathNode[],
  defaultLanguage: string,
) {
  const problems: string[] = [];
  const slugs = new Set(paths.map((path) => path.fields.pathSlug));
  for (const slug of slugs) {
    const versions = paths.filter((path) => path.fields.pathSlug === slug);
    const reference =
      versions.find((path) => path.fields.langKey === defaultLanguage) ||
      versions[0]!;
    for (const version of versions) {
      if (version === reference || sameArticles(version, reference)) continue;
      problems.push(
        `Learning path "${slug}" lists different articles in ${version.fields.langKey} than in ${reference.fields.langKey}`,
      );
    }
  }
  return problems;
}

export function learningPathProblems(
  paths: LearningPathNode[],
  posts: PathArticle[],
  defaultLanguage = 'en',
): string[] {
  return [
    ...paths.flatMap((path) => unknownArticles(path, posts, defaultLanguage)),
    ...translationMismatches(paths, defaultLanguage),
  ];
}
