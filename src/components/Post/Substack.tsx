import React, { useEffect, useRef, useState } from 'react';

const Substack = () => {
  const section = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );
    if (section.current) observer.observe(section.current);
    return () => observer.disconnect();
  }, []);
  return (
    <React.Fragment>
      <div id="substack" className="substack" ref={section}>
        <div className="w-full border-0 border-t border-solid border-[#ecebea] pt-2.5">
          <b>👋 If you found this article helpful</b> and want to get
          notification about the next one,{' '}
          <b>subscribe to Architecture Weekly.</b>
          <br />
          <br />
          <b>✉️ Join over 11500 subscribers</b>, get the best resources to boost
          your skills, and stay updated with Software Architecture trends!
          <br />
          <a
            className="subscription-fallback text-[0.8em]"
            href="https://www.architecture-weekly.com/subscribe"
          >
            Subscribe to Architecture Weekly
          </a>
          <br />
        </div>
        <iframe
          src={ready ? 'https://www.architecture-weekly.com/embed' : undefined}
          width="100%"
          height="320"
          title="Subscribe to Architecture Weekly"
          loading="lazy"
          className="border border-solid border-[#eee] bg-white"
        ></iframe>
      </div>
    </React.Fragment>
  );
};

export default Substack;
