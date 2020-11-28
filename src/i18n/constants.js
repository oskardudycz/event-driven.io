const defaultLanguage = 'en';
const translations = require('./i18n.json');
const supportedLanguages = ["en", "pl"]


export const DEFAULT_OPTIONS = {
  // the locales that your gatsby app supports
  supportedLanguages: supportedLanguages,

  // the default language for your gatsby app
  defaultLanguage: defaultLanguage,

  // the domain (url) in which your web app is hosted in
  siteUrl: process.env.URL || 'localhost:8080',

  // the (optional) path in which your web app redirects in case of a 404
  notFoundPage: '/404/',

  // a list of paths, whose pages should not be processed by this plugin (i.e. delegate to whatever
  // gatsby would do by default)
  excludedPages: [],

  // Whether to delete the original pages at the original URLs or keep them
  deleteOriginalPages: true,

  i18nextConfig: {
    resources: translations,
    fallbackLng: defaultLanguage,
    interpolation: {
      escapeValue: false, // react already protects us from xss
    },
  },
};
