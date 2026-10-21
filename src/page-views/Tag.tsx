import type { SitePageProps } from '../types/content.ts';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Blog from '../components/Blog/index.ts';
import Bodytext from '../components/Article/Bodytext.tsx';
import { tagDescription, tagLabel } from '../utils/tag-label.ts';

const TagTemplate = (props: SitePageProps<'posts' | 'tagContent'>) => {
  const { t } = useTranslation();
  const {
    data: {
      posts: { edges: posts },
      tagContent,
    },
    pageContext: { tag = '' },
  } = props;

  return (
    <Blog posts={posts} compactTop heading={tagLabel(t, tag)}>
      {tagContent?.html ? (
        <Bodytext html={tagContent.html} />
      ) : (
        <p className="text-summary">
          {tagDescription(t, tag, tagContent?.frontmatter.description)}
        </p>
      )}
      <p className="mt-2 text-caption text-muted">
        {t('tags.articleCount', { count: posts.length })}
      </p>
    </Blog>
  );
};

export default TagTemplate;
