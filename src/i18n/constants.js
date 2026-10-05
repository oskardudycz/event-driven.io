import translations from './i18n.json';
import { DEFAULT_OPTIONS_BASE } from './settings.mjs';

export const DEFAULT_OPTIONS = {
  ...DEFAULT_OPTIONS_BASE,
  i18nextConfig: {
    resources: translations,
    fallbackLng: DEFAULT_OPTIONS_BASE.defaultLanguage,
    interpolation: { escapeValue: false },
  },
};
