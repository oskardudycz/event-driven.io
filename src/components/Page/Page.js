import React from 'react';
import PropTypes from 'prop-types';

import Headline from '../Article/Headline';
import Bodytext from '../Article/Bodytext';
import Summary from '../Article/Summary';

const Page = (props) => {
  const {
    page: {
      html,
      frontmatter: { title, summary },
    },
  } = props;

  return (
    <React.Fragment>
      <header>
        <Headline title={title} />
        <Summary>{summary}</Summary>
      </header>
      <Bodytext html={html} />
    </React.Fragment>
  );
};

Page.propTypes = {
  page: PropTypes.object.isRequired,
};

export default Page;
