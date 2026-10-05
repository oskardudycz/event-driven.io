import PropTypes from 'prop-types';
import React from 'react';
import { graphql } from 'gatsby';
import { ThemeContext } from '../layouts';
import Blog from '../components/Blog';
import Hero from '../components/Hero';
import { createHead } from '../components/Seo';
import { withTranslation } from 'react-i18next';

class IndexPage extends React.Component {
  separator = React.createRef();

  scrollToContent = () => {
    this.separator.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
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
                <h2>{t('blog.latestTitle')}</h2>
              </header>
              <Blog posts={posts} theme={theme} browseAllPath="/articles/" compactTop />
              <style jsx>{`
                .latestArticles {
                  scroll-margin-top: ${theme.header.height.default};
                }
                .sectionHeader {
                  margin: 0 auto;
                  padding: ${theme.space.l} ${theme.space.inset.default} 0;
                }
                .sectionHeader h2 {
                  font-size: ${theme.font.size.xxl};
                }
                @from-width tablet {
                  .sectionHeader {
                    max-width: ${theme.text.maxWidth.tablet};
                    padding-left: 0;
                    padding-right: 0;
                  }
                }
                @from-width desktop {
                  .sectionHeader {
                    max-width: ${theme.text.maxWidth.desktop};
                  }
                }
              `}</style>
            </section>
          )}
        </ThemeContext.Consumer>
      </React.Fragment>
    );
  }
}

IndexPage.propTypes = {
  data: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(IndexPage);

export const query = graphql`
  query IndexQuery($langKey: String!) {
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
      resize(width: 800, height: 1100, quality: 80, cropFocus: CENTER, toFormat: WEBP) {
        src
      }
    }
    bgMobile: imageSharp(original: { src: { regex: "/hero-background/" } }) {
      resize(width: 450, height: 850, quality: 80, cropFocus: CENTER, toFormat: WEBP) {
        src
      }
    }
  }
`;

//hero-background

export const Head = createHead();
