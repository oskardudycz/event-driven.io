import React, { type AnchorHTMLAttributes, type ReactNode } from 'react';
import { localizedHref } from '../../content/links.ts';

// Presentational components receive routing through renderLink.
export type RenderLink = (
  _props: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string;
    'data-slug'?: string;
  },
) => ReactNode;

export const anchor: RenderLink = (props) => <a {...props} />;

export function localizedAnchor(
  language: string,
  currentPath: string,
): RenderLink {
  return ({ href, ...attributes }) => {
    const destination = localizedHref(href, language);
    return (
      <a
        {...attributes}
        href={destination}
        aria-current={
          attributes['aria-current'] ??
          (destination === currentPath ? 'page' : undefined)
        }
      />
    );
  };
}
