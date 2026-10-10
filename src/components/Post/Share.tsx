import type { ArticleNode } from '../../types/content.ts';
import * as styles from './Share.module.css';
import React from 'react';
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  FacebookShareCount,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
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
  const filter = (count: number) => (count > 0 ? count : '');

  return (
    <React.Fragment>
      <div className={`share ${styles.share}`}>
        <span className={`label ${styles.label}`}>SHARE</span>
        <div className={`links ${styles.links}`}>
          <TwitterShareButton
            url={url}
            title={title}
            aria-label="Twitter share"
          >
            <TwitterIcon round size={iconSize} />
          </TwitterShareButton>
          <FacebookShareButton url={url} aria-label="Facebook share">
            <FacebookIcon round size={iconSize} />
            <FacebookShareCount url={url}>
              {(count: number) => (
                <div className={'share-count'}>{filter(count)}</div>
              )}
            </FacebookShareCount>
          </FacebookShareButton>
          <LinkedinShareButton
            url={url}
            title={title}
            aria-label="LinkedIn share"
          >
            <LinkedinIcon round size={iconSize} />
          </LinkedinShareButton>
        </div>
      </div>
    </React.Fragment>
  );
};

export default PostShare;
