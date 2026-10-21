import React from 'react';
import { usePageContext } from '../../i18n/page-context.ts';
import { localizedHref } from '../../content/links.ts';
export type LinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'download'
> & {
  to: string;
  language?: string | undefined;
  download?: string | boolean | undefined;
};
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, language, download, ...attributes }, ref) => {
    const context = usePageContext();
    const href =
      download !== undefined && download !== false
        ? to
        : localizedHref(to, language || context.lang);
    const current = `/${context.lang}${context.originalPath || '/'}`;
    return (
      <a
        {...attributes}
        href={href}
        download={download}
        ref={ref}
        aria-current={
          attributes['aria-current'] || (href === current ? 'page' : undefined)
        }
      />
    );
  },
);
