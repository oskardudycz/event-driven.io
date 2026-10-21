import React from 'react';
import type { ImageData } from '../../types/image.ts';

// The serialized image shape is shared with the search index. Rendering and
// loading use native pictures; no Gatsby runtime is needed by Astro.
export default function ResponsiveImage({
  image,
  alt = '',
  sizes,
  eager = false,
  contain = false,
  fill = false,
}: {
  image: ImageData;
  alt?: string;
  sizes?: string;
  eager?: boolean;
  contain?: boolean;
  fill?: boolean;
}) {
  const fixed = image.layout === 'fixed';
  const mainStyle: React.CSSProperties = {
    position: 'absolute',
    transform: 'translateZ(0)',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: contain ? 'contain' : 'cover',
  };
  return (
    <div
      data-gatsby-image-wrapper=""
      className="gatsby-image-wrapper"
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...(fixed
          ? {
              display: 'block',
              width: image.width,
              height: image.height,
            }
          : { width: '100%', ...(fill ? { height: '100%' } : {}) }),
      }}
    >
      {!fixed && !fill && (
        <div
          aria-hidden="true"
          style={{ paddingTop: `${(100 * image.height) / image.width}%` }}
        />
      )}
      {image.placeholder?.fallback && (
        <img
          data-placeholder-image=""
          aria-hidden="true"
          alt=""
          src={image.placeholder.fallback}
          style={mainStyle}
        />
      )}
      <picture>
        {image.images.sources?.map((source) => (
          <source
            key={source.type}
            type={source.type}
            srcSet={source.srcSet}
            sizes={sizes || source.sizes}
          />
        ))}
        <img
          data-main-image=""
          alt={alt}
          src={image.images.fallback?.src}
          srcSet={image.images.fallback?.srcSet}
          sizes={sizes || image.images.fallback?.sizes}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          style={mainStyle}
        />
      </picture>
    </div>
  );
}
