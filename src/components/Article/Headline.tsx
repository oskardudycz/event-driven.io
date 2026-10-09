import * as styles from './Headline.module.css';
import React from 'react';

const Headline = (props: React.PropsWithChildren<{ title?: string }>) => {
  const { title, children } = props;

  return (
    <React.Fragment>
      {title ? (
        <h1 className={styles.elementH1}>{title}</h1>
      ) : (
        <h1 className={styles.elementH1}>{children}</h1>
      )}
    </React.Fragment>
  );
};

export default Headline;
