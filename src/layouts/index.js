import FontFaceObserver from 'fontfaceobserver';
import PropTypes from 'prop-types';
import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';

import { getScreenWidth, timeoutThrottlerHandler } from '../utils/helpers';
import Footer from '../components/Footer/';
import Header from '../components/Header';

export const ThemeContext = React.createContext(null);
export const ScreenWidthContext = React.createContext(0);
export const FontLoadedContext = React.createContext(false);

import themeObjectFromYaml from '../theme/theme.yaml';

class Layout extends React.Component {
  constructor() {
    super();

    this.state = {
      font400loaded: false,
      font600loaded: false,
      screenWidth: 0,
      headerMinimized: false,
      theme: themeObjectFromYaml,
    };
  }

  timeouts = {};

  componentDidMount() {
    this.mounted = true;
    this.loadFont('font400', 'Open Sans', 400);
    this.loadFont('font600', 'Open Sans', 600);
    this.setState({
      screenWidth: getScreenWidth(),
    });
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeThrottler, false);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('resize', this.resizeThrottler, false);
    Object.values(this.timeouts).forEach(clearTimeout);
    this.timeouts = {};
  }

  resizeThrottler = () => {
    return timeoutThrottlerHandler(this.timeouts, 'resize', 100, this.resizeHandler);
  };

  resizeHandler = () => {
    this.setState({ screenWidth: getScreenWidth() });
  };

  isHomePage = () => {
    if (this.props.location.pathname === '/') {
      return true;
    }

    return false;
  };

  loadFont = (name, family, weight) => {
    const font = new FontFaceObserver(family, {
      weight: weight,
    });

    font.load(null, 10000).then(
      () => {
        console.log(`${name} is available`);
        if (this.mounted) this.setState({ [`${name}loaded`]: true });
      },
      () => {
        console.log(`${name} is not available`);
      },
    );
  };

  render() {
    const { children } = this.props;
    const {
      footnote: { html: footnoteHTML },
      pages: { edges: pages },
    } = this.props.data;

    return (
      <ThemeContext.Provider value={this.state.theme}>
        <FontLoadedContext.Provider value={this.state.font400loaded}>
          <ScreenWidthContext.Provider value={this.state.screenWidth}>
            <React.Fragment>
              <Header path={this.props.location.pathname} pages={pages} theme={this.state.theme} />
              <main>{children}</main>
              <Footer html={footnoteHTML} theme={this.state.theme} />

              {/* --- STYLES --- */}
              <style jsx>{`
                main {
                  min-height: 80vh;
                }
              `}</style>
              <style jsx global>{`
                html {
                  box-sizing: border-box;
                }
                *,
                *:after,
                *:before {
                  box-sizing: inherit;
                  margin: 0;
                  padding: 0;
                }
                body {
                  font-family: ${this.state.font400loaded
                    ? "'Open Sans', sans-serif;"
                    : 'Arial, sans-serif;'};
                }
                h1,
                h2,
                h3 {
                  font-weight: ${this.state.font600loaded ? 600 : 400};
                  line-height: 1.1;
                  letter-spacing: -0.03em;
                  margin: 0;
                }
                h1 {
                  letter-spacing: -0.04em;
                }
                p {
                  margin: 0;
                }
                strong {
                  font-weight: ${this.state.font600loaded ? 600 : 400};
                }
                a {
                  text-decoration: none;
                  color: #666;
                }
                main {
                  width: auto;
                  display: block;
                }
                hr {
                  border: 1px solid lightgray;
                  margin-bottom: 20px;
                }
              `}</style>
            </React.Fragment>
          </ScreenWidthContext.Provider>
        </FontLoadedContext.Provider>
      </ThemeContext.Provider>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  data: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default function LayoutWithData(props) {
  const data = useStaticQuery(graphql`
          query LayoutgQuery {
            pages: allMarkdownRemark(
              filter: { fileAbsolutePath: { regex: "//pages//" }, fields: { prefix: { regex: "/^\\d+$/" } } }
              sort: { fields: { prefix: ASC } }
            ) {
              edges {
                node {
                  fields {
                    slug
                    prefix
                    langKey
                  }
                  frontmatter {
                    title
                    menuTitle
                    icon
                  }
                }
              }
            }
            footnote: markdownRemark(fileAbsolutePath: { regex: "/footnote/" }) {
              id
              html
            }
          }
        `);
  return <Layout {...props} data={data} />;
}
