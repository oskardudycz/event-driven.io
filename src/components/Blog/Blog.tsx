import type { ArticleEdge } from '../../types/content.ts';
import React from 'react';

import Item from './Item.tsx';
import { Link } from '../Link/index.tsx';
import { useTranslation } from 'react-i18next';

const Blog = (props: {
  posts: ArticleEdge[];
  browseAllPath?: string;
  compactTop?: boolean;
  heading?: string;
  children?: React.ReactNode;
}) => {
  const { posts, browseAllPath, compactTop, heading, children } = props;
  const { t } = useTranslation();

  // Item's cover sizes attribute is written for the 601px and 1025px widths.
  return (
    <div className="main px-5 min-[601px]:px-0 min-[601px]:pb-7.5">
      {heading && (
        <h1 className="mx-auto mt-10 text-[length:var(--font-size-xxl)] min-[601px]:max-w-[var(--text-max-width-tablet)] min-[1025px]:max-w-[var(--text-max-width-desktop)]">
          {heading}
        </h1>
      )}
      {children && (
        <div className="mx-auto mt-5 min-[601px]:max-w-[var(--text-max-width-tablet)] min-[1025px]:max-w-[var(--text-max-width-desktop)]">
          {children}
        </div>
      )}
      <ul
        className={`mx-auto list-none pb-2.5 min-[601px]:max-w-[var(--text-max-width-tablet)] min-[1025px]:max-w-[var(--text-max-width-desktop)] ${compactTop ? 'pt-0 [--first-card-margin:var(--space-md)]' : 'pt-7.5'}`}
      >
        {posts.map(({ node }) => (
          <Item key={node.fields.slug} post={node} />
        ))}
      </ul>
      {browseAllPath && (
        <div className="mx-auto mb-20 max-w-[var(--text-max-width-desktop)] text-center">
          <Link
            to={browseAllPath}
            className="inline-block rounded-[var(--size-radius-small)] border-2 border-solid border-[var(--color-brand)] px-5 py-2.5 font-semibold text-[color:var(--text-color-brand)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)]"
          >
            {t('blog.browseAll')} →
          </Link>
        </div>
      )}
    </div>
  );
};

export default Blog;
