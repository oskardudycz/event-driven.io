import React from 'react';
import { Link as GatsbyLink, type GatsbyLinkProps } from 'gatsby';
import { Link as PluginLink } from 'gatsby-plugin-react-i18next';

export type LinkProps = Omit<
  GatsbyLinkProps<unknown>,
  'ref' | 'innerRef' | 'onClick'
> & {
  language?: string | undefined;
  onClick?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
};
// The plugin's published Pick type marks optional React event props as required.
// Keep the adapter's public Gatsby anchor contract at this integration boundary.
const LocalizedLink = PluginLink as React.ForwardRefExoticComponent<
  LinkProps & React.RefAttributes<HTMLAnchorElement>
>;
// Gatsby forwards ref to its anchor, although its published type still describes
// the historical class component. Keep that runtime contract at this boundary.
const InternalLink = GatsbyLink as React.ComponentType<
  LinkProps & React.RefAttributes<HTMLAnchorElement>
>;
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      to,
      language,
      activeClassName,
      activeStyle,
      partiallyActive,
      state,
      replace,
      getProps,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const native = /^(?:[a-z][a-z0-9+.-]*:|\/\/|[?#])/i.test(to);
    const download = rest.download !== undefined && rest.download !== false;
    if (native || download)
      return <a {...rest} onClick={onClick} ref={ref} href={to} />;

    const routing = {
      ...(activeClassName !== undefined ? { activeClassName } : {}),
      ...(activeStyle !== undefined ? { activeStyle } : {}),
      ...(partiallyActive !== undefined ? { partiallyActive } : {}),
      ...(state !== undefined ? { state } : {}),
      ...(replace !== undefined ? { replace } : {}),
      ...(getProps !== undefined ? { getProps } : {}),
      ...(onClick !== undefined ? { onClick } : {}),
    };
    // Already localized destinations must not receive a second language prefix.
    if (/^\/(?:en|pl)(?:[/?#]|$)/i.test(to)) {
      return <InternalLink {...rest} {...routing} ref={ref} to={to} />;
    }
    return (
      <LocalizedLink
        {...rest}
        {...routing}
        ref={ref}
        language={language}
        to={to}
      />
    );
  },
);

export { Link };
