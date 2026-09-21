import React from "react";
import PropTypes from "prop-types";

import Headline from "../Article/Headline";
import Bodytext from "../Article/Bodytext";
import Summary from "../Article/Summary";

const Page = (props) => {
  const {
    page: {
      html,
      frontmatter: { title, summary },
    },
    theme,
  } = props;

  return (
    <React.Fragment>
      <header>
        <Headline title={title} theme={theme} />
        <Summary theme={theme}>{summary}</Summary>
      </header>
      <Bodytext html={html} theme={theme} />
    </React.Fragment>
  );
};

Page.propTypes = {
  page: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default Page;
