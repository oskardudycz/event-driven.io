import styles from './Bodytext.module.css';
import React from 'react';
import PropTypes from 'prop-types';

const Bodytext = (props) => {
  const { html } = props;

  return (
    <React.Fragment>
      <div
        className={`bodytext ${styles['bodytext']}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </React.Fragment>
  );
};

Bodytext.propTypes = {
  html: PropTypes.string.isRequired,
};

export default Bodytext;
