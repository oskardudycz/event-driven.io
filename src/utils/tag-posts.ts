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
  return posts.filter(
    (node) => node.fields.langKey === language && members.has(node.fields.slug),
  );
}

// A language has a tag page when one of the tag's articles has a route in
// it, including an English copy published under the Polish route.
export function tagsForLanguage<T extends TaggedPost>(
  nodes: T[],
  language: string,
): [string, T[]][] {
  const posts = nodes.filter((node) => node.fields.source === 'posts');
  const routes = new Set(
    posts
      .filter((node) => node.fields.langKey === language)
      .map((node) => node.fields.slug),
  );
  const tags = new Set<string>();
  posts
    .filter(
      (node) =>
        !node.frontmatter.useDefaultLangCanonical &&
        routes.has(node.fields.slug),
    )
    .forEach((node) => tagsForPost(node).forEach((tag) => tags.add(tag)));
  return [...tags].map((tag) => [
    tag,
    tagPostsForLanguage(nodes, slugForTag(tag), language),
  ]);
}

export type TagChip = { slug: string; label: string; count: number };

export function tagChips<T extends TaggedPost>(
  nodes: T[],
  language: string,
  label: (tag: string) => string,
): TagChip[] {
  return tagsForLanguage(nodes, language)
    .map(([tag, posts]) => ({
      slug: slugForTag(tag),
      label: label(tag),
      count: posts.length,
    }))
    .sort(
      (left, right) =>
        right.count - left.count ||
        left.label.localeCompare(right.label, language),
    );
}
