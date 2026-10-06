const postcssPresetEnv = require(`postcss-preset-env`);
const postcssEasyMediaQuery = require(`postcss-easy-media-query`);

module.exports = () => ({
  plugins: [
    postcssPresetEnv({
      stage: 0,
    }),
    postcssEasyMediaQuery({
      breakpoints: {
        tablet: 600,
        desktop: 1024,
      },
    }),
    require(`postcss-nested`),
  ],
});

// "postcss-nested": {},
// "postcss-sorting": {
//   order: ["custom-properties", "dollar-variables", "declarations", "at-rules", "rules"],
//   "properties-order": "alphabetical",
//   "unspecified-properties-position": "bottom"
// },
// "postcss-utilities": {},
