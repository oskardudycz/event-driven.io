import * as styles from './Meta.module.css';
import React from 'react';
import { Link } from '../Link/index.tsx';

import { FaCalendar } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { FaTag } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { tagSlug } from '../../utils/tag-slug.ts';
import { tagLabel } from '../../utils/tag-label.ts';

const Meta = (props: {
  prefix?: string | undefined;
  author?: string | undefined;
  tags?: string[] | undefined;
}) => {
  const { t } = useTranslation();
  const { prefix, author: authorName, tags = [] } = props;

  return (
    <p className={`meta ${styles.meta}`}>
      <span className={styles.elementSpan}>
        <FaCalendar size={18} /> {prefix}
      </span>
      <span className={styles.elementSpan}>
        <FaUser size={18} /> {authorName}
      </span>
      {tags.map((tag) => (
        <span key={tag} className={styles.elementSpan}>
          <FaTag size={18} />
          <Link to={`/category/${tagSlug(tag)}/`}>{tagLabel(t, tag)}</Link>
        </span>
      ))}
    </p>
  );
};

export default Meta;
