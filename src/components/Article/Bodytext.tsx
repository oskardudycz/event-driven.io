import * as styles from './Bodytext.module.css';
import React from 'react';

const Bodytext = (props: { html?: string | undefined }) => {
  const { html } = props;

  return (
    <React.Fragment>
      <div
        className={`bodytext ${styles.bodytext}`}
        dangerouslySetInnerHTML={{ __html: html || '' }}
      />
    </React.Fragment>
  );
};

export default Bodytext;
