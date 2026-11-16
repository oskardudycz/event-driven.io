import { publishedContent, publishedGuides } from './published-content.ts';
import { tagSlug } from '../../src/utils/tag-slug.ts';
const posts = publishedContent('posts');
const guides = publishedGuides();
const slugOf = (route: string) => route.split('/')[2]!;

function relatedRoute(slug: string, language: string) {
  const versions = posts.filter((post) => post.route.endsWith(`/${slug}/`));
  const match =
    versions.find((other) => other.language === language) ||
    versions.find(
      (other) =>
        other.language === 'en' && !other.metadata.useDefaultLangCanonical,
    ) ||
    versions.find((other) => !other.metadata.useDefaultLangCanonical);
  return match?.route;
}

function slugsListing(slug: string) {
  const referrers = posts
    .filter((post) => post.metadata.related?.includes(slug))
    .sort((a, b) => b.date.localeCompare(a.date));
  return [...new Set(referrers.map((post) => slugOf(post.route)))];
}

export function expectedArticleLinks(route: string) {
  const post = posts.find((post) => post.route === route);
  if (!post) throw new Error(`Unknown article: ${route}`);
  const slug = slugOf(route);
  const explicit = post.metadata.related || [];
  const explicitRoutes = explicit.map((related) => {
    const match = relatedRoute(related, post.language);
    if (!match) throw new Error(`Missing related article: ${related}`);
    return match;
  });
  const backReferenceRoutes = slugsListing(slug)
    .filter((referrer) => !explicit.includes(referrer))
    .flatMap((referrer) => relatedRoute(referrer, post.language) ?? []);
  const related = [...explicitRoutes, ...backReferenceRoutes];
  const tagLinks = (post.metadata.tags || []).map((tag) => ({
    tag,
    path: `/${post.language}/articles/tag/${tagSlug(tag)}/`,
  }));
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
