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
        {(theme) => <Blog posts={posts} theme={theme} compactTop heading={t("blog.allTitle")} />}
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
            useDefaultLangCanonical
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
