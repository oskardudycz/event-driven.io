import * as styles from './Hit.module.css';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import { highlightParts, snippet } from '../../search/snippets.mjs';
import { usePageContext } from '../../i18n/page-context';

const Highlight = ({ text, terms }) =>
  highlightParts(text, terms).map((part, index) =>
    part.highlighted ? (
      <mark key={index} className={`search-highlight ${styles.searchHighlight}`}>
        {part.text}
      </mark>
    ) : (
      <React.Fragment key={index}>{part.text}</React.Fragment>
    ),
  );
Highlight.propTypes = { text: PropTypes.string.isRequired, terms: PropTypes.array.isRequired };

const Hit = ({ hit }) => {
  const { lang = 'en' } = usePageContext();
  const sourceLabels =
    lang === 'pl'
      ? { posts: 'Artykuł', pages: 'Strona', 'newsletter-pl': 'Newsletter' }
      : { posts: 'Article', pages: 'Page', 'newsletter-pl': 'Newsletter' };
  const categories = Array.isArray(hit.category)
    ? hit.category
    : hit.category
      ? [hit.category]
      : [];
  const details = [sourceLabels[hit.source] || hit.source, ...categories].filter(Boolean);

  return (
    <article
      className={`search-hit ${styles.searchHit}${hit.cover ? ` search-hit-with-cover ${styles.searchHitWithCover}` : ''}`}
    >
      <Link to={hit.path} className={`search-hit-link ${styles.searchHitLink}`}>
        {hit.cover && (
          <div className={`search-hit-cover ${styles.searchHitCover}`}>
            <GatsbyImage
              image={hit.cover}
              alt=""
              loading="lazy"
              objectFit="contain"
              sizes="(max-width: 599px) 88px, 180px"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
        <div className={'search-hit-heading'}>
          <p className={`search-hit-meta ${styles.searchHitMeta}`}>
            {details.join(' · ')}
            {hit.date && (
              <>
                <span aria-hidden="true"> · </span>
                <time dateTime={hit.date}>{hit.date}</time>
              </>
            )}
            {hit.langKey !== lang && (
              <span className={`search-hit-language ${styles.searchHitLanguage}`}>
                {lang === 'pl' ? 'Po angielsku' : 'In Polish'}
              </span>
            )}
          </p>
          <h2>
            <Highlight text={hit.title} terms={hit.terms} />
          </h2>
        </div>
        <p className={`search-hit-snippet ${styles.searchHitSnippet}`}>
          <Highlight text={snippet(hit.content, hit.terms)} terms={hit.terms} />
        </p>
      </Link>
    </article>
  );
};

Hit.propTypes = {
  hit: PropTypes.object.isRequired,
};

export default Hit;
