import type { IconType } from 'react-icons';
export type MenuItem = {
  to: string;
  label: string;
  iconOnly?: boolean;
  icon?: IconType | undefined;
};
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
    item: { label, to, icon: Icon, iconOnly },
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
          aria-label={iconOnly ? t(label) : undefined}
        >
          {Icon && <Icon aria-hidden="true" />}
          {(!iconOnly || props.hiddenItem) && t(label)}
        </Link>
      </li>
    </React.Fragment>
  );
};

export default Item;
