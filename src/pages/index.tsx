import type { SitePageProps } from '../types/content.ts';
import * as styles from './Index.module.css';
import React, { useRef } from 'react';
import { graphql } from 'gatsby';

import Blog from '../components/Blog/index.ts';
import Hero from '../components/Hero/index.ts';
import { createHead } from '../components/Seo/index.ts';
import { useTranslation } from 'react-i18next';

export default function IndexPage({ data }: SitePageProps<'posts' | 'site'>) {
  const { t } = useTranslation();
  const separator = useRef<HTMLElement>(null);
  const scrollToContent = () => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    separator.current?.scrollIntoView({
      block: 'start',
      behavior: reducedMotion ? 'instant' : 'smooth',
    });
  };
  const {
    posts: { edges: posts = [] },
  } = data;

  return (
    <React.Fragment>
      <Hero scrollToContent={scrollToContent} />

      <section
        className={`latestArticles ${styles.latestArticles}`}
        id="latest-articles"
        ref={separator}
      >
        <header className={`sectionHeader ${styles.sectionHeader}`}>
          <h2 className={styles.elementH2}>{t('blog.latestTitle')}</h2>
        </header>
        <Blog posts={posts} browseAllPath="/articles/" compactTop />
      </section>
    </React.Fragment>
  );
}

export const query = graphql`
  query IndexQuery($langKey: String!, $language: String!) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
    posts: allMarkdownRemark(
      limit: 12
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
                  formats: [WEBP]
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

export const Head = createHead();
