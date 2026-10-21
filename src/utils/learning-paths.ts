import type {
  ArticleFields,
  Frontmatter,
  GuideStep,
} from '../types/content.ts';

export type LearningPathNode = {
  fields: { pathSlug: string; langKey: string; prefix?: string };
  frontmatter: {
    title: string;
    articles?: string[];
    icon?: string;
    description?: string;
    // An authored cover path; the content pipeline resolves it before rendering.
    cover?: string | { id: string } | null;
  };
};

type PathArticle = {
  id?: string;
  fields: Pick<ArticleFields, 'slug' | 'langKey' | 'source'>;
  frontmatter: Pick<Frontmatter, 'title' | 'useDefaultLangCanonical'>;
};

// Same resolution as an article's `related` entries: the path's language
// first, then the canonical English article.
export function pathArticle(
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

function missingDetails(path: LearningPathNode) {
  const { pathSlug, langKey } = path.fields;
  const { icon, description, cover } = path.frontmatter;
  return Object.entries({ icon, description, cover })
    .filter(
      ([, value]) => !value || (typeof value === 'string' && !value.trim()),
    )
    .map(([name]) => `Learning path "${pathSlug}" (${langKey}) has no ${name}`);
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
    ...paths.flatMap(missingDetails),
    ...translationMismatches(paths, defaultLanguage),
  ];
}

export const guidePath = (path: LearningPathNode) =>
  `/${path.fields.langKey}/guides/${path.fields.pathSlug}/`;

function nextArticle(
  posts: PathArticle[],
  slug: string | undefined,
  language: string,
  defaultLanguage: string,
) {
  if (!slug) return undefined;
  const article = pathArticle(posts, slug, language, defaultLanguage);
  if (!article) return undefined;
  return {
    title: article.frontmatter.title,
    path: `/${article.fields.langKey}${article.fields.slug}`,
  };
}

// One step for every guide in the reader's language that lists the article.
export function guideSteps(
  paths: LearningPathNode[],
  posts: PathArticle[],
  slug: string,
  language: string,
  defaultLanguage = 'en',
): GuideStep[] {
  return paths
    .filter((path) => path.fields.langKey === language)
    .filter((path) => (path.frontmatter.articles || []).includes(slug))
    .sort((left, right) =>
      (left.fields.prefix || '').localeCompare(right.fields.prefix || ''),
    )
    .map((path) => {
      const articles = path.frontmatter.articles || [];
      const index = articles.indexOf(slug);
      const next = nextArticle(
        posts,
        articles[index + 1],
        language,
        defaultLanguage,
      );
      return {
        title: path.frontmatter.title,
        path: guidePath(path),
        step: index + 1,
        total: articles.length,
        ...(next ? { next } : {}),
      };
    });
}
