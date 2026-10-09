import type { ArticleNode } from '../../types/content.ts';
import * as styles from './Item.module.css';
import { FaArrowRight } from 'react-icons/fa';
import { FaCalendar } from 'react-icons/fa';
import { FaTag } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { Link } from '../Link/index.tsx';
import React from 'react';

const Item = (props: { post: ArticleNode }) => {
  const {
    post: {
      excerpt,
      fields: { slug, prefix },
      frontmatter: { title, category, categories = [], author, cover },
    },
  } = props;
  const additionalCategories = Array.isArray(categories) ? categories : [];

  return (
    <React.Fragment>
      <li className={styles.elementLi}>
        <Link to={slug} key={slug} className={`link ${styles.link}`}>
          <div className={'gatsby-image-outer-wrapper'}>
            <GatsbyImage
              image={getImage(cover?.childImageSharp?.gatsbyImageData || null)!}
              alt={title}
              sizes="(min-width: 1025px) 846px, (min-width: 1024px) 646px, (min-width: 690px) 606px, (min-width: 600px) calc(100vw - 84px), calc(100vw - 64px)"
            />
          </div>
          <h2 className={styles.elementH2}>
            {title} <FaArrowRight className={'arrow'} />
          </h2>
          <p className={`meta ${styles.meta}` + ' ' + styles.elementP}>
            <span className={styles.elementSpan}>
              <FaCalendar size={18} /> {prefix}
            </span>
            <span className={styles.elementSpan}>
              <FaUser size={18} /> {author}
            </span>
            {Array.from(
              new Set([category, ...additionalCategories].filter(Boolean)),
            ).map((categoryName) => (
              <span key={categoryName} className={styles.elementSpan}>
                <FaTag size={18} /> {categoryName}
              </span>
            ))}
          </p>
          <p className={styles.elementP}>{excerpt}</p>
        </Link>
      </li>
    </React.Fragment>
  );
};

export default Item;
