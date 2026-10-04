import PropTypes from "prop-types";
import React from "react";
import { graphql } from "gatsby";
import { ThemeContext } from "../layouts";
import Blog from "../components/Blog";
import { createHead } from "../components/Seo";

class IndexPage extends React.Component {
  render() {
    const {
      data: {
        posts: { edges: posts = [] },
        site: {
          siteMetadata: { facebook }
        }
      }
    } = this.props;

    return (
      <React.Fragment>
        <ThemeContext.Consumer>
          {theme => <Blog posts={posts} theme={theme} />}
        </ThemeContext.Consumer>

        <style jsx>{`
          hr {
            margin: 0;
            border: 0;
          }
        `}</style>
      </React.Fragment>
    );
  }
}

IndexPage.propTypes = {
  data: PropTypes.object.isRequired
};

export default IndexPage;

//eslint-disable-next-line no-undef
export const query = graphql`
  query NewsletterPlQuery($langKey: String!) {
    posts: allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "//newsletter-pl/[0-9]+.*--/" }, fields: { langKey: { eq: $langKey } } }
      sort: { fields: { prefix: DESC } }
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
            author
            cover {
              childImageSharp {
                gatsbyImageData(
                  aspectRatio: 2.2222222222
                  layout: FULL_WIDTH
                  formats: [AUTO, WEBP]
                  placeholder: BLURRED
                )
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


export const Head = createHead({ title: "Newsletter", description: "Articles from Oskar Dudycz's software architecture newsletter.", schemaType: "CollectionPage" });
