import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Link } from "../Link";

const Related = ({ posts, theme }) => {
  const { t } = useTranslation();
  if (!posts || posts.length === 0) return null;

  return (
    <React.Fragment>
      <aside className="related" aria-labelledby="related-title">
        <h2 id="related-title">{t("related.title")}</h2>
        <ul>
          {posts.map(({ node }) => (
            <li key={node.fields.slug}>
              <Link to={node.fields.slug}>{node.frontmatter.title}</Link>
            </li>
          ))}
        </ul>
      </aside>
      <style jsx>{`
        .related {
          border-top: 1px solid ${theme.line.color};
          margin-top: ${theme.space.xl};
          padding-top: ${theme.space.l};
        }
        .related h2 {
          font-size: ${theme.font.size.l};
          margin-bottom: ${theme.space.m};
        }
        .related ul {
          padding-left: ${theme.space.m};
        }
        .related li {
          line-height: ${theme.font.lineHeight.l};
          margin-bottom: ${theme.space.s};
        }
        .related :global(a) {
          color: ${theme.color.brand.primary};
          font-weight: ${theme.font.weight.bold};
        }
      `}</style>
    </React.Fragment>
  );
};

Related.propTypes = {
  posts: PropTypes.array,
  theme: PropTypes.object.isRequired,
};

export default Related;
