import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

// Hash compatibility inputs, including environment-dependent generated content.
// Never print credentials; only the digest leaves this process.
const hash = crypto.createHash('sha256');
hash.update(`gatsby-cache-v2:${process.version}:${process.platform}:${process.arch}`);
function include(file) {
  hash.update(file);
  hash.update(fs.readFileSync(file));
}
for (const file of [
  'yarn.lock',
  'package.json',
  'gatsby-config.js',
  'gatsby-node.mjs',
  'gatsby-browser.js',
  'gatsby-ssr.js',
  'postcss.config.js',
  'src/i18n/constants.js',
  'src/i18n/settings.mjs',
  'src/i18n/translation-query.js',
  'src/theme/theme.yaml',
  'scripts/build-search-index.mjs',
  'src/utils/category-posts.mjs',
  'content/meta/config.js',
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
includeDirectory('plugins');
includeDirectory('src/search');
includeDirectory('src/i18n/locales');
for (const key of ['FB_APP_ID', 'GATSBY_DISQUS_NAME', 'GOOGLE_TAG_ID'])
  hash.update(`${key}:${process.env[key] || ''}`);
const compatibility = hash.digest('hex');
if (process.env.GITHUB_OUTPUT)
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `compatibility=${compatibility}\n`);
else console.log(compatibility);
