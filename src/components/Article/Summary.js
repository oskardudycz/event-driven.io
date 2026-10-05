import React from 'react';
import PropTypes from 'prop-types';
import styles from './Summary.module.css';

const Summary = ({ children }) => {
  if (!children) return null;
  return <p className={`standfirst ${styles.standfirst}`}>{children}</p>;
};

Summary.propTypes = {
  children: PropTypes.node,
};

export default Summary;
