import React from "react";


const Substack = () => {

  return (
    <React.Fragment>
      <div id="substack" className="substack">
        <iframe
          src="https://www.architecture-weekly.com/embed"
          width="850"
          height="320"
          frameborder="0"
          scrolling="no"
        >
        </iframe>
      </div>
      {/* --- STYLES --- */}
      <style jsx>{`
        .substack iframe{
          border:1px solid #EEE;
          background:white
        }
      `}</style>
    </React.Fragment>
  );
};


export default Substack;
