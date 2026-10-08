import * as styles from './CategoryTemplate.module.css';
import { FaTag } from 'react-icons/fa/';
import PropTypes from 'prop-types';
import React from 'react';
import { graphql } from 'gatsby';

import Article from '../components/Article';
import Headline from '../components/Article/Headline';
import List from '../components/List';
import { useTranslation } from 'react-i18next';
import { createHead } from '../components/Seo';

const CategoryTemplate = (props) => {
  const { t } = useTranslation();
  const {
    data: {
      posts: { edges },
    },
    pageContext: { category, categoryDescription, recommendedSlugs = [] },
  } = props;
  const totalCount = edges.length;
  const slugKey = (edge) => edge.node.fields.slug.replace(/^\/+|\/+$/g, '');
  const edgesBySlug = new Map(edges.map((edge) => [slugKey(edge), edge]));
  const recommended = recommendedSlugs.map((slug) => edgesBySlug.get(slug)).filter(Boolean);
  const recommendedSet = new Set(recommended.map(slugKey));
  const remaining = edges.filter((edge) => !recommendedSet.has(slugKey(edge)));

  return (
    <React.Fragment>
      <Article>
        <header className={`categoryHeader ${styles.categoryHeader}`}>
          <p className={`eyebrow ${styles.eyebrow}` + ' ' + styles.elementP}>
            <FaTag /> {t('categories.topic')}
          </p>
          <Headline title={category} />
          <p className={`description ${styles.description}` + ' ' + styles.elementP}>
            {categoryDescription || t('categories.defaultDescription', { category })}
          </p>
          <p className={`meta ${styles.meta}` + ' ' + styles.elementP}>
            {t('categories.articleCount', { count: totalCount })}
          </p>
        </header>
        {recommended.length > 0 && (
          <section className={`articleSection ${styles.articleSection}`}>
            <div className={`sectionHeader ${styles.sectionHeader}`}>
              <h2 className={styles.elementH2}>{t('categories.recommended')}</h2>
              <p className={styles.elementP}>{t('categories.recommendedDescription')}</p>
            </div>
            <List edges={recommended} ordered showImages />
          </section>
        )}
        {remaining.length > 0 && (
          <section
            className={`articleSection ${styles.articleSection}${recommended.length > 0 ? ` moreArticles ${styles.moreArticles}` : ''}`}
          >
            <div className={`sectionHeader ${styles.sectionHeader}`}>
              <h2 className={styles.elementH2}>
                {recommended.length > 0 ? t('categories.moreArticles') : t('categories.articles')}
              </h2>
            </div>
            <List edges={remaining} showImages />
          </section>
        )}
      </Article>
    </React.Fragment>
  );
};

CategoryTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
};

export default CategoryTemplate;

export const query = graphql`
  query CategoryPosts($categoryPostIds: [String!]!, $language: String!) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
    posts: allMarkdownRemark(
      filter: { id: { in: $categoryPostIds } }
      sort: { fields: { prefix: DESC } }
    ) {
      edges {
        node {
          excerpt(pruneLength: 170)
          fields {
            slug
            prefix
            langKey
          }
          frontmatter {
            title
            useDefaultLangCanonical
            cover {
              childImageSharp {
                resize(width: 420, height: 240, quality: 78, cropFocus: CENTER, toFormat: WEBP) {
                  src
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const Head = createHead(({ pageContext, t }) => ({
  title: t('categories.seoTitle', { category: pageContext.category }),
  description:
    pageContext.categoryDescription ||
    t('categories.defaultDescription', { category: pageContext.category }),
  schemaType: 'CollectionPage',
}));
