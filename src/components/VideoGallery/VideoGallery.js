import * as styles from './VideoGallery.module.css';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Video from '../Video';

const VideoGallery = ({ videos }) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ul className={`videoGrid ${styles.videoGrid}`}>
        {videos.map((video) => {
          const url = `https://www.youtube.com/watch?v=${video.VideoId}`;
          return (
            <li key={video.VideoId} className={styles.elementLi}>
              <Video
                videoSrcURL={video.VideoId}
                videoTitle={video.Title}
                playLabel={t('talks.play', { title: video.Title })}
              />
              <div className={`videoDetails ${styles.videoDetails}`}>
                <h3 className={styles.elementH3}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.elementA}
                  >
                    {video.Title}
                  </a>
                </h3>
                <p className={styles.elementP}>
                  {video.Channel} · {video.Duration} · {video.Language}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </React.Fragment>
  );
};

VideoGallery.propTypes = {
  videos: PropTypes.array.isRequired,
};

export default VideoGallery;
