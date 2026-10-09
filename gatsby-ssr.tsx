import type { GatsbySSR } from 'gatsby';
import React from 'react';
import { DEFAULT_OPTIONS_BASE } from './src/i18n/settings.ts';
import { PageContext } from './src/i18n/page-context.ts';
import FontLinks from './src/components/DocumentResources/FontLinks';

// Document resources are shared by every page, including the static 404.
// Keep them independent of SEO and emit each resource exactly once.
export const onRenderBody: GatsbySSR['onRenderBody'] = ({ pathname, setHeadComponents }) => {
  const language = pathname.startsWith('/pl/') ? 'pl' : 'en';
  setHeadComponents([<FontLinks key="document-fonts" language={language} />]);
};

// The plugin owns translation instances. This context keeps the site's
// editorial availability/canonical policy available to layout and Head users.
export const wrapPageElement: GatsbySSR['wrapPageElement'] = ({ element, props }) => (
  <PageContext.Provider value={{ ...DEFAULT_OPTIONS_BASE, lang: 'en', ...props.pageContext }}>
    {element}
  </PageContext.Provider>
);
