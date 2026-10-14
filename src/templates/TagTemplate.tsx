import type { SitePageProps } from '../types/content.ts';
import React from 'react';
import { graphql } from 'gatsby';
import { useTranslation } from 'react-i18next';

import Blog from '../components/Blog/index.ts';
import { createHead } from '../components/Seo/index.ts';
import { tagDescription, tagLabel } from '../utils/tag-label.ts';

const TagTemplate = (props: SitePageProps<'posts'>) => {
  const { t } = useTranslation();
  const {
    data: {
      posts: { edges: posts },
    },
    pageContext: { tag = '' },
  } = props;

  return (
    <Blog posts={posts} compactTop heading={tagLabel(t, tag)}>
      <p className="text-summary">{tagDescription(t, tag)}</p>
      <p className="mt-2 text-caption text-muted">
        {t('tags.articleCount', { count: posts.length })}
      </p>
    </Blog>
  );
};

export default TagTemplate;

export const query = graphql`
  query TagPosts($tagPostIds: [String!]!, $language: String!) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
    posts: allMarkdownRemark(
      filter: { id: { in: $tagPostIds } }
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
            tags
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
  }
`;

export const Head = createHead(({ pageContext, t }) => {
  const tag = pageContext.tag || '';
  return {
    title: t('tags.seoTitle', { tag: tagLabel(t, tag) }),
    description: tagDescription(t, tag),
    schemaType: 'CollectionPage',
  };
});
