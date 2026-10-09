import type { ArticleEdge } from '../../types/content.ts';
import React from 'react';
import * as styles from './Related.module.css';
import { useTranslation } from 'react-i18next';
import List from '../List/index.ts';

const Related = ({ posts }: { posts?: ArticleEdge[] | undefined }) => {
  const { t } = useTranslation();
  if (!posts || posts.length === 0) return null;

  return (
    <React.Fragment>
      <aside
        className={`related ${styles.related}`}
        aria-labelledby="related-title"
      >
        <h2 id="related-title">{t('related.title')}</h2>
        <List edges={posts} showImages />
      </aside>
    </React.Fragment>
  );
};

export default Related;
