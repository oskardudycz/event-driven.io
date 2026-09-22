import PropTypes from "prop-types";
import React from "react";
import { graphql } from "gatsby";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../layouts";
import Blog from "../components/Blog";
import Seo from "../components/Seo";

const ArticlesPage = (props) => {
  const { t } = useTranslation();
  const {
    data: {
      posts: { edges: posts },
      site: {
        siteMetadata: { facebook },
      },
    },
  } = props;

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {(theme) => (
          <React.Fragment>
            <header className="archiveHeader">
              <h1>{t("blog.allTitle")}</h1>
            </header>
            <Blog posts={posts} theme={theme} compactTop />
            <style jsx>{`
              .archiveHeader {
                margin: 0 auto;
                padding: ${theme.space.l} ${theme.space.inset.default} 0;
              }

              .archiveHeader h1 {
                font-size: ${theme.font.size.xxl};
                margin: 0;
              }

              @above tablet {
                .archiveHeader {
                  max-width: ${theme.text.maxWidth.tablet};
                  padding-left: 0;
                  padding-right: 0;
                }
              }

              @above desktop {
                .archiveHeader {
                  max-width: ${theme.text.maxWidth.desktop};
                }
              }
            `}</style>
          </React.Fragment>
        )}
      </ThemeContext.Consumer>

      <Seo
        facebook={facebook}
        title={t("blog.allTitle")}
        description={t("blog.allIntro")}
        schemaType="CollectionPage"
      />
    </React.Fragment>
  );
};

ArticlesPage.propTypes = {
  data: PropTypes.object.isRequired,
};

export default ArticlesPage;

// eslint-disable-next-line no-undef
export const query = graphql`
  query ArticlesQuery($langKey: String!) {
    posts: allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "//posts/[0-9]+.*--/" }
        fields: { langKey: { eq: $langKey } }
        frontmatter: { useDefaultLangCanonical: { ne: true } }
      }
      sort: { fields: [fields___prefix], order: DESC }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
            prefix
            langKey
          }
          frontmatter {
            title
            category
            categories
            author
            cover {
              children {
                ... on ImageSharp {
                  fluid(maxWidth: 800, maxHeight: 360) {
                    ...GatsbyImageSharpFluid_withWebp
                  }
                }
              }
            }
          }
        }
      }
    }
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
  }
`;
