import styles from './Expand.module.css';
import { FaAngleDown } from 'react-icons/fa/';
import PropTypes from 'prop-types';
import React from 'react';

const Expand = (props) => {
  const { onClick } = props;

  return (
    <React.Fragment>
      <button className={`more ${styles['more']}`} to="#" onClick={onClick} aria-label="expand">
        <FaAngleDown size={30} />
      </button>
    </React.Fragment>
  );
};

Expand.propTypes = {
  onClick: PropTypes.func,
};

export default Expand;
