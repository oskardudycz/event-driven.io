import * as styles from './Hero.module.css';
import React from 'react';

import { FaArrowDown } from 'react-icons/fa';

import { Trans, useTranslation } from 'react-i18next';
import { Link } from '../Link/index.tsx';
import { StaticImage } from 'gatsby-plugin-image';

const Hero = (props: { scrollToContent: () => void }) => {
  const { scrollToContent } = props;
  const { t } = useTranslation();

  return (
    <section
      className={`hero grid items-start px-gutter py-section sm:px-section ${styles.hero}`}
    >
      <div className="grid items-center">
        <div
          className={`flex min-w-0 flex-col items-start gap-8 wrap-anywhere ${styles.copy}`}
        >
          <h1
            className={`${styles.heading} m-0 max-w-4xl text-3xl font-semibold uppercase leading-tight lg:text-4xl`}
          >
            <Trans
              i18nKey="hero.h1"
              components={{
                linebreak: <br />,
                architecture: <u className={styles.underline} />,
              }}
            />
          </h1>
          <p className="m-0 text-xl font-semibold leading-snug lg:text-2xl">
            <Trans
              i18nKey="hero.h2"
              components={{
                formats: <span className={`yellow ${styles.yellow}`} />,
              }}
            />
          </p>
          <p className="m-0 max-w-xl text-base leading-relaxed lg:text-lg">
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
          </p>
          <nav className={styles.services} aria-label={t('hero.servicesLabel')}>
            <Link to="/training/">{t('hero.trainingCta')}</Link>
            <Link to="/consulting/">{t('hero.consultingCta')}</Link>
          </nav>
          <button
            onClick={scrollToContent}
            aria-label={t('hero.articlesCta')}
            className={styles.elementButton}
          >
            <span className={styles.articlesLabel}>
              {t('hero.articlesCta')}
            </span>
            <span className={styles.arrowCircle}>
              <FaArrowDown />
            </span>
          </button>
        </div>
        <div className={styles.artwork} aria-hidden="true">
          <StaticImage
            src="../../images/png/hero-speaker.png"
            alt=""
            layout="fixed"
            width={772}
            quality={90}
            placeholder="none"
            objectFit="contain"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
