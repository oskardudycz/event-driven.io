import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import Article from '../components/Article';
import Page from '../components/Page';
import { createHead } from '../components/Seo';

const PageTemplate = (props) => {
  const {
    data: { page },
  } = props;

  return (
    <React.Fragment>
      <Article>
        <Page page={page} />
      </Article>
    </React.Fragment>
  );
};

PageTemplate.propTypes = {
  data: PropTypes.object.isRequired,
};

export default PageTemplate;

export const pageQuery = graphql`
  query PageByPath($slug: String!, $langKey: String!, $language: String!) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
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
        summary
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

export const Head = createHead(({ data }) => ({
  data: data.page,
  useDefaultLangCanonical: data.page.frontmatter.useDefaultLangCanonical,
  noIndex: data.page.fields.slug === '/success/',
}));
