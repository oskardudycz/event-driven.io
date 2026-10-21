import type { ArticleEdge } from '../../types/content.ts';
import * as styles from './Header.module.css';
import { anchor, type RenderLink } from '../Link/anchor.tsx';
import React, { useEffect, useRef, useState } from 'react';

import { ScreenWidthContext, FontLoadedContext } from '../../layouts/contexts';
import config from '../../../content/meta/config.ts';
import Menu from '../Menu/index.ts';

import { usePageContext } from '../../i18n/index.ts';
import { useTranslation } from 'react-i18next';

const Header = ({
  pages,
  path,
  avatar = '/images/avatar.webp',
  renderLink = anchor,
}: {
  pages: ArticleEdge[];
  path: string;
  avatar?: string;
  renderLink?: RenderLink;
}) => {
  const { t } = useTranslation();
  const [fixed, setFixed] = useState(false);
  const sensorRef = useRef<HTMLDivElement>(null);
  const { lang } = usePageContext();
  const homepage = path === `/${lang}/` || path === `/${lang}`;
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
  }, [homepage]);

  return (
    <div className={`${styles.frame} ${homepage ? styles.overlay : ''}`}>
      <header
        className={styles.header}
        data-homepage={homepage || undefined}
        data-fixed={fixed || undefined}
      >
        {renderLink({
          href: '/',
          className: styles.brand,
          children: (
            <>
              <div className={styles.portrait}>
                <img
                  src={avatar}
                  alt={config.siteTitle}
                  width="180"
                  height="180"
                  className={styles.avatar}
                />
              </div>
              <div className={styles.titles}>
                <span className={styles.siteTitle}>
                  {t('header.title') || config.headerTitle}
                </span>
                <h2 className={styles.subtitle}>
                  {t('header.subTitle') || config.headerSubTitle}
                </h2>
              </div>
            </>
          ),
        })}
        <FontLoadedContext.Consumer>
          {(loaded) => (
            <ScreenWidthContext.Consumer>
              {(width) => (
                <Menu
                  renderLink={renderLink}
                  path={path}
                  homepage={homepage}
                  fixed={fixed}
                  screenWidth={width}
                  fontLoaded={loaded}
                  pages={filteredPages}
                />
              )}
            </ScreenWidthContext.Consumer>
          )}
        </FontLoadedContext.Consumer>
      </header>
      <div ref={sensorRef} aria-hidden="true" className={styles.sensor} />
    </div>
  );
};

export default Header;
