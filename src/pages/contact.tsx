import React from 'react';
import { graphql } from 'gatsby';

import Article from '../components/Article/index.ts';
import Headline from '../components/Article/Headline.tsx';
import { createHead } from '../components/Seo/index.ts';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Article>
        <header>
          <Headline title={t('contact.title')} />
        </header>
        <p className="text-body leading-summary">
          {t('contact.intro')}{' '}
          <a
            href="https://calendly.com/oskar-dudycz/consulting"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent underline"
          >
            {t('contact.bookCall')}
          </a>
        </p>
      </Article>
    </React.Fragment>
  );
};

export default ContactPage;

export const query = graphql`
  query ContactQuery($language: String!) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
  }
`;

export const Head = createHead(({ t }) => ({
  title: t('contact.seoTitle'),
  description: t('contact.description'),
  schemaType: 'ContactPage',
}));
