import styles from './Share.module.css';
import React from 'react';
import PropTypes from 'prop-types';
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  FacebookShareCount,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from 'react-share';

import config from '../../../content/meta/config';

const PostShare = (props) => {
  const {
    post: {
      fields: { slug, langKey },
      frontmatter: { title },
      excerpt,
    },
  } = props;

  const url = config.siteUrl + config.pathPrefix + '/' + langKey + slug;

  const iconSize = 36;
  const filter = (count) => (count > 0 ? count : '');

  return (
    <React.Fragment>
      <div className={`share ${styles['share']}`}>
        <span className={`label ${styles['label']}`}>SHARE</span>
        <div className={`links ${styles['links']}`}>
          <TwitterShareButton
            url={url}
            title={title}
            additionalProps={{
              'aria-label': 'Twitter share',
            }}
          >
            <TwitterIcon round size={iconSize} />
          </TwitterShareButton>
          <FacebookShareButton
            url={url}
            quote={`${title} - ${excerpt}`}
            additionalProps={{
              'aria-label': 'Facebook share',
            }}
          >
            <FacebookIcon round size={iconSize} />
            <FacebookShareCount url={url}>
              {(count) => <div className={'share-count'}>{filter(count)}</div>}
            </FacebookShareCount>
          </FacebookShareButton>
          <LinkedinShareButton
            url={url}
            title={title}
            description={excerpt}
            additionalProps={{
              'aria-label': 'LinkedIn share',
            }}
          >
            <LinkedinIcon round size={iconSize} />
          </LinkedinShareButton>
        </div>
      </div>
    </React.Fragment>
  );
};

PostShare.propTypes = {
  post: PropTypes.object.isRequired,
};

export default PostShare;
