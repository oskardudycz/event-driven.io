import type { ArticleEdge } from '../../types/content.ts';
import React from 'react';
import { Link } from '../Link/index.tsx';
import ReadingList from './ReadingList';
import { readingItems } from './reading-items.ts';

// Map editorial nodes to the shared reading view and localized native links.
const List = ({
  edges,
  ordered = false,
  showImages = false,
}: {
  edges: ArticleEdge[];
  ordered?: boolean;
  showImages?: boolean;
}) => {
  const items = readingItems(edges);

  return (
    <ReadingList
      items={items}
      ordered={ordered}
      showImages={showImages}
      renderLink={({ href, ...props }) => <Link {...props} to={href} />}
    />
  );
};

export default List;
