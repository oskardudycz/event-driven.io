import * as styles from './contact.module.css';
import PropTypes from 'prop-types';
import React from 'react';
import { graphql } from 'gatsby';

import Article from '../components/Article';
import Headline from '../components/Article/Headline';
import { createHead } from '../components/Seo';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Article>
        <header>
          <Headline title={t('contact.title')} />
        </header>
        <p className={styles.elementP}>
          {t('contact.intro')}{' '}
          <a
            href="https://calendly.com/oskar-dudycz/consulting"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.elementA}
          >
            {t('contact.bookCall')}
          </a>
        </p>
      </Article>
    </React.Fragment>
  );
};

ContactPage.propTypes = {
  data: PropTypes.object.isRequired,
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
