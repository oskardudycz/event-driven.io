# Direct dependency review — 2026-10-11

The direct upgrades and npm migration passed the previous local application checks. **Dependency compatibility/security remediation is not complete:** peer overrides and vulnerable nested packages remain. The [starter comparison](gatsby-starter-comparison.md) now records source ownership, fresh starter/project resolutions, root causes, simplifications and owner decisions. Gatsby 5.16.1 and its configured official plugins remain current. Node types track Node 24 rather than a different runtime major. Run `npm outdated` and `npm explain <package>` to refresh registry and dependency information.

## Implemented

### Current remediation — 2026-10-11

Test-fixture refactoring is deferred by the owner. Clean npm ci reproduces the Gatsby peer/deprecation warnings and the 111-entry audit baseline. Registry checks confirm Gatsby 5.16.1 and @gatsbyjs/reach-router 2.0.1 are current; the latter still declares React/React DOM 18 only, despite [Gatsby's React 19 announcement](https://www.gatsbyjs.com/docs/reference/release-notes/v5.16/). Gatsby directly installs its old CRA/ESLint stack. Neither chain can be removed by deleting project imports or changing the project lint configuration. Swapping React Router or overriding the entire compiler/lint stack would require maintaining a framework fork; it is not an application cleanup.

Normal npm audit fix and targeted npm update do not replace the vulnerable locked utility copies. The lock also retains nested typescript-estree 8.59.0 beneath parents requiring exactly 8.71.1. Independent manifest resolution removes those stale placements. Its first lock exposed an optional @types/eslint peer placement inconsistency; a second normal npm resolution corrects it and passes npm ci's dry-run validation. Adopt the regenerated lock only after actual clean installation and full acceptance. Keep only two same-major security overrides for pinned owners: plugin-helpers' Lodash and relay-compiler's Immutable. semver and nth-check resolve patched versions naturally.

| Owner                                     | Installed → patched     | Reason / validation                                                                                                                                    |
| ----------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gatsby and GraphQL codegen plugin-helpers | lodash 4.17.23 → 4.18.1 | [Template code injection](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) and prototype pollution; schema/codegen/build tests                       |
| @ardatan/relay-compiler                   | immutable 3.7.6 → 3.8.4 | [Hash-collision denial of service](https://github.com/advisories/GHSA-xvcm-6775-5m9r), list overflow and prototype pollution; GraphQL extraction/build |
| Locked semver 7.3.5 copies                | 7.3.5 → 7.8.5           | [Regular expression denial of service](https://github.com/advisories/GHSA-c2qf-rxjj-qqgw); actual Netlify CLI commands and build                       |
| unist-util-select                         | nth-check 2.0.0 → 2.1.1 | [Regular expression denial of service](https://github.com/advisories/GHSA-rp65-9cf3-cjxr); Markdown transforms and generated-output checks             |

These are dependency updates, not patched peer metadata or warning suppression. Remove the two security overrides once their owners publish corrected ranges. Clean npm ci, production builds, CI-mode npm test, lint/format, smoke and Netlify CLI help pass locally; browser acceptance is recorded in todo.md. The regenerated lock has 2,824 entries, versus 2,906 before this remediation. Rehoisting means a same-path version difference is not necessarily an upgrade or downgrade of an owning dependency.

The refreshed installed-tree audit reports **109 affected entries** (19 low, 31 moderate, 59 high; no critical), representing **21 distinct advisory URLs**, down from 111 entries / 29 URLs. Eight advisory URLs disappear and none are added; affected-entry counts also include ancestor packages, so these two metrics differ. npm outdated reports only Node 26 types; retain Node 24 types to match the actual runtime.

Installation is still not warning-free. Peer-warning blocks decrease from five to three: Gatsby's router React DOM peer, and its CRA configuration's TypeScript ESLint plugin/parser peers. Fresh registry metadata exposes 23 deprecation warnings: 22 package/version pairs were already in the old graph, and 20 of those lacked deprecation metadata in the old lock. The additional deprecated object-schema 1.2.1 belongs to Gatsby's nested ESLint stack. Do not remove deprecation metadata to conceal these warnings.

npm ls --all still exits with dependency diagnostics. Besides Gatsby's three conflicts, Netlify's optional unstorage blob driver declares compatibility through @netlify/blobs 10 while the CLI installs 11.1.4. It also reports Sharp's optional WASM fallback against the root 0.35.5 copy on Linux: the lock correctly retains ipx's 0.34.5 WASM package with cpu: wasm32, which is not installed on this native platform. Native image generation and CLI startup pass; that does not establish optional blob-driver compatibility.

Other vulnerable major-version chains remain open; do not run audit fix --force. Current registry latest node-forge 1.4.0, sprintf-js 1.1.3 and braces 3.0.3 remain in advisory ranges; latest alone cannot deliver an audit-clean tree. Gatsby's pinned image/compiler/schema/dev-server chains require upstream updates or separately validated owner upgrades.

Replace layout fontfaceobserver with native document.fonts.load and ordinary React effect cleanup, retaining the ten-second fallback, readiness attributes, contexts and SSR markup. Remove its types and the now-unused generic screen/timer helper. This is portable browser behavior and introduces no Astro/Gatsby compatibility abstraction or typography redesign.

- Matched Playwright 1.64 packages, TypeScript ESLint 8.71.1, Prettier 3.9.10, Vitest 5.0.3, Vite 8.3.4 / React plugin 6.1.2 and current utilities.
- TypeScript 7.0.2 native checker alongside the TS6 compiler API required by Gatsby, typed ESLint and source-analysis tools, using [Microsoft's documented aliases](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0). VS Code recommends the native extension; Gatsby continues to own application compilation.
- i18next 26 / react-i18next 17, using initAsync instead of the removed initImmediate option; Cheerio/remark/unist and js-yaml current exports; strict redirect-parser result validation. The later portable foundation replaces broad preset-env transforms with Tailwind 4.3.3 while retaining postcss-nested for CSS Module selectors; component ownership and the existing reset remain.
- Netlify CLI 27.12.0. Its deploy command now builds by default: explicit `--no-build` preserves uploading the already validated public directory and prepared IndexNow manifest. Authentication and hosted deployment remain external validation.
- Native Node fs/git import commands replace shelljs/simple-git. Node loadEnvFile replaces dotenv. Remove unused postcss-easy-media-query, redundant js-yaml/shelljs types and @ant-design/compatible. The owner subsequently authorized retiring the inactive form: its component/CSS/barrel, form-only translations and Ant Design are now removed; Calendly contact pages remain.
- Sharp 0.35.5 and a native TypeScript icon command replace the unusable shell icon command. The previous Yarn installation failed a fresh-process load. Clean npm ci resolves the native layout: Sharp 0.35.5 loads libvips 8.18.7, and the icon fixture generates and verifies all 19 PNG sizes. No binary or library-path patch is used.
- ESLint project resolution is anchored to import.meta.dirname so editor subdirectories resolve the real tsconfig. React.version explicitly configures eslint-plugin-react instead of its incompatible ESLint 10 autodetection path. DOM linting catches obsolete iframe attributes. New fixtures exercise editor cwd, lint-staged rejection, native repository imports and PNG generation.

The portable foundation also removes unused pngjs, the unused runtime ThemeContext and the YAML-to-CSS generator. Tokens are directly editable CSS variables. Category slugs now use one shared native TypeScript function: all 37 current labels matched the former Lodash output before removal, and representative behavior tests cover ongoing edits. Remove the direct Lodash and type declarations; Gatsby still requires transitive Lodash, so this removes application coupling rather than claiming to eliminate every installed copy. At the portable-foundation checkpoint, the lock had 2,906 entries versus the original 3,040: 165 removed, 31 added for Tailwind and platform variants, no retained version changes. That checkpoint had 81 direct declarations (37 runtime, 44 development). Installation reported Gatsby-owned peer/deprecation diagnostics and 111 audit findings; this is not warning-free acceptance.

The PostCSS integration now passes the shared ESM configuration directly through Gatsby's supported `postcssOptions`, with config-file discovery disabled. The installed postcss-loader 7.3.4 discovers `.mjs` but returns its module namespace without unwrapping the default export, silently skipping the plugins. Generated-output coverage caught the unprocessed directives; the corrected production assets contain actual utilities. This follows the [loader's documented inline configuration](https://webpack.js.org/loaders/postcss-loader/#postcssoptions) rather than patching loader internals.

## npm and Pongo comparison

Pongo's actual files were read again on 2026-10-10: src/package.json, package-lock.json, eslint.config.mjs, shared/lint tsconfigs, Prettier/EditorConfig, root VS Code settings/tasks and build workflow. Use its npm 11.9.0 baseline, npm ci and npm run scripts. Shared TypeScript, Prettier and EditorConfig files already match; keep Gatsby-specific JSX/DOM configuration, generated-output exclusions and React/accessibility checks. No database/Cloudflare workspace rules are copied. Vitest configuration lives in tests/vitest.config.ts under the existing ESM tests scope, following [Vite config-loading requirements](https://vite.dev/config/#config-loading). Its command and VS Code debugger select that file explicitly. The root ESM boundary remains documented in README because Gatsby emits CommonJS SSR bundles; source scopes use native modules.

Replace Yarn resolutions with npm overrides. Normal npm resolution reproduced ERESOLVE for the React/accessibility lint plugins. Scoped overrides bind those plugins to the project's tested ESLint and the Gatsby localization plugin to the project's tested React/i18next versions. Keep the existing single React type version. These explicit compatibility exceptions do not assert upstream peer support: remove them when published peer ranges support this stack. No blanket legacy-peer-deps or force setting is used; unrelated upstream peer/deprecation warnings remain visible. See [npm overrides](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides), [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/) and [Netlify deploy](https://cli.netlify.com/commands/deploy/).

## Remaining transitive advisories

Normal npm audit fix (without force) updates compatible dependencies, including loader-utils 2.0.4 and shell-quote 1.12.0. The audit decreases from 126 findings (including two critical) to 112: 19 low, 32 moderate, 61 high and zero critical. Remaining affected direct integration chains are Gatsby plugins and Netlify CLI. They are not all application runtime exploits, and the dependency tree is not declared vulnerability-free. npm proposes incompatible Gatsby plugin downgrades for some findings; assess those upstream dependencies separately rather than apply force, blanket overrides or exclusions. Reproduce with npm audit.

The later form retirement removes 70 lock entries without changing retained versions. Its saved audit reports 111 affected entries: 19 low, 31 moderate, 61 high, zero critical, from 29 distinct advisory URLs. Root Sharp/lodash upgrades do not replace Gatsby's nested older copies. The comparison documents ownership/exposure and remediation priorities; passing npm ci is not proof of a supported or secure dependency graph.

## Validation status

Before this research/form retirement, the npm graph passed clean npm ci, root/NodeNext/browser types, smoke, actual fix/format and uncached lint, all 12 tooling/CLI cases, all 19 component tests, the full suite and all 57 browser cases with unchanged screenshots. That build passed in 120.08s and preserved the 697-route/feed/sitemap contract. Warm content modification/deletion/restoration and module/global CSS edit/restoration passed, including browser styles and restored publication/search output. Current form-retirement validation and remaining warnings are recorded separately in todo.md. Hosted CI/deployment are separate pending checks; no live deployment or indexing notification was performed. Keep Gatsby's default JSX runtime and the existing screenshot tolerances.

## Registry inventory

The manifest now contains 79 direct declarations (36 application/build integrations and 43 development tools/type packages), after the authorized form retirement, portable foundation and native font-loader cleanup. “At audit” is the original installed version; “Current” is the implementation, with application checks and peer/security limitations separated above. Removed declarations may remain transitively owned by Gatsby or another active package. The Yarn-only postinstall-postinstall helper is removed; npm applies patch-package through postinstall.

| Package                            | At audit    | Current              | Last checked latest    |
| ---------------------------------- | ----------- | -------------------- | ---------------------- |
| @ant-design/compatible             | 1.0.8       | removed              | 5.1.5                  |
| @eslint/js                         | 9.39.5      | 10.0.1               | 10.0.1                 |
| @playwright/browser-chromium       | 1.63.0      | 1.64.0               | 1.64.0                 |
| @playwright/test                   | 1.63.0      | 1.64.0               | 1.64.0                 |
| @types/escape-html                 | 1.0.4       | 1.0.4                | 1.0.4                  |
| @types/fontfaceobserver            | 2.1.3       | removed              | 2.1.3                  |
| @types/js-yaml                     | 4.0.9       | removed              | 4.0.9                  |
| @types/lodash                      | 4.17.25     | removed              | 4.17.26                |
| @types/mdast                       | 4.0.4       | 4.0.4                | 4.0.4                  |
| @types/node                        | 24.19.1     | 24.19.2              | 26.6.5                 |
| @types/react                       | 18.3.31     | 19.3.0               | 19.3.0                 |
| @types/react-dom                   | 18.3.7      | 19.3.0               | 19.3.0                 |
| @types/shelljs                     | 0.10.0      | removed              | 0.10.0                 |
| @types/turndown                    | 5.0.6       | 5.0.6                | 5.0.6                  |
| @types/webpack-bundle-analyzer     | 4.7.0       | 4.7.0                | 4.7.0                  |
| @typescript-eslint/eslint-plugin   | 8.59.0      | 8.71.1               | 8.71.1                 |
| @typescript-eslint/parser          | 8.59.0      | 8.71.1               | 8.71.1                 |
| @vitejs/plugin-react               | 5.2.0       | 6.1.2                | 6.1.2                  |
| @weknow/gatsby-remark-twitter      | 0.2.3       | 0.2.3                | 0.2.3                  |
| antd                               | 4.16.12     | removed              | 6.6.5                  |
| cheerio                            | 1.0.0-rc.12 | 1.2.0                | 1.2.0                  |
| disqus-react                       | 1.1.7       | 1.1.7                | 1.1.7                  |
| dotenv                             | 10.0.0      | removed              | 18.0.6                 |
| escape-html                        | 1.0.3       | 1.0.3                | 1.0.3                  |
| eslint                             | 9.39.5      | 10.12.0              | 10.12.0                |
| eslint-config-prettier             | 10.1.8      | 10.1.8               | 10.1.8                 |
| eslint-plugin-jsx-a11y             | 6.10.2      | 6.10.2               | 6.10.2                 |
| eslint-plugin-prettier             | 5.5.5       | 5.5.6                | 5.5.6                  |
| eslint-plugin-react                | 7.37.5      | 7.37.5               | 7.37.5                 |
| eslint-plugin-react-hooks          | 7.1.1       | 7.1.1                | 7.1.1                  |
| fontfaceobserver                   | 2.1.0       | removed              | 2.3.0                  |
| gatsby                             | 5.16.1      | 5.16.1               | 5.16.1                 |
| gatsby-plugin-catch-links          | 5.16.0      | 5.16.0               | 5.16.0                 |
| gatsby-plugin-feed                 | 5.16.0      | 5.16.0               | 5.16.0                 |
| gatsby-plugin-google-tagmanager    | 5.16.0      | 5.16.0               | 5.16.0                 |
| gatsby-plugin-image                | 3.16.0      | 3.16.0               | 3.16.0                 |
| gatsby-plugin-layout               | 4.16.0      | 4.16.0               | 4.16.0                 |
| gatsby-plugin-manifest             | 5.16.0      | 5.16.0               | 5.16.0                 |
| gatsby-plugin-netlify              | 5.1.1       | 5.1.1                | 5.1.1                  |
| gatsby-plugin-postcss              | 6.16.0      | 6.16.0               | 6.16.0                 |
| gatsby-plugin-react-i18next        | 3.0.1       | 3.0.1                | 3.0.1                  |
| gatsby-plugin-remove-serviceworker | 1.0.0       | 1.0.0                | 1.0.0                  |
| gatsby-plugin-sharp                | 5.16.0      | 5.16.0               | 5.16.0                 |
| gatsby-plugin-sitemap              | 6.16.0      | 6.16.0               | 6.16.0                 |
| gatsby-remark-autolink-headers     | 6.16.0      | 6.16.0               | 6.16.0                 |
| gatsby-remark-copy-linked-files    | 6.16.0      | 6.16.0               | 6.16.0                 |
| gatsby-remark-embed-video          | 3.2.1       | 3.2.1                | 3.2.1                  |
| gatsby-remark-images               | 7.16.0      | 7.16.0               | 7.16.0                 |
| gatsby-remark-prismjs              | 7.16.0      | 7.16.0               | 7.16.0                 |
| gatsby-remark-responsive-iframe    | 6.16.0      | 6.16.0               | 6.16.0                 |
| gatsby-remark-smartypants          | 6.16.0      | 6.16.0               | 6.16.0                 |
| gatsby-source-filesystem           | 5.16.0      | 5.16.0               | 5.16.0                 |
| gatsby-transformer-json            | 5.16.0      | 5.16.0               | 5.16.0                 |
| gatsby-transformer-remark          | 6.16.0      | 6.16.0               | 6.16.0                 |
| gatsby-transformer-sharp           | 5.16.0      | 5.16.0               | 5.16.0                 |
| globals                            | 17.5.0      | 17.13.0              | 17.13.0                |
| husky                              | 9.1.7       | 9.1.7                | 9.1.7                  |
| i18next                            | 22.5.1      | 26.4.3               | 26.4.3                 |
| js-yaml                            | 4.1.0       | 5.4.3                | 5.4.3                  |
| lint-staged                        | 17.6.0      | 17.6.0               | 17.6.0                 |
| lodash                             | 4.17.21     | removed              | 4.18.1                 |
| minisearch                         | 7.2.0       | 7.2.0                | 7.2.0                  |
| netlify-cli                        | 6.7.1       | 27.12.0              | 27.12.0                |
| netlify-redirect-parser            | 11.0.2      | 14.4.0               | 14.4.0                 |
| patch-package                      | 8.0.1       | 8.0.1                | 8.0.1                  |
| pixelmatch                         | 7.2.0       | 8.0.0                | 8.0.0                  |
| playwright                         | 1.63.0      | 1.64.0               | 1.64.0                 |
| pngjs                              | 7.0.0       | removed              | 7.0.0                  |
| postcss                            | 8.3.6       | 8.5.29               | 8.5.29                 |
| postcss-easy-media-query           | 1.0.0       | removed              | 1.0.0                  |
| postcss-nested                     | 5.0.6       | 8.0.1                | 8.0.1                  |
| postcss-preset-env                 | 6.7.0       | removed              | 11.6.1                 |
| postinstall-postinstall            | 2.1.0       | removed              | 2.1.0                  |
| prettier                           | 3.8.3       | 3.9.10               | 3.9.10                 |
| prismjs                            | 1.27.0      | 1.30.0               | 1.30.0                 |
| react                              | 18.3.1      | 19.3.0               | 19.3.0                 |
| react-dom                          | 18.3.1      | 19.3.0               | 19.3.0                 |
| react-i18next                      | 12.3.1      | 17.0.16              | 17.0.16                |
| react-icons                        | 4.2.0       | 5.7.0                | 5.7.0                  |
| react-share                        | 5.3.0       | 5.3.0                | 5.3.0                  |
| react-visibility-sensor            | 5.1.1       | removed              | 5.1.1                  |
| remark                             | 13.0.0      | 15.0.1               | 15.0.1                 |
| sharp                              | 0.32.6      | 0.35.5               | 0.35.5                 |
| shelljs                            | 0.8.5       | removed              | 0.10.0                 |
| simple-git                         | 3.3.0       | removed              | 4.0.2                  |
| turndown                           | 7.2.4       | 7.2.4                | 7.2.4                  |
| turndown-plugin-gfm                | 1.0.2       | 1.0.2                | 1.0.2                  |
| typescript                         | 6.0.3       | TS6 API alias        | 7.0.2 (native checker) |
| unist-util-visit                   | 2.0.3       | 5.1.0                | 5.1.0                  |
| vite                               | 7.3.6       | 8.3.4                | 8.3.4                  |
| vitest                             | 5.0.1       | 5.0.3                | 5.0.3                  |
| webpack-bundle-analyzer            | 4.4.2       | 5.4.0                | 5.4.0                  |
| @typescript/native                 | —           | npm:typescript@7.0.2 | 7.0.2                  |
