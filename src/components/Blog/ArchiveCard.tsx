import React, { type ComponentProps, type ReactNode } from 'react';
import * as styles from './Item.module.css';
import { FaArrowRight, FaCalendar, FaTag, FaUser } from 'react-icons/fa';

type ArchiveCardProps = {
  href: string;
  title: string;
  date: string;
  author?: string | undefined;
  categories: string[];
  excerpt: string;
  cover: ReactNode;
  renderLink?: (
    _props: Pick<ComponentProps<'a'>, 'children' | 'className'> & {
      href: string;
    },
  ) => ReactNode;
};
const anchor = (props: ComponentProps<'a'>) => <a {...props} />;

export default function ArchiveCard({
  href,
  title,
  date,
  author,
  categories,
  excerpt,
  cover,
  renderLink = anchor,
}: ArchiveCardProps) {
  return (
    <React.Fragment>
      <li className={styles.elementLi}>
        {renderLink({
          href,
          className: `link ${styles.link}`,
          children: (
            <>
              <div className={'gatsby-image-outer-wrapper'}>{cover}</div>
              <h2 className={styles.elementH2}>
                {title} <FaArrowRight className={'arrow'} />
              </h2>
              <p className={`meta ${styles.meta}` + ' ' + styles.elementP}>
                <span className={styles.elementSpan}>
                  <FaCalendar size={18} /> {date}
                </span>
                <span className={styles.elementSpan}>
                  <FaUser size={18} /> {author}
                </span>
                {categories.map((categoryName) => (
                  <span key={categoryName} className={styles.elementSpan}>
                    <FaTag size={18} /> {categoryName}
                  </span>
                ))}
              </p>
              <p className={styles.elementP}>{excerpt}</p>
            </>
          ),
        })}
      </li>
    </React.Fragment>
  );
}
