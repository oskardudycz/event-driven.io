import React from "react";

const Substack = () => {
  return (
    <React.Fragment>
      <div id="substack" className="substack">
        <div className="substack-legend">
          <b>👋 If you found this article helpful</b> and want to get notification about the next
          one, <b>subscribe to Architecture Weekly.</b>
          <br />
          <br />
          <b>✉️ Join over 2100 subscribers</b>, get the best resources to boost your skills, and
          stay updated with Software Architecture trends!
          <br />
          <br />
        </div>
        <iframe
          src="https://www.architecture-weekly.com/embed"
          width="100%"
          height="320"
          frameborder="0"
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
        .substack iframe {
          border: 1px solid #eee;
          background: white;
        }
      `}</style>
    </React.Fragment>
  );
};

export default Substack;
