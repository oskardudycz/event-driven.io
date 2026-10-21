import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type { RenderLink } from '../Link/anchor.tsx';

import HeroView from './HeroView.tsx';

export default function HeroContent({
  scrollToContent,
  renderLink,
  portrait,
}: {
  scrollToContent: () => void;
  renderLink: RenderLink;
  portrait: React.ReactNode;
}) {
  const { t } = useTranslation();
  const HostLink = ({ href = '', ...props }: React.ComponentProps<'a'>) =>
    renderLink({ href, ...props });
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
            formats: <span />,
            articles: <HostLink href="/articles/" />,
            videos: <HostLink href="/talks/" />,
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
          {renderLink({ href: '/training/', children: t('hero.trainingCta') })}
          {renderLink({
            href: '/consulting/',
            children: t('hero.consultingCta'),
          })}
        </>
      }
      servicesLabel={t('hero.servicesLabel')}
      portrait={portrait}
      articlesLabel={t('hero.articlesCta')}
      onArticlesClick={scrollToContent}
    />
  );
}
