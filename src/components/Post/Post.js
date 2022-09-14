import React from "react";
import PropTypes from "prop-types";
import "prismjs/themes/prism-okaidia.css";

import asyncComponent from "../AsyncComponent";
import Headline from "../Article/Headline";
import Bodytext from "../Article/Bodytext";
import Meta from "./Meta";
import Author from "./Author";
import Substack from "./Substack";
import NextPrev from "./NextPrev";
import { DiscussionEmbed } from "disqus-react";

const Share = asyncComponent(() =>
  import("./Share")
    .then(module => {
      return module.default;
    })
    .catch(error => {})
);

const Post = props => {
  const {
    post,
    post: {
      html,
      fields: { prefix, slug },
      frontmatter: { title, author, category, disqusId }
    },
    authornote,
    next: nextPost,
    prev: prevPost,
    theme
  } = props;

  const disqusConfig = {
    shortname: process.env.GATSBY_DISQUS_NAME,
    config: { identifier: disqusId || slug, title }
  };

  return (
    <React.Fragment>
      <header>
        <Headline title={title} theme={theme} />
        <Meta prefix={prefix} author={author} category={category} theme={theme} />
      </header>
      <Bodytext html={html} theme={theme} />
      <footer>
        <Substack />
        <Share post={post} theme={theme} />
        <Author note={authornote} theme={theme} />
        <NextPrev next={nextPost} prev={prevPost} theme={theme} />
        <DiscussionEmbed {...disqusConfig} />
      </footer>
    </React.Fragment>
  );
};

Post.propTypes = {
  post: PropTypes.object.isRequired,
  authornote: PropTypes.string.isRequired,
  facebook: PropTypes.object.isRequired,
  next: PropTypes.object,
  prev: PropTypes.object,
  theme: PropTypes.object.isRequired
};

export default Post;
