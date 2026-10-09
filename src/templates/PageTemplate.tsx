import type { PageData } from '../types/content.ts';
import type { SitePageProps } from '../types/content.ts';
import React from 'react';
import { graphql } from 'gatsby';
import Article from '../components/Article/index.ts';
import Page from '../components/Page/index.ts';
import { createHead } from '../components/Seo/index.ts';

const PageTemplate = (props: SitePageProps<'page' | 'site'>) => {
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

export const Head = createHead<Pick<PageData, 'page' | 'site'>>(({ data }) => ({
  data: data.page,
  useDefaultLangCanonical: data.page.frontmatter.useDefaultLangCanonical,
  noIndex: data.page.fields.slug === '/success/',
}));
