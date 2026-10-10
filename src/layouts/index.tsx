import type { ArticleEdge } from '../types/content.ts';
import '../theme/tokens.css';
import '../theme/tailwind.css';
import '../theme/global.css';
import FontFaceObserver from 'fontfaceobserver';
import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';

import { getScreenWidth, timeoutThrottlerHandler } from '../utils/helpers.ts';
import Footer from '../components/Footer/index.ts';
import Header from '../components/Header/index.ts';
import { ScreenWidthContext, FontLoadedContext } from './contexts';
export { ScreenWidthContext, FontLoadedContext } from './contexts';

type LayoutProps = React.PropsWithChildren<{
  location: { pathname: string };
  data: { pages: { edges: ArticleEdge[] }; footnote: { html: string } };
}>;
type LayoutState = {
  font400loaded: boolean;
  font600loaded: boolean;
  screenWidth: number;
  headerMinimized: boolean;
};
class Layout extends React.Component<LayoutProps, LayoutState> {
  mounted = false;
  constructor(props: LayoutProps) {
    super(props);

    this.state = {
      font400loaded: false,
      font600loaded: false,
      screenWidth: 0,
      headerMinimized: false,
    };
  }

  timeouts: Record<string, ReturnType<typeof setTimeout> | null> = {};

  componentDidMount() {
    this.mounted = true;
    this.loadFont('font400', 'Open Sans', 400);
    this.loadFont('font600', 'Open Sans', 600);
    this.setState({
      screenWidth: getScreenWidth() || 0,
    });
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeThrottler, false);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('resize', this.resizeThrottler, false);
    Object.values(this.timeouts).forEach((timeout) => {
      if (timeout) clearTimeout(timeout);
    });
    this.timeouts = {};
    delete document.documentElement.dataset.font400;
    delete document.documentElement.dataset.font600;
  }

  resizeThrottler = () => {
    return timeoutThrottlerHandler(
      this.timeouts,
      'resize',
      100,
      this.resizeHandler,
    );
  };

  resizeHandler = () => {
    this.setState({ screenWidth: getScreenWidth() || 0 });
  };

  isHomePage = () => {
    if (this.props.location.pathname === '/') {
      return true;
    }

    return false;
  };

  loadFont = (name: 'font400' | 'font600', family: string, weight: number) => {
    const font = new FontFaceObserver(family, {
      weight: weight,
    });

    font.load(null, 10000).then(
      () => {
        if (this.mounted) {
          document.documentElement.dataset[name] = 'loaded';
          if (name === 'font400') this.setState({ font400loaded: true });
          else this.setState({ font600loaded: true });
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
      <FontLoadedContext.Provider value={this.state.font400loaded}>
        <ScreenWidthContext.Provider value={this.state.screenWidth}>
          <React.Fragment>
            <Header path={this.props.location.pathname} pages={pages} />
            <main className="min-h-[80vh]">{children}</main>
            <Footer html={footnoteHTML} />
          </React.Fragment>
        </ScreenWidthContext.Provider>
      </FontLoadedContext.Provider>
    );
  }
}

export default function LayoutWithData(props: Omit<LayoutProps, 'data'>) {
  const data = useStaticQuery<LayoutProps['data']>(graphql`
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
