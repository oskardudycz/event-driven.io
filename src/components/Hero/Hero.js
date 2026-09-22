import React from "react";
import PropTypes from "prop-types";

import { FaArrowDown } from "react-icons/fa/";

import { Trans, useTranslation } from "react-i18next";
import { Link } from "../Link";

const Hero = (props) => {
  const { scrollToContent, backgrounds, theme } = props;
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <section className="hero">
        <h1>
          <Trans i18nKey="hero.h1">
            Szukasz praktycznej wiedzy <br /> o <u>architekturze oprogramowania?</u>
          </Trans>
          <br />
        </h1>
        <h2>
          <Trans i18nKey="hero.h2">
            Zapoznaj się z moimi treściami - <span className="yellow">od artykułów po wideo</span>
          </Trans>
        </h2>
        <h3>
          {t("hero.introExperience")}
          <br />
          {t("hero.introTraining")}
          <br />
          <Trans
            i18nKey="hero.introEmmett"
            components={{
              emmett: (
                <a
                  href="https://event-driven-io.github.io/emmett/getting-started.html"
                  target="_parent"
                  className="yellow"
                />
              ),
            }}
          />
          <br />
          {t("hero.introBlog")}
        </h3>
        <nav className="services" aria-label={t("hero.servicesLabel")}>
          <Link to="/training/">{t("hero.trainingCta")}</Link>
          <Link to="/consulting/">{t("hero.consultingCta")}</Link>
        </nav>
        <button onClick={scrollToContent} aria-label={t("hero.articlesCta")}>
          <span className="articlesLabel">{t("hero.articlesCta")}</span>
          <span className="arrowCircle">
            <FaArrowDown />
          </span>
        </button>
      </section>

      {/* --- STYLES --- */}
      <style jsx>{`
        .hero {
          align-items: left;
          background: ${theme.hero.background};
          background-image: url(${backgrounds.mobile});
          background-size: cover;
          color: ${theme.text.color.primary.inverse};
          display: flex;
          flex-flow: column nowrap;
          justify-content: center;
          min-height: 100vh;
          padding: ${theme.space.inset.l};
          padding-top: ${theme.header.height.homepage};
        }

        h1 {
          text-align: left;
          text-transform: uppercase;
          font-size: ${theme.hero.h1.size};
          font-size: ${`calc(${theme.hero.h1.size} * 0.9)`};
          margin: ${theme.space.stack.l};
          margin-bottom: ${theme.space.m};
          color: ${theme.hero.h1.color};
          line-height: ${theme.hero.h1.lineHeight};
          line-height: 1.2;
          text-remove-gap: both 0 "Open Sans";

          :global(strong) {
            position: relative;

            &::after,
            &::before {
              content: "›";
              color: ${theme.text.color.attention};
              margin: 0 ${theme.space.xs} 0 0;
              text-shadow: 0 0 ${theme.space.s} ${theme.color.neutral.gray.k};
            }
            &::after {
              content: "‹";
              margin: 0 0 0 ${theme.space.xs};
            }
          }
        }

        h1 > u {
          text-decoration-color: yellow;
        }

        h2 {
          text-align: left;
          font-size: ${theme.hero.h2.size};
          margin: ${theme.space.stack.l};
          margin-top: ${theme.space.s};
          margin-bottom: ${theme.space.m};
          color: ${theme.hero.h2.color};
          line-height: ${theme.hero.h2.lineHeight};
          text-remove-gap: both 0 "Open Sans";

          :global(strong) {
            position: relative;

            &::after,
            &::before {
              content: "›";
              color: ${theme.text.color.attention};
              margin: 0 ${theme.space.xs} 0 0;
              text-shadow: 0 0 ${theme.space.s} ${theme.color.neutral.gray.k};
            }
            &::after {
              content: "‹";
              margin: 0 0 0 ${theme.space.xs};
            }
          }
        }

        h3 {
          text-align: left;
          font-weight: 400;
          font-size: ${theme.hero.h3.size};
          margin: ${theme.space.stack.l};
          margin-top: ${theme.space.s};
          color: ${theme.hero.h3.color};
          line-height: ${theme.hero.h3.lineHeight};
          line-height: 1.8;
          text-remove-gap: both 0 "Open Sans";

          :global(strong) {
            position: relative;

            &::after,
            &::before {
              content: "›";
              color: ${theme.text.color.attention};
              margin: 0 ${theme.space.xs} 0 0;
              text-shadow: 0 0 ${theme.space.s} ${theme.color.neutral.gray.k};
            }
            &::after {
              content: "‹";
              margin: 0 0 0 ${theme.space.xs};
            }
          }
        }

        .yellow {
          color: yellow !important;
        }

        .services {
          display: flex;
          flex-wrap: wrap;
          gap: ${theme.space.s};
          margin: 0 0 ${theme.space.l};

          :global(a) {
            background: yellow;
            border: 2px solid yellow;
            border-radius: ${theme.size.radius.small};
            color: ${theme.color.neutral.black};
            font-weight: ${theme.font.weight.bold};
            padding: ${theme.space.s} ${theme.space.m};
          }

          :global(a:last-child) {
            background: transparent;
            color: ${theme.color.neutral.white};
          }

          :global(a:hover),
          :global(a:focus) {
            text-decoration: underline;
          }
        }

        button {
          align-items: center;
          background: transparent;
          border: 0;
          color: ${theme.color.neutral.white};
          display: inline-flex;
          gap: ${theme.space.s};
          font-size: ${theme.font.size.xs};
          font-weight: ${theme.font.weight.bold};
          justify-content: center;
          padding: 0;
          cursor: pointer;
          width: fit-content;

          &:focus {
            outline: 3px solid ${theme.color.neutral.white};
            outline-offset: 3px;
          }
        }

        button:hover .articlesLabel,
        button:focus .articlesLabel {
          text-decoration: underline;
        }

        .arrowCircle {
          align-items: center;
          background: yellow;
          border-radius: 50%;
          display: inline-flex;
          height: ${theme.space.l};
          justify-content: center;
          width: ${theme.space.l};

          :global(svg) {
            fill: ${theme.color.neutral.black};
            animation-duration: ${theme.time.duration.long};
            animation-name: buttonIconMove;
            animation-iteration-count: infinite;
          }
        }

        @keyframes buttonIconMove {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(4px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @from-width tablet {
          .hero {
            background-image: url(${backgrounds.tablet});
          }

          h1 {
            max-width: 95%;
            line-height: 1.5;
            margin-bottom: ${theme.space.l};
            font-size: ${`calc(${theme.hero.h1.size} * 1.3)`};
          }

          h2 {
            max-width: 95%;
            margin-top: 30px;
            margin-bottom: ${theme.space.l};
            font-size: ${`calc(${theme.hero.h2.size} * 1.3)`};
          }

          h3 {
            max-width: 95%;
            margin-top: 30px;
            font-size: ${`calc(${theme.hero.h3.size} * 1.3)`};
          }

          button {
            font-size: ${theme.font.size.s};
          }
        }

        @from-width desktop {
          .hero {
            background-image: url(${backgrounds.desktop});
          }

          h1 {
            max-width: 80%;
            line-height: 1.5;
            margin-bottom: ${theme.space.l};
            font-size: ${`calc(${theme.hero.h1.size} * 1.5)`};
          }

          h2 {
            max-width: 80%;
            margin-top: 30px;
            margin-bottom: ${theme.space.l};
            font-size: ${`calc(${theme.hero.h2.size} * 1.5)`};
          }

          h3 {
            max-width: 80%;
            margin-top: 30px;
            font-size: ${`calc(${theme.hero.h3.size} * 1.5)`};
          }

          button {
            font-size: ${theme.font.size.s};
          }
        }
      `}</style>
    </React.Fragment>
  );
};

Hero.propTypes = {
  scrollToContent: PropTypes.func.isRequired,
  backgrounds: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default Hero;
