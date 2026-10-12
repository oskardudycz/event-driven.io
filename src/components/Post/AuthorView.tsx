import * as styles from './Author.module.css';
import React from 'react';

const AuthorView = ({
  note,
  avatar,
  name,
}: {
  note: string;
  avatar: string;
  name: string;
}) => {
  return (
    <React.Fragment>
      <div className={`author ${styles.author}`}>
        <div className={`avatar ${styles.avatar}`}>
          <img
            src={avatar}
            alt={name}
            width="180"
            height="180"
            className={styles.elementImg}
          />
        </div>
        <div
          className={`note ${styles.note}`}
          dangerouslySetInnerHTML={{ __html: note }}
        />
      </div>
    </React.Fragment>
  );
};

export default AuthorView;
