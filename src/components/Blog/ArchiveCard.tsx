import React, { type ReactNode } from 'react';
import { anchor, type RenderLink } from '../Link/anchor.tsx';
import * as styles from './ArchiveCard.module.css';
import { FaArrowRight, FaCalendar, FaTag, FaUser } from 'react-icons/fa';

type ArchiveCardProps = {
  href: string;
  title: string;
  date: string;
  author?: string | undefined;
  tags: string[];
  excerpt: string;
  cover: ReactNode;
  renderLink?: RenderLink;
};

export default function ArchiveCard({
  href,
  title,
  date,
  author,
  tags,
  excerpt,
  cover,
  renderLink = anchor,
}: ArchiveCardProps) {
  return (
    <li className={styles.card}>
      {renderLink({
        href,
        className: `link ${styles.link}`,
        children: (
          <>
            <div className={styles.cover}>{cover}</div>
            <h2 className={styles.title}>
              {title} <FaArrowRight className={styles.arrow} />
            </h2>
            <p className={`meta ${styles.text} ${styles.meta}`}>
              <span className={styles.entry}>
                <FaCalendar size={18} /> {date}
              </span>
              <span className={styles.entry}>
                <FaUser size={18} /> {author}
              </span>
              {tags.map((tag) => (
                <span key={tag} className={styles.entry}>
                  <FaTag size={18} /> {tag}
                </span>
              ))}
            </p>
            <p className={styles.text}>{excerpt}</p>
          </>
        ),
      })}
    </li>
  );
}
