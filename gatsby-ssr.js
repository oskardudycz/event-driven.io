import React from 'react';
import i18next from 'i18next';
import merge from 'lodash.merge';
import { Helmet } from 'react-helmet';
import { I18nextProvider } from 'react-i18next';
import { DEFAULT_OPTIONS } from './src/i18n/constants';
import { PageContext } from './src/i18n/page-context';

export const wrapRootElement = ({ element }, pluginOptions) => {
  const { i18nextConfig, defaultLanguage } = merge({}, DEFAULT_OPTIONS, pluginOptions);
  if (!i18nextConfig.resources) {
    throw new Error(
      'You must specify where to load translations from through the `resources` field of `i18nextConfig`'
    );
  }
  i18nextConfig.fallbackLng = defaultLanguage;

  i18next.init(i18nextConfig);

  return <I18nextProvider i18n={i18next}>{element}</I18nextProvider>;
};

/**
 * Wrap all pages with a Translation provider and set the language on SSR time
 */
export const wrapPageElement = ({ element, props }, pluginOptions) => {
  const { excludedPages, supportedLanguages, siteUrl, defaultLanguage, deleteOriginalPages } = {
    ...DEFAULT_OPTIONS,
    ...pluginOptions,
  };

  // The fallbacks are for pages that are non-localized. The only pages that are non localized are
  // the original ones which are only there if `deleteOriginalPages` option is `false`
  const lang = props.pageContext.lang || defaultLanguage;
  const originalPath = props.pageContext.originalPath || props.location.pathname;

  if (excludedPages.includes(props.location.pathname)) {
    return element;
  }

  const canonicalUrl = deleteOriginalPages
    ? `${siteUrl}/${lang}${originalPath}`
    : `${siteUrl}${originalPath}`;

  const languageFallbackUrl = `${siteUrl}${originalPath}`;

  const contextValue = merge({}, props.pageContext, {
    supportedLanguages,
    defaultLanguage,
    siteUrl,
  });

  // Can't wrap this in a React effect, since it won't work correctly. This changes
  // the context value (which causes React to re-render the page component).
  // Endless re-rendering from this circular dependency is prevented by the fact that Gatsby
  // doesn't call `wrapPageElement` more than once. If we didn't use Gatsby, `react-i18next` has
  // a helpful `useSSR` hook which uses an `isInitialized` boolean check to avoid calling the
  // `i18n.changeLanguage` more than once (i.e. not causing an endless circular dependency). See
  // more here:
  // https://github.com/i18next/react-i18next/blob/master/src/useSSR.js
  // -----
  // We know that this props will exist here because of @3nvi/gatsby-plugin-intl. Again, the
  // fallback has to do with the handling of non-localized pages (i.e. the original ones),
  // which exist only if `deleteOriginalPages` is `false`
  i18next.changeLanguage(props.pageContext.lang || "ch");

  return (
    <React.Fragment>
      <Helmet htmlAttributes={{ lang }}>
        <meta property="og:locale" content={lang} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" href={languageFallbackUrl} hrefLang="x-default" />
        {supportedLanguages.map(supportedLang => (
          <link
            rel="alternate"
            href={`${siteUrl}/${supportedLang}${originalPath}`}
            hrefLang={supportedLang}
            key={supportedLang}
          />
        ))}
        {/* <script id='pixel-script-poptin' src='https://cdn.popt.in/pixel.js?id=ef33d55fc38ef' async='true'></script>  */}
      </Helmet>
      <PageContext.Provider value={contextValue}>{element}</PageContext.Provider>
    </React.Fragment>
  );
};

