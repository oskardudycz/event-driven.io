import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import config from "../../../content/meta/config";
import { useTranslation } from 'react-i18next';
import { usePageContext } from '../../i18n/page-context';

const Seo = props => {
  const { t } = useTranslation();

  const { lang, originalPath, supportedLanguages } = usePageContext();

  const { data, facebook, meta } = props;
  const postTitle = ((data || {}).frontmatter || {}).title;
  const postDescription = ((data || {}).frontmatter || {}).description;
  const postCover = ((data || {}).frontmatter || {}).cover;
  const postSlug = ((data || {}).fields || {}).slug;

  const title = postTitle ? `${postTitle} - ${config.shortSiteTitle}` : config.siteTitle;
  const description = postDescription ? postDescription : (config.siteDescription || t('siteMetadata.description'));
  const image = postCover ? postCover : config.siteImage;
  const url = config.siteUrl + config.pathPrefix + postSlug;
  const host = config.siteUrl;

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      // titleTemplate={`%s | ${t('siteMetadata.title')}`}
      meta={[

        {
          name: `description`,
          content: description,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:image`,
          content: image,
        },
        {
          property: `og:type`,
          content: 'website',
        },
        {
          property: `og:description`,
          content: description,
        },
        {
          property: `og:locale`,
          content: lang,
        },
        {
          property: `fb:app_id`,
          content: facebook.appId,
        },
        {
          property: `twitter:card`,
          content: 'summary',
        },
        {
          property: `twitter:creator`,
          content: config.authorTwitterAccount ? config.authorTwitterAccount : "",
        }
      ].concat(meta || [])}
      link={[
        {
          rel: 'canonical',
          href: `${host}/${lang}${originalPath}`,
        },
        {
          rel: 'alternate',
          hrefLang: 'x-default',
          href: `${host}${originalPath}`,
        },
        ...supportedLanguages.map(supportedLang => ({
          rel: 'alternate',
          hrefLang: supportedLang,
          href: `${host}/${supportedLang}${originalPath}`,
        })),
      ]}
    />
  );
};

Seo.propTypes = {
  data: PropTypes.object,
  facebook: PropTypes.object.isRequired
};

export default Seo;
