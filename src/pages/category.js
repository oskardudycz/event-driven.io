import { FaTag } from "react-icons/fa/";
import PropTypes from "prop-types";
import React from "react";
import { graphql } from "gatsby";
import kebabCase from "lodash/kebabCase";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../layouts";
import { usePageContext } from "../i18n/page-context";
import Article from "../components/Article/";
import Headline from "../components/Article/Headline";
import { Link } from "../components/Link";
import Seo from "../components/Seo";
import categoryGuides from "../../data/category-guides.json";

const categoriesFor = (frontmatter) =>
  Array.from(new Set([frontmatter.category, ...(frontmatter.categories || [])].filter(Boolean)));

const CategoryPage = (props) => {
  const { t } = useTranslation();
  const { lang } = usePageContext();
  const {
    data: {
      posts: { edges: posts },
      site: {
        siteMetadata: { facebook },
      },
    },
  } = props;

  const categories = new Map();
  posts.forEach((edge) => {
    categoriesFor(edge.node.frontmatter).forEach((category) => {
      const current = categories.get(category) || [];
      current.push(edge);
      categories.set(category, current);
    });
  });

  const guides = categoryGuides.filter((guide) => guide.language === lang);
  const guideFor = (category) => guides.find((guide) => guide.slug === kebabCase(category));
  const categoryList = Array.from(categories.entries()).sort(([left], [right]) => {
    const leftGuide = guideFor(left);
    const rightGuide = guideFor(right);
    if (leftGuide && !rightGuide) return -1;
    if (!leftGuide && rightGuide) return 1;
    return left.localeCompare(right);
  });

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {(theme) => (
          <Article theme={theme}>
            <header>
              <Headline title={t("categories.title")} theme={theme} />
              <p className="intro">{t("categories.intro")}</p>
            </header>
            <div className="categoryGrid">
              {categoryList.map(([category, categoryPosts]) => {
                const guide = guideFor(category);
                return (
                  <section key={category}>
                    <Link to={`/category/${kebabCase(category)}/`}>
                      <h2>
                        <FaTag /> {category}
                      </h2>
                      <p>
                        {guide
                          ? guide.description
                          : t("categories.defaultDescription", { category })}
                      </p>
                      <strong>
                        {t("categories.articleCount", { count: categoryPosts.length })} →
                      </strong>
                    </Link>
                  </section>
                );
              })}
            </div>
            <style jsx>{`
              .intro {
                font-size: ${theme.font.size.s};
                line-height: ${theme.font.lineHeight.xl};
                margin-bottom: ${theme.space.l};
              }
              .categoryGrid {
                display: grid;
                gap: ${theme.space.m};
              }
              section {
                border: 1px solid ${theme.line.color};
                border-radius: ${theme.size.radius.default};
              }
              section :global(a) {
                color: ${theme.text.color.primary};
                display: block;
                height: 100%;
                padding: ${theme.space.m};
              }
              h2 {
                margin: 0 0 ${theme.space.s};
              }
              h2 :global(svg) {
                height: 0.8em;
                fill: ${theme.color.brand.primary};
              }
              section p {
                line-height: ${theme.font.lineHeight.l};
                margin-bottom: ${theme.space.m};
              }
              section strong {
                color: ${theme.color.brand.primary};
              }
              @from-width tablet {
                .categoryGrid {
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                }
              }
            `}</style>
          </Article>
        )}
      </ThemeContext.Consumer>

      <Seo
        facebook={facebook}
        title={t("categories.seoTitleAll")}
        description={t("categories.seoDescription")}
        schemaType="CollectionPage"
      />
    </React.Fragment>
  );
};

CategoryPage.propTypes = {
  data: PropTypes.object.isRequired,
};

export default CategoryPage;

//eslint-disable-next-line no-undef
export const query = graphql`
  query PostsQuery($langKey: String!) {
    posts: allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "//posts/[0-9]+.*--/" }
        fields: { langKey: { eq: $langKey } }
        frontmatter: { useDefaultLangCanonical: { ne: true } }
      }
      sort: { fields: [fields___prefix], order: DESC }
    ) {
      edges {
        node {
          frontmatter {
            category
            categories
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
