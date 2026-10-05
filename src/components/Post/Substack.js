import React, { useEffect, useRef, useState } from 'react';

const Substack = () => {
  const section = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);
  return (
    <React.Fragment>
      <div id="substack" className="substack" ref={section}>
        <div className="substack-legend">
          <b>👋 If you found this article helpful</b> and want to get notification about the next
          one, <b>subscribe to Architecture Weekly.</b>
          <br />
          <br />
          <b>✉️ Join over 11500 subscribers</b>, get the best resources to boost your skills, and
          stay updated with Software Architecture trends!
          <br />
          <a className="subscription-fallback" href="https://www.architecture-weekly.com/subscribe">
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
          frameBorder="0"
          scrolling="no"
        ></iframe>
      </div>
      {/* --- STYLES --- */}
      <style jsx>{`
        .substack .substack-legend {
          width: 100%;
          border-top: 1px solid #ecebea;
          padding-top: 10px;
        }
        .subscription-fallback {
          font-size: 0.8em;
        }
        .substack iframe {
          border: 1px solid #eee;
          background: white;
        }
      `}</style>
    </React.Fragment>
  );
};

export default Substack;
