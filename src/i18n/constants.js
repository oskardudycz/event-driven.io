import en from './locales/en/translation.json';
import pl from './locales/pl/translation.json';

const translations = { en: { translation: en }, pl: { translation: pl } };
import { DEFAULT_OPTIONS_BASE } from './settings.mjs';

export const DEFAULT_OPTIONS = {
  ...DEFAULT_OPTIONS_BASE,
  i18nextConfig: {
    resources: translations,
    fallbackLng: DEFAULT_OPTIONS_BASE.defaultLanguage,
    interpolation: { escapeValue: false },
  },
};
