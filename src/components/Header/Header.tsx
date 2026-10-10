import type { ArticleEdge } from '../../types/content.ts';
import * as styles from './Header.module.css';
import { Link } from '../Link/index.tsx';
import React, { useEffect, useRef, useState } from 'react';

import { ScreenWidthContext, FontLoadedContext } from '../../layouts/contexts';
import config from '../../../content/meta/config.ts';
import Menu from '../Menu/index.ts';
import ThemePicker from '../ThemePicker/ThemePicker.tsx';

import { withPrefix } from 'gatsby';

import { usePageContext } from '../../i18n/index.ts';
import { useTranslation } from 'react-i18next';

const avatar = withPrefix('/images/avatar.webp');

const Header = ({ pages, path }: { pages: ArticleEdge[]; path: string }) => {
  const { t } = useTranslation();
  const [fixed, setFixed] = useState(false);
  const sensorRef = useRef<HTMLDivElement>(null);
  const { lang } = usePageContext();
  const filteredPages = pages.filter((p) => p.node.fields.langKey === lang);

  useEffect(() => {
    const sensor = sensorRef.current;
    if (!sensor) return;

    if (typeof IntersectionObserver === 'undefined') {
      const updateFixed = () => {
        const bounds = sensor.getBoundingClientRect();
        setFixed(bounds.top < 0 || bounds.bottom > window.innerHeight);
      };
      updateFixed();
      window.addEventListener('scroll', updateFixed, { passive: true });
      window.addEventListener('resize', updateFixed);
      return () => {
        window.removeEventListener('scroll', updateFixed);
        window.removeEventListener('resize', updateFixed);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // One sensor can have several queued visibility changes in a batch.
        const entry = entries.at(-1);
        if (entry) setFixed(entry.intersectionRatio < 1);
      },
      { threshold: 1 },
    );
    observer.observe(sensor);
    return () => observer.disconnect();
  }, []);

  const getHeaderSize = () => {
    const fixedText = fixed ? `fixed ${styles.fixed}` : '';

    const homePages = [`/${lang}`]; //, `/${lang}/newsletter-pl`];

    const homepage = homePages.some(
      (page) => path === `${page}/` || path === `${page}`,
    )
      ? `homepage ${styles.homepage}`
      : '';

    return `${fixedText} ${homepage}`;
  };

  return (
    <React.Fragment>
      <header className={`header ${styles.header} ${getHeaderSize()}`}>
        <Link to="/" className={'logoType'}>
          <div className={`logo ${styles.logo}`}>
            <img
              src={avatar}
              alt={config.siteTitle}
              width="180"
              height="180"
              className={styles.elementImg}
            />
          </div>
          <div className={'type'}>
            <span className={`siteTitle ${styles.siteTitle}`}>
              {t('header.title') || config.headerTitle}
            </span>
            <h2 className={styles.elementH2}>
              {t('header.subTitle') || config.headerSubTitle}
            </h2>
          </div>
        </Link>
        <FontLoadedContext.Consumer>
          {(loaded) => (
            <ScreenWidthContext.Consumer>
              {(width) => (
                <Menu
                  path={path}
                  fixed={fixed}
                  screenWidth={width}
                  fontLoaded={loaded}
                  pages={filteredPages}
                />
              )}
            </ScreenWidthContext.Consumer>
          )}
        </FontLoadedContext.Consumer>
        <ThemePicker />
      </header>
      <div
        ref={sensorRef}
        style={
          {
            '--sensor-top':
              path === `/${lang}/`
                ? 'var(--header-height-homepage)'
                : 'var(--header-height-default)',
          } as React.CSSProperties
        }
        className={`sensor ${styles.sensor}`}
      />
    </React.Fragment>
  );
};

export default Header;
