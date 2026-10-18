import React from 'react';

const Headline = (
  props: React.PropsWithChildren<{ title?: string | undefined }>,
) => {
  const { title, children } = props;

  return (
    <h1 className="mb-10 animate-headline-entry text-[length:var(--font-size-xxl)] sm:text-[length:calc(var(--font-size-xl)*1.2)] lg:text-[length:calc(var(--font-size-xl)*1.4)] [&_svg]:h-[0.75em] [&_svg]:fill-[var(--color-brand)]">
      {title || children}
    </h1>
  );
};

export default Headline;
