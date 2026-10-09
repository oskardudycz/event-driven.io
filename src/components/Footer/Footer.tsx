import React from 'react';
import * as styles from './Footer.module.css';

const Footer = ({ html }: { html: string }) => (
  <footer className={`footer ${styles.footer}`} dangerouslySetInnerHTML={{ __html: html }} />
);

export default Footer;
