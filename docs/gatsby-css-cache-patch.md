# Gatsby CSS asset invalidation correction

`patches/gatsby+5.16.1.patch` fixes a reproduced dependency defect in Gatsby 5.16.1. It is a local patch, not an upstream release or a documented Gatsby configuration option.

## Cause and correction

Gatsby's Slice-enabled build records per-template SSR hashes and a shared renderer hash. A declaration-only CSS change updates the browser's content-hashed CSS asset, but unchanged CSS Module exports leave the server hashes unchanged. Gatsby can therefore reuse HTML that inlines the previous stylesheet. This occurs with the official PostCSS plugin and built-in CSS handling, independently of this site's application structure.

The patch includes the sorted emitted CSS asset filenames in Gatsby's existing shared renderer invalidation key. Gatsby's CSS assets are content-hashed; when their content changes, that dependency changes. HTML is regenerated through Gatsby's existing pipeline. No class exports, source-file hashes, environment flags, Redux actions, HTML rewriting or extraction warning settings are modified.

References: [Gatsby incremental-build inputs](https://www.gatsbyjs.com/docs/debugging-incremental-builds/), [upstream build pipeline](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/commands/build.ts), [Webpack compilation assets](https://webpack.js.org/api/compilation-object/#getassets), [patch-package installation](https://github.com/ds300/patch-package#usage).

## Installation and maintenance

- Gatsby is pinned to 5.16.1. Normal Yarn installation applies the checked-in patch through `postinstall`; patch failures stop installation.
- If installation deliberately uses `--ignore-scripts`, run `yarn postinstall` before building.
- Gatsby cache compatibility includes the patch directory. Do not restore caches built with a different patch.
- Keep the patch visible in code review. It changes Gatsby's compiled CommonJS dependency file; application code retains its own ECMAScript/TypeScript conventions.
- Before upgrading Gatsby, test the unpatched candidate with `yarn test:cache:css`. Remove the patch and version pin once a released correction passes module/global declaration-only edits and restoration, then run the full build/browser/content-cache checks.

## Repeatable validation

Run `yarn build`, `yarn test`, `yarn test:visual`, `yarn test:cache:css` and `yarn test:cache`. The CSS cache check modifies a module declaration and a global declaration independently, checks every generated page against current compilation assets, checks browser computed styles with and without JavaScript, and always restores each stylesheet in `finally`.

An isolated two-page reproduction first failed without the correction: updated CSS existed on disk but both pages retained the old inline asset. With the patch, declaration-only changes update both pages while identifiers remain based on their path/local name. Final repository acceptance is tracked in [todo.md](../todo.md).
