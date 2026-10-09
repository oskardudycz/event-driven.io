import React from 'react';
import * as styles from './Summary.module.css';

const Summary = ({ children }: React.PropsWithChildren) => {
  if (!children) return null;
  return <p className={`standfirst ${styles.standfirst}`}>{children}</p>;
};

export default Summary;
