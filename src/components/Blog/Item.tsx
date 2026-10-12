import React from 'react';
import type { ArticleNode } from '../../types/content.ts';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { Link } from '../Link/index.tsx';
import ArchiveCard from './ArchiveCard.tsx';

export default function Item({ post }: { post: ArticleNode }) {
  const {
    excerpt = '',
    fields: { slug, prefix = '' },
    frontmatter: { title = '', category, categories = [], author, cover },
  } = post;
  const additionalCategories = Array.isArray(categories) ? categories : [];
  const categoryNames = Array.from(
    new Set(
      [category, ...additionalCategories].filter(
        (categoryName): categoryName is string => Boolean(categoryName),
      ),
    ),
  );
  return (
    <ArchiveCard
      href={slug}
      title={title}
      date={prefix}
      author={author}
      categories={categoryNames}
      excerpt={excerpt}
      cover={
        <GatsbyImage
          image={getImage(cover?.childImageSharp?.gatsbyImageData || null)!}
          alt={title}
          sizes="(min-width: 1025px) 846px, (min-width: 1024px) 646px, (min-width: 690px) 606px, (min-width: 600px) calc(100vw - 84px), calc(100vw - 64px)"
        />
      }
      renderLink={({ href, ...props }) => <Link {...props} to={href} />}
    />
  );
}
