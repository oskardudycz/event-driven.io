import type { VideoDetails } from '../../types/content.ts';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Video from '../Video/index.ts';

const VideoGallery = ({ videos }: { videos: VideoDetails[] }) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ul className="videoGrid my-section grid list-none gap-section p-0 min-[600px]:grid-cols-2">
        {videos.map((video) => {
          const url = `https://www.youtube.com/watch?v=${video.VideoId}`;
          return (
            <li
              key={video.VideoId}
              className="overflow-hidden rounded-panel border border-solid border-line"
            >
              <Video
                videoSrcURL={video.VideoId}
                videoTitle={video.Title}
                playLabel={t('talks.play', { title: video.Title })}
              />
              <div className="videoDetails p-gutter">
                <h3 className="mb-2.5 text-summary leading-[var(--line-height-card)]">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink"
                  >
                    {video.Title}
                  </a>
                </h3>
                <p className="text-caption">
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

export default VideoGallery;
