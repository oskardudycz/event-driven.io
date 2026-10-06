import PropTypes from 'prop-types';
import React from 'react';
import { graphql } from 'gatsby';

import Article from '../components/Article';
import Headline from '../components/Article/Headline';
import { createHead } from '../components/Seo';
import VideoGallery from '../components/VideoGallery';
import { useTranslation } from 'react-i18next';

const TalksPage = (props) => {
  const { t } = useTranslation();
  const {
    data: {
      allVideosJson: { edges: videoNodes },
    },
  } = props;

  const videos = videoNodes.map((n) => n.node);

  return (
    <React.Fragment>
      <Article>
        <header>
          <Headline title={t('talks.title')} />
        </header>
        <section>
          <h2>{t('talks.videosTitle')}</h2>
          <p>{t('talks.videosIntro')}</p>
          <VideoGallery videos={videos} />
        </section>
      </Article>
    </React.Fragment>
  );
};

TalksPage.propTypes = {
  data: PropTypes.object.isRequired,
};

export default TalksPage;

export const query = graphql`
  query TalksQuery($language: String!) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
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

export const Head = createHead(({ t }) => ({
  title: t('talks.title'),
  description: t('talks.videosIntro'),
  schemaType: 'CollectionPage',
}));
