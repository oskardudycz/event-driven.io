import config from '../../content/meta/config.js';

export const DEFAULT_OPTIONS_BASE = {
  supportedLanguages: ['en', 'pl'],
  defaultLanguage: 'en',
  siteUrl: config.siteUrl,
  notFoundPage: '/404/',
  excludedPages: [],
  deleteOriginalPages: true,
};
