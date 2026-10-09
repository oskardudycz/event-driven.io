import type { SitePageProps } from '../types/content.ts';
import * as styles from './Index.module.css';
import React, { useRef } from 'react';
import { graphql } from 'gatsby';

import Blog from '../components/Blog/index.ts';
import Hero from '../components/Hero/index.ts';
import { createHead } from '../components/Seo/index.ts';
import { useTranslation } from 'react-i18next';

export default function IndexPage({
  data,
}: SitePageProps<'posts' | 'bgDesktop' | 'bgTablet' | 'bgMobile' | 'site'>) {
  const { t } = useTranslation();
  const separator = useRef<HTMLElement>(null);
  const scrollToContent = () => {
    separator.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };
  const {
    posts: { edges: posts = [] },
    bgDesktop: {
      resize: { src: desktop },
    },
    bgTablet: {
      resize: { src: tablet },
    },
    bgMobile: {
      resize: { src: mobile },
    },
  } = data;

  const backgrounds = {
    desktop,
    tablet,
    mobile,
  };

  return (
    <React.Fragment>
      <Hero scrollToContent={scrollToContent} backgrounds={backgrounds} />

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
    bgDesktop: imageSharp(original: { src: { regex: "/hero-background/" } }) {
      resize(width: 1200, quality: 80, cropFocus: CENTER, toFormat: WEBP) {
        src
      }
    }
    bgTablet: imageSharp(original: { src: { regex: "/hero-background/" } }) {
      resize(
        width: 800
        height: 1100
        quality: 80
        cropFocus: CENTER
        toFormat: WEBP
      ) {
        src
      }
    }
    bgMobile: imageSharp(original: { src: { regex: "/hero-background/" } }) {
      resize(
        width: 450
        height: 850
        quality: 80
        cropFocus: CENTER
        toFormat: WEBP
      ) {
        src
      }
    }
  }
`;

//hero-background

export const Head = createHead();
