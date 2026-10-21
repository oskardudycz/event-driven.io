import type { ArticleEdge } from '../../types/content.ts';

export function readingItems(edges: ArticleEdge[]) {
  return edges.map(({ node }) => ({
    id: node.fields.slug,
    href: `/${node.fields.langKey}${node.fields.slug}`,
    title: node.frontmatter.title,
    date: node.fields.prefix,
    excerpt: node.excerpt,
    image: node.frontmatter.cover,
  }));
}
