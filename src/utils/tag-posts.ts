import type { Frontmatter } from '../types/content.ts';
type TaggedPost = {
  fields: { slug: string; langKey: string; source?: string };
  frontmatter: Pick<Frontmatter, 'tags' | 'useDefaultLangCanonical'>;
};
import { tagSlug as slugForTag } from './tag-slug.ts';

export const tagsForPost = (node: Pick<TaggedPost, 'frontmatter'>) =>
  Array.from(
    new Set((node.frontmatter.tags || []).filter((tag) => Boolean(tag))),
  );

// Tag membership belongs to the article, while a card's language belongs
// to the available locale route. Placeholder copies do not define topics.
export function tagPostsForLanguage<T extends TaggedPost>(
  nodes: T[],
  tagSlug: string,
  language: string,
  defaultLanguage = 'en',
): T[] {
  const posts = nodes.filter((node) => node.fields.source === 'posts');
  const members = new Set(
    posts
      .filter(
        (node) =>
          !node.frontmatter.useDefaultLangCanonical &&
          tagsForPost(node).some((tag) => slugForTag(tag) === tagSlug),
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

// Keep established tag routes: a locale needs a canonical article in the
// topic. Within each route, expose the same shared set of unique article slugs.
export function tagsForLanguage<T extends TaggedPost>(
  nodes: T[],
  language: string,
): [string, T[]][] {
  const tags = new Set<string>();
  nodes
    .filter(
      (node) =>
        node.fields.source === 'posts' &&
        node.fields.langKey === language &&
        !node.frontmatter.useDefaultLangCanonical,
    )
    .forEach((node) => tagsForPost(node).forEach((tag) => tags.add(tag)));
  return [...tags].map((tag) => [
    tag,
    tagPostsForLanguage(nodes, slugForTag(tag), language),
  ]);
}
