const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const babel = require("@babel/core");
const { parse } = require("gatsby/graphql");

const root = path.resolve(__dirname, "..");
const config = require(path.join(root, "gatsby-config.js"));
assert.equal(config.trailingSlash, "always");
assert.ok(config.siteMetadata.siteUrl);
assert.ok(Array.isArray(config.plugins));

const webfinger = JSON.parse(
  fs.readFileSync(path.join(root, "static/.well-known/webfinger"), "utf8")
);
assert.equal(webfinger.subject, "acct:oskardudycz@hachyderm.io");

const files = ["gatsby-config.js", "gatsby-node.es6.js"];
function visitFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) visitFiles(file);
    else if (entry.name.endsWith(".js")) files.push(path.relative(root, file));
  }
}
visitFiles(path.join(root, "src"));

let queryCount = 0;
function walk(node, file) {
  if (!node || typeof node !== "object") return;

  const taggedGraphql =
    node.type === "TaggedTemplateExpression" && node.tag.name === "graphql";
  const calledGraphql =
    node.type === "CallExpression" &&
    node.callee.name === "graphql" &&
    node.arguments[0]?.type === "TemplateLiteral";
  const configQuery =
    node.type === "ObjectProperty" &&
    node.key.name === "query" &&
    node.value.type === "TemplateLiteral";
  const topLevelQuery =
    node.type === "VariableDeclarator" &&
    node.id.name === "query" &&
    node.init?.type === "TemplateLiteral";

  if (taggedGraphql || calledGraphql || configQuery || topLevelQuery) {
    const template = taggedGraphql
      ? node.quasi
      : calledGraphql
        ? node.arguments[0]
        : configQuery
          ? node.value
          : node.init;
    assert.equal(template.expressions.length, 0, `GraphQL interpolation in ${file}`);
    parse(template.quasis.map((part) => taggedGraphql ? part.value.raw : part.value.cooked).join(""));
    queryCount += 1;
  }

  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((item) => walk(item, file));
    else if (value && typeof value === "object") walk(value, file);
  }
}

for (const file of files) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const ast = babel.parseSync(source, {
    babelrc: false,
    configFile: false,
    parserOpts: { sourceType: "unambiguous", plugins: ["jsx"] },
  });
  walk(ast, file);
}

assert.ok(queryCount > 0, "No GraphQL queries were found");
console.log(`Smoke check passed: Gatsby config, WebFinger, ${files.length} source files, ${queryCount} GraphQL queries`);
