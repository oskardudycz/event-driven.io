import { FaTag } from "react-icons/fa/";
import PropTypes from "prop-types";
import React from "react";
import Seo from "../components/Seo";
import { ThemeContext } from "../layouts";
import Article from "../components/Article";
import Headline from "../components/Article/Headline";
import List from "../components/List";
import { useTranslation } from "react-i18next";

const CategoryTemplate = (props) => {
  const { t } = useTranslation();
  const {
    pageContext: {
      category,
      categoryDescription,
      recommendedSlugs = [],
      categoryPosts: edges = [],
    },
  } = props;
  const totalCount = edges.length;
  const slugKey = (edge) => edge.node.fields.slug.replace(/^\/+|\/+$/g, "");
  const edgesBySlug = new Map(edges.map((edge) => [slugKey(edge), edge]));
  const recommended = recommendedSlugs.map((slug) => edgesBySlug.get(slug)).filter(Boolean);
  const recommendedSet = new Set(recommended.map(slugKey));
  const remaining = edges.filter((edge) => !recommendedSet.has(slugKey(edge)));

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {(theme) => (
          <Article theme={theme}>
            <header className="categoryHeader">
              <p className="eyebrow">
                <FaTag /> {t("categories.topic")}
              </p>
              <Headline title={category} theme={theme} />
              <p className="description">
                {categoryDescription || t("categories.defaultDescription", { category })}
              </p>
              <p className="meta">{t("categories.articleCount", { count: totalCount })}</p>
            </header>
            {recommended.length > 0 && (
              <section className="articleSection">
                <div className="sectionHeader">
                  <h2>{t("categories.recommended")}</h2>
                  <p>{t("categories.recommendedDescription")}</p>
                </div>
                <List edges={recommended} theme={theme} ordered showImages />
              </section>
            )}
            {remaining.length > 0 && (
              <section className="articleSection moreArticles">
                <div className="sectionHeader">
                  <h2>
                    {recommended.length > 0
                      ? t("categories.moreArticles")
                      : t("categories.articles")}
                  </h2>
                </div>
                <List edges={remaining} theme={theme} showImages />
              </section>
            )}
            <style jsx>{`
              .categoryHeader {
                border-bottom: 1px solid ${theme.line.color};
                margin-bottom: ${theme.space.xl};
                padding-bottom: ${theme.space.l};
              }
              .eyebrow {
                align-items: center;
                color: ${theme.color.brand.primary};
                display: flex;
                font-size: ${theme.font.size.xs};
                font-weight: ${theme.font.weight.bold};
                gap: ${theme.space.s};
                letter-spacing: 0.08em;
                margin-bottom: ${theme.space.s};
                text-transform: uppercase;
              }
              .eyebrow :global(svg) {
                height: 1em;
              }
              .categoryHeader :global(h1) {
                margin-bottom: ${theme.space.m};
              }
              .description {
                font-size: ${theme.font.size.m};
                line-height: ${theme.font.lineHeight.l};
                max-width: 46rem;
              }
              .meta {
                background: ${theme.background.color.alt};
                border-radius: 999px;
                display: inline-block;
                font-size: ${theme.font.size.xs};
                font-weight: ${theme.font.weight.bold};
                margin-top: ${theme.space.m};
                padding: ${theme.space.xs} ${theme.space.s};
              }
              .articleSection {
                margin-bottom: ${theme.space.xl};
              }
              .sectionHeader {
                margin-bottom: ${theme.space.l};
                max-width: 44rem;
              }
              .sectionHeader h2 {
                font-size: ${theme.font.size.xl};
                margin-bottom: ${theme.space.s};
              }
              .sectionHeader p {
                font-size: ${theme.font.size.s};
                line-height: ${theme.font.lineHeight.l};
              }
              .moreArticles {
                border-top: 1px solid ${theme.line.color};
                padding-top: ${theme.space.xl};
              }
              @from-width tablet {
                .categoryHeader {
                  margin-bottom: ${theme.space.xl};
                  padding-bottom: ${theme.space.l};
                }
              }
            `}</style>
          </Article>
        )}
      </ThemeContext.Consumer>

      <Seo
        title={t("categories.seoTitle", { category })}
        description={categoryDescription || t("categories.defaultDescription", { category })}
        schemaType="CollectionPage"
      />
    </React.Fragment>
  );
};

CategoryTemplate.propTypes = {
  pageContext: PropTypes.object.isRequired,
};

export default CategoryTemplate;
