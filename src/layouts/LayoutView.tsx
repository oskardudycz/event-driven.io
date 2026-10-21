import React, { useEffect, useState } from 'react';
import type { ArticleEdge } from '../types/content.ts';
import { anchor, type RenderLink } from '../components/Link/anchor.tsx';
import HeaderView from '../components/Header/HeaderView.tsx';
import Footer from '../components/Footer/Footer.tsx';
import { ScreenWidthContext, FontLoadedContext } from './contexts.ts';

export type LayoutProps = React.PropsWithChildren<{
  renderLink?: RenderLink;
  avatar?: string;
  location: { pathname: string };
  data: { pages: { edges: ArticleEdge[] }; footnote: { html: string } };
}>;
export default function Layout({
  children,
  location,
  data,
  renderLink = anchor,
  avatar = '/images/avatar.webp',
}: LayoutProps) {
  const [font400loaded, setFont400Loaded] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const updateFontState = () => {
      setFont400Loaded(document.documentElement.dataset.font400 === 'loaded');
    };
    updateFontState();
    document.addEventListener('site:fonts-loaded', updateFontState);
    return () =>
      document.removeEventListener('site:fonts-loaded', updateFontState);
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
          <HeaderView
            path={location.pathname}
            pages={data.pages.edges}
            renderLink={renderLink}
            avatar={avatar}
          />
          <main className="min-h-[80vh]">{children}</main>
          <Footer html={data.footnote.html} />
        </React.Fragment>
      </ScreenWidthContext.Provider>
    </FontLoadedContext.Provider>
  );
}
