import './src/theme/tokens.css';
import './src/theme/global.css';
import React from 'react';
import { DEFAULT_OPTIONS_BASE } from './src/i18n/settings.mjs';
import { PageContext } from './src/i18n/page-context';

// The plugin owns translation instances. This context keeps the site's
// editorial availability/canonical policy available to layout and Head users.
export const wrapPageElement = ({ element, props }) => (
  <PageContext.Provider value={{ ...DEFAULT_OPTIONS_BASE, ...props.pageContext }}>
    {element}
  </PageContext.Provider>
);
