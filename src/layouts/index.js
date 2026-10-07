import '../theme/tokens.css';
import '../theme/global.css';
import styles from './Layout.module.css';
import FontFaceObserver from 'fontfaceobserver';
import PropTypes from 'prop-types';
import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';

import { getScreenWidth, timeoutThrottlerHandler } from '../utils/helpers';
import Footer from '../components/Footer/';
import Header from '../components/Header';
import themeObjectFromYaml from '../theme/theme.yaml';

import { ThemeContext, ScreenWidthContext, FontLoadedContext } from './contexts';
export { ThemeContext, ScreenWidthContext, FontLoadedContext } from './contexts';

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
    delete document.documentElement.dataset.font400;
    delete document.documentElement.dataset.font600;
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
        if (this.mounted) {
          document.documentElement.dataset[name] = 'loaded';
          this.setState({ [`${name}loaded`]: true });
        }
      },
      // Keep the existing fallback fonts when loading fails.
      () => {},
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
              <Header path={this.props.location.pathname} pages={pages} />
              <main className={styles.main}>{children}</main>
              <Footer html={footnoteHTML} />
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
