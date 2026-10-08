import * as styles from './Comments.module.css';
import React from 'react';
import PropTypes from 'prop-types';
import FacebookProvider, { Comments as FBComments } from 'react-facebook';

import config from '../../../content/meta/config';

const Comments = (props) => {
  const { facebook, slug } = props;

  return (
    <React.Fragment>
      <div id="post-comments" className={`comments ${styles.comments}`}>
        <FacebookProvider appId={facebook.appId}>
          <FBComments href={`${config.siteUrl}${slug}`} width="100%" colorscheme="light" />
        </FacebookProvider>
      </div>
    </React.Fragment>
  );
};

Comments.propTypes = {
  slug: PropTypes.string.isRequired,
  facebook: PropTypes.object.isRequired,
};

export default Comments;
