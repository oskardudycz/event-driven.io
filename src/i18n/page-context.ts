import React from 'react';
import { DEFAULT_OPTIONS_BASE } from './settings.ts';
import type { SitePageContext } from '../types/content.ts';

export const PageContext = React.createContext<SitePageContext>({
  ...DEFAULT_OPTIONS_BASE,
  lang: 'en',
});

export const usePageContext = () => React.useContext(PageContext);
