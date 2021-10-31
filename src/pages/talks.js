import PropTypes from "prop-types";
import React from "react";
import { graphql } from "gatsby";
import { ThemeContext } from "../layouts";
import Article from "../components/Article";
import Talks from "../components/Talks";
import Headline from "../components/Article/Headline";
import Seo from "../components/Seo";

const TalksPage = props => {
  const {
    data: {
      site: {
        siteMetadata: { facebook }
      },
      allTalksJson: {
        edges: talksNodes
      }
    }
  } = props;

  const talks = talksNodes.map(n => n.node);

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {theme => (
          <Article theme={theme}>
            <header>
              <Headline title="Talks" theme={theme} />
            </header>
            <Talks theme={theme} talks={talks}  />
          </Article>
        )}
      </ThemeContext.Consumer>

      <Seo facebook={facebook} />
    </React.Fragment>
  );
};

TalksPage.propTypes = {
  data: PropTypes.object.isRequired
};

export default TalksPage;

//eslint-disable-next-line no-undef
export const query = graphql`
  query TalksQuery {
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
    allTalksJson {
      edges {
        node {
          Date,
          Where,
          Title,
          Description,
          Link,
          Video,
          HideVideo,
          Language
        }
      }
    }
  }
`;
