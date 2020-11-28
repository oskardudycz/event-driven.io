import React from "react";
import PropTypes from "prop-types";
import { Link } from "../Link";
import { useTranslation } from 'react-i18next';

const Item = props => {
  const { theme, item: { label, to, icon: Icon } = {}, onClick } = props;
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <li className={"hiddenItem" in props ? "hiddenItem" : "item"} key={label}>
        <Link
          to={to}
          className={"hiddenItem" in props ? "inHiddenItem" : ""}
          onClick={onClick}
          data-slug={to}
        >
          {Icon && <Icon />} {t(label)}
        </Link>
      </li>

      {/* --- STYLES --- */}
      <style jsx>{`
        .item,
        .showItem {
          background: transparent;
          transition: all ${theme.time.duration.default};
          display: flex;
          align-items: center;

          :global(a) {
            padding: ${theme.space.inset.s};
            display: flex;
            align-items: center;
          }

          :global(svg) {
            margin: 0 ${theme.space.inset.xs} 0 0;
            opacity: 0.3;
          }
        }

        :global(.itemList .hideItem) {
          display: none;
        }

        @from-width desktop {
          .item {
            :global(a) {
              color: ${theme.text.color.primary};
              padding: ${theme.space.inset.s};
              transition: all ${theme.time.duration.default};
              border-radius: ${theme.size.radius.small};
            }

            :global(.homepage):not(.fixed) & :global(a) {
              color: ${theme.color.neutral.white};
            }

            
            :global(a:hover) {
              color: black;
              background: color(white alpha(-60%));
            }

            :global(.homepage):not(.fixed) & :global(a:hover) {
              color: ${theme.color.brand.primaryDark};
              background: color(white alpha(-60%));
            }

            :global(svg) {
              transition: all ${theme.time.duration.default};
            }

            &:hover :global(svg) {
              fill: black;
              opacity: 1;

              :global(.hero) & :global(svg) {
                fill: green;
              }
            }

            :global(.homepage):not(.fixed) &:hover :global(svg) {
              fill: ${theme.color.brand.primaryDark};
              
              opacity: 1;

              :global(.hero) & :global(svg) {
                fill: green;
              }
            }
          }

          .showItem {
            display: none;
          }

          .hiddenItem {
            text-align: left;
            padding: ${theme.space.xs};

            & :global(a.inHiddenItem) {
              color: ${theme.text.color.primary};
              &:hover {
                color: ${theme.color.brand.primary};
              }
            }
          }
        }
      `}</style>
    </React.Fragment>
  );
};

Item.propTypes = {
  item: PropTypes.object,
  hidden: PropTypes.bool,
  onClick: PropTypes.func,
  icon: PropTypes.func,
  theme: PropTypes.object.isRequired
};

export default Item;
