import React from "react";
import PropTypes from "prop-types";
import { Link } from "../Link";

const List = (props) => {
  const { edges, theme, ordered = false, showImages = false } = props;
  const ListElement = ordered ? "ol" : "ul";

  return (
    <React.Fragment>
      <ListElement className={showImages ? `withImages${ordered ? " ordered" : ""}` : ""}>
        {edges.map((edge) => {
          const {
            node: {
              excerpt,
              timeToRead,
              frontmatter: { title, cover },
              fields: { slug, prefix },
            },
          } = edge;
          const image = cover && cover.childImageSharp && cover.childImageSharp.resize;

          return (
            <li key={slug}>
              <Link to={slug} className={showImages ? "readingCard" : ""}>
                {showImages && image && (
                  <img
                    className="readingCardImage"
                    src={image.src}
                    alt={title}
                    loading="lazy"
                    width="420"
                    height="240"
                  />
                )}
                <span className="readingCardContent">
                  {showImages ? <h3>{title}</h3> : title}
                  {showImages && (prefix || timeToRead) && (
                    <small>
                      {[prefix, timeToRead ? `${timeToRead} min` : ""].filter(Boolean).join(" · ")}
                    </small>
                  )}
                  {showImages && excerpt && <span className="excerpt">{excerpt}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ListElement>

      {/* --- STYLES --- */}
      <style jsx>{`
        ul:not(.withImages),
        ol:not(.withImages) {
          margin: ${theme.space.stack.m};
          padding: ${theme.space.m};
          list-style: circle;
        }
        ul:not(.withImages) li,
        ol:not(.withImages) li {
          padding: ${theme.space.xs} 0;
          font-size: ${theme.font.size.s};
          line-height: ${theme.font.lineHeight.l};
        }
        .withImages {
          display: grid;
          gap: ${theme.space.l};
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .withImages li {
          padding: 0;
          position: relative;
        }
        .ordered {
          counter-reset: reading-order;
        }
        .ordered li {
          counter-increment: reading-order;
        }
        .ordered li::before {
          align-items: center;
          background: ${theme.color.brand.primary};
          border: 3px solid ${theme.background.color.primary};
          border-radius: 50%;
          color: ${theme.text.color.primaryInverse};
          content: counter(reading-order);
          display: flex;
          font-size: ${theme.font.size.xs};
          font-weight: ${theme.font.weight.bold};
          height: 2.25rem;
          justify-content: center;
          left: ${theme.space.s};
          position: absolute;
          top: ${theme.space.s};
          width: 2.25rem;
          z-index: 2;
        }
        :global(.readingCard) {
          background: ${theme.background.color.primary};
          border: 1px solid ${theme.line.color};
          border-radius: ${theme.size.radius.default};
          color: ${theme.text.color.primary};
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          text-decoration: none;
          transition: border-color ${theme.time.duration.default},
            box-shadow ${theme.time.duration.default}, transform ${theme.time.duration.default};
        }
        :global(.readingCard:hover),
        :global(.readingCard:focus) {
          border-color: ${theme.color.brand.primary};
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }
        :global(.readingCardImage) {
          aspect-ratio: 16 / 9;
          display: block;
          object-fit: cover;
          width: 100%;
        }
        .readingCardContent {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: ${theme.space.m};
        }
        .readingCardContent h3 {
          font-size: ${theme.font.size.m};
          line-height: ${theme.font.lineHeight.m};
          margin: 0 0 ${theme.space.s};
        }
        .readingCardContent small {
          color: ${theme.text.color.primary};
          opacity: 0.7;
          display: block;
          margin-bottom: ${theme.space.s};
        }
        .excerpt {
          display: -webkit-box;
          font-size: ${theme.font.size.xs};
          line-height: ${theme.font.lineHeight.l};
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
        @from-width tablet {
          .withImages {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </React.Fragment>
  );
};

List.propTypes = {
  edges: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  ordered: PropTypes.bool,
  showImages: PropTypes.bool,
};

export default List;
