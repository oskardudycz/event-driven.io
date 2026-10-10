import { createContext } from 'react';

// Keep shared state independent of the layout's component and stylesheet imports.
export const ScreenWidthContext = createContext(0);
export const FontLoadedContext = createContext(false);
