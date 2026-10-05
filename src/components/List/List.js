import React from 'react';
import styles from './List.module.css';
import PropTypes from 'prop-types';
import { Link } from '../Link';

const List = (props) => {
  const { edges, ordered = false, showImages = false } = props;
  const ListElement = ordered ? 'ol' : 'ul';

  return (
    <React.Fragment>
      <ListElement
        className={
          showImages
            ? `withImages ${styles.withImages}${ordered ? ` ordered ${styles.ordered}` : ''}`
            : styles.plain
        }
      >
        {edges.map((edge) => {
          const {
            node: {
              excerpt,
              frontmatter: { title, cover, useDefaultLangCanonical },
              fields: { slug, prefix, langKey },
            },
          } = edge;
          const image = cover && cover.childImageSharp && cover.childImageSharp.resize;

          return (
            <li key={slug}>
              <Link
                to={slug}
                language={useDefaultLangCanonical ? 'en' : langKey}
                className={showImages ? `readingCard ${styles.readingCard}` : ''}
              >
                {showImages && image && (
                  <img
                    className={`readingCardImage ${styles.readingCardImage}`}
                    src={image.src}
                    alt=""
                    loading="lazy"
                    width="420"
                    height="240"
                  />
                )}
                <span className={`readingCardContent ${styles.readingCardContent}`}>
                  {showImages ? <h3>{title}</h3> : title}
                  {showImages && prefix && <small>{prefix}</small>}
                  {showImages && excerpt && (
                    <span className={`excerpt ${styles.excerpt}`}>{excerpt}</span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ListElement>
    </React.Fragment>
  );
};

List.propTypes = {
  edges: PropTypes.array.isRequired,
  ordered: PropTypes.bool,
  showImages: PropTypes.bool,
};

export default List;
