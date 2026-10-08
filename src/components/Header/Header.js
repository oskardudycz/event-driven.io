import * as styles from './Header.module.css';
import { Link } from '../Link';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import VisibilitySensor from 'react-visibility-sensor';

import { ScreenWidthContext, FontLoadedContext } from '../../layouts/contexts';
import config from '../../../content/meta/config';
import Menu from '../Menu';

import { withPrefix } from 'gatsby';

import { usePageContext } from '../../i18n';
import { useTranslation } from 'react-i18next';

const avatar = withPrefix('/images/avatar.webp');

const Header = ({ pages, path }) => {
  const { t } = useTranslation();
  const [fixed, setFixed] = useState(false);
  const { lang } = usePageContext();
  const filteredPages = pages.filter((p) => p.node.fields.langKey === lang);

  const visibilitySensorChange = (val) => {
    if (val) {
      setFixed(false);
    } else {
      setFixed(true);
    }
  };

  const getHeaderSize = () => {
    const fixedText = fixed ? `fixed ${styles.fixed}` : '';

    const homePages = [`/${lang}`]; //, `/${lang}/newsletter-pl`];

    const homepage = homePages.some((page) => path === `${page}/` || path === `${page}`)
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
            <h2 className={styles.elementH2}>{t('header.subTitle') || config.headerSubTitle}</h2>
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
      </header>
      <VisibilitySensor onChange={visibilitySensorChange}>
        <div
          style={{
            '--sensor-top':
              path === `/${lang}/`
                ? 'var(--header-height-homepage)'
                : 'var(--header-height-default)',
          }}
          className={`sensor ${styles.sensor}`}
        />
      </VisibilitySensor>
    </React.Fragment>
  );
};

Header.propTypes = {
  pages: PropTypes.array.isRequired,
  path: PropTypes.string.isRequired,
};

export default Header;
