import React from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import { Highlight, Snippet } from "react-instantsearch-dom";
import { usePageContext } from "../../i18n/page-context";

const Hit = (props) => {
  const { hit } = props;
  const { lang = "en" } = usePageContext();
  const sourceLabels =
    lang === "pl"
      ? { posts: "Artykuł", pages: "Strona", "newsletter-pl": "Newsletter" }
      : { posts: "Article", pages: "Page", "newsletter-pl": "Newsletter" };
  const categories = Array.isArray(hit.category)
    ? hit.category
    : hit.category
    ? [hit.category]
    : [];
  const details = [sourceLabels[hit.source] || hit.source, ...categories, hit.date].filter(Boolean);

  return (
    <article className="search-hit">
      <Link to={hit.path}>
        <h2>
          <Highlight attribute="title" hit={hit} />
        </h2>
        {details.length > 0 && <p className="search-hit-meta">{details.join(" · ")}</p>}
        <p className="search-hit-snippet">
          <Snippet attribute="content" hit={hit} />
        </p>
      </Link>

      {/* --- STYLES --- */}
      <style jsx global>{`
        .ais-Hits-item {
          padding: 0;
          margin-bottom: 0.75em;
          display: block;
          width: 100%;
          border: 1px solid #e5e5e5;
          border-radius: 4px;
        }

        .search-hit a {
          display: block;
          padding: 0.9em 1em;
          color: #555;
          text-decoration: none;
        }

        .search-hit a:hover h2 {
          color: red;
        }

        .search-hit h2 {
          margin: 0 0 0.25em;
          font-size: 1.15em;
        }

        .search-hit-meta {
          margin: 0 0 0.45em;
          color: #888;
          font-size: 0.78em;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .search-hit-snippet {
          margin: 0;
          line-height: 1.45;
          font-size: 0.95em;
        }

        .ais-Highlight-highlighted,
        .ais-Snippet-highlighted {
          background: #fff1a8;
          font-style: normal;
        }
      `}</style>
    </article>
  );
};

Hit.propTypes = {
  hit: PropTypes.object.isRequired,
};

export default Hit;
