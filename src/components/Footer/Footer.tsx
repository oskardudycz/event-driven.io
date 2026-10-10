import React from 'react';
import * as styles from './Footer.module.css';

const Footer = ({ html }: { html: string }) => (
  <footer
    className={`footer ${styles.footer} bg-page px-gutter pt-0 pb-[120px] min-[1024px]:px-[1em] min-[1024px]:pb-[1.5em]`}
  >
    <div dangerouslySetInnerHTML={{ __html: html }} />
  </footer>
);

export default Footer;
