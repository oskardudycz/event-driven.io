require(`@babel/register`)({
  // Limit this legacy hook to our Node entry points, not Gatsby's generated SSR bundles.
  only: [
    require("path").resolve(__dirname, "gatsby-node.es6.js"),
    require("path").resolve(__dirname, "src/i18n/constants.js"),
  ],
  presets: ["@babel/preset-env", "@babel/preset-react"],
});
module.exports = require(`./gatsby-node.es6.js`);