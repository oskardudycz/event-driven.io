import React from 'react';

const Article = (props: React.PropsWithChildren) => (
  <article className="mx-auto p-5 sm:max-w-[var(--text-max-width-tablet)] sm:px-10 sm:py-5 lg:max-w-[var(--text-max-width-desktop)] lg:px-0 lg:pt-[50px] lg:pb-10">
    {props.children}
  </article>
);

export default Article;
