import * as styles from './Article.module.css';
import React from 'react';

const Article = (props: React.PropsWithChildren) => {
  const { children } = props;

  return (
    <React.Fragment>
      <article className={`article ${styles.article}`}>{children}</article>
    </React.Fragment>
  );
};

export default Article;
