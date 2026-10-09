import type { ArticleNode } from '../../types/content.ts';
import React from 'react';
import * as styles from './NextPrev.module.css';
import { useTranslation } from 'react-i18next';
import { Link } from '../Link/index.tsx';

import { FaArrowRight } from 'react-icons/fa/';
import { FaArrowLeft } from 'react-icons/fa/';

const NextPrev = (props: { next?: ArticleNode; prev?: ArticleNode }) => {
  const { t } = useTranslation();
  const {
    next: {
      fields: { prefix: nextPrefix, slug: nextSlug } = {},
      frontmatter: { title: nextTitle } = {},
    } = {},
    prev: {
      fields: { prefix: prevPrefix, slug: prevSlug } = {},
      frontmatter: { title: prevTitle } = {},
    } = {},
  } = props;

  return (
    <React.Fragment>
      <nav className={`links ${styles.links}`} aria-label={t('articleNavigation.title')}>
        {nextSlug && (
          <Link to={nextSlug}>
            <FaArrowRight />
            <span className="linkContent">
              <span className={`direction ${styles.direction}`}>
                {t('articleNavigation.later')}
              </span>
              <span className={`title ${styles.title}`}>{nextTitle}</span>
              <time className={styles.date}>{nextPrefix}</time>
            </span>
          </Link>
        )}
        {prevSlug && (
          <Link to={prevSlug}>
            <FaArrowLeft />
            <span className="linkContent">
              <span className={`direction ${styles.direction}`}>
                {t('articleNavigation.earlier')}
              </span>
              <span className={`title ${styles.title}`}>{prevTitle}</span>
              <time className={styles.date}>{prevPrefix}</time>
            </span>
          </Link>
        )}
      </nav>
    </React.Fragment>
  );
};

export default NextPrev;
