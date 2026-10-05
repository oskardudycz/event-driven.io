import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import List from '../List';

const Related = ({ posts, theme }) => {
  const { t } = useTranslation();
  if (!posts || posts.length === 0) return null;

  return (
    <React.Fragment>
      <aside className="related" aria-labelledby="related-title">
        <h2 id="related-title">{t('related.title')}</h2>
        <List edges={posts} theme={theme} showImages />
      </aside>
      <style jsx>{`
        .related {
          margin: ${theme.space.m} 0 ${theme.space.l};
        }
        .related h2 {
          font-size: ${theme.font.size.l};
          line-height: ${theme.font.lineHeight.s};
          margin: 0 0 ${theme.space.m};
        }
      `}</style>
    </React.Fragment>
  );
};

Related.propTypes = {
  posts: PropTypes.array,
  theme: PropTypes.object.isRequired,
};

export default Related;
