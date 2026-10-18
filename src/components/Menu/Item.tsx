import type { IconType } from 'react-icons';
export type MenuItem = {
  to: string;
  label: string;
  iconOnly?: boolean;
  icon?: IconType | undefined;
};
import React from 'react';
import { Link } from '../Link/index.tsx';
import { useTranslation } from 'react-i18next';

// The navigation sets --theme-trigger-color and --nav-hover-ink for its state.
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
    hiddenItem = false,
  } = props;
  const { t } = useTranslation();
  const accessibleName = iconOnly ? t(label) : undefined;

  if (hiddenItem)
    return (
      <li className="text-left">
        <Link
          to={to}
          onClick={onClick}
          data-slug={to}
          aria-label={accessibleName}
          className="flex min-h-11 items-center gap-2.5 rounded-[var(--size-radius-small)] px-2.5 py-1.25 text-inherit hover:bg-[var(--color-brand-tint)] hover:underline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current"
        >
          {Icon && <Icon aria-hidden="true" className="shrink-0" />}
          {t(label)}
        </Link>
      </li>
    );

  return (
    <li
      className={`group shrink-0 items-center transition-all duration-[var(--duration-default)] ${overflowHidden ? 'hidden' : 'flex'}`}
    >
      <Link
        to={to}
        onClick={onClick}
        data-slug={to}
        aria-label={accessibleName}
        className="flex items-center p-2.5 text-[color:var(--theme-trigger-color)] lg:rounded-[var(--size-radius-small)] lg:transition-all lg:duration-[var(--duration-default)] lg:hover:bg-[var(--color-brand-tint)] lg:hover:text-[color:var(--nav-hover-ink)]"
      >
        {Icon && (
          <Icon
            aria-hidden="true"
            className="mr-1.25 opacity-30 lg:transition-all lg:duration-[var(--duration-default)] lg:group-hover:fill-[var(--nav-hover-ink)] lg:group-hover:opacity-100"
          />
        )}
        {!iconOnly && t(label)}
      </Link>
    </li>
  );
};

export default Item;
