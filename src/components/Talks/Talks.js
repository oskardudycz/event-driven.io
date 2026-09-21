import React from "react";
import PropTypes from "prop-types";

import { ThemeContext } from "../../layouts";
import { useTranslation } from "react-i18next";

const Talks = (props) => {
  const { talks } = props;
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {(theme) => (
          <div>
            <ul>
              {talks.map((talk) => {
                return (
                  <li key={`${talk.Date}-${talk.Title}`}>
                    <p className="date-container">
                      <span className="date">📅 {talk.Date}</span> -{" "}
                      <span className="where">
                        {talk.Link ? (
                          <a href={talk.Link} target="_blank" rel="noopener noreferrer">
                            {talk.Where}
                          </a>
                        ) : (
                          talk.Where
                        )}
                      </span>
                    </p>
                    <p className="title-container">
                      <label className="title-label">{t("talks.titleLabel")}:</label>{" "}
                      <span className="title">{talk.Title}</span>
                    </p>
                    {talk.Description && (
                      <p className="description-container">
                        <label className="description-label">{t("talks.descriptionLabel")}:</label>{" "}
                        <span className="description">{talk.Description}</span>
                      </p>
                    )}
                    {talk.Video && !talk.HideVideo && talk.Video.includes("youtube") && (
                      <p>
                        <a href={talk.Video} target="_blank" rel="noopener noreferrer">
                          {t("talks.watch")} →
                        </a>
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
            {/* --- STYLES --- */}
            <style jsx>{`
              ul {
                margin: ${theme.space.stack.m};
                list-style: none;
              }
              li {
                padding: ${theme.space.m} 0;
                font-size: ${theme.font.size.s};
                line-height: ${theme.font.lineHeight.l};
                border: 1px solid transparent;
                border-radius: ${theme.size.radius.default};
                margin: ${`calc(${theme.space.default} * 2) 0 calc(${theme.space.default} * 3)`};
                padding: ${theme.space.inset.s};
                position: relative;
                transition: all ${theme.time.duration.default};
                background: transparent;

                &::after {
                  border-top: 1px solid ${theme.line.color};
                  content: "";
                  height: 0;
                  position: absolute;
                  bottom: ${`calc(${theme.space.default} * -1.5)`};
                  left: 50%;
                  transform: translateX(-50%);
                  transition: all ${theme.time.duration.default};
                  width: 50%;
                }

                &:first-child {
                  &::before {
                    content: "";
                    height: 0;
                    position: absolute;
                    top: ${`calc(${theme.space.default} * -1.2)`};
                    left: 50%;
                    transform: translateX(-50%);
                    transition: all ${theme.time.duration.default};
                    width: 50%;
                  }
                }
              }
              .date-container {
                padding: ${theme.space.xs} 0 ${theme.space.s} 0;
              }
              .date {
                font-weight: ${theme.font.weight.bold};
              }
              .where {
                font-weight: ${theme.font.weight.bold};
              }
              .title-container {
                padding: ${theme.space.s} 0;
              }
              .title-label {
                font-weight: ${theme.font.weight.bold};
              }
              .title {
                text-decoration: underline;
              }
              .description-container {
                padding: ${theme.space.xs} 0 ${theme.space.m} 0;
              }
              .description-label {
                font-weight: ${theme.font.weight.bold};
              }
            `}</style>
          </div>
        )}
      </ThemeContext.Consumer>
    </React.Fragment>
  );
};

Talks.propTypes = {
  talks: PropTypes.array,
};

export default Talks;
