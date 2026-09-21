import React from "react";
import PropTypes from "prop-types";
import { Link } from "../Link";

const List = (props) => {
  const { edges, theme, ordered = false, showImages = false } = props;
  const ListElement = ordered ? "ol" : "ul";

  return (
    <React.Fragment>
      <ListElement className={showImages ? "withImages" : ""}>
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
        ul {
          margin: ${theme.space.stack.m};
          padding: ${theme.space.m};
          list-style: circle;
        }
        li {
          padding: ${theme.space.xs} 0;
          font-size: ${theme.font.size.s};
          line-height: ${theme.font.lineHeight.l};
        }
        .withImages {
          list-style-position: outside;
          padding-left: ${ordered ? theme.space.l : 0};
        }
        .withImages li {
          margin: 0 0 ${theme.space.l};
          padding: 0;
        }
        :global(.readingCard) {
          border: 1px solid ${theme.line.color};
          border-radius: ${theme.size.radius.default};
          color: ${theme.text.color.primary};
          display: grid;
          gap: ${theme.space.m};
          overflow: hidden;
          text-decoration: none;
        }
        :global(.readingCardImage) {
          height: 100%;
          min-height: 10rem;
          object-fit: cover;
          width: 100%;
        }
        .readingCardContent {
          display: block;
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
          display: block;
          line-height: ${theme.font.lineHeight.l};
        }
        @from-width tablet {
          :global(.readingCard) {
            grid-template-columns: minmax(12rem, 35%) 1fr;
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
