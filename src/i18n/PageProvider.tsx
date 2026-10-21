import React, { useState } from 'react';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { DEFAULT_OPTIONS } from './constants.ts';
import { PageContext } from './page-context.ts';
import type { SitePageContext } from '../types/content.ts';

export default function PageProvider({
  context,
  children,
}: React.PropsWithChildren<{ context: SitePageContext }>) {
  const [translations] = useState(() => {
    const instance = i18next.createInstance();
    void instance.init({
      ...DEFAULT_OPTIONS.i18nextConfig,
      lng: context.lang,
      initAsync: false,
    });
    return instance;
  });
  return (
    <I18nextProvider i18n={translations}>
      <PageContext.Provider value={context}>{children}</PageContext.Provider>
    </I18nextProvider>
  );
}
