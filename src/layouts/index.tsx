import type { ArticleEdge } from '../types/content.ts';
import '../theme/tokens.css';
import '../theme/tailwind.css';
import '../theme/global.css';
import React, { useEffect, useState } from 'react';
import { graphql, useStaticQuery } from 'gatsby';

import Footer from '../components/Footer/index.ts';
import Header from '../components/Header/index.ts';
import { ScreenWidthContext, FontLoadedContext } from './contexts';
export { ScreenWidthContext, FontLoadedContext } from './contexts';

type LayoutProps = React.PropsWithChildren<{
  location: { pathname: string };
  data: { pages: { edges: ArticleEdge[] }; footnote: { html: string } };
}>;
function Layout({ children, location, data }: LayoutProps) {
  const [font400loaded, setFont400Loaded] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    let active = true;
    const timeout = setTimeout(() => {
      active = false;
    }, 10000);
    const fontLoads = [400, 600].map((weight) =>
      document.fonts.load(`${weight} 1em "Open Sans"`, 'BESbswy').then(
        (faces) => {
          if (!active || faces.length === 0) return;
          document.documentElement.dataset[`font${weight}`] = 'loaded';
          if (weight === 400) setFont400Loaded(true);
        },
        // Keep the existing fallback fonts when loading fails.
        () => {},
      ),
    );
    void Promise.all(fontLoads).then(() => clearTimeout(timeout));

    return () => {
      active = false;
      clearTimeout(timeout);
      delete document.documentElement.dataset.font400;
      delete document.documentElement.dataset.font600;
    };
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const updateWidth = () => setScreenWidth(window.innerWidth);
    const onResize = () => {
      if (timeout !== undefined) return;
      timeout = setTimeout(() => {
        timeout = undefined;
        updateWidth();
      }, 100);
    };
    updateWidth();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <FontLoadedContext.Provider value={font400loaded}>
      <ScreenWidthContext.Provider value={screenWidth}>
        <React.Fragment>
          <Header path={location.pathname} pages={data.pages.edges} />
          <main className="min-h-[80vh]">{children}</main>
          <Footer html={data.footnote.html} />
        </React.Fragment>
      </ScreenWidthContext.Provider>
    </FontLoadedContext.Provider>
  );
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
