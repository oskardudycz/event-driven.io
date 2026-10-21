import React from 'react';
import BlogView from './BlogView.tsx';
import Item from './Item.tsx';
import { Link } from '../Link/index.tsx';
export default function Blog(
  props: Omit<
    React.ComponentProps<typeof BlogView>,
    'renderLink' | 'renderItem'
  >,
) {
  return (
    <BlogView
      {...props}
      renderLink={({ href, ...attributes }) => (
        <Link {...attributes} to={href} />
      )}
      renderItem={({ node }) => <Item post={node} />}
    />
  );
}
