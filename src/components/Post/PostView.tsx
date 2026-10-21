import 'prismjs/themes/prism-okaidia.css';
import type {
  ArticleNode,
  ArticleEdge,
  GuideStep,
  TagLink,
} from '../../types/content.ts';
import React from 'react';
import { anchor, type RenderLink } from '../Link/anchor.tsx';

import Share from './Share.tsx';
import Headline from '../Article/Headline.tsx';
import Bodytext from '../Article/Bodytext.tsx';
import Meta from './Meta.tsx';
import AuthorView from './AuthorView.tsx';
import config from '../../config.ts';
import Substack from './Substack.tsx';
import NextPrev from './NextPrev.tsx';
import Summary from '../Article/Summary.tsx';
import Related from './Related.tsx';
import GuideSteps from './GuideSteps.tsx';
import { DiscussionEmbed } from 'disqus-react';

export type PostProps = {
  renderLink?: RenderLink;
  subscription?: React.ReactNode;
  share?: React.ReactNode;
  comments?: React.ReactNode;
  avatar?: string;
  disqusShortname?: string;
  post: ArticleNode;
  authornote: string;
  related?: ArticleEdge[] | undefined;
  guides?: GuideStep[] | undefined;
  tagLinks?: TagLink[] | undefined;
  next?: ArticleNode | undefined;
  prev?: ArticleNode | undefined;
};

const Post = (props: PostProps) => {
  const {
    renderLink = anchor,
    avatar = '/images/avatar.webp',
    disqusShortname = '',
    subscription,
    share,
    comments,
    post,
    post: {
      html,
      fields: { prefix, slug, originalSlug },
      frontmatter: { title, summary, author, disqusId },
    },
    authornote,
    related,
    guides,
    tagLinks,
    next: nextPost,
    prev: prevPost,
  } = props;

  const disqusConfig = {
    shortname: disqusShortname,
    config: { identifier: disqusId || originalSlug || slug, title },
  };

  return (
    <React.Fragment>
      <header>
        <Headline title={title} />
        <Summary>{summary}</Summary>
        <Meta
          prefix={prefix}
          author={author}
          tags={tagLinks}
          guides={guides}
          renderLink={renderLink}
        />
      </header>
      {/* Imported article diagrams need a light canvas for their dark lettering. */}
      <Bodytext
        html={html}
        className="[&_img.article-image-content]:bg-[var(--color-image-canvas)]"
      />
      <footer>
        {subscription ?? <Substack />}
        <GuideSteps guides={guides} renderLink={renderLink} />
        <Related posts={related} renderLink={renderLink} />
        {share ?? <Share post={post} />}
        <AuthorView note={authornote} avatar={avatar} name={config.siteTitle} />
        <NextPrev next={nextPost} prev={prevPost} renderLink={renderLink} />
        {comments ?? <DiscussionEmbed {...disqusConfig} />}
      </footer>
    </React.Fragment>
  );
};

export default Post;
