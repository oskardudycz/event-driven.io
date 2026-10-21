import type { ArticleNode } from '../../types/content.ts';
import React from 'react';
import * as styles from './NextPrev.module.css';
import { useTranslation } from 'react-i18next';
import { anchor, type RenderLink } from '../Link/anchor.tsx';

import { FaArrowRight } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';

const NextPrev = (props: {
  renderLink?: RenderLink;
  next?: ArticleNode | undefined;
  prev?: ArticleNode | undefined;
}) => {
  const { t } = useTranslation();
  const {
    renderLink = anchor,
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
      <nav
        className={`links ${styles.links}`}
        aria-label={t('articleNavigation.title')}
      >
        {nextSlug &&
          renderLink({
            href: nextSlug,
            children: (
              <>
                <FaArrowRight />
                <span>
                  <span className={styles.direction}>
                    {t('articleNavigation.later')}
                  </span>
                  <span className={styles.title}>{nextTitle}</span>
                  <time className={styles.date}>{nextPrefix}</time>
                </span>
              </>
            ),
          })}
        {prevSlug &&
          renderLink({
            href: prevSlug,
            children: (
              <>
                <FaArrowLeft />
                <span>
                  <span className={styles.direction}>
                    {t('articleNavigation.earlier')}
                  </span>
                  <span className={styles.title}>{prevTitle}</span>
                  <time className={styles.date}>{prevPrefix}</time>
                </span>
              </>
            ),
          })}
      </nav>
    </React.Fragment>
  );
};

export default NextPrev;
