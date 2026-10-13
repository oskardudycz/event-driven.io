import type { ArticleNode } from '../../types/content.ts';
import * as styles from './Share.module.css';
import React from 'react';
import {
  FacebookShareButton,
  LinkedinShareButton,
  XShareButton,
  FacebookLegacyIcon,
  XLegacyIcon,
  LinkedinLegacyIcon,
} from 'react-share';

import config from '../../../content/meta/config.ts';

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
      <div className={`share ${styles.share}`}>
        <span className={`label ${styles.label}`}>SHARE</span>
        <div className={`links ${styles.links}`}>
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
