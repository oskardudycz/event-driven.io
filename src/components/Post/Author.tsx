import React from 'react';
import config from '../../config.ts';
import AuthorView from './AuthorView.tsx';

export default function Author({ note }: { note: string }) {
  return (
    <AuthorView
      note={note}
      avatar="/images/avatar.webp"
      name={config.siteTitle}
    />
  );
}
