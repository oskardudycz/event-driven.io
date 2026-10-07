import { graphql } from 'gatsby';
import React from 'react';

import Article from '../components/Article';
import Headline from '../components/Article/Headline';
import { Link } from '../components/Link';
import { usePageContext } from '../i18n/page-context';
import styles from './404.module.css';

const NotFoundPage = () => {
  const { lang = 'en' } = usePageContext();
  const polish = lang === 'pl';
  return (
    <Article>
      <section className={styles.recovery}>
        <p className={styles.code}>404</p>
        <Headline title={polish ? 'Ups! Nie znaleziono strony.' : 'Oops! Page not found.'} />
        <p>
          {polish
            ? 'Ten adres nie prowadzi do żadnej strony. Być może link jest nieaktualny lub w adresie jest literówka.'
            : 'There’s no page at this address. The link may be out of date, or there may be a typo in the URL.'}
        </p>
        <nav aria-label={polish ? 'Dokąd dalej?' : 'Where next?'} className={styles.links}>
          <Link to={`/${lang}/`} className={styles.primary}>
            {polish ? 'Wróć na stronę główną' : 'Back to home'}
          </Link>
          <Link to={`/${lang}/articles/`}>
            {polish ? 'Przeglądaj artykuły' : 'Browse articles'}
          </Link>
          <Link to={`/${lang}/search/`}>{polish ? 'Szukaj na blogu' : 'Search the blog'}</Link>
        </nav>
      </section>
    </Article>
  );
};

export default NotFoundPage;

export const Head = ({ pageContext }) => (
  <React.Fragment>
    <html lang={pageContext.lang || 'en'} />
    <title>
      {pageContext.lang === 'pl' ? 'Nie znaleziono strony' : 'Page not found'} - Event-Driven.io
    </title>
    <meta name="robots" content="noindex, nofollow" />
  </React.Fragment>
);

export const query = graphql`
  query ($language: String!) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
  }
`;
