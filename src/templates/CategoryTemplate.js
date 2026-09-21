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
            <header>
              <Headline theme={theme}>
                <span>{t("categories.topic")}</span> <FaTag />
                {category}
              </Headline>
              <p className="description">
                {categoryDescription || t("categories.defaultDescription", { category })}
              </p>
              <p className="meta">{t("categories.articleCount", { count: totalCount })}</p>
              {recommended.length > 0 && (
                <React.Fragment>
                  <h2>{t("categories.recommended")}</h2>
                  <p>{t("categories.recommendedDescription")}</p>
                  <List edges={recommended} theme={theme} ordered showImages />
                </React.Fragment>
              )}
              {remaining.length > 0 && (
                <React.Fragment>
                  <h2>
                    {recommended.length > 0
                      ? t("categories.moreArticles")
                      : t("categories.articles")}
                  </h2>
                  <List edges={remaining} theme={theme} showImages />
                </React.Fragment>
              )}
            </header>
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
