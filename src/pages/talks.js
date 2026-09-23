import PropTypes from "prop-types";
import React from "react";
import { graphql } from "gatsby";
import { ThemeContext } from "../layouts";
import Article from "../components/Article";
import Headline from "../components/Article/Headline";
import Seo from "../components/Seo";
import VideoGallery from "../components/VideoGallery";
import { useTranslation } from "react-i18next";

const TalksPage = (props) => {
  const { t } = useTranslation();
  const {
    data: {
      site: {
        siteMetadata: { facebook },
      },
      allVideosJson: { edges: videoNodes },
    },
  } = props;

  const videos = videoNodes.map((n) => n.node);

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {(theme) => (
          <Article theme={theme}>
            <header>
              <Headline title={t("talks.title")} theme={theme} />
            </header>
            <section>
              <h2>{t("talks.videosTitle")}</h2>
              <p>{t("talks.videosIntro")}</p>
              <VideoGallery theme={theme} videos={videos} />
            </section>
          </Article>
        )}
      </ThemeContext.Consumer>

      <Seo
        facebook={facebook}
        title={t("talks.title")}
        description={t("talks.videosIntro")}
        schemaType="CollectionPage"
      />
    </React.Fragment>
  );
};

TalksPage.propTypes = {
  data: PropTypes.object.isRequired,
};

export default TalksPage;

// eslint-disable-next-line no-undef
export const query = graphql`
  query TalksQuery {
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
    allVideosJson(sort: { Order: ASC }) {
      edges {
        node {
          Order
          VideoId
          Title
          Channel
          Duration
          Language
        }
      }
    }
  }
`;
