import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '../Link';
import ReadingList from './ReadingList';

// This adapter owns Gatsby's data shape and routing. The view owns its markup
// and CSS and can be reused with an ordinary anchor in another framework.
const List = ({ edges, ordered = false, showImages = false }) => {
  const items = edges.map(({ node }) => ({
    id: node.fields.slug,
    href: `/${node.fields.langKey}${node.fields.slug}`,
    title: node.frontmatter.title,
    date: node.fields.prefix,
    excerpt: node.excerpt,
    image: node.frontmatter.cover?.childImageSharp?.resize,
  }));

  return (
    <ReadingList
      items={items}
      ordered={ordered}
      showImages={showImages}
      renderLink={({ href, ...props }) => <Link {...props} to={href} />}
    />
  );
};

List.propTypes = {
  edges: PropTypes.array.isRequired,
  ordered: PropTypes.bool,
  showImages: PropTypes.bool,
};

export default List;
