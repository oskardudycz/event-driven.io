import React from 'react';
import { Link as GatsbyLink } from 'gatsby';
import { usePageContext } from '../../i18n/page-context';

const LanguagePicker = () => {
  const { slug, supportedLanguages, lang } = usePageContext();
  const languagesToSwitch = supportedLanguages.filter(l => l != lang);
  // const selectedLanguage = localStorage.getItem("last-selected-lang", lang);

  // if(selectedLanguage && selectedLanguage != lang) {
  //   return (
  //     <Redirect to={`/${selectedLanguage}${slug}`} />
  //   );
  // }

  return (
    <React.Fragment>
      <div className="language-selector-container">
        {languagesToSwitch.map(supportedLang => (
            <GatsbyLink
              aria-label={`Change language to ${supportedLang}`}
              className="langSelector"
              onClick={() => localStorage.setItem("last-selected-lang", lang)}
              key={supportedLang}
              to={`/${supportedLang}${slug}`}
            >
              {
              (supportedLang === "en") ? "🇬🇧" : "🇵🇱"}
            </GatsbyLink> 
        ))}
      </div>

    {/* --- STYLES --- */}
    <style jsx>{`
      .langSelector {
        margin-right: 10px
      }
    `}</style>
    </React.Fragment>
  );
};

export default LanguagePicker;