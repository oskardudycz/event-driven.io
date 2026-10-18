import React from 'react';
import { anchor, type RenderLink } from '../Link/anchor.tsx';
import * as styles from './ReadingList.module.css';

type ReadingItem = {
  id: string;
  href: string;
  title: string;
  date?: string | undefined;
  excerpt?: string | undefined;
  image?: { src: string } | undefined;
};

type ReadingListProps = {
  items: ReadingItem[];
  ordered?: boolean;
  showImages?: boolean;
  renderLink?: RenderLink;
};

export default function ReadingList({
  items,
  ordered = false,
  showImages = false,
  renderLink = anchor,
}: ReadingListProps) {
  const ListElement = ordered ? 'ol' : 'ul';

  return (
    <ListElement
      className={
        showImages
          ? `withImages ${styles.withImages}${ordered ? ` ordered ${styles.ordered}` : ''}`
          : styles.plain
      }
    >
      {items.map((item) => (
        <li key={item.id}>
          {renderLink({
            href: item.href,
            className: showImages ? `readingCard ${styles.readingCard}` : '',
            children: (
              <>
                {showImages && item.image && (
                  <img
                    className={`readingCardImage ${styles.readingCardImage}`}
                    src={item.image.src}
                    alt=""
                    loading="lazy"
                    width="420"
                    height="240"
                  />
                )}
                <span
                  className={`readingCardContent ${styles.readingCardContent}`}
                >
                  {showImages ? <h3>{item.title}</h3> : item.title}
                  {showImages && item.date && <small>{item.date}</small>}
                  {showImages && item.excerpt && (
                    <span className={`excerpt ${styles.excerpt}`}>
                      {item.excerpt}
                    </span>
                  )}
                </span>
              </>
            ),
          })}
        </li>
      ))}
    </ListElement>
  );
}
