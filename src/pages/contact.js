import PropTypes from 'prop-types';
import React from 'react';
import { graphql } from 'gatsby';
import { ThemeContext } from '../layouts';
import Article from '../components/Article';
import Headline from '../components/Article/Headline';
import { createHead } from '../components/Seo';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {(theme) => (
          <Article theme={theme}>
            <header>
              <Headline title={t('contact.title')} theme={theme} />
            </header>
            <p>
              {t('contact.intro')}{' '}
              <a
                href="https://calendly.com/oskar-dudycz/consulting"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('contact.bookCall')}
              </a>
            </p>
            <style jsx>{`
              p {
                font-size: ${theme.font.size.s};
                line-height: ${theme.font.lineHeight.l};
              }
              a {
                color: ${theme.color.brand.primary};
                font-weight: ${theme.font.weight.bold};
                text-decoration: underline;
              }
            `}</style>
          </Article>
        )}
      </ThemeContext.Consumer>
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
