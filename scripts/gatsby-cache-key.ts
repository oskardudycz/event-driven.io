import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

// Hash compatibility inputs, including environment-dependent generated content.
// Never print credentials; only the digest leaves this process.
const hash = crypto.createHash('sha256');
hash.update(
  `gatsby-cache-v4:${process.version}:${process.platform}:${process.arch}`,
);
function include(file: string) {
  hash.update(file);
  hash.update(fs.readFileSync(file));
}
for (const file of [
  'package-lock.json',
  'package.json',
  'src/package.json',
  'site/package.json',
  'scripts/package.json',
  'import/package.json',
  'tests/package.json',
  'content/meta/package.json',
  'gatsby-config.mjs',
  'site/config.ts',
  'gatsby-node.mjs',
  'site/node.ts',
  'tsconfig.json',
  'tsconfig.shared.json',
  'tsconfig.node.json',
  'gatsby-browser.tsx',
  'gatsby-ssr.tsx',
  'netlify.toml',
  'postcss.config.mjs',
  'src/i18n/constants.ts',
  'src/i18n/settings.ts',
  'src/i18n/translation-query.ts',
  'src/theme/theme.yaml',
  'scripts/generate-theme-css.ts',
  'scripts/build-search-index.ts',
  'src/utils/category-posts.ts',
  'content/meta/config.ts',
])
  include(file);
function includeDirectory(directory: string) {
  for (const entry of fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) includeDirectory(file);
    else include(file);
  }
}
includeDirectory('patches');
includeDirectory('plugins');
includeDirectory('src/search');
includeDirectory('src/i18n/locales');
for (const key of ['FB_APP_ID', 'GATSBY_DISQUS_NAME', 'GOOGLE_TAG_ID'])
  hash.update(`${key}:${process.env[key] || ''}`);
const compatibility = hash.digest('hex');
if (process.env.GITHUB_OUTPUT)
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `compatibility=${compatibility}\n`,
  );
else console.log(compatibility);
