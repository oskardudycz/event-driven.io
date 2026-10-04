import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

// Hash compatibility inputs, including environment-dependent generated content.
// Never print credentials; only the digest leaves this process.
const hash = crypto.createHash("sha256");
hash.update(`gatsby-cache-v1:${process.version}:${process.platform}:${process.arch}`);
function include(file) {
  hash.update(file);
  hash.update(fs.readFileSync(file));
}
for (const file of [
  "yarn.lock",
  "package.json",
  "gatsby-config.js",
  "gatsby-node.mjs",
  "gatsby-browser.js",
  "gatsby-ssr.js",
  "postcss.config.js",
  "src/i18n/constants.js",
  "src/i18n/settings.mjs",
  "src/i18n/i18n.json",
  "src/theme/theme.yaml",
  "src/utils/algolia.js",
  "content/meta/config.js",
])
  include(file);
function includeDirectory(directory) {
  for (const entry of fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) includeDirectory(file);
    else include(file);
  }
}
includeDirectory("plugins");
const indexing =
  Boolean(
    process.env.ALGOLIA_APP_ID &&
      process.env.ALGOLIA_ADMIN_API_KEY &&
      process.env.ALGOLIA_INDEX_NAME
  ) &&
  !(process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_REF !== "refs/heads/main") &&
  process.env.ALGOLIA_SKIP_INDEXING !== "true";
hash.update(`indexing:${indexing}`);
for (const key of [
  "ALGOLIA_APP_ID",
  "ALGOLIA_INDEX_NAME",
  "ALGOLIA_SEARCH_ONLY_API_KEY",
  "FB_APP_ID",
  "GATSBY_DISQUS_NAME",
  "GOOGLE_TAG_ID",
])
  hash.update(`${key}:${process.env[key] || ""}`);
const compatibility = hash.digest("hex");
if (process.env.GITHUB_OUTPUT)
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `compatibility=${compatibility}\n`);
else console.log(compatibility);
