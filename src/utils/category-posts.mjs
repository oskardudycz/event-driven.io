import kebabCase from "lodash/kebabCase.js";

export const categoriesForPost = (node) =>
  Array.from(new Set([
    node.frontmatter.category,
    ...(node.frontmatter.categories || []),
  ].filter(Boolean)));

// Category membership belongs to the article, while a card's language belongs
// to the best available translation. Placeholder copies do not define topics.
export function categoryPostsForLanguage(nodes, categorySlug, language, defaultLanguage = "en") {
  const posts = nodes.filter((node) => node.fields.source === "posts");
  const members = new Set(posts.filter((node) =>
    !node.frontmatter.useDefaultLangCanonical &&
    categoriesForPost(node).some((category) => kebabCase(category) === categorySlug)
  ).map((node) => node.fields.slug));
  const translations = new Map();
  for (const post of posts) {
    if (!members.has(post.fields.slug) || post.frontmatter.useDefaultLangCanonical) continue;
    const versions = translations.get(post.fields.slug) || [];
    versions.push(post);
    translations.set(post.fields.slug, versions);
  }
  return [...members].map((slug) => {
    const versions = translations.get(slug);
    return versions.find((node) => node.fields.langKey === language) ||
      versions.find((node) => node.fields.langKey === defaultLanguage) || versions[0];
  });
}

// Keep established category routes: a locale needs a canonical article in the
// topic. Within each route, expose the same shared set of unique article slugs.
export function categoriesForLanguage(nodes, language) {
  const categories = new Set();
  nodes.filter((node) => node.fields.source === "posts" &&
    node.fields.langKey === language && !node.frontmatter.useDefaultLangCanonical
  ).forEach((node) => categoriesForPost(node).forEach((category) => categories.add(category)));
  return [...categories].map((category) => [
    category, categoryPostsForLanguage(nodes, kebabCase(category), language),
  ]);
}
