import * as styles from './Bodytext.module.css';
import React from 'react';

const Bodytext = (props: {
  html?: string | undefined;
  className?: string | undefined;
}) => {
  const { html, className = '' } = props;

  return (
    <React.Fragment>
      <div
        className={`bodytext ${styles.bodytext} ${className}`}
        dangerouslySetInnerHTML={{ __html: html || '' }}
      />
    </React.Fragment>
  );
};

export default Bodytext;
