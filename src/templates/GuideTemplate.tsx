import type { ArticleEdge, PageData, SitePageProps } from '../types/content.ts';
import React from 'react';
import { graphql } from 'gatsby';

import Article from '../components/Article/index.ts';
import Headline from '../components/Article/Headline.tsx';
import Bodytext from '../components/Article/Bodytext.tsx';
import List from '../components/List/index.ts';
import { createHead } from '../components/Seo/index.ts';

const GuideTemplate = (props: SitePageProps<'guide' | 'articles'>) => {
  const {
    data: { guide, articles },
    pageContext: { articleIds = [] },
  } = props;
  const { title, icon } = guide.frontmatter;
  const orderedArticles = articleIds
    .map((id) => articles.edges.find(({ node }) => node.id === id))
    .filter((edge): edge is ArticleEdge => Boolean(edge));

  return (
    <React.Fragment>
      <Article>
        <header className="mb-section">
          <Headline>
            <span aria-hidden="true">{icon}</span> {title}
          </Headline>
        </header>
        {guide.html && <Bodytext html={guide.html} />}
        <List edges={orderedArticles} ordered showImages />
      </Article>
    </React.Fragment>
  );
};

export default GuideTemplate;

export const query = graphql`
  query GuideBySlug(
    $pathSlug: String!
    $langKey: String!
    $articleIds: [String!]!
    $language: String!
  ) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
    guide: markdownRemark(
      fields: {
        source: { eq: "paths" }
        pathSlug: { eq: $pathSlug }
        langKey: { eq: $langKey }
      }
    ) {
      html
      fields {
        pathSlug
        langKey
        source
      }
      frontmatter {
        title
        description
        icon
        cover {
          childImageSharp {
            resize(width: 1200) {
              src
            }
          }
        }
      }
    }
    articles: allMarkdownRemark(filter: { id: { in: $articleIds } }) {
      edges {
        node {
          id
          excerpt(pruneLength: 170)
          fields {
            slug
            prefix
            langKey
          }
          frontmatter {
            title
            cover {
              childImageSharp {
                resize(
                  width: 420
                  height: 240
                  quality: 78
                  cropFocus: CENTER
                  toFormat: WEBP
                ) {
                  src
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

export const Head = createHead<Pick<PageData, 'guide' | 'site'>>(
  ({ data }) => ({
    data: data.guide,
    schemaType: 'CollectionPage',
  }),
);
