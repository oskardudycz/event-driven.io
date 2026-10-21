import { publishedContent, publishedGuides } from './published-content.ts';
import { tagSlug } from '../../src/utils/tag-slug.ts';
const posts = publishedContent('posts');
const guides = publishedGuides();
export function expectedArticleLinks(route: string) {
  const post = posts.find((post) => post.route === route);
  if (!post) throw new Error(`Unknown article: ${route}`);
  const related = (post.metadata.related || []).map((slug) => {
    const versions = posts.filter((post) => post.route.endsWith(`/${slug}/`));
    const match =
      versions.find((other) => other.language === post.language) ||
      versions.find(
        (other) =>
          other.language === 'en' && !other.metadata.useDefaultLangCanonical,
      ) ||
      versions.find((other) => !other.metadata.useDefaultLangCanonical);
    if (!match) throw new Error(`Missing related article: ${slug}`);
    return match.route;
  });
  const tagLinks = (post.metadata.tags || []).map((tag) => ({
    tag,
    path: `/${post.language}/articles/tag/${tagSlug(tag)}/`,
  }));
  const slug = route.split('/')[2]!;
  const steps = guides
    .filter(
      (guide) =>
        guide.language === post.language &&
        guide.metadata.articles.includes(slug),
    )
    .map((guide) => ({
      title: guide.metadata.title,
      path: guide.route,
      step: guide.metadata.articles.indexOf(slug) + 1,
      total: guide.metadata.articles.length,
    }));
  return { related, tagLinks, guides: steps };
}
