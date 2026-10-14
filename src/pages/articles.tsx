import type { SitePageProps } from '../types/content.ts';
import React from 'react';
import { graphql } from 'gatsby';
import { useTranslation } from 'react-i18next';

import Blog from '../components/Blog/index.ts';
import TagChips from '../components/Blog/TagChips.tsx';
import { createHead } from '../components/Seo/index.ts';
import { usePageContext } from '../i18n/page-context.ts';
import { tagChips } from '../utils/tag-posts.ts';
import { tagLabel } from '../utils/tag-label.ts';

const ArticlesPage = (props: SitePageProps<'posts' | 'tagged' | 'site'>) => {
  const { t } = useTranslation();
  const { lang } = usePageContext();
  const {
    data: {
      posts: { edges: posts },
      tagged,
    },
  } = props;
  const chips = tagChips(tagged.nodes, lang, (tag) => tagLabel(t, tag));

  return (
    <React.Fragment>
      <Blog posts={posts} compactTop heading={t('blog.allTitle')}>
        <TagChips language={lang} chips={chips} />
      </Blog>
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
    tagged: allMarkdownRemark(filter: { fields: { source: { eq: "posts" } } }) {
      nodes {
        fields {
          slug
          langKey
          source
        }
        frontmatter {
          tags
          useDefaultLangCanonical
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
