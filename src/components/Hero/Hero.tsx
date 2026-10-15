import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StaticImage } from 'gatsby-plugin-image';
import { Link } from '../Link/index.tsx';
import HeroView from './HeroView.tsx';

export default function Hero({
  scrollToContent,
}: {
  scrollToContent: () => void;
}) {
  const { t } = useTranslation();
  return (
    <HeroView
      heading={
        <Trans
          i18nKey="hero.h1"
          components={{ linebreak: <br />, architecture: <u /> }}
        />
      }
      lead={
        <Trans
          i18nKey="hero.h2"
          components={{
            formats: <span className="yellow" />,
            articles: <Link to="/articles/" />,
            videos: <Link to="/talks/" />,
          }}
        />
      }
      biography={
        <>
          <p>{t('hero.introExperience')}</p>
          <p>{t('hero.introTraining')}</p>
          <p>
            <Trans
              i18nKey="hero.introEmmett"
              components={{
                emmett: (
                  <a
                    href="https://event-driven-io.github.io/emmett/getting-started.html"
                    target="_parent"
                  />
                ),
              }}
            />
          </p>
          <p>{t('hero.introBlog')}</p>
        </>
      }
      services={
        <>
          <Link to="/training/">{t('hero.trainingCta')}</Link>
          <Link to="/consulting/">{t('hero.consultingCta')}</Link>
        </>
      }
      servicesLabel={t('hero.servicesLabel')}
      portrait={
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
      }
      articlesLabel={t('hero.articlesCta')}
      onArticlesClick={scrollToContent}
    />
  );
}
