import type { ArticleEdge } from '../../types/content.ts';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ReadingList from '../List/ReadingList.tsx';
import { readingItems } from '../List/reading-items.ts';
import { anchor, type RenderLink } from '../Link/anchor.tsx';

const Related = ({
  posts,
  renderLink = anchor,
}: {
  posts?: ArticleEdge[] | undefined;
  renderLink?: RenderLink;
}) => {
  const { t } = useTranslation();
  if (!posts || posts.length === 0) return null;

  return (
    <React.Fragment>
      <aside
        className="related mt-gutter mb-section"
        aria-labelledby="related-title"
      >
        <h2 id="related-title" className="mb-gutter text-heading">
          {t('related.title')}
        </h2>
        <ReadingList
          items={readingItems(posts)}
          showImages
          renderLink={renderLink}
        />
      </aside>
    </React.Fragment>
  );
};

export default Related;
