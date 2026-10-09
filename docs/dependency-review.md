# Direct dependency review — 2026-10-09

Registry audit of all 86 direct dependencies before upgrade candidates: 42 installed versions are behind the latest stable release. Gatsby 5.16.1 and the official Gatsby plugins are current. This is an inventory, not a claim that every latest major is compatible. Re-run `yarn outdated` to refresh the comparison.

## Applied upgrades

- ESLint 10.12.0 / @eslint/js 10.0.1: isolated full-project uncached lint, installed lint, staging/accessibility fixtures and full-suite acceptance pass with the existing plugins.
- React / React DOM 19.3.0, matching types and react-icons 5.7.0: production build, strict checks and all 57 browser cases pass. Remove the actual findDOMNode dependency; the header uses native visibility detection with a cleaned-up event fallback. Keep Gatsby's default JSX runtime after the automatic-runtime experiment fails font checks. The localization plugin still declares React 18; bilingual SSR/hydration/navigation is verified locally.
- Keep Node types on the actual Node 24 runtime.
- Other major upgrades remain a coordinated follow-up: CSS transforms and Ant Design can change rendering; i18next must match the Gatsby localization plugin; TypeScript is also imported as a compiler API by project tools; sharp and remark must remain compatible with Gatsby plugins; deployment tools need manual command validation. A newer version alone does not establish compatibility.

Sources: [Gatsby React 19 support](https://www.gatsbyjs.com/docs/reference/release-notes/v5.16/), [React upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide), [Gatsby JSX runtime](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/#jsxruntime). Installed and latest plugin manifests provide peer ranges; actual project checks provide runtime evidence.

## Local validation

ESLint 10.12.0 and @eslint/js 10.0.1 are installed; full lint, TypeScript staging/accessibility fixtures and the full nonvisual suite pass. React 19.3.0, matching types and react-icons 5.7.0 pass strict compiler checks, 19 component tests, production build and the nonvisual suite (170.22s). The removed react-visibility-sensor is replaced with a native observer and cleanup; its findDOMNode calls are incompatible with React 19.

The automatic JSX runtime experiment fails browser font/screenshot checks despite the successful build. Gatsby's React 19 Head compatibility code intercepts React.createElement; automatic JSX bypasses that interception and React document singletons remove live font attributes. The clean default-runtime build passes (676.97s), and the original archive/font/screenshot case now passes unchanged (7.65s). Runtime switches require a clean build; all 57 browser cases pass (186.31s), including the supported/unsupported observer paths. The final full suite passes (170.50s), and warm-cache modification/deletion/restoration passes (155.77s). No React compatibility patch or relaxed assertion is added. Existing plugin peer warnings remain visible: localization declares React 18 and React/accessibility lint plugins declare older ESLint ranges. Local integration evidence is distinct from upstream declared support. Hosted CI/deployment remain pending.

## Remaining upgrade batches

1. Compatible tooling/utilities: TypeScript ESLint parser/plugin together, Prettier and its plugin, globals, Vitest, the Vite 7 patch, fontfaceobserver, Prism, lodash and other compatible minor/patch releases. Re-run formatting, real staging/security fixtures, build and browser checks; a nonbreaking version range does not replace acceptance.
2. Browser tooling: update all three Playwright packages together, install the matching Chromium revision and compare existing reviewed screenshots. Do not update PNGs merely to accommodate a new browser version.
3. Compiler/test tooling majors: TypeScript 7.0 has no compiler API, while the smoke/search tools and typed ESLint require the TypeScript 6 API. [Microsoft documents a supported side-by-side setup](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0) using the TS7 CLI with an aliased TS6 API. Evaluate that explicitly instead of replacing the API package blindly. Assess Vite 8 / React plugin 6 together.
4. Import/build tooling: remark 15 / unist-util-visit 5, Cheerio, YAML, sharp and Netlify redirect parser, preserving importer security and rendered content. Upgrade related APIs together.
5. Styling and localization: PostCSS transformation majors and Ant Design require rendering/form checks; newer i18next/react-i18next need a compatible Gatsby integration. Contact restoration remains deferred.
6. Deployment/manual tools: review Netlify CLI 27 command/authentication compatibility, simple-git, shelljs and bundle analyzer before changing manual commands.

Keep Node 24 type declarations aligned with the actual runtime. The remaining versions are visible in this inventory and remain follow-up work, not silently treated as current.

## Registry inventory

“At audit” records the initial installed version; “Now” shows the accepted installed version. Removing the obsolete visibility package leaves 85 direct dependencies. Seven outdated declarations have been upgraded; 35 still differ from the registry latest, including Node types deliberately aligned with Node 24. The remaining batches above are follow-up work.

| Package                            | At audit    | Now         | Latest  |
| ---------------------------------- | ----------- | ----------- | ------- |
| @ant-design/compatible             | 1.0.8       | 1.0.8       | 5.1.5   |
| @eslint/js                         | 9.39.5      | 10.0.1      | 10.0.1  |
| @playwright/browser-chromium       | 1.63.0      | 1.63.0      | 1.64.0  |
| @playwright/test                   | 1.63.0      | 1.63.0      | 1.64.0  |
| @types/escape-html                 | 1.0.4       | 1.0.4       | 1.0.4   |
| @types/fontfaceobserver            | 2.1.3       | 2.1.3       | 2.1.3   |
| @types/js-yaml                     | 4.0.9       | 4.0.9       | 4.0.9   |
| @types/lodash                      | 4.17.25     | 4.17.25     | 4.17.25 |
| @types/mdast                       | 4.0.4       | 4.0.4       | 4.0.4   |
| @types/node                        | 24.19.1     | 24.19.1     | 26.6.4  |
| @types/react                       | 18.3.31     | 19.3.0      | 19.3.0  |
| @types/react-dom                   | 18.3.7      | 19.3.0      | 19.3.0  |
| @types/shelljs                     | 0.10.0      | 0.10.0      | 0.10.0  |
| @types/turndown                    | 5.0.6       | 5.0.6       | 5.0.6   |
| @types/webpack-bundle-analyzer     | 4.7.0       | 4.7.0       | 4.7.0   |
| @typescript-eslint/eslint-plugin   | 8.59.0      | 8.59.0      | 8.71.1  |
| @typescript-eslint/parser          | 8.59.0      | 8.59.0      | 8.71.1  |
| @vitejs/plugin-react               | 5.2.0       | 5.2.0       | 6.1.2   |
| @weknow/gatsby-remark-twitter      | 0.2.3       | 0.2.3       | 0.2.3   |
| antd                               | 4.16.12     | 4.16.12     | 6.6.5   |
| cheerio                            | 1.0.0-rc.12 | 1.0.0-rc.12 | 1.2.0   |
| disqus-react                       | 1.1.7       | 1.1.7       | 1.1.7   |
| dotenv                             | 10.0.0      | 10.0.0      | 18.0.6  |
| escape-html                        | 1.0.3       | 1.0.3       | 1.0.3   |
| eslint                             | 9.39.5      | 10.12.0     | 10.12.0 |
| eslint-config-prettier             | 10.1.8      | 10.1.8      | 10.1.8  |
| eslint-plugin-jsx-a11y             | 6.10.2      | 6.10.2      | 6.10.2  |
| eslint-plugin-prettier             | 5.5.5       | 5.5.5       | 5.5.6   |
| eslint-plugin-react                | 7.37.5      | 7.37.5      | 7.37.5  |
| eslint-plugin-react-hooks          | 7.1.1       | 7.1.1       | 7.1.1   |
| fontfaceobserver                   | 2.1.0       | 2.1.0       | 2.3.0   |
| gatsby                             | 5.16.1      | 5.16.1      | 5.16.1  |
| gatsby-plugin-catch-links          | 5.16.0      | 5.16.0      | 5.16.0  |
| gatsby-plugin-feed                 | 5.16.0      | 5.16.0      | 5.16.0  |
| gatsby-plugin-google-tagmanager    | 5.16.0      | 5.16.0      | 5.16.0  |
| gatsby-plugin-image                | 3.16.0      | 3.16.0      | 3.16.0  |
| gatsby-plugin-layout               | 4.16.0      | 4.16.0      | 4.16.0  |
| gatsby-plugin-manifest             | 5.16.0      | 5.16.0      | 5.16.0  |
| gatsby-plugin-netlify              | 5.1.1       | 5.1.1       | 5.1.1   |
| gatsby-plugin-postcss              | 6.16.0      | 6.16.0      | 6.16.0  |
| gatsby-plugin-react-i18next        | 3.0.1       | 3.0.1       | 3.0.1   |
| gatsby-plugin-remove-serviceworker | 1.0.0       | 1.0.0       | 1.0.0   |
| gatsby-plugin-sharp                | 5.16.0      | 5.16.0      | 5.16.0  |
| gatsby-plugin-sitemap              | 6.16.0      | 6.16.0      | 6.16.0  |
| gatsby-remark-autolink-headers     | 6.16.0      | 6.16.0      | 6.16.0  |
| gatsby-remark-copy-linked-files    | 6.16.0      | 6.16.0      | 6.16.0  |
| gatsby-remark-embed-video          | 3.2.1       | 3.2.1       | 3.2.1   |
| gatsby-remark-images               | 7.16.0      | 7.16.0      | 7.16.0  |
| gatsby-remark-prismjs              | 7.16.0      | 7.16.0      | 7.16.0  |
| gatsby-remark-responsive-iframe    | 6.16.0      | 6.16.0      | 6.16.0  |
| gatsby-remark-smartypants          | 6.16.0      | 6.16.0      | 6.16.0  |
| gatsby-source-filesystem           | 5.16.0      | 5.16.0      | 5.16.0  |
| gatsby-transformer-json            | 5.16.0      | 5.16.0      | 5.16.0  |
| gatsby-transformer-remark          | 6.16.0      | 6.16.0      | 6.16.0  |
| gatsby-transformer-sharp           | 5.16.0      | 5.16.0      | 5.16.0  |
| globals                            | 17.5.0      | 17.5.0      | 17.13.0 |
| husky                              | 9.1.7       | 9.1.7       | 9.1.7   |
| i18next                            | 22.5.1      | 22.5.1      | 26.4.2  |
| js-yaml                            | 4.1.0       | 4.1.0       | 5.4.3   |
| lint-staged                        | 17.6.0      | 17.6.0      | 17.6.0  |
| lodash                             | 4.17.21     | 4.17.21     | 4.18.1  |
| minisearch                         | 7.2.0       | 7.2.0       | 7.2.0   |
| netlify-cli                        | 6.7.1       | 6.7.1       | 27.12.0 |
| netlify-redirect-parser            | 11.0.2      | 11.0.2      | 14.4.0  |
| patch-package                      | 8.0.1       | 8.0.1       | 8.0.1   |
| pixelmatch                         | 7.2.0       | 7.2.0       | 8.0.0   |
| playwright                         | 1.63.0      | 1.63.0      | 1.64.0  |
| pngjs                              | 7.0.0       | 7.0.0       | 7.0.0   |
| postcss                            | 8.3.6       | 8.3.6       | 8.5.29  |
| postcss-easy-media-query           | 1.0.0       | 1.0.0       | 1.0.0   |
| postcss-nested                     | 5.0.6       | 5.0.6       | 8.0.1   |
| postcss-preset-env                 | 6.7.0       | 6.7.0       | 11.6.1  |
| postinstall-postinstall            | 2.1.0       | 2.1.0       | 2.1.0   |
| prettier                           | 3.8.3       | 3.8.3       | 3.9.9   |
| prismjs                            | 1.27.0      | 1.27.0      | 1.30.0  |
| react                              | 18.3.1      | 19.3.0      | 19.3.0  |
| react-dom                          | 18.3.1      | 19.3.0      | 19.3.0  |
| react-i18next                      | 12.3.1      | 12.3.1      | 17.0.16 |
| react-icons                        | 4.2.0       | 5.7.0       | 5.7.0   |
| react-share                        | 5.3.0       | 5.3.0       | 5.3.0   |
| react-visibility-sensor            | 5.1.1       | removed     | 5.1.1   |
| remark                             | 13.0.0      | 13.0.0      | 15.0.1  |
| sharp                              | 0.32.6      | 0.32.6      | 0.35.5  |
| shelljs                            | 0.8.5       | 0.8.5       | 0.10.0  |
| simple-git                         | 3.3.0       | 3.3.0       | 4.0.2   |
| turndown                           | 7.2.4       | 7.2.4       | 7.2.4   |
| turndown-plugin-gfm                | 1.0.2       | 1.0.2       | 1.0.2   |
| typescript                         | 6.0.3       | 6.0.3       | 7.0.2   |
| unist-util-visit                   | 2.0.3       | 2.0.3       | 5.1.0   |
| vite                               | 7.3.6       | 7.3.6       | 8.3.4   |
| vitest                             | 5.0.1       | 5.0.1       | 5.0.3   |
| webpack-bundle-analyzer            | 4.4.2       | 4.4.2       | 5.4.0   |
