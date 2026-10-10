import React from 'react';

const Summary = ({ children }: React.PropsWithChildren) => {
  if (!children) return null;
  return (
    <p className="standfirst mb-section text-summary text-ink">{children}</p>
  );
};

export default Summary;
