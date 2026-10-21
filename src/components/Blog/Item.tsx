import React from 'react';
import type { ArticleNode } from '../../types/content.ts';
import ResponsiveImage from '../Image/ResponsiveImage.tsx';
import { Link } from '../Link/index.tsx';
import ArchiveCard from './ArchiveCard.tsx';
import { useTranslation } from 'react-i18next';
import { tagLabel } from '../../utils/tag-label.ts';

export default function Item({ post }: { post: ArticleNode }) {
  const { t } = useTranslation();
  const {
    excerpt = '',
    fields: { slug, prefix = '' },
    frontmatter: { title = '', tags = [], author, cover },
  } = post;
  return (
    <ArchiveCard
      href={slug}
      title={title}
      date={prefix}
      author={author}
      tags={tags.map((tag) => tagLabel(t, tag))}
      excerpt={excerpt}
      cover={
        cover?.responsive && (
          <ResponsiveImage
            image={cover.responsive}
            alt={title}
            sizes="(min-width: 1025px) 846px, (min-width: 1024px) 646px, (min-width: 690px) 606px, (min-width: 600px) calc(100vw - 84px), calc(100vw - 64px)"
          />
        )
      }
      renderLink={({ href, ...props }) => <Link {...props} to={href} />}
    />
  );
}
