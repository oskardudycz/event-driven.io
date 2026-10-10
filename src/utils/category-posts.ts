import type { Frontmatter } from '../types/content.ts';
type CategorizedPost = {
  fields: { slug: string; langKey: string; source?: string };
  frontmatter: Pick<
    Frontmatter,
    'category' | 'categories' | 'useDefaultLangCanonical'
  >;
};
import { categorySlug as slugForCategory } from './category-slug.ts';

export const categoriesForPost = (node: Pick<CategorizedPost, 'frontmatter'>) =>
  Array.from(
    new Set(
      [
        node.frontmatter.category,
        ...(node.frontmatter.categories || []),
      ].filter((category): category is string => Boolean(category)),
    ),
  );

// Category membership belongs to the article, while a card's language belongs
// to the available locale route. Placeholder copies do not define topics.
export function categoryPostsForLanguage<T extends CategorizedPost>(
  nodes: T[],
  categorySlug: string,
  language: string,
  defaultLanguage = 'en',
): T[] {
  const posts = nodes.filter((node) => node.fields.source === 'posts');
  const members = new Set(
    posts
      .filter(
        (node) =>
          !node.frontmatter.useDefaultLangCanonical &&
          categoriesForPost(node).some(
            (category) => slugForCategory(category) === categorySlug,
          ),
      )
      .map((node) => node.fields.slug),
  );
  const translations = new Map<string, T[]>();
  for (const post of posts) {
    if (!members.has(post.fields.slug)) continue;
    const versions = translations.get(post.fields.slug) || [];
    versions.push(post);
    translations.set(post.fields.slug, versions);
  }
  return [...members].map((slug) => {
    const versions = translations.get(slug)!;
    return (
      versions.find((node) => node.fields.langKey === language) ||
      versions.find(
        (node) =>
          node.fields.langKey === defaultLanguage &&
          !node.frontmatter.useDefaultLangCanonical,
      ) ||
      versions.find((node) => !node.frontmatter.useDefaultLangCanonical)!
    );
  });
}

// Keep established category routes: a locale needs a canonical article in the
// topic. Within each route, expose the same shared set of unique article slugs.
export function categoriesForLanguage<T extends CategorizedPost>(
  nodes: T[],
  language: string,
): [string, T[]][] {
  const categories = new Set<string>();
  nodes
    .filter(
      (node) =>
        node.fields.source === 'posts' &&
        node.fields.langKey === language &&
        !node.frontmatter.useDefaultLangCanonical,
    )
    .forEach((node) =>
      categoriesForPost(node).forEach((category) => categories.add(category)),
    );
  return [...categories].map((category) => [
    category,
    categoryPostsForLanguage(nodes, slugForCategory(category), language),
  ]);
}
