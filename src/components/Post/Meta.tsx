import * as styles from './Meta.module.css';
import React, { useId } from 'react';
import { Link } from '../Link/index.tsx';

import { FaCalendar } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { FaTag } from 'react-icons/fa';
import { FaMapSigns } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import type { GuideStep, TagLink } from '../../types/content.ts';
import { tagLabel } from '../../utils/tag-label.ts';

const MetaGroup = (props: {
  icon: React.ReactNode;
  label: string;
  items: { key: string; content: React.ReactNode }[];
}) => {
  const { icon, label, items } = props;
  const labelId = useId();
  if (items.length === 0) return null;

  return (
    <div role="group" aria-labelledby={labelId} className={styles.row}>
      <span id={labelId} className={`${styles.elementSpan} ${styles.label}`}>
        {icon}
        {label}
      </span>
      {items.map(({ key, content }, index) => (
        <span key={key} className={styles.elementSpan}>
          {content}
          {index < items.length - 1 && (
            <span aria-hidden="true" className={styles.separator}>
              ·
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

const Meta = (props: {
  prefix?: string | undefined;
  author?: string | undefined;
  tags?: TagLink[] | undefined;
  guides?: GuideStep[] | undefined;
}) => {
  const { t } = useTranslation();
  const { prefix, author: authorName, tags = [], guides = [] } = props;

  return (
    <div className={`meta ${styles.meta}`}>
      <div className={styles.row}>
        <span className={styles.elementSpan}>
          <FaCalendar size={18} /> {prefix}
        </span>
        <span className={styles.elementSpan}>
          <FaUser size={18} /> {authorName}
        </span>
      </div>
      <MetaGroup
        icon={<FaTag size={18} />}
        label={t('tags.metaLabel')}
        items={tags.map(({ tag, path }) => ({
          key: tag,
          content: path ? (
            <Link to={path}>{tagLabel(t, tag)}</Link>
          ) : (
            tagLabel(t, tag)
          ),
        }))}
      />
      <MetaGroup
        icon={<FaMapSigns size={18} />}
        label={t('guides.metaLabel')}
        items={guides.map(({ title, path, step, total }) => ({
          key: path,
          content: (
            <Link to={path}>
              {title} ({step}/{total})
            </Link>
          ),
        }))}
      />
    </div>
  );
};

export default Meta;
