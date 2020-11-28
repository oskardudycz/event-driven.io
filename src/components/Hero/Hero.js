import React from "react";
import PropTypes from "prop-types";

import { FaArrowDown } from "react-icons/fa/";

import { Trans, useTranslation } from 'react-i18next'

const Hero = props => {
  const { scrollToContent, backgrounds, theme } = props;
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <section className="hero">
        <h1>
          <Trans i18nKey="hero.h1">Szukasz praktycznej wiedzy <br /> o <u>architekturze oprogramowania?</u></Trans><br />
        </h1>
        <h2>
          <Trans i18nKey="hero.h2">Zapoznaj się z moimi treściami - <span className="yellow">od artykułów po wideo</span></Trans>
        </h2>
        <h3>
          <Trans i18nKey="hero.h3">Nazywam się <b className="yellow">Oskar Dudycz</b>. Od ponad 13 lat, tworzę systemy informatyczne bliskie biznesowi. <br />
          Prowadzę warsztaty i szkolenia na temat <b className="yellow">Event Sourcing</b>, CQRS oraz architektur opartych o zdarzeniach. <br />
          Jestem maintainerem biblioteki <a href="https://martendb.io/" target="_parent" className="yellow">Marten</a>, umożliwiającej pracę z Event Sourcing. <br />          
          Na blogu dzielę się wiedzą jak pragmatycznie tworzyć, dobre modularne aplikacje.</Trans>
        </h3>
        <button onClick={scrollToContent} aria-label="scroll">
          <FaArrowDown />
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
          height: 100px;
          padding: ${theme.space.inset.l};
          padding-top: ${theme.header.height.homepage};
        }

        h1 {
          text-align: left;
          text-transform: uppercase;
          font-size: ${theme.hero.h1.size};
          margin: ${theme.space.stack.l};
          color: ${theme.hero.h1.color};
          line-height: ${theme.hero.h1.lineHeight};
          line-height: 1.5;
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
          margin-top: 30px;
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
          margin-top: 30px;
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

        button {
          background: ${theme.background.color.brand};
          background: yellow;
          border: 0;
          border-radius: 50%;
          font-size: ${theme.font.size.xs};
          padding: ${theme.space.xs} ${theme.space.xs};
          cursor: pointer;
          width: ${theme.space.m};
          height: ${theme.space.m};
          min-width: ${theme.space.l};
          min-height: ${theme.space.l};

          &:focus {
            outline-style: none;
            background: ${theme.color.brand.primary.active};
          }

          :global(svg) {
            position: relative;
            top: 5px;
            fill: ${theme.color.neutral.black};
            stroke-width: 40;
            stroke: ${theme.color.neutral.black};
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
            transform: translateY(-10px);
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
            font-size: ${`calc(${theme.hero.h1.size} * 1.3)`};
          }

          h2 {
            max-width: 95%;
            font-size: ${`calc(${theme.hero.h2.size} * 1.3)`};
          }
          
          h3 {
            max-width: 95%;
            font-size: ${`calc(${theme.hero.h3.size} * 1.3)`};
          }

          button {
            font-size: ${theme.font.size.m};
            min-width: ${theme.space.l};
            min-height: ${theme.space.l};
          }
        }

        @from-width desktop {
          .hero {
            background-image: url(${backgrounds.desktop});
          }

          h1 {
            max-width: 80%;
            font-size: ${`calc(${theme.hero.h1.size} * 1.5)`};
          }

          h2 {
            max-width: 80%;
            font-size: ${`calc(${theme.hero.h2.size} * 1.5)`};
          }

          h3 {
            max-width: 80%;
            font-size: ${`calc(${theme.hero.h3.size} * 1.5)`};
          }

          button {
            font-size: ${theme.font.size.xl};
            min-width: ${theme.space.xl};
            min-height: ${theme.space.xl};
          }
        }
      `}</style>
    </React.Fragment>
  );
};

Hero.propTypes = {
  scrollToContent: PropTypes.func.isRequired,
  backgrounds: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default Hero;
