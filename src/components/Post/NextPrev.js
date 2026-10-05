import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from '../Link';

import { FaArrowRight } from 'react-icons/fa/';
import { FaArrowLeft } from 'react-icons/fa/';

const NextPrev = (props) => {
  const { t } = useTranslation();
  const {
    theme,
    next: {
      fields: { prefix: nextPrefix, slug: nextSlug } = {},
      frontmatter: { title: nextTitle } = {},
    } = {},
    prev: {
      fields: { prefix: prevPrefix, slug: prevSlug } = {},
      frontmatter: { title: prevTitle } = {},
    } = {},
  } = props;

  return (
    <React.Fragment>
      <nav className="links" aria-label={t('articleNavigation.title')}>
        {nextSlug && (
          <Link to={nextSlug}>
            <FaArrowRight />
            <span className="linkContent">
              <span className="direction">{t('articleNavigation.later')}</span>
              <span className="title">{nextTitle}</span>
              <time>{nextPrefix}</time>
            </span>
          </Link>
        )}
        {prevSlug && (
          <Link to={prevSlug}>
            <FaArrowLeft />
            <span className="linkContent">
              <span className="direction">{t('articleNavigation.earlier')}</span>
              <span className="title">{prevTitle}</span>
              <time>{prevPrefix}</time>
            </span>
          </Link>
        )}
      </nav>

      {/* --- STYLES --- */}
      <style jsx>{`
        .links {
          display: flex;
          flex-direction: column;
          padding: 0 ${theme.space.m} ${theme.space.l};
          border-bottom: 1px solid ${theme.line.color};
          margin: ${theme.space.stack.l};

          :global(a) {
            display: flex;
          }

          :global(a:nth-child(2)) {
            margin: ${theme.space.default} 0 0;
          }

          :global(svg) {
            fill: ${theme.color.special.attention};
            width: ${theme.space.m};
            height: ${theme.space.m};
            flex-shrink: 0;
            flex-grow: 0;
            margin: ${theme.space.inline.m};
          }
        }

        .title {
          display: block;
          font-weight: 600;
          margin: 0;
          font-size: 1.1em;
        }
        .direction {
          color: ${theme.color.neutral.gray.h};
          display: block;
          font-size: 0.8em;
          margin-bottom: ${theme.space.xs};
        }
        time {
          color: ${theme.color.neutral.gray.g};
          display: block;
          font-weight: 400;
          font-size: 0.8em;
          margin-top: 0.5em;
        }

        @from-width desktop {
          .links {
            flex-direction: row-reverse;
            justify-content: center;

            :global(a) {
              flex-basis: 50%;
            }

            :global(a:nth-child(2)) {
              margin: 0;
            }
            :global(svg) {
              transition: all 0.5s;
              margin: ${theme.space.inline.s};
            }
          }

          @media (hover: hover) {
            .links :global(a:hover svg) {
              transform: scale(1.5);
            }
          }
        }
      `}</style>
    </React.Fragment>
  );
};

NextPrev.propTypes = {
  next: PropTypes.object,
  prev: PropTypes.object,
  theme: PropTypes.object.isRequired,
};

export default NextPrev;
