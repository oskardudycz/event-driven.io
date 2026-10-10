import type { ArticleEdge } from '../../types/content.ts';
import React from 'react';
import { Link } from '../Link/index.tsx';
import ReadingList from './ReadingList';

// This adapter owns Gatsby's data shape and routing. The view owns its markup
// and CSS and can be reused with an ordinary anchor in another framework.
const List = ({
  edges,
  ordered = false,
  showImages = false,
}: {
  edges: ArticleEdge[];
  ordered?: boolean;
  showImages?: boolean;
}) => {
  const items = edges.map(({ node }) => ({
    id: node.fields.slug,
    href: `/${node.fields.langKey}${node.fields.slug}`,
    title: node.frontmatter.title,
    date: node.fields.prefix,
    excerpt: node.excerpt,
    image: node.frontmatter.cover?.childImageSharp?.resize,
  }));

  return (
    <ReadingList
      items={items}
      ordered={ordered}
      showImages={showImages}
      renderLink={({ href, ...props }) => <Link {...props} to={href} />}
    />
  );
};

export default List;
