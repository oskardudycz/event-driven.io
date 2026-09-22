import PropTypes from "prop-types";
import React from "react";
import { graphql } from "gatsby";
import { ThemeContext } from "../layouts";
import Blog from "../components/Blog";
import Hero from "../components/Hero";
import Seo from "../components/Seo";
import { withTranslation } from "react-i18next";

class IndexPage extends React.Component {
  separator = React.createRef();

  scrollToContent = (e) => {
    this.separator.current.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  render() {
    const {
      t,
      data: {
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
        site: {
          siteMetadata: { facebook },
        },
      },
    } = this.props;

    const backgrounds = {
      desktop,
      tablet,
      mobile,
    };

    return (
      <React.Fragment>
        <ThemeContext.Consumer>
          {(theme) => (
            <Hero scrollToContent={this.scrollToContent} backgrounds={backgrounds} theme={theme} />
          )}
        </ThemeContext.Consumer>

        <ThemeContext.Consumer>
          {(theme) => (
            <section className="latestArticles" id="latest-articles" ref={this.separator}>
              <header className="sectionHeader">
                <p>{t("blog.latestLabel")}</p>
                <h2>{t("blog.latestTitle")}</h2>
                <span>{t("blog.latestIntro")}</span>
              </header>
              <Blog posts={posts} theme={theme} browseAllPath="/articles/" />
              <style jsx>{`
                .latestArticles {
                  scroll-margin-top: ${theme.header.height.default};
                }
                .sectionHeader {
                  margin: 0 auto;
                  max-width: ${theme.text.maxWidth.desktop};
                  padding: ${theme.space.xl} ${theme.space.inset.default} 0;
                }
                .sectionHeader p {
                  color: ${theme.color.brand.primary};
                  font-size: ${theme.font.size.xs};
                  font-weight: ${theme.font.weight.bold};
                  letter-spacing: 0.08em;
                  margin-bottom: ${theme.space.s};
                  text-transform: uppercase;
                }
                .sectionHeader h2 {
                  font-size: ${theme.font.size.xxl};
                  margin-bottom: ${theme.space.s};
                }
                .sectionHeader span {
                  display: block;
                  font-size: ${theme.font.size.s};
                  line-height: ${theme.font.lineHeight.l};
                  max-width: 42rem;
                }
                @from-width tablet {
                  .sectionHeader {
                    padding-left: 0;
                    padding-right: 0;
                  }
                }
              `}</style>
            </section>
          )}
        </ThemeContext.Consumer>

        <Seo facebook={facebook} />
      </React.Fragment>
    );
  }
}

IndexPage.propTypes = {
  data: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(IndexPage);

//eslint-disable-next-line no-undef
export const query = graphql`
  query IndexQuery($langKey: String!) {
    posts: allMarkdownRemark(
      limit: 12
      filter: {
        fileAbsolutePath: { regex: "//posts/[0-9]+.*--/" }
        fields: { langKey: { eq: $langKey } }
        frontmatter: { useDefaultLangCanonical: { ne: true } }
      }
      sort: { fields: [fields___prefix], order: DESC }
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
            cover {
              children {
                ... on ImageSharp {
                  fluid(maxWidth: 800, maxHeight: 360) {
                    ...GatsbyImageSharpFluid_withWebp
                  }
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
    bgDesktop: imageSharp(fluid: { originalName: { regex: "/hero-background/" } }) {
      resize(width: 1200, quality: 80, cropFocus: CENTER, toFormat: WEBP) {
        src
      }
    }
    bgTablet: imageSharp(fluid: { originalName: { regex: "/hero-background/" } }) {
      resize(width: 800, height: 1100, quality: 80, cropFocus: CENTER, toFormat: WEBP) {
        src
      }
    }
    bgMobile: imageSharp(fluid: { originalName: { regex: "/hero-background/" } }) {
      resize(width: 450, height: 850, quality: 80, cropFocus: CENTER, toFormat: WEBP) {
        src
      }
    }
  }
`;

//hero-background
