import React from 'react';
import i18next from 'i18next';
import { Trans } from 'react-i18next';
import HeroView from '../../src/components/Hero/HeroView.tsx';
import english from '../../src/i18n/locales/en/translation.json';
import polish from '../../src/i18n/locales/pl/translation.json';

const portrait = new URL(
  '../../src/images/png/hero-speaker.png',
  import.meta.url,
).href;

export function HeroExample({ language }: { language: 'en' | 'pl' }) {
  const copy = language === 'pl' ? polish : english;
  const translation = i18next.createInstance();
  void translation.init({
    lng: language,
    resources: { [language]: { translation: copy } },
    initAsync: false,
  });
  const onArticlesClick = () =>
    document.getElementById('hero-example-following')?.scrollIntoView();
  return (
    <>
      <header className="heroPreviewHeader">
        <img src="/images/avatar.webp" alt="" width="44" height="44" />
        <div>
          <span>{copy.header.title}</span>
          <small>{copy.header.subTitle}</small>
        </div>
      </header>
      <HeroView
        heading={
          <Trans
            i18n={translation}
            i18nKey="hero.h1"
            components={{ linebreak: <br />, architecture: <u /> }}
          />
        }
        lead={
          <Trans
            i18n={translation}
            i18nKey="hero.h2"
            components={{
              formats: <span />,
              articles: <a href={`/${language}/articles/`} />,
              videos: <a href={`/${language}/talks/`} />,
            }}
          />
        }
        biography={
          <>
            <p>{copy.hero.introExperience}</p>
            <p>{copy.hero.introTraining}</p>
            <p>
              <Trans
                i18n={translation}
                i18nKey="hero.introEmmett"
                components={{
                  emmett: (
                    <a href="https://event-driven-io.github.io/emmett/getting-started.html" />
                  ),
                }}
              />
            </p>
            <p>{copy.hero.introBlog}</p>
          </>
        }
        services={
          <>
            <a href={`/${language}/training/`}>{copy.hero.trainingCta}</a>
            <a href={`/${language}/consulting/`}>{copy.hero.consultingCta}</a>
          </>
        }
        servicesLabel={copy.hero.servicesLabel}
        portrait={<img src={portrait} alt="" width="772" height="722" />}
        articlesLabel={copy.hero.articlesCta}
        onArticlesClick={onArticlesClick}
      />
      <section id="hero-example-following" className="specimens">
        <h2>{copy.blog.latestTitle}</h2>
      </section>
    </>
  );
}
