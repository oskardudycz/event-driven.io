import PropTypes from 'prop-types';
import React from 'react';
import { graphql } from 'gatsby';

import Blog from '../components/Blog';
import { createHead } from '../components/Seo';

class IndexPage extends React.Component {
  render() {
    const {
      data: {
        posts: { edges: posts = [] },
      },
    } = this.props;

    return (
      <React.Fragment>
        <Blog posts={posts} heading="Newsletter" />
      </React.Fragment>
    );
  }
}

IndexPage.propTypes = {
  data: PropTypes.object.isRequired,
};

export default IndexPage;

export const query = graphql`
  query NewsletterPlQuery($langKey: String!, $language: String!) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
    posts: allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "//newsletter-pl/[0-9]+.*--/" }
        fields: { langKey: { eq: $langKey } }
      }
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
                  breakpoints: [360, 610, 850, 1220, 1700]
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

export const Head = createHead({
  title: 'Newsletter',
  description: "Articles from Oskar Dudycz's software architecture newsletter.",
  schemaType: 'CollectionPage',
});
