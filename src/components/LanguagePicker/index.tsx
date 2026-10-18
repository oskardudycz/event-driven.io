import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '../Link/index.tsx';
import { usePageContext } from '../../i18n/page-context.ts';

const LanguagePicker = () => {
  const { t } = useTranslation();
  const {
    slug,
    originalPath,
    supportedLanguages,
    availableLanguages = supportedLanguages,
    lang,
  } = usePageContext();
  const pagePath = slug || originalPath || '/';
  const languagesToSwitch = availableLanguages.filter(
    (language) => language !== lang,
  );

  return (
    <div className="flex shrink-0">
      {languagesToSwitch.map((supportedLang) => (
        <Link
          aria-label={t(`language.switchTo.${supportedLang}`)}
          className="flex min-h-11 min-w-11 items-center justify-center"
          onClick={() =>
            localStorage.setItem('last-selected-lang', supportedLang)
          }
          key={supportedLang}
          to={pagePath}
          language={supportedLang}
          hrefLang={supportedLang}
        >
          {supportedLang === 'en' ? '🇬🇧' : '🇵🇱'}
        </Link>
      ))}
    </div>
  );
};

export default LanguagePicker;
