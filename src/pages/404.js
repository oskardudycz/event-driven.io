import React from 'react';
import { withPrefix } from 'gatsby';

const NotFoundPage = () => (
  <React.Fragment>
    <div>
      <h1>NOT FOUND</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </div>
  </React.Fragment>
);

export default NotFoundPage;

export const Head = ({ pageContext }) => (
  <React.Fragment>
    <html lang={pageContext.lang || 'en'} />
    <title>Not found - Event-Driven.io</title>
    <meta name="robots" content="noindex, nofollow" />
    <link rel="stylesheet" href={withPrefix('/fonts/open-sans/index.css')} />
  </React.Fragment>
);
