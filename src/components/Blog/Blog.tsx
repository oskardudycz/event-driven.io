import type { ArticleEdge } from '../../types/content.ts';
import * as styles from './Blog.module.css';
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

  return (
    <React.Fragment>
      <div
        className={`main ${styles.main}${compactTop ? ` compactTop ${styles.compactTop}` : ''}`}
      >
        {heading && <h1 className={`heading ${styles.heading}`}>{heading}</h1>}
        {children && <div className={styles.intro}>{children}</div>}
        <ul className={styles.elementUl}>
          {posts.map((post) => {
            const {
              node,
              node: {
                fields: { slug },
              },
            } = post;
            return <Item key={slug} post={node} />;
          })}
        </ul>
        {browseAllPath && (
          <div className={`summary ${styles.summary}`}>
            <Link to={browseAllPath}>{t('blog.browseAll')} →</Link>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default Blog;
