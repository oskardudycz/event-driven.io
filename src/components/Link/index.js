import React from 'react';
import { Link as GatsbyLink } from 'gatsby';
import { Link as LocalizedLink } from 'gatsby-plugin-react-i18next';

const Link = React.forwardRef(({ to, ...rest }, ref) => {
  // Explicit language routes and external URLs are already complete.
  const complete = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/(?:en|pl)(?:\/|$))/i.test(to);
  if (complete) return <GatsbyLink {...rest} ref={ref} to={to} />;
  return <LocalizedLink {...rest} ref={ref} to={to} />;
});

export { Link };
