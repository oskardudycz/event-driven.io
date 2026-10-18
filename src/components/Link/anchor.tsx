import React, { type ComponentProps, type ReactNode } from 'react';

// Presentational components receive routing through renderLink. Gatsby
// adapters pass the localized Link; any other host can use a plain anchor.
export type RenderLink = (
  _props: Pick<ComponentProps<'a'>, 'children' | 'className'> & {
    href: string;
  },
) => ReactNode;

export const anchor: RenderLink = (props) => <a {...props} />;
