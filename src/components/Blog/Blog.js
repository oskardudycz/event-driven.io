import PropTypes from "prop-types";
import React from "react";

import Item from "./Item";
import { Link } from "../Link";
import { useTranslation } from "react-i18next";

const Blog = (props) => {
  const { posts, theme, browseAllPath, compactTop, heading } = props;
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <div className={`main${compactTop ? " compactTop" : ""}`}>
        {heading && <h1 className="heading">{heading}</h1>}
        <ul>
          {posts.map((post) => {
            const {
              node,
              node: {
                fields: { slug },
              },
            } = post;
            return <Item key={slug} post={node} theme={theme} />;
          })}
        </ul>
        {browseAllPath && (
          <div className="summary">
            <Link to={browseAllPath}>{t("blog.browseAll")} →</Link>
          </div>
        )}
      </div>

      {/* --- STYLES --- */}
      <style jsx>{`
        .main {
          padding: 0 ${theme.space.inset.default};
        }

        ul {
          list-style: none;
          margin: 0 auto;
          padding: ${`calc(${theme.space.default} * 1.5) 0 calc(${theme.space.default} * 0.5)`};
        }

        .heading {
          font-size: ${theme.font.size.xxl};
          margin: ${theme.space.l} auto 0;
        }

        .summary {
          margin: 0 auto ${theme.space.xl};
          max-width: ${theme.text.maxWidth.desktop};
          text-align: center;
        }
        .summary :global(a) {
          border: 2px solid ${theme.color.brand.primary};
          border-radius: ${theme.size.radius.small};
          color: ${theme.color.brand.primary};
          display: inline-block;
          font-weight: ${theme.font.weight.bold};
          padding: ${theme.space.s} ${theme.space.m};
        }

        .compactTop ul {
          padding-top: 0;
        }

        .compactTop ul > :global(li:first-child) {
          margin-top: ${theme.space.m};
        }

        blockquote {
          font-style: italic;
          border-left: 7px solid orange;
          margin: 1.5em 10px;
          padding: 1em 10px 0.1em 10px;
        }

        @above tablet {
          .main {
            padding: 0 ${`0 calc(${theme.space.default} * 1.5)`};
          }
          ul {
            max-width: ${theme.text.maxWidth.tablet};
          }
          .heading {
            max-width: ${theme.text.maxWidth.tablet};
          }
        }
        @above desktop {
          ul {
            max-width: ${theme.text.maxWidth.desktop};
          }
          .heading {
            max-width: ${theme.text.maxWidth.desktop};
          }
        }
      `}</style>
    </React.Fragment>
  );
};

Blog.propTypes = {
  posts: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  browseAllPath: PropTypes.string,
  compactTop: PropTypes.bool,
  heading: PropTypes.string,
};

export default Blog;
