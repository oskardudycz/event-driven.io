import React from 'react';

const AuthorView = ({
  note,
  avatar,
  name,
}: {
  note: string;
  avatar: string;
  name: string;
}) => {
  return (
    <React.Fragment>
      <div className="author my-10 border-0 border-y border-solid border-[var(--color-border)] py-10 sm:flex">
        <div className="avatar float-left mt-1.25 mr-5 inline-block size-12.5 overflow-hidden rounded-[65%_75%] border border-solid border-[var(--color-border)] sm:flex-[0_0_auto]">
          <img
            src={avatar}
            alt={name}
            width="180"
            height="180"
            className="h-auto w-full"
          />
        </div>
        <div
          className="note flex flex-col content-center justify-center text-[0.9em] leading-[1.6] [&_a]:font-bold [&_a]:text-[color:var(--text-color-brand)] [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: note }}
        />
      </div>
    </React.Fragment>
  );
};

export default AuthorView;
