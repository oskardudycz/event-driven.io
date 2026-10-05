import React from 'react';
import { Link } from 'gatsby-plugin-react-i18next';
import { usePageContext } from '../../i18n/page-context';

const LanguagePicker = () => {
  const {
    slug,
    originalPath,
    supportedLanguages,
    availableLanguages = supportedLanguages,
    lang,
  } = usePageContext();
  const pagePath = slug || originalPath || '/';
  const languagesToSwitch = availableLanguages.filter((language) => language !== lang);

  return (
    <React.Fragment>
      <div className="language-selector-container">
        {languagesToSwitch.map((supportedLang) => (
          <Link
            aria-label={`Change language to ${supportedLang}`}
            className="langSelector"
            onClick={() => localStorage.setItem('last-selected-lang', supportedLang)}
            key={supportedLang}
            to={pagePath}
            language={supportedLang}
          >
            {supportedLang === 'en' ? '🇬🇧' : '🇵🇱'}
          </Link>
        ))}
      </div>

      {/* --- STYLES --- */}
      <style jsx>{`
        .langSelector {
          margin-right: 10px;
        }
      `}</style>
    </React.Fragment>
  );
};

export default LanguagePicker;
