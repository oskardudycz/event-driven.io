import type { SitePageProps } from '../types/content.ts';
import React from 'react';
import { graphql } from 'gatsby';
import { useTranslation } from 'react-i18next';

import Blog from '../components/Blog/index.ts';
import { createHead } from '../components/Seo/index.ts';

const ArticlesPage = (props: SitePageProps<'posts' | 'site'>) => {
  const { t } = useTranslation();
  const {
    data: {
      posts: { edges: posts },
    },
  } = props;

  return (
    <React.Fragment>
      <Blog posts={posts} compactTop heading={t('blog.allTitle')} />
    </React.Fragment>
  );
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
