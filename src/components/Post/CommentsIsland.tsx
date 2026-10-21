import React from 'react';
import { DiscussionEmbed } from 'disqus-react';

export default function CommentsIsland(
  props: React.ComponentProps<typeof DiscussionEmbed>,
) {
  return <DiscussionEmbed {...props} />;
}
