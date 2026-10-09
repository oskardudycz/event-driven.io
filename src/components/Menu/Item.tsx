import type { IconType } from 'react-icons';
export type MenuItem = { to: string; label?: string; icon?: IconType };
import * as styles from './Item.module.css';
import React from 'react';
import { Link } from '../Link/index.tsx';
import { useTranslation } from 'react-i18next';

const Item = (props: {
  item: MenuItem;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  overflowHidden?: boolean;
  hiddenItem?: boolean;
}) => {
  const {
    item: { label, to, icon: Icon },
    onClick,
    overflowHidden = false,
  } = props;
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <li
        className={
          'hiddenItem' in props
            ? `hiddenItem ${styles.hiddenItem}`
            : `item ${styles.item} ${overflowHidden ? styles.overflowHidden : ''}`
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

export default Item;
