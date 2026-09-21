import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Seo from "../components/Seo";
import Article from "../components/Article";
import Page from "../components/Page";
import { ThemeContext } from "../layouts";

const PageTemplate = (props) => {
  const {
    data: {
      page,
      site: {
        siteMetadata: { facebook },
      },
    },
  } = props;

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {(theme) => (
          <Article theme={theme}>
            <Page page={page} theme={theme} />
          </Article>
        )}
      </ThemeContext.Consumer>

      <Seo
        data={page}
        facebook={facebook}
        useDefaultLangCanonical={page.frontmatter.useDefaultLangCanonical}
        noIndex={page.fields.slug === "/success/"}
      />
    </React.Fragment>
  );
};

PageTemplate.propTypes = {
  data: PropTypes.object.isRequired,
};

export default PageTemplate;

//eslint-disable-next-line no-undef
export const pageQuery = graphql`
  query PageByPath($slug: String!, $langKey: String!) {
    page: markdownRemark(fields: { slug: { eq: $slug }, langKey: { eq: $langKey } }) {
      id
      html
      excerpt(pruneLength: 170)
      fields {
        slug
        langKey
        source
      }
      frontmatter {
        title
        description
        useDefaultLangCanonical
        cover {
          childImageSharp {
            resize(width: 1200) {
              src
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
