import React from 'react';
import { Link as GatsbyLink } from 'gatsby';
import { Link as LocalizedLink } from 'gatsby-plugin-react-i18next';

const Link = React.forwardRef(
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
      ...rest
    },
    ref,
  ) => {
    const native = /^(?:[a-z][a-z0-9+.-]*:|\/\/|[?#])/i.test(to);
    const download = rest.download !== undefined && rest.download !== false;
    if (native || download) return <a {...rest} ref={ref} href={to} />;

    const routing = { activeClassName, activeStyle, partiallyActive, state, replace, getProps };
    // Already localized destinations must not receive a second language prefix.
    if (/^\/(?:en|pl)(?:[/?#]|$)/i.test(to)) {
      return <GatsbyLink {...rest} {...routing} innerRef={ref} to={to} />;
    }
    return <LocalizedLink {...rest} {...routing} ref={ref} language={language} to={to} />;
  },
);

export { Link };
