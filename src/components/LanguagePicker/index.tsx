import React from 'react';
import { useTranslation } from 'react-i18next';
import { anchor, type RenderLink } from '../Link/anchor.tsx';
import { usePageContext } from '../../i18n/page-context.ts';

const LanguagePicker = ({
  renderLink = anchor,
}: {
  renderLink?: RenderLink;
}) => {
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
        <React.Fragment key={supportedLang}>
          {renderLink({
            href: `/${supportedLang}${pagePath}`,
            'aria-label': t(`language.switchTo.${supportedLang}`),
            className: 'flex min-h-11 min-w-11 items-center justify-center',
            onClick: () =>
              localStorage.setItem('last-selected-lang', supportedLang),
            hrefLang: supportedLang,
            children: supportedLang === 'en' ? '🇬🇧' : '🇵🇱',
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default LanguagePicker;
