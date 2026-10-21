import React, { type AnchorHTMLAttributes, type ReactNode } from 'react';

// Presentational components receive routing through renderLink. Gatsby
// adapters pass the localized Link; any other host can use a plain anchor.
export type RenderLink = (
  _props: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string;
    'data-slug'?: string;
  },
) => ReactNode;

export const anchor: RenderLink = (props) => <a {...props} />;
