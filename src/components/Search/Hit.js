import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import { highlightParts, snippet } from '../../search/snippets.mjs';
import { usePageContext } from '../../i18n/page-context';

const Highlight = ({ text, terms }) =>
  highlightParts(text, terms).map((part, index) =>
    part.highlighted ? (
      <mark key={index} className="search-highlight">
        {part.text}
      </mark>
    ) : (
      <React.Fragment key={index}>{part.text}</React.Fragment>
    ),
  );
Highlight.propTypes = { text: PropTypes.string.isRequired, terms: PropTypes.array.isRequired };

const Hit = ({ hit, theme }) => {
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
    <article className={`search-hit${hit.cover ? ' search-hit-with-cover' : ''}`}>
      <Link to={hit.path} className="search-hit-link">
        {hit.cover && (
          <div className="search-hit-cover">
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
        <div className="search-hit-heading">
          <p className="search-hit-meta">
            {details.join(' · ')}
            {hit.date && (
              <>
                <span aria-hidden="true"> · </span>
                <time dateTime={hit.date}>{hit.date}</time>
              </>
            )}
            {hit.langKey !== lang && (
              <span className="search-hit-language">
                {lang === 'pl' ? 'Po angielsku' : 'In Polish'}
              </span>
            )}
          </p>
          <h2>
            <Highlight text={hit.title} terms={hit.terms} />
          </h2>
        </div>
        <p className="search-hit-snippet">
          <Highlight text={snippet(hit.content, hit.terms)} terms={hit.terms} />
        </p>
      </Link>

      <style jsx global>{`
        .search .ais-Hits-item {
          padding: 0;
          margin: 0 0 ${theme.space.m};
          display: block;
          width: 100%;
        }
        .search-hit-link {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: ${theme.space.s};
          padding: ${theme.space.m};
          border: 1px solid ${theme.line.color};
          border-radius: ${theme.size.radius.default};
          background: ${theme.background.color.primary};
          color: ${theme.text.color.primary};
          text-decoration: none;
          transition:
            border-color 150ms,
            background-color 150ms;
        }
        .search-hit-with-cover .search-hit-link {
          grid-template-columns: 180px minmax(0, 1fr);
          column-gap: ${theme.space.m};
        }
        .search-hit-link:hover {
          border-color: ${theme.color.brand.primary};
          background: ${theme.background.color.alt};
        }
        .search-hit-link:focus-visible {
          outline: 2px solid ${theme.text.color.brand};
          outline-offset: 4px;
        }
        .search-hit-link:hover h2,
        .search-hit-link:focus-visible h2 {
          color: ${theme.text.color.brand};
        }
        .search-hit-cover {
          grid-row: 1 / 3;
          align-self: start;
          height: 120px;
          border-radius: ${theme.size.radius.small};
          overflow: hidden;
          background: ${theme.background.color.alt};
        }
        .search-hit h2 {
          margin: 0;
          font-size: 1.25em;
          font-weight: ${theme.font.weight.bold};
          line-height: 1.4;
          overflow-wrap: anywhere;
        }
        .search-hit-meta {
          margin: 0 0 ${theme.space.xs};
          color: ${theme.color.neutral.gray.h};
          font-size: 0.75em;
          line-height: 1.6;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          overflow-wrap: anywhere;
        }
        .search-hit-meta time {
          white-space: nowrap;
        }
        .search-hit-language {
          display: inline-block;
          margin-left: ${theme.space.xs};
          padding: 0 ${theme.space.xs};
          color: ${theme.text.color.brand};
          background: ${theme.color.brand.primary}18;
          border-radius: ${theme.size.radius.small};
        }
        .search-hit-snippet {
          margin: 0;
          line-height: 1.6;
          font-size: 0.95em;
          overflow-wrap: anywhere;
        }
        .search-highlight {
          color: ${theme.text.color.brand};
          background: ${theme.color.brand.primary}18;
          font-weight: ${theme.font.weight.bold};
          border-radius: 2px;
          box-decoration-break: clone;
        }
        @media (max-width: 599px) {
          .search-hit-link {
            padding: ${theme.space.s};
          }
          .search-hit-with-cover .search-hit-link {
            grid-template-columns: 88px minmax(0, 1fr);
            column-gap: ${theme.space.s};
          }
          .search-hit-cover {
            grid-row: 1;
            height: 72px;
          }
          .search-hit-snippet {
            grid-column: 1 / -1;
          }
          .search-hit h2 {
            font-size: 1.05em;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .search-hit-link {
            transition: none;
          }
        }
      `}</style>
    </article>
  );
};

Hit.propTypes = {
  hit: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default Hit;
