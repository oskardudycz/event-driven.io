import type { ArticleNode } from '../../types/content.ts';
import React from 'react';
import {
  FacebookShareButton,
  LinkedinShareButton,
  XShareButton,
  FacebookLegacyIcon,
  XLegacyIcon,
  LinkedinLegacyIcon,
} from 'react-share';

import config from '../../config.ts';

const PostShare = (props: { post: ArticleNode }) => {
  const {
    post: {
      fields: { slug, langKey },
      frontmatter: { title },
    },
  } = props;

  const url = config.siteUrl + config.pathPrefix + '/' + langKey + slug;

  const iconSize = 36;

  return (
    <React.Fragment>
      <div className="share flex flex-col items-center justify-center sm:m-10 sm:flex-row">
        <span className="mx-[1em] mb-[1em] text-[1.2em] sm:mr-5 sm:mb-0 sm:ml-0">
          SHARE
        </span>
        <div className="flex flex-row">
          <XShareButton url={url} text={title} aria-label="X share">
            <XLegacyIcon round size={iconSize} />
          </XShareButton>
          <FacebookShareButton url={url} aria-label="Facebook share">
            <FacebookLegacyIcon round size={iconSize} />
          </FacebookShareButton>
          <LinkedinShareButton url={url} aria-label="LinkedIn share">
            <LinkedinLegacyIcon round size={iconSize} />
          </LinkedinShareButton>
        </div>
      </div>
    </React.Fragment>
  );
};

export default PostShare;
