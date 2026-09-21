import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Video from "../Video";

const VideoGallery = ({ videos, theme }) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ul className="videoGrid">
        {videos.map((video) => {
          const url = `https://www.youtube.com/watch?v=${video.VideoId}`;
          return (
            <li key={video.VideoId}>
              <Video
                videoSrcURL={video.VideoId}
                videoTitle={video.Title}
                playLabel={t("talks.play", { title: video.Title })}
              />
              <div className="videoDetails">
                <h3>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {video.Title}
                  </a>
                </h3>
                <p>
                  {video.Channel} · {video.Duration} · {video.Language}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <style jsx>{`
        .videoGrid {
          display: grid;
          gap: ${theme.space.l};
          list-style: none;
          margin: ${theme.space.l} 0;
          padding: 0;
        }
        .videoGrid li {
          border: 1px solid ${theme.line.color};
          border-radius: ${theme.size.radius.default};
          overflow: hidden;
        }
        .videoDetails {
          padding: ${theme.space.m};
        }
        .videoDetails h3 {
          font-size: ${theme.font.size.m};
          line-height: ${theme.font.lineHeight.m};
          margin: 0 0 ${theme.space.s};
        }
        .videoDetails h3 a {
          color: ${theme.text.color.primary};
        }
        .videoDetails p {
          font-size: ${theme.font.size.xs};
          line-height: ${theme.font.lineHeight.l};
        }
        @from-width tablet {
          .videoGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </React.Fragment>
  );
};

VideoGallery.propTypes = {
  videos: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
};

export default VideoGallery;
