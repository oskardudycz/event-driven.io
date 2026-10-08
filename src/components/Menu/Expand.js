import styles from './Expand.module.css';
import { FaAngleDown } from 'react-icons/fa/';
import PropTypes from 'prop-types';
import React from 'react';

const Expand = (props) => {
  const { onClick, open } = props;

  return (
    <React.Fragment>
      <button
        className={`more ${styles['more']}`}
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

Expand.propTypes = {
  onClick: PropTypes.func,
  open: PropTypes.bool,
};

export default Expand;
