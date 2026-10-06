import styles from './Blog.module.css';
import PropTypes from 'prop-types';
import React from 'react';

import Item from './Item';
import { Link } from '../Link';
import { useTranslation } from 'react-i18next';

const Blog = (props) => {
  const { posts, browseAllPath, compactTop, heading } = props;
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <div
        className={`main ${styles['main']}${compactTop ? ` compactTop ${styles['compactTop']}` : ''}${heading ? ` withHeading ${styles['withHeading']}` : ''}`}
      >
        {heading && <h1 className={`heading ${styles['heading']}`}>{heading}</h1>}
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
          <div className={`summary ${styles['summary']}`}>
            <Link to={browseAllPath}>{t('blog.browseAll')} →</Link>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

Blog.propTypes = {
  posts: PropTypes.array.isRequired,
  browseAllPath: PropTypes.string,
  compactTop: PropTypes.bool,
  heading: PropTypes.string,
};

export default Blog;
