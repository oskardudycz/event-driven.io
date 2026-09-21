import React from "react";
import PropTypes from "prop-types";

const Summary = ({ children, theme }) => {
  if (!children) return null;

  return (
    <React.Fragment>
      <p className="standfirst">{children}</p>
      <style jsx>{`
        .standfirst {
          color: ${theme.text.color.primary};
          font-size: ${theme.font.size.m};
          line-height: ${theme.font.lineHeight.l};
          margin: 0 0 ${theme.space.l};
        }
      `}</style>
    </React.Fragment>
  );
};

Summary.propTypes = {
  children: PropTypes.node,
  theme: PropTypes.object.isRequired,
};

export default Summary;
