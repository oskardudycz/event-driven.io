import React from 'react';

import Article from '../components/Article/index.ts';
import Headline from '../components/Article/Headline.tsx';

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
