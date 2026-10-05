import React from 'react';
import styles from './Related.module.css';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import List from '../List';

const Related = ({ posts }) => {
  const { t } = useTranslation();
  if (!posts || posts.length === 0) return null;

  return (
    <React.Fragment>
      <aside className={`related ${styles.related}`} aria-labelledby="related-title">
        <h2 id="related-title">{t('related.title')}</h2>
        <List edges={posts} showImages />
      </aside>
    </React.Fragment>
  );
};

Related.propTypes = {
  posts: PropTypes.array,
};

export default Related;
