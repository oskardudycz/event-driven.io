import * as styles from './Meta.module.css';
import React from 'react';
import { Link } from '../Link/index.tsx';

import { FaCalendar } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { FaTag } from 'react-icons/fa';
import { categorySlug } from '../../utils/category-slug.ts';

const Meta = (props: {
  prefix?: string | undefined;
  author?: string | undefined;
  category?: string | undefined;
  categories?: string[] | undefined;
}) => {
  const { prefix, author: authorName, category, categories = [] } = props;
  const additionalCategories = Array.isArray(categories) ? categories : [];
  const allCategories = Array.from(
    new Set(
      [category, ...additionalCategories].filter((value): value is string =>
        Boolean(value),
      ),
    ),
  );

  return (
    <p className={`meta ${styles.meta}`}>
      <span className={styles.elementSpan}>
        <FaCalendar size={18} /> {prefix}
      </span>
      <span className={styles.elementSpan}>
        <FaUser size={18} /> {authorName}
      </span>
      {allCategories.map((categoryName) => (
        <span key={categoryName} className={styles.elementSpan}>
          <FaTag size={18} />
          <Link to={`/category/${categorySlug(categoryName)}/`}>
            {categoryName}
          </Link>
        </span>
      ))}
    </p>
  );
};

export default Meta;
