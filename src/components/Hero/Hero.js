import * as styles from './Hero.module.css';
import React from 'react';
import PropTypes from 'prop-types';

import { FaArrowDown } from 'react-icons/fa/';

import { Trans, useTranslation } from 'react-i18next';
import { Link } from '../Link';

const Hero = (props) => {
  const { scrollToContent, backgrounds } = props;
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <section
        style={{
          '--hero-mobile-image': `url(${backgrounds.mobile})`,
          '--hero-tablet-image': `url(${backgrounds.tablet})`,
          '--hero-desktop-image': `url(${backgrounds.desktop})`,
        }}
        className={`hero ${styles.hero}`}
      >
        <h1 className={styles.elementH1}>
          <Trans
            i18nKey="hero.h1"
            components={{
              linebreak: <br />,
              architecture: <u className={styles.elementU} />,
            }}
          />
          <br />
        </h1>
        <h2 className={styles.elementH2}>
          <Trans
            i18nKey="hero.h2"
            components={{
              formats: <span className={`yellow ${styles.yellow}`} />,
            }}
          />
        </h2>
        <h3 className={styles.elementH3}>
          {t('hero.introExperience')}
          <br />
          {t('hero.introTraining')}
          <br />
          <Trans
            i18nKey="hero.introEmmett"
            components={{
              emmett: (
                <a
                  href="https://event-driven-io.github.io/emmett/getting-started.html"
                  target="_parent"
                  className={`yellow ${styles.yellow}`}
                />
              ),
            }}
          />
          <br />
          {t('hero.introBlog')}
        </h3>
        <nav className={`services ${styles.services}`} aria-label={t('hero.servicesLabel')}>
          <Link to="/training/">{t('hero.trainingCta')}</Link>
          <Link to="/consulting/">{t('hero.consultingCta')}</Link>
        </nav>
        <button
          onClick={scrollToContent}
          aria-label={t('hero.articlesCta')}
          className={styles.elementButton}
        >
          <span className={`articlesLabel ${styles.articlesLabel}`}>{t('hero.articlesCta')}</span>
          <span className={`arrowCircle ${styles.arrowCircle}`}>
            <FaArrowDown />
          </span>
        </button>
      </section>
    </React.Fragment>
  );
};

Hero.propTypes = {
  scrollToContent: PropTypes.func.isRequired,
  backgrounds: PropTypes.object.isRequired,
};

export default Hero;
