import React from 'react';
import PropTypes from 'prop-types';
import styles from './Footer.module.css';

const Footer = ({ html }) => (
  <footer className={`footer ${styles.footer}`} dangerouslySetInnerHTML={{ __html: html }} />
);

Footer.propTypes = {
  html: PropTypes.string,
};

export default Footer;
