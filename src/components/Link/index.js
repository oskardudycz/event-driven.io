/* eslint-disable react/display-name */
import React from 'react';
import { Link as GatsbyLink } from 'gatsby';
import { usePageContext } from '../../i18n/page-context';

const Link = React.forwardRef(({ to, language, ...rest }, ref) => {
  const { lang } = usePageContext();
  const targetLanguage = language || lang;

  const linkTo = to.startsWith("http")
    ? to
    : targetLanguage
    ? `/${targetLanguage}${to}`
    : `/${to}`;

  return <GatsbyLink {...rest} ref={ref} to={linkTo} />;
});

export { Link };
