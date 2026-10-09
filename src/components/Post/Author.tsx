import * as styles from './Author.module.css';
import React from 'react';

import config from '../../../content/meta/config.ts';
import { withPrefix } from 'gatsby';

const avatar = withPrefix('/images/avatar.webp');

const Author = (props: { note: string }) => {
  const { note } = props;

  return (
    <React.Fragment>
      <div className={`author ${styles.author}`}>
        <div className={`avatar ${styles.avatar}`}>
          <img
            src={avatar}
            alt={config.siteTitle}
            width="180"
            height="180"
            className={styles.elementImg}
          />
        </div>
        <div className={`note ${styles.note}`} dangerouslySetInnerHTML={{ __html: note }} />
      </div>
    </React.Fragment>
  );
};

export default Author;
