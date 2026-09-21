import React from "react";
import Helmet from "react-helmet";

const NotFoundPage = () => (
  <React.Fragment>
    <Helmet>
      <title>Not found - Event-Driven.io</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <div>
      <h1>NOT FOUND</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </div>
  </React.Fragment>
);

export default NotFoundPage;
