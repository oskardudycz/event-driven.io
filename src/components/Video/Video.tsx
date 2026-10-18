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
    <div className="relative overflow-hidden bg-[#111] pt-[56.25%]">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${embedId}?autoplay=1`}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={videoTitle}
          className="absolute top-0 left-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={playLabel}
          className="group absolute top-0 left-0 size-full cursor-pointer border-0 bg-[#111] p-0"
        >
          <img
            src={`https://i.ytimg.com/vi/${embedId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            width="480"
            height="360"
            className="absolute top-0 left-0 size-full object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 flex size-16 items-center justify-center rounded-[50%] bg-black/75 pl-[0.2rem] text-[1.8rem] text-white [transform:translate(-50%,-50%)] group-hover:bg-[#d00] group-focus:bg-[#d00]"
          >
            ▶
          </span>
        </button>
      )}
    </div>
  );
};

export default Video;
