import type { SitePageProps } from '../types/content.ts';
import * as styles from './category.module.css';
import { FaTag } from 'react-icons/fa';
import React from 'react';
import { graphql } from 'gatsby';
import { tagSlug } from '../utils/tag-slug.ts';
import { tagLabel } from '../utils/tag-label.ts';
import { useTranslation } from 'react-i18next';

import { usePageContext } from '../i18n/page-context.ts';
import Article from '../components/Article/index.ts';
import Headline from '../components/Article/Headline.tsx';
import { Link } from '../components/Link/index.tsx';
import { createHead } from '../components/Seo/index.ts';
import categoryGuides from '../../data/category-guides.json';
import { tagsForLanguage } from '../utils/tag-posts.ts';

const CategoryPage = (props: SitePageProps<'posts'>) => {
  const { t } = useTranslation();
  const { lang } = usePageContext();
  const {
    data: {
      posts: { edges: posts },
    },
  } = props;

  const guides = categoryGuides.filter((guide) => guide.language === lang);
  const guideFor = (tag: string) =>
    guides.find((guide) => guide.slug === tagSlug(tag));
  const tagList = tagsForLanguage(
    posts.map(({ node }) => node),
    lang,
  ).sort(([left], [right]) => {
    const leftGuide = guideFor(left);
    const rightGuide = guideFor(right);
    if (leftGuide && !rightGuide) return -1;
    if (!leftGuide && rightGuide) return 1;
    return left.localeCompare(right);
  });

  return (
    <React.Fragment>
      <Article>
        <header>
          <Headline title={t('tags.title')} />
          <p className={`intro ${styles.intro}` + ' ' + styles.elementP}>
            {t('tags.intro')}
          </p>
        </header>
        <div className={`categoryGrid ${styles.categoryGrid}`}>
          {tagList.map(([tag, tagPosts]) => {
            const guide = guideFor(tag);
            const label = tagLabel(t, tag);
            return (
              <section key={tag} className={styles.elementSection}>
                <Link to={`/category/${tagSlug(tag)}/`}>
                  <h2 className={styles.elementH2}>
                    <FaTag /> {label}
                  </h2>
                  <p className={styles.elementP}>
                    {guide
                      ? guide.description
                      : t('tags.defaultDescription', { tag: label })}
                  </p>
                  <strong className={styles.elementStrong}>
                    {t('tags.articleCount', {
                      count: tagPosts.length,
                    })}{' '}
                    →
                  </strong>
                </Link>
              </section>
            );
          })}
        </div>
      </Article>
    </React.Fragment>
  );
};

export default CategoryPage;

export const query = graphql`
  query PostsQuery($language: String!) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
    posts: allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "//posts/[0-9]+.*--/" }
        fields: { source: { eq: "posts" } }
      }
      sort: { fields: { prefix: DESC } }
    ) {
      edges {
        node {
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
    }
  }
`;

export const Head = createHead(({ t }) => ({
  title: t('tags.seoTitleAll'),
  description: t('tags.seoDescription'),
  schemaType: 'CollectionPage',
}));
