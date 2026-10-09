import * as styles from './Expand.module.css';
import { FaAngleDown } from 'react-icons/fa';
import React from 'react';

const Expand = (props: { onClick: () => void; open: boolean }) => {
  const { onClick, open } = props;

  return (
    <React.Fragment>
      <button
        className={`more ${styles.more}`}
        type="button"
        onClick={onClick}
        aria-label="expand"
        aria-expanded={open}
      >
        <FaAngleDown size={30} />
      </button>
    </React.Fragment>
  );
};

export default Expand;
