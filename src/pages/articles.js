import PropTypes from 'prop-types';
import React from 'react';
import { graphql } from 'gatsby';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../layouts';
import Blog from '../components/Blog';
import { createHead } from '../components/Seo';

const ArticlesPage = (props) => {
  const { t } = useTranslation();
  const {
    data: {
      posts: { edges: posts },
    },
  } = props;

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {(theme) => <Blog posts={posts} theme={theme} compactTop heading={t('blog.allTitle')} />}
      </ThemeContext.Consumer>
    </React.Fragment>
  );
};

ArticlesPage.propTypes = {
  data: PropTypes.object.isRequired,
};

export default ArticlesPage;

export const query = graphql`
  query ArticlesQuery($langKey: String!, $language: String!) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
    posts: allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "//posts/[0-9]+.*--/" }
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
            categories
            author
            useDefaultLangCanonical
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

export const Head = createHead(({ t }) => ({
  title: t('blog.allTitle'),
  description: t('blog.allIntro'),
  schemaType: 'CollectionPage',
}));
