import React from 'react';
import { withPrefix } from 'gatsby';

export default function FontLinks({ language }: { language: string }) {
  const subsets = language === 'pl' ? ['latin', 'latin-ext'] : ['latin'];
  return (
    <>
      {subsets.flatMap((subset) =>
        [400, 600].map((weight) => (
          <link
            key={`${subset}-${weight}`}
            id={
              subset === 'latin'
                ? `font-preload-${weight}`
                : `font-preload-${subset}-${weight}`
            }
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href={withPrefix(
              `/fonts/open-sans/files/open-sans-${subset}-${weight}.woff2`,
            )}
          />
        )),
      )}
      <link
        rel="stylesheet"
        href={withPrefix('/fonts/open-sans/index.css')}
        id="site-fonts"
      />
    </>
  );
}
