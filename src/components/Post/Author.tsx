import React from 'react';
import { withPrefix } from 'gatsby';
import config from '../../../content/meta/config.ts';
import AuthorView from './AuthorView.tsx';

export default function Author({ note }: { note: string }) {
  return (
    <AuthorView
      note={note}
      avatar={withPrefix('/images/avatar.webp')}
      name={config.siteTitle}
    />
  );
}
