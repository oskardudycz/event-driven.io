import styles from './Item.module.css';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '../Link';
import { useTranslation } from 'react-i18next';

const Item = (props) => {
  const { item: { label, to, icon: Icon } = {}, onClick, overflowHidden = false } = props;
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <li
        className={
          'hiddenItem' in props
            ? `hiddenItem ${styles['hiddenItem']}`
            : `item ${styles['item']} ${overflowHidden ? styles.overflowHidden : ''}`
        }
        key={label}
      >
        <Link
          to={to}
          className={'hiddenItem' in props ? 'inHiddenItem' : ''}
          onClick={onClick}
          data-slug={to}
        >
          {Icon && <Icon />} {label && t(label)}
        </Link>
      </li>
    </React.Fragment>
  );
};

Item.propTypes = {
  item: PropTypes.object,
  hiddenItem: PropTypes.bool,
  overflowHidden: PropTypes.bool,
  onClick: PropTypes.func,
  icon: PropTypes.func,
};

export default Item;
