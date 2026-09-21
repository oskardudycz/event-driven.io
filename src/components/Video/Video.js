import React, { useState } from "react";
import PropTypes from "prop-types";

const youtubeIdFrom = (value) => {
  if (!value) return "";
  if (/^[\w-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) return url.pathname.split("/").filter(Boolean)[0] || "";
    if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || "";
    return url.searchParams.get("v") || "";
  } catch (error) {
    return "";
  }
};

const Video = ({ videoSrcURL, videoTitle, playLabel = "Play video" }) => {
  const [playing, setPlaying] = useState(false);
  const embedId = youtubeIdFrom(videoSrcURL);

  if (!embedId) return null;

  return (
    <div className="video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${embedId}?autoplay=1`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={videoTitle}
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={playLabel}>
          <img
            src={`https://i.ytimg.com/vi/${embedId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            width="480"
            height="360"
          />
          <span aria-hidden="true">▶</span>
        </button>
      )}
      <style jsx>{`
        .video {
          background: #111;
          overflow: hidden;
          padding-top: 56.25%;
          position: relative;
        }
        .video iframe,
        .video button,
        .video img {
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
        }
        .video button {
          background: #111;
          border: 0;
          cursor: pointer;
          padding: 0;
        }
        .video img {
          object-fit: cover;
        }
        .video span {
          align-items: center;
          background: rgba(0, 0, 0, 0.75);
          border-radius: 50%;
          color: white;
          display: flex;
          font-size: 1.8rem;
          height: 4rem;
          justify-content: center;
          left: 50%;
          padding-left: 0.2rem;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 4rem;
        }
        .video button:hover span,
        .video button:focus span {
          background: #d00;
        }
      `}</style>
    </div>
  );
};

Video.propTypes = {
  videoSrcURL: PropTypes.string.isRequired,
  videoTitle: PropTypes.string.isRequired,
  playLabel: PropTypes.string,
};

export default Video;
