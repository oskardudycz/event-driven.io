import React from 'react';

import Article from '../components/Article/index.ts';
import Headline from '../components/Article/Headline.tsx';

import VideoGallery from '../components/VideoGallery/index.ts';
import { useTranslation } from 'react-i18next';
import videoData from '../../data/videos.json';

const videos = videoData.toSorted((left, right) => left.Order - right.Order);

const TalksPage = () => {
  const { t } = useTranslation();

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

export default TalksPage;
