import * as styles from './Video.module.css';
import React, { useState } from 'react';

const youtubeIdFrom = (value: string) => {
  if (!value) return '';
  if (/^[\w-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);
    if (url.hostname.includes('youtu.be'))
      return url.pathname.split('/').filter(Boolean)[0] || '';
    if (url.pathname.startsWith('/embed/'))
      return url.pathname.split('/')[2] || '';
    return url.searchParams.get('v') || '';
  } catch {
    return '';
  }
};

const Video = ({
  videoSrcURL,
  videoTitle,
  playLabel = 'Play video',
}: {
  videoSrcURL: string;
  videoTitle: string;
  playLabel?: string;
}) => {
  const [playing, setPlaying] = useState(false);
  const embedId = youtubeIdFrom(videoSrcURL);

  if (!embedId) return null;

  return (
    <div className={`video ${styles.video}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${embedId}?autoplay=1`}
          referrerPolicy="strict-origin-when-cross-origin"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={videoTitle}
          className={styles.elementIframe}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={playLabel}
          className={styles.elementButton}
        >
          <img
            src={`https://i.ytimg.com/vi/${embedId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            width="480"
            height="360"
            className={styles.elementImg}
          />
          <span aria-hidden="true" className={styles.elementSpan}>
            ▶
          </span>
        </button>
      )}
    </div>
  );
};

export default Video;
