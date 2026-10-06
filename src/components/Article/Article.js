import styles from './Article.module.css';
import React from 'react';
import PropTypes from 'prop-types';

const Article = (props) => {
  const { children } = props;

  return (
    <React.Fragment>
      <article className={`article ${styles['article']}`}>{children}</article>
    </React.Fragment>
  );
};

Article.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Article;
