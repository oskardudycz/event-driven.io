# SEO, discoverability, and services plan

## Portable styling and dependency quick wins — 2026-10-10

**Current agreed scope:** finish the portable foundation, keep useful CSS Modules, then make one coordinated shared-layout/theme change using Tailwind. Do not convert all existing CSS declarations into utilities merely for consistency. This replaces the proposed appearance-preserving rewrite and its multi-day estimate with a smaller scope, rather than promising the same rewrite in less time. Stay on Gatsby for this pass. Astro remains a later explicit decision; no framework migration is authorized by this stage.

Keep Pongo's ESLint/Prettier integration exactly as requested. The owner selected Tailwind, accepts modern CSS output and approved CSS variables as the token source. Add Tailwind 4 through Gatsby's documented PostCSS integration, retaining the existing reset and component-owned CSS Modules. Preserve all current token values while making CSS the single editable source; remove the unused runtime ThemeContext and YAML generation layer. Remove proven-unused pngjs and inert resolver settings, and narrow Lodash imports without changing the slug algorithm. Keep Turndown: article import actively uses it.

Execution is grouped by outcome:

1. **Portable foundation:** finish the current dependency/token/Tailwind cleanup and validate installation, emitted CSS, page contracts and existing browser behavior. Remove project-owned unnecessary packages and obsolete mechanisms. Investigate install warnings by owning dependency; never hide warnings or rewrite peer metadata to claim a clean installation. Gatsby-owned unresolved warnings must remain explicit blockers to the warning-free target.
2. **Shared layout:** use Tailwind for actual improvements to the shared shell, navigation, spacing and reusable presentation where it simplifies the code. Retain complex responsive selectors, article typography and other useful scoped CSS. The layout may change within the owner's "close enough and continues to look well" allowance; avoid pixel-perfect compatibility hacks. Preserve routes, article content, bilingual navigation and essential interactions.
3. **Theme:** add light/dark/system behavior using the same CSS variables and a small accessible control. Verify initial rendering, persisted preference, system changes and contrast across representative pages. No replacement styling runtime or theme provider is needed.

Stages 2 and 3 form one coordinated layout/theme change after foundation acceptance, rather than a series of component-by-component conversions. Finish the shared shell and reusable presentation as one reviewable outcome; leave working article typography and complex scoped styles alone. Review intentional visual differences explicitly; do not automatically accept new snapshots or relax tolerances. Reuse existing route/SEO/browser checks. Avoid intermediate Gatsby-only abstractions that would need replacing in Astro. A template-derived redesign is an alternative only if explicitly selected later; it is not the current plan.

Validate emitted utilities, nested module selectors, token contrast and production page contracts, then existing responsive/bilingual browser checks with unchanged screenshots. Native font-loader replacement and share-control changes need separate behavioral validation; keep existing font readiness and sharing features for this pass. Recommend finishing portable cleanup before an Astro parity prototype, and assess the prototype before substantial Gatsby-specific redesign. Astro adoption is a separate decision, not part of this implementation.

Research Starlight for typed content, localized navigation/fallback, Pagefind, CSS variables and accessible theme controls. It is a documentation framework rather than a replacement blog template; do not copy its sidebar, reset or content conventions into the live blog.

**Current implementation status:** the working tree contains foundation cleanup and a draft coordinated layout/theme change: utilities for the shell/footer, summaries, related headings, contact typography and video grids, plus a localized light/dark/system control. Navigation's stateful responsive rules and article typography remain scoped; diagrams retain a white canvas and iframe styling stays provider-owned. This draft is not accepted as complete. Focused browser checks pass three theme-preference scenarios but fail the video-grid and mobile-width scenarios. Generated CSS still contains unprocessed Tailwind directives, so checking the standalone PostCSS pipeline was insufficient. The next implementation task is to establish supported Gatsby/PostCSS configuration loading and verify actual emitted utilities before further styling work. Then rerun responsive, bilingual, screenshot and warm-cache checks. Keep these failures and unresolved installation warnings visible in todo.md; successful builds or earlier browser runs do not certify this draft.

## Starter comparison and contact-form retirement — 2026-10-10

The completed [starter comparison](docs/gatsby-starter-comparison.md) uses the official minimal Gatsby/blog starters and AstroPaper as the popular maintained modern Tailwind reference. Downloaded pinned sources, source/configuration review, registry metadata and isolated Linux npm fresh-resolution/audit probes distinguish current direct releases from upstream support and transitive security. The popular Next Tailwind sample supplies secondary patterns but fails the security baseline due to its stale exact framework pin; archived Gatsby community examples are excluded from recommendations. All 84 starting declarations have an owner/disposition. No sample build or performance parity is claimed.

The owner now authorizes retiring the unused contact form and Ant Design rather than preserving them for restoration. Remove its component, barrel, CSS and unused form translation keys, and update the manifest/lockfile together. Preserve the live bilingual Calendly contact page and existing routes. A future form is a separate design: research native HTML controls and documented hosted processing before selecting a provider or adding a form library. Earlier instructions below to retain the inactive form are superseded by this decision.

Passing previous application tests establishes behavior, not a clean dependency graph: npm peer conflicts and remaining transitive advisories still require remediation. Keep research/resolution evidence separate from clean installation, production build, hosted CI and deployment results.

After form retirement, the manifest had 83 declarations and the lock had 2,970 package entries, 70 fewer with no retained version changes. Audit still reported 111 affected entries / 29 distinct advisory URLs. The portable foundation above is now the current execution order. Tailwind with useful modules, modern browser output, CSS token ownership and Pongo formatting integration are settled. Preserve share features until a separately reviewed replacement has demonstrated benefits. Current validation evidence is maintained in todo.md.

## Dependency acceptance and npm migration — 2026-10-10

Finish the current dependency/tooling acceptance and migrate to npm as the next bounded category, before further CSS work. Reproduce the Sharp native-loader failure in a fresh process and compare clean package-manager installations; use the documented installer rather than library-path patches. Preserve current package versions and behavior unless an actual compatibility failure requires a change. Replace Yarn commands, lockfile, cache inputs, hooks, editor settings and manual instructions together. Use npm ci for reproducible installation and preserve patch-package's Gatsby correction. Research any peer-resolution conflict before choosing an explicit compatibility policy; do not silently force installs or rewrite upstream metadata. Validate strict types, editor linting from subdirectories, real fix/format commands, production output, the full suite, unchanged browser screenshots and warm-cache content changes. Record local results separately from hosted CI and deployment.

Local acceptance is complete on 2026-10-10. npm 11.9.0 follows the actual Pongo baseline; one package-lock.json replaces yarn.lock across commands, CI/download caches, Gatsby compatibility keys, hooks and editor tasks. Clean npm ci fixes the demonstrated Sharp/libvips layout without a loader patch. Scoped, documented npm overrides retain tested ESLint/localization versions where peer declarations lag. Native TypeScript 7 checking and the TS6 compiler API coexist through Microsoft's aliases; Vitest's .ts config uses the existing ESM tests scope. All 84 direct declarations are current except Node types intentionally matching Node 24. Compatible audit fixes remove both critical findings; 112 Gatsby/Netlify-chain findings remain for separate upstream review.

The final graph passes clean installation, smoke, root/NodeNext/browser types, actual fix/format and uncached lint, the full suite, all 57 browser cases, the unchanged 697-route/feed/sitemap contract, and content/CSS warm-cache modification/deletion/restoration. Existing screenshots and tolerances remain unchanged. Build timings and remaining diagnostics are recorded in todo.md; hosted CI/deployment are still pending. This supersedes earlier npm deferrals and Yarn-only execution instructions below, which describe historical checkpoints.

## Complete remaining dependency upgrades — 2026-10-09

Continue the owner-requested latest-package upgrade rather than stop at an inventory. Research and migrate remaining utilities/import APIs, matched browser/test tooling, localization, CSS transforms and manual tools in compatible groups. Test actual behavior before retaining an older version; peer ranges alone are not evidence of failure. Evaluate Microsoft's documented TypeScript 7 checker alongside the TypeScript 6 compiler API required by Gatsby/ESLint and project tools. Preserve reviewed screenshots, routes, content, language selection and the deferred contact page behavior. Record concrete blockers separately from completed upgrades and distinguish local acceptance from hosted CI/deployment.

## Coordinated TypeScript migration — 2026-10-09

The owner now authorizes the repository-wide migration previously deferred. Migrate application components/pages/layouts to .tsx and plain browser modules to .ts; migrate Node scripts/importers/tests/shared build helpers to native ESM .ts with explicit package scopes. Preserve content, CSS ownership, routes, publication identities and all existing assertions. Replace CommonJS imports/exports with native imports/exports, explicit Node-runtime extensions and import.meta.dirname/main. Use Gatsby/React and domain types, narrow external values at boundaries, and run an explicit no-emit TypeScript gate in CI (bundler resolution for Gatsby/Vite, NodeNext for native scripts); do not use ts-nocheck or blanket any declarations to turn renames into a nominal migration.

Research: [Gatsby TypeScript](https://www.gatsbyjs.com/docs/how-to/custom-configuration/typescript/), [Gatsby native ESM limitations](https://www.gatsbyjs.com/docs/how-to/custom-configuration/es-modules/), [Node 24 TypeScript](https://nodejs.org/docs/latest-v24.x/api/typescript.html). Gatsby 5.16's native hook discovery recognizes .mjs but not .mts, while its .ts hook compiler emits CommonJS. Retain documented .mjs entry files for native ESM hooks/configuration, forwarding to typed .ts implementation through Node 24's built-in loader. Framework-owned configuration discovery may likewise retain .mjs; do not add a runtime transpiler, private loader override or build-output rewrite. Local remark plugins use a package `main` pointing to index.ts and load natively. A clean build demonstrated that a root `type: module` misclassifies Gatsby's generated CommonJS SSR render-page.js. Omit it at the root; use standard Node package scopes with `type: module` for src, content/meta, site, scripts, import and tests, where .ts modules run in Node and Gatsby. This leaves framework output untouched and avoids typeless-module reparsing warnings. See the [upstream ESM limitation report](https://github.com/gatsbyjs/gatsby/discussions/37069) and [Node package scopes](https://nodejs.org/docs/latest-v24.x/api/packages.html#type). CSS Modules and YAML receive precise ambient declarations; third-party types use maintained declarations or narrow documented interfaces.

Update package commands, internal imports, Gatsby component paths, cache compatibility inputs, tooling fixtures and manual README commands together. Verify frozen installation, source/query smoke, type-checking, lint/format, production build, full tests and all existing browser/screenshot checks. Cold source-extension changes invalidate prior Gatsby compilation artifacts. Preserve screenshot baselines and build-contract fixtures; record local evidence separately from pending hosted CI/deployment.

## Pongo tooling alignment — 2026-10-09

The owner requests the Pongo TypeScript/ESLint/Prettier/VS Code setup as the starting point and ordinary .ts/.tsx source files rather than extension-specific ESM markers. Compare `/home/oskar/repos/Pongo/src/package.json`, tsconfig.shared.json, tsconfig.eslint.json, eslint.config.mjs, .prettierrc.json and the root VS Code configuration before implementation. Use Pongo's strict/erasable/verbatim module setup, type-only import rules, typed linting, formatting conventions and import/editor actions where compatible. Keep this project's React accessibility/hooks rules, Markdown preservation, Yarn commands and Node 24 runtime. Do not copy database/Cloudflare rules or Pongo's obsolete Node 20 editor hint.

Replace all .mts application-owned scripts/plugins/tests/implementation files with .ts using documented nearest-package `type: module` boundaries. Gatsby's generated SSR output must remain in its original package scope: the actual clean build with root `type: module` failed with `require is not defined` in .cache/page-ssr/routes/render-page.js; the corrected build passes (690.84s). Keep only loader-required .mjs configuration entries (including Pongo's own eslint.config.mjs convention). Do not patch generated output or install a custom loader to force root ESM. Document this tested Gatsby exception rather than claim exact Pongo parity. Run compiler/lint diagnostics before choosing additional strict rules; fix demonstrated errors and record any remaining stricter checks explicitly. Update commands, CI cache inputs, fixtures and README together before final acceptance.

Use the Pongo configuration files themselves as the starting point, as clarified by the owner. Copy tsconfig.shared.json, .prettierrc.json and .editorconfig; extend the shared compiler configuration for Gatsby's browser libraries, JSX, no-emit checking and source locations. Preserve Pongo's exactOptionalPropertyTypes/noUncheckedIndexedAccess and fix the diagnostics they expose rather than defer those settings. Copy the general ESLint configuration and retain its recommended/type-checked/Prettier/import rules; replace database/Cloudflare workspace restrictions with Gatsby source/configuration locations and React/accessibility rules. Keep native NodeNext checking for scripts. Document the precise Gatsby/React and output-directory differences; do not describe a selected subset of Pongo's settings as a copied setup.

## Current package audit and React/ESLint candidates — 2026-10-09

The owner requests checking every direct dependency against its latest stable release and testing ESLint 10/latest Gatsby-supported React rather than treating peer ranges alone as proof of incompatibility. Registry audit: 86 direct declarations, 42 outdated installed versions; Gatsby 5.16.1 and all configured official Gatsby plugins are current. Record the complete inventory in [docs/dependency-review.md](docs/dependency-review.md), including versions that need a coordinated major migration.

[Gatsby 5.16 officially supports React 19](https://www.gatsbyjs.com/docs/reference/release-notes/v5.16/). The latest registry React/React DOM release is 19.3.0. First remove the demonstrated runtime blocker: react-visibility-sensor calls findDOMNode, removed in React 19. Replace its 100ms polling with a component-owned IntersectionObserver on the existing sensor, preserve the full-visibility boundary and disconnect on unmount. Test Gatsby's documented [JSX runtime option](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/#jsxruntime). The automatic-runtime candidate clears live font attributes through React 19 document singletons: Gatsby's Head compatibility interception currently only wraps React.createElement. Compare the supported default runtime; do not patch React/Gatsby internals or weaken browser assertions. Upgrade matching React types/icons together and validate SSR, hydration, bilingual navigation, sticky scrolling and unchanged screenshots. gatsby-plugin-react-i18next 3.0.1 is still latest but declares React 18; distinguish local integration evidence from upstream declared support rather than change its metadata or add compatibility patches.

An isolated ESLint 10.12.0 / @eslint/js 10.0.1 installation passed a full uncached lint run with the current React/accessibility/TypeScript plugins and copied Pongo configuration. Upgrade these two direct tools and run the actual staging/accessibility fixtures too. Do not upgrade unrelated CSS transform majors, inactive Ant Design forms, TypeScript compiler internals or deployment tooling blindly; each needs its own compatibility and behavior acceptance. Keep Node types aligned with Node 24 instead of copying the latest Node 26 types.

Local acceptance is complete: exact copied Pongo shared TS/Prettier/EditorConfig settings, ordinary TypeScript/ESM source scopes, React 19.3.0 and ESLint 10.12.0 pass frozen installation, compiler/lint/staging/smoke checks, production build, full suite and all 57 browser cases. Keep Gatsby's default JSX runtime: the automatic experiment bypasses its current Head compatibility interception and fails browser font checks; a clean default-runtime build passes without a React patch. The final warm-cache modification/deletion/restoration passes, and the unchanged 697-route/feed/sitemap contract and reviewed screenshots remain intact. Detailed timings, peer metadata limits and hosted follow-ups are in todo.md. Remaining registry upgrades are explicitly listed in the dependency review rather than claimed complete.

## Dependency cleanup — 2026-10-09

Before the next performance category, audit direct dependencies against source imports (including deferred components), Gatsby/Babel/PostCSS configuration, CLI scripts, local plugins, tests, peer requirements and installation hooks. Remove only unused declarations and their obsolete command/comment remnants; do not upgrade active integrations or change rendered content. Existing build, security and browser checks validate behavior rather than asserting a historical package list.

Confirmed candidates are the unused core-js/normalize.css/react-obfuscate/tinycolor2/yaml-loader declarations, the unconfigured robots plugin (static/robots.txt owns the file), the unused Babel import plugin, the former Stylelint command/config packages and unused PostCSS/serve declarations. Remove the unused SVG plugin and duplicate root loader declarations; preserve the active PostCSS plugin and configured transforms. Keep postcss itself as the official plugin's peer, eslint-config-prettier for its recommended integration, mdast types and the browser installation dependency. Keep deferred contact dependencies, active sharing/import commands, Disqus, search, image tooling and installation patch hooks. The direct-import audit found no undeclared external runtime import; mdast is supplied by @types/mdast. The compiler/tooling declarations receive the starter comparison below before final removal.

Research: [Gatsby PostCSS setup](https://www.gatsbyjs.com/plugins/gatsby-plugin-postcss/), [Gatsby SVG plugin](https://www.gatsbyjs.com/plugins/gatsby-plugin-react-svg/) and [patch-package's Yarn 1 requirements](https://github.com/ds300/patch-package#yarn-v1). The installed plugin manifests confirm ownership of postcss-loader and svg-react-loader; patch-package requires postinstall-postinstall for Yarn 1. Preserve those installation hooks.

The expanded requested audit also replaces Bluebird's standard Promise/all/resolve uses with native promises and retires the unreferenced Facebook Comments component/package plus unused Post prop forwarding (Disqus and Facebook share buttons/metadata remain active). No source imports SVGs as React components, so remove the SVG plugin/configuration as well as its redundant root loader. The emoji-pattern audit finds no substitutions, so remove that unused plugin/configuration. Retain the Twitter plugin: comparison of actual built article markup proves it embeds bare tweet URLs after Gatsby auto-links them. A standalone remark parser did not reproduce Gatsby's auto-linking and incorrectly classified those URLs; generated-output comparison caught the mistake before final acceptance. JSON transformation is required by the talks gallery's allVideosJson query and stays. Remove the redundant sharp entry from the remark-transformer list; the root image/sharp plugins remain. Gatsby still compiles with Babel; preserve its internal compiler while simplifying the project-owned setup as described below. See [Gatsby Babel configuration](https://www.gatsbyjs.com/docs/how-to/custom-configuration/babel/) and [promise-based Node hooks](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#async-vs-sync-work).

The owner requested a comparison with fresh modern starters before retaining root compiler declarations. The official [minimal starter](https://github.com/gatsbyjs/gatsby-starter-minimal/blob/master/package.json) lists only Gatsby/React/React DOM; the [TypeScript starter](https://github.com/gatsbyjs/gatsby-starter-minimal-ts/blob/master/package.json) additionally lists TypeScript and Node/React type declarations. Gatsby owns its internal Babel/Bluebird/core-js dependency graph. Remove project-owned Babel usage rather than relying on incidental Yarn hoisting: move the two manual CommonJS compilation/render checks to existing Vitest module mocks, use TypeScript's compiler API for the syntax/GraphQL smoke check, and use the already installed TypeScript ESLint parser for JavaScript/JSX too. Configure the test runner's documented JSX loader for legacy .js components; preserve all security/timestamp assertions. This allows removal of the four direct @babel declarations. Explicitly declare Node 24 and React 18/React DOM types: the old undeclared hoisted types were Node 16 and React 17. The reachability review also confirms that the former Talks list is unused; remove its component/barrel/CSS while preserving the active video gallery and archived talk data. Keep Gatsby-discovered GraphQL fragments, SSR-imported font resources, build-owned search modules and the explicitly deferred contact form. Gatsby and Vite's React plugin keep ownership of their compiler internals. This is bounded test/tooling cleanup, not a repository-wide extension migration. References: [TypeScript compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API), [typescript-eslint parser JSX options](https://typescript-eslint.io/packages/parser/#ecmafeatures), [Vitest module mocks](https://vitest.dev/guide/mocking/modules), and [Vite 7 esbuild options](https://v7.vite.dev/config/shared-options.html#esbuild).

The official [default image-enabled starter](https://github.com/gatsbyjs/gatsby-starter-default/blob/master/package.json) and [blog starter](https://github.com/gatsbyjs/gatsby-starter-blog/blob/master/package.json) also omit root Babel declarations. Our installed Gatsby owns @babel/core, Bluebird and core-js internally. Yarn 1 reports an @babel/core peer warning for gatsby-plugin-image when the root declaration is removed; the plugin's compiler runs within Gatsby's Babel pipeline. Record this metadata warning and verify a cold build rather than restoring unused project imports or suppressing it. Existing Gatsby/Ant Design/webpack peer warnings are separate from this cleanup; retain deferred contact dependencies and do not force internal dependency upgrades.

Acceptance also exposed a responsive menu failure after a mobile-to-desktop resize. The menu measures window/prop changes, while its header continues a 0.5s padding transition that changes the actual available width afterward. A container-only resize regression reproduced the stale overflow state before the application fix. The menu now observes its owning container with native ResizeObserver, remeasures through React state/ref lifecycles only when its width changes, and disconnects on unmount. CSS, existing assertions and screenshot tolerances remain unchanged; repeated shrink/grow checks report no observer errors. [ResizeObserver reports element dimensions](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver); [React documents measuring layout through refs before paint](https://react.dev/reference/react/useLayoutEffect).

Local acceptance is complete: 29 unused direct dependencies removed, three matching runtime type packages added, frozen installation/lint/smoke/build/full nonvisual tests passing, and all 55 browser cases passing with unchanged screenshots. Rendered article markup matches the pre-cleanup output across all 694 generated pages. Retained lockfile versions are unchanged. Results and remaining dependency warnings are recorded in todo.md; hosted CI/deployment remain separate. The next performance category remains measured font loading/CLS work.

## Current execution order — 2026-10-09

The supplied deployment `6ac7e39e32aee76765a22ec6` exposes a navigation regression: Polish related cards select English canonical records, and the reading-list/archive adapters force English for placeholder articles. A canonical URL describes indexing identity; it must not silently override a visitor's chosen interface language. Prefer an existing route in the current locale for related cards, archives, category reading lists and search results, including untranslated copies. Fall back only when that route does not exist. Keep English content labels and canonical/hreflang/sitemap policy accurate; explicit language switching remains available.

Execute the requested categories in order:

1. Reconcile this strategy and the live checklist. Runtime is Node 24, Gatsby 5.16.1 and npm 11.9.0; React/React DOM 19.3.0 and ESLint 10.12.0 now pass local build/full-suite/browser/cache acceptance. CSS Modules, root/localized 404 recovery, full lint, image descriptions/enforcement, workshop translation and anti-patterns collision removal are complete. Old checkpoint timings describe their original revisions, not current pending work.
2. Completed: locale-preserving discovery navigation with SSR/client regressions and the bounded script/Node-test readability pass: replace repeated ad-hoc CLI parsing with Node's built-in parseArgs, share actual Markdown traversal duplication, and use Node test cleanup hooks through a small temporary-directory fixture. Keep existing CLI commands and security checks; no repository-wide module rename or generic testing framework.
3. Copied Pongo configuration, coordinated TypeScript/ESM migration, React/ESLint upgrades and the full registry inventory now pass local acceptance. The remaining package upgrades and npm migration pass local acceptance; hosted CI/deployment and remaining upstream audit findings are tracked separately.
4. Profile font loading/CLS and select only measured typography-preserving changes.
5. Validate the latest hosted CI and deployed behavior, then production IndexNow publication/submission and repeated comparable mobile audits. A supplied preview is evidence of a deployment, not proof of every CI check or production publication.

Research: [Gatsby internal/external links](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-link/), [Google localized/canonical versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [Node 24 CLI parsing](https://nodejs.org/docs/latest-v24.x/api/util.html#utilparseargsconfig), [Node 24 test cleanup](https://nodejs.org/docs/latest-v24.x/api/test.html#contextafterfn-options).

The navigation/readability implementation now passes the production build, full nonvisual suite and all 54 browser cases with unchanged screenshots and route/feed/sitemap contracts. The bounded cleanup uses native CLI parsing/traversal and a small Node test cleanup fixture; search profiling now loads actual native modules instead of rewriting source exports. Validation exposed and corrected a traversal callback return value and an obsolete forced-English category assertion. A traced repeat identifies the negative-timer diagnostics in Gatsby's pinned LMDB scheduleFlush; they remain visible pending an upstream dependency investigation. Warm-cache modification/deletion/restoration and restored-build navigation/search/contract checks pass. Current verification details and pending hosted checks are consolidated in todo.md.

The sections below retain historical research and acceptance evidence. This section and todo.md determine current execution order; earlier “next”, “current” and “pending” statements describe their dated checkpoints.

## Test readability and framework helpers — 2026-10-08

The owner requests using built-in test helpers and small reusable functions rather than repeated setup or custom frameworks. Research [Playwright fixtures](https://playwright.dev/docs/test-fixtures), [retrying locator assertions](https://playwright.dev/docs/test-assertions), [native screenshot comparisons](https://playwright.dev/docs/test-snapshots) and [Vitest fixtures](https://vitest.dev/guide/test-context) before editing. Use Playwright Test for browser acceptance, with framework-owned page/context cleanup, base URL, local server lifecycle, traces and screenshot artifacts; retain Vitest for component rendering/mocks. Split the browser suite by tested behavior, replace mechanical polling with locator assertions, and share only genuine repeated domain checks. Preserve every existing scenario, static/client locale variants, original screenshot files, colour threshold 0.2, 3% differing-pixel limit and explicit reviewed snapshot updates. Do not add retries that hide failures, generic page-object classes or a second homemade runner. Record local acceptance separately from hosted CI.

The implementation uses the matched Playwright Test 1.63.0 runner for browser acceptance and Vitest for components. Browser checks are grouped by behavior in TypeScript; framework fixtures own ordinary pages, while one lazy second-context fixture exercises locale isolation. Repeated font/image checks and category slug collection are small functions. Native screenshot assertions replace manual PNG comparison; built-in [webServer lifecycle](https://playwright.dev/docs/test-webserver) replaces the CI shell loop. [Vitest mock cleanup](https://vitest.dev/config/clearmocks) replaces the component beforeEach hook. The browser/configuration TypeScript check runs in the main suite, with the [TypeScript-aware unused-variable rule](https://typescript-eslint.io/rules/no-unused-vars/) replacing its JavaScript equivalent. Preserve actual CSS-rendered text with useInnerText and pseudo-element checks with explicit computed styles. The reading-order check compares current bilingual membership/order and uniqueness without pinning a historical article count. Local acceptance passes: frozen installation, lint/format, smoke, strict browser/configuration TypeScript checks, the full nonvisual suite (including 17 component tests), the production build (144.53s) and all 52 browser cases (113.34s). All existing screenshot PNGs and the 697-route/feed/sitemap contract are unchanged. Native traces exposed conversion mistakes in a browser-evaluated helper, scoped header selection, pseudo-element checks and CSS-rendered text; these were corrected before acceptance. The build still reports a dependency punycode deprecation. Hosted CI remains pending; no deployment was performed.

## Image accessibility and IndexNow — 2026-10-08

The owner authorizes the next image-accessibility category and IndexNow. Follow [W3C's image decision tree](https://www.w3.org/WAI/tutorials/images/decision-tree/) and [complex-image guidance](https://www.w3.org/WAI/tutorials/images/complex/): inspect images/context, describe informative images, preserve deliberately decorative images and require an accessible destination for image-only links. Validate Markdown before Gatsby transforms images, JSX at lint time and all generated HTML. Imports preserve source descriptions; missing descriptions require manifest overrides rather than invented filename/title fallbacks. Keep appearance and URLs unchanged.

Follow [IndexNow's protocol](https://www.indexnow.org/documentation) and [automation guidance](https://www.indexnow.org/faq): publish a root verification file, generate canonical content fingerprints, compare with the last successful production submission, and notify added/changed/deleted URLs only after successful production deployment. First use establishes a baseline instead of submitting the entire historical archive. CI retains successful acknowledgement state and recovers the previous deployed manifest before publication if that cache expires; one-off retry commands cover earlier failed notifications. Provide dry-run/manual commands, verify the deployed key and affected pages before submitting, handle HTTP errors without advancing state, exclude preview deployments, and retain the XML sitemap. Implement and test locally; publishing the key and real submissions require the subsequent production deployment.

This category is complete locally: 264 descriptions are added, redundant icons are explicitly decorative, and shared source/import/JSX/generated-output checks pass. The production build, full suite and all 35 browser checks pass with unchanged screenshots and route/feed/sitemap contracts. IndexNow prepares 394 canonical page fingerprints and all 11 protocol/failure-state tests pass. README documents manual operation. Hosted verification of the key/manifest and actual notifications remains pending deployment; no real IndexNow API calls were made locally. The owner also requests clearer scripts: this implementation separates command handling, content comparison and submission with shared validation. Audit earlier scripts/tests next for the same readability and reuse concerns, without a speculative whole-repository rewrite.

## CSS completion — 2026-10-08

The owner requests completion and removal of the custom CSS hashing. Standard named ES-module CSS exports are now used across all 33 modules, keeping module ownership and unchanged selectors/markup. The loader's documented SHA-256 identifier template replaces the deleted application `getLocalIdent` callback and supports Node 24.

The isolated reproduction proves that loading the routing dependency before the reading-list stylesheet eliminates its opposing traversal orders. The architectural boundary is corrected through a Gatsby data/routing adapter and a portable reading-list view that owns its CSS Module. The existing List API and localized destinations are preserved. The production build has no extraction-order warnings, and all 35 browser checks pass without screenshot/tolerance changes.

For stale HTML, a version-pinned Gatsby dependency correction includes emitted, content-hashed browser CSS assets in the existing renderer invalidation key. It is retained through a checked-in package-manager patch; no runtime overrides, modified class exports, private flags or HTML rewriting are applied. The all-source hash is removed after isolated baseline/edit/restoration passes. [Patch provenance and removal conditions](docs/gatsby-css-cache-patch.md) and cache compatibility are updated. Frozen installation, production build (146.76s), full tests (65.75s), all 35 browser checks (73.66s), lint and smoke pass. Module/global CSS modification/restoration (218.62s) and content modification/deletion/restoration (141.75s) also pass. The CSS stage is complete locally; hosted CI/deployment remain separate checks. Maintain the versioned patch until a released Gatsby correction passes the same regressions. No upstream publication or deployment is included.

## Standards research checkpoint — 2026-10-08

The owner confirms the previous changes are merged and deployed. PR #52 is merged at `e627cc1`; its [Build and Deploy](https://github.com/oskardudycz/event-driven.io/actions/runs/37791196912) and [CodeQL](https://github.com/oskardudycz/event-driven.io/actions/runs/37791196910) runs pass. Alerts 6 and 7 report their most recent PR instances as fixed; the open-alert query is empty. Production contact and search-manifest URLs return HTTP 200. These checks do not replace the full indexing/production audit.

Start the next bounded category with navigation correctness, then investigate CSS extraction/cache behavior. Follow [Gatsby's Link guidance](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-link/): native anchors for external/protocol, fragment/query-only and download destinations; Gatsby links for explicit locale paths; the translation plugin for unprefixed internal paths. Preserve DOM refs, anchor attributes and internal route state. Add ESM-aware component tests and retain real bilingual browser navigation.

The review called Contact.sendMessage an active defect, but source inspection shows the Contact form is unreferenced: the live contact page offers Calendly only. The owner asked to proceed with other work. Preserve both the form code/dependencies and current contact page; whether to restore the form remains a separate decision. Continue CSS extraction/cache root-cause investigation after this pass; no warning suppression, forced stylesheet imports or broad module renaming is included.

The owner requested another standards review before further implementation. [The updated Gatsby/CSS review](docs/gatsby-css-review.md) separates documented component/global CSS ownership, supported Link/test configuration, ordering diagnostics and the broad cache workaround. The proposed List import-order change was not applied. Source tracing alone is not sufficient grounds to change imports; reproduce and audit the emitted cascade/dependency graph first. Isolate Gatsby's default CSS handling and official PostCSS plugin to find the stale-inline-HTML boundary before replacing the custom global class hash. Do not add compiler monkey patches, global invalidators, forced imports or suppression.

At the research checkpoint, the Link/test configuration was an uncommitted draft with build, focused tests, frozen install, lint and smoke passing; full browser acceptance was pending. Subsequent menu/navigation implementation and acceptance are recorded below. The TypeScript/ESM plan also needs correction: Gatsby documents native ESM hooks/config as `.mjs`, while its TS hook compiler targets CommonJS. Settle that supported loader boundary before coordinated renames instead of forcing an all-`.ts` runtime with custom shims.

## CSS root-cause findings — 2026-10-08

The completed documentation/source/reproduction review is merged into [the Gatsby CSS review](docs/gatsby-css-review.md#reproduced-causes-and-correction-boundaries--2026-10-08). Keep component-owned modules, layout-owned globals, matching SSR/browser providers and the existing supported translation plugin. A minimal Gatsby fixture reproduces the extraction warnings with both the layout plugin and native wrappers; eight built-site computed-style comparisons show no ordering effect on the exercised category/article surfaces. Do not force imports or suppress warnings.

The demonstrated persistent-menu defect is corrected as one state/visibility category: derive current page models, measure through refs, retain overflow indexes rather than translated DOM copies, and render scoped visibility classes from React state. Overflow entries preserve translation keys and social icons. All 35 browser checks, the production build, full nonvisual suite, lint and smoke pass; current evidence is recorded in todo.md. Current responsive design, screenshot fixtures and tolerances are preserved. Hosted CI/deployment remain separate checks.

The CSS-only warm-build defect is independently reproduced with both the official PostCSS plugin and built-in CSS handling: Gatsby emits updated CSS while reusing obsolete inline HTML. Its default Slice build path skips browser-hash HTML invalidation, while unchanged server class exports leave renderer hashes unchanged. A fixture-only invalidation control confirms this cause; it is not a production remedy. The former safeguard is now replaced by the version-pinned CSS-asset dependency correction described above; no private runtime override or post-build HTML patch is applied. Published stable Gatsby remains 5.16.1, so retain the documented local patch until an upstream release passes the cache regressions. The earlier 155.96s cache result belongs to the removed safeguard; final module/global acceptance is tracked above. Images follow CSS acceptance, as requested.

## CodeQL and durable regression tests — 2026-10-08

PR #52 reports alerts 6 and 7 (`js/incomplete-url-substring-sanitization`) in indexing tests, not application URL handling. Replace whole-document URL substring checks with exact membership of parsed anchor destinations, and verify that lookalike URLs and plain text cannot satisfy the assertions. Follow [CodeQL's guidance](https://codeql.github.com/codeql-query-help/javascript/js-incomplete-url-substring-sanitization/) rather than suppressing findings.

Retire the completed archive-migration acceptance suite from ongoing tests; preserve its manifests/provenance as records. Remove assertions about deleted landing files, styled-jsx markers, exact restored article Markdown, historical body/count totals and broad CSS class-hash mechanics. Keep importer/security fixtures, real generated CSS and warm-cache edit/restoration checks, routes/canonicals, language navigation and browser rendering. Derive article/related-content coverage from current generated data rather than a completed migration list. Record local verification separately from the next hosted CodeQL scan.

This pass is complete locally: the production build, revised full suite, all 34 browser checks, lint/format and smoke pass. Application code/content, route/feed/sitemap contracts and screenshot fixtures are unchanged. `test:articles` replaces the import-only build suite; the archive acceptance suite is retired. Alert closure still requires the next hosted CodeQL scan. CSS-order and slow-query investigations remain separate stages.

## Evidence-led indexing fixes — 2026-10-07

The new Search Console investigation, including the full production audit and mixed-case URL correction, is merged in [docs/google-indexing-review.md](docs/google-indexing-review.md) before implementation. Execute canonical source corrections and collision removal first, then confirmed aliases, legacy query routing and 404 validation, followed by build/browser regressions and a repeatable public audit. Delete the obsolete anti-patterns landing files and retain the fully cross-linked article in discovery. Preserve both workshop URLs with a real English translation. Convert only standalone YouTube linked thumbnails through the existing player format; preserve all text links, including reading lists and standalone links. Existing explicit players and mapped webinar recordings remain embedded. Keep publication identities (RSS GUIDs and Disqus IDs) separate from canonical routing; use Gatsby SSR document resources for fonts instead of SEO coupling. Preserve translated Polish canonicals, layout and comment behavior. The owner does not recall the five unknown missing addresses; keep genuine 404s unless original-content evidence appears; historic Google server failures require deployment/crawl-log revalidation. The broader Gatsby/CSS review remains the source for subsequent grouped architecture work, and the consistent TypeScript/ESM migration is now authorized in the current category.

The corrected YouTube scope is verified locally: 36 text references restored in 28 files, four thumbnail conversions retained, full production build/tests and all 34 browser checks pass. Importer tests enforce the same rule in English and Polish. This correction requires no build-contract or screenshot fixture update; hosted deployment verification remains pending.

## Research-led CSS follow-up — 2026-10-06

The root AGENTS.md now requires demonstrated root-cause fixes using supported Gatsby/React/CSS mechanisms, component-owned CSS, and actual SSR/hydration/browser validation. The blanket style-order entry and all forced imports are removed. Research and installed Gatsby findings are recorded in [docs/gatsby-css-review.md](docs/gatsby-css-review.md) before further implementation.

Global reset/theme tokens belong to the shared layout, as Gatsby documents. Component CSS Modules remain local. The narrower import ordering still leaves nine extraction warnings; it is not an accepted root-cause resolution. Continue the cascade/dependency investigation in the review before further CSS changes; do not add unrelated imports, replace chunk policy or suppress warnings. Acceptance requires unchanged rendered content/screenshots and warm-cache integrity, not merely silence from the compiler. Preserve new bilingual recovery pages and measured Polish font preload work; record their verification separately from the deployed baseline.

## Historical CSS conversion checkpoint — 2026-10-06

The complete styling category is implemented: all 29 remaining styled-jsx consumers are replaced together, leaving 32 native CSS Modules and no styled-jsx consumers. The obsolete Gatsby/styled-jsx integrations and processors are removed. Plain global CSS retains the existing reset/font fallback rules; this milestone originally used theme.yaml through a native TypeScript generator; the approved portable foundation now makes CSS variables the editable source. Preserve current colors, fonts, spacing, breakpoints, public state hooks, routes and behavior. Dynamic image/menu/sensor values use CSS custom properties. Keep default module imports and CSS independent of Gatsby queries/providers for eventual Astro reuse.

A CSS-only warm-build regression reproduced obsolete inline CSS. Content-aware SHA-256 module exports now invalidate cached renderers when shared styles change; Webpack tracks source stylesheet dependencies. The baseline/edit/restoration check passes across every generated page and real computed styles with JavaScript enabled/disabled. Content modification/deletion/restoration also passes. Final local acceptance passes: production builds, full suite, all 30 browser checks, lint/format and smoke. Existing screenshot fixtures and the 3% tolerance are unchanged. See todo.md for the final local result and separate CI/deployment status.

Modern-practice defaults for new work: native ESM and TypeScript; semantic CSS variables; scoped CSS/logical properties; accessible keyboard/focus/contrast; reduced-motion support for animation; minimal client JavaScript; measured validation. The earlier component-by-component sequence is superseded by the completed whole-category implementation.

Current authorized follow-up: start with a meaningful bilingual 404 page and restore the default static-host fallback, then resolve stylesheet import-order warnings and profile first-party font loading/CLS before selecting a typography-preserving fix. Verify the owner-supplied deployed preview separately and compare repeated mobile audits. Preserve all existing content routes; explicitly review any added error routes/rewrites in the build contract. Keep Disqus and its loading behavior. Giscus/custom guest comments remain deferred alternatives. Tailwind, dark mode, package-manager migration and visual redesign remain separate reviewed stages.

Gatsby CSS Modules: <https://www.gatsbyjs.com/docs/how-to/styling/css-modules/>; supported loader options: <https://www.gatsbyjs.com/plugins/gatsby-plugin-postcss/>; Astro styling: <https://docs.astro.build/en/guides/styling/>.

This document records the improvements made to event-driven.io and the remaining work. The goal is not only higher search rankings. It is to make the site easy for people, search engines, and AI-assisted discovery tools to understand, navigate, and cite while giving consulting and training a clear path to conversion.

## How progress is tracked

- `plan.md` is the durable strategy: goals, decisions, priorities, and the Gatsby migration sequence.
- `todo.md` is the live execution checklist: completed work, verification state, current blockers, and the next actionable tasks.
- Update both files when scope or architecture changes. For ordinary implementation progress, update `todo.md` and change `plan.md` only when the strategy or remaining-work list changes.

## Outcomes we are aiming for

- Google and Bing can crawl, index, and correctly canonicalise the public English and Polish content.
- AI crawlers can access useful, self-contained articles and service pages and discover a generated `llms.txt` index.
- Visitors can move naturally from an article or talk to related material, training, consulting, and a free introductory call.
- Category pages act as curated learning paths rather than flat tag archives.
- Search results identify the content type, language context, categories, and publication date without duplicates.
- The home and talks pages avoid unnecessarily expensive images and third-party embeds.

## Implemented

### Crawlability and technical SEO

- Public crawling is allowed in `robots.txt`, with the sitemap index declared explicitly.
- Canonical URLs and language alternates are emitted consistently, including `x-default` where appropriate.
- Duplicate fallback-language documents are excluded from indexable lists and the sitemap.
- Retired sign-in, callback, and billing routes are removed; remaining utility routes such as search and 404 are kept out of the search index.
- Structured data covers articles, services, the author profile, and the website.
- Open Graph and X/Twitter metadata include descriptions, images, and image alternative text.
- `llms.txt` is generated from the site's canonical content during every build instead of being maintained by hand.

### Services and conversion paths

- Added full English and Polish consulting pages covering architecture reviews, Event Sourcing adoption or recovery, modelling workshops, and hands-on implementation support.
- Added prominent links to a free introductory call at <https://calendly.com/oskar-dudycz/consulting>.
- Linked consulting from the main menu, homepage hero, author profile, contact form, and related workshop copy on the consulting page.
- Added visible summaries below page and article titles when a `summary` frontmatter field is present. The same content can also support search snippets and AI-oriented summaries.

### Content discovery

- Posts can now belong to a primary `category` and any number of additional `categories`.
- Category landing pages show curated topic descriptions, article counts, and recommended reading paths.
- Individual category pages use compact responsive image cards, visible reading-order steps, and separate the recommended sequence from the remaining articles.
- Recommended reading order is deliberately editorial rather than algorithmic. It is controlled by each topic's ordered `recommended` slug list in `data/category-guides.json`; changing that list changes the displayed sequence without changing article dates or URLs.
- Posts show related articles only when explicitly curated in that post's `related` frontmatter list. Broad category matching produced misleading recommendations; an absent list now means no related block. Slugs must resolve to published canonical articles or the build fails. Related cards prefer an existing route in the current interface language, including an untranslated copy; use another available original only when that locale route is absent. Canonical identity is independent of the visitor destination.
- Related reading uses the same responsive image-card design as category pages and follows the newsletter signup, before sharing and author information. Chronological earlier/later links remain separate and visibly labelled so they are not mistaken for recommendations.
- The homepage shows a focused recent selection and links to a dedicated complete article archive instead of rendering every post up front; the topic index remains a separate curated path.
- The homepage uses one concise “Latest articles” section heading, while a quiet “Read latest articles” label beside the original down-arrow control names its destination without competing with the service calls to action.
- The complete article archive stays intentionally simple: one heading followed by the chronological article list, without a count badge, explanatory filler, or stacked layout spacing.
- Ten English cornerstone articles now have hand-written search descriptions and visible summaries covering Event Sourcing fundamentals, projections, validation, testing, versioning, suitability, messaging guarantees, distributed processes, idempotency, and ordering.
- Local MiniSearch indexes use canonical records with translation preference/fallback links; search results show content type, categories, date and safe highlighted snippets.

### Talks and video

- Added the 23 videos from the supplied YouTube playlist as a separate, ordered video gallery.
- Fixed playlist URL parsing: only the 11-character YouTube video ID is passed to the player.
- Replaced eager YouTube embeds with thumbnail facades. The privacy-enhanced `youtube-nocookie.com` player is created only after a visitor clicks play.
- The talks page focuses on the useful video gallery; the redundant chronological conference-appearance list was removed.

### Accessibility, language, and performance

- Fixed language switching so it uses the target language and works for static routes.
- Added useful alternative text to article and category cover images.
- Localised contact form labels and errors and fixed its network-error callback.
- Converted homepage hero image variants to compressed WebP and limited the initial article list.
- Removed the contradictory fixed height from the full-height hero.
- Removed unused Ant Design styles from the talks page.
- Gated the webpack bundle analyzer behind `ANALYZE=true` and disabled automatic browser opening so normal CI builds do not run an interactive analysis step.
- Added dependency-free post-build SEO assertions and an integration test for representative canonicals, language alternates, structured data, no-index routes, sitemap inclusion/exclusion, `robots.txt`, and `llms.txt`; CI runs the test before deployment. The shared verifier can move behind Vitest after the Node/Gatsby migration without rewriting the checks.

## Content frontmatter conventions

Use one primary topic and add genuinely useful secondary topics. Avoid assigning every broadly related topic.

```yaml
title: A concrete, descriptive article title
description: A concise search description explaining what the reader will learn.
summary: A direct visible answer to what the article is about and who it helps.
category: Event Sourcing
categories:
  - CQRS
  - Software Architecture
```

The `description` is primarily metadata and may appear as a search or social snippet. The `summary` is shown to readers below the title. Search engines may still choose a different excerpt when it better matches a query.

## Editorial guidance for Google and AI discovery

The strongest content-level opportunity is clarity, evidence, and useful internal connections:

1. Open important articles with a direct two- or three-sentence summary of the problem, answer, and intended reader.
2. Prefer headings that describe the question answered by a section over clever or generic headings.
3. Keep original diagrams, runnable examples, trade-off tables, failure cases, and production lessons. These are more useful and citable than generic summaries.
4. Make authorship and first-hand experience explicit where it supports the claim; the author profile and service pages should remain easy to reach.
5. Add contextual links between articles that form a sequence, and link relevant technical articles to the training or consulting page that helps apply the material.
6. Update high-value evergreen articles when the advice or tooling changes. A future `updated` field should drive `dateModified` structured data and sitemap last-modified values.

## Substack publishing approach

Reposting is not automatically harmful, but publishing identical full articles in two places can make the preferred source ambiguous and split links and engagement.

- Publish the canonical article on event-driven.io first.
- Prefer a shorter adapted edition or substantial excerpt on Substack, followed by a clear link to the complete original.
- If posting the full version, verify whether the Substack post exposes a canonical URL setting and point it to the original article when possible.
- Link with meaningful anchor text and optional UTM parameters so referrals can be measured.
- Keep the site version as the maintained source: update it, link it into topic paths, and make examples/assets available there.
- After publishing, inspect the rendered Substack HTML and Google Search Console to confirm which URL Google selected as canonical.

## Remaining work, in priority order

### P0 — remaining hosted validation (historical details below)

- Keep reviewing intentional layout changes at desktop/mobile widths; the existing screenshot tolerances and 52 browser cases passed the 2026-10-08 local acceptance. See the latest deployment verification below for hosted results.
- The baseline presentation/runtime changes are deployed since 99519a3c and representative production pages/assets pass public checks. Later owner-reported deployments supersede this original checkpoint; verify the latest revision independently.
- Submit the sitemap index in Google Search Console and Bing Webmaster Tools; request indexing for the consulting pages and a few cornerstone articles.
- Use URL Inspection to compare the declared and Google-selected canonical URLs.
- Test Article and Service structured data with Google's Rich Results Test and Schema.org Validator.
- Check CDN/WAF logs or rules to make sure Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, and other desired agents are not blocked upstream of `robots.txt`.
- Measure Core Web Vitals on the homepage, an article, a category page, a workshop page, and the talks page after deployment.

### P1 — high-value content work

- The English workshop offer is translated and verified. Updating historical dates, pricing and registration terms requires current editorial input; do not invent new commercial terms.
- Continue adding hand-written descriptions and summaries beyond the first ten cornerstone articles, prioritising pages with search impressions and articles linked from consulting or training.
- Curate additional Polish recommended reading paths beyond the shared Event Sourcing sequence; prefer real translations for editorial clarity.
- Add concise case studies to consulting: starting situation, constraints, intervention, and measurable outcome. Use anonymised examples if necessary.
- Add specific testimonials or client evidence to the consulting page where permission allows.
- Translate the most commercially and topically important English-only articles, starting with the articles linked from training and consulting.

### P2 — stronger content relationships and freshness

- Add an `updated` frontmatter field and emit `dateModified` in structured data and `lastmod` in the sitemap.
- Curate `related` frontmatter for additional cornerstone posts where a genuinely useful reading sequence is clear; do not restore automatic category-based fallback.
- Image alternatives are described and enforced at import, source, staging and generated-output boundaries. Maintain descriptions for new diagrams and screenshots; explicitly declare decorative exceptions.
- Add Breadcrumb structured data to categories, articles, training, and consulting pages.
- Add FAQ structured data only where the visible FAQ and its answers meet Google's current eligibility rules; do not create FAQ markup only for rankings.
- Review local search quality with curated bilingual queries and tune title/category boosts and prefix/fuzzy matching when evidence supports a change.

### P3 — larger engineering work

- Continue Gatsby 5 modernization from the completed runtime migration. The current baseline is Gatsby 5.16.1, React 18.3.1, Node 24 and Yarn 1. Earlier migration checkpoints below are historical.
- Revisit the global CSS and JavaScript payload after measuring production coverage. Ant Design is retained with the deferred, unreferenced contact form; review restoration/removal together and measure actual route payload before attributing a cost.
- Consider archive pagination if the topic and article indexes grow enough to create large HTML pages.
- Expand the automated SEO assertions when new page types or indexing rules are introduced.

## Historical Node-first Gatsby upgrade investigation (completed)

The primary goal is to move the build and deployment runtime to Node 24 LTS. The investigation therefore starts by running the current site on Node 24 and works backward from real failures. Yarn 1 remains the package manager throughout; changing it does not help the runtime upgrade.

Research snapshot (2026-09-22):

| Checkpoint               | Node            | Gatsby | React  | Purpose                                  |
| ------------------------ | --------------- | ------ | ------ | ---------------------------------------- |
| Known-good baseline      | 16.20.2         | 3.12.0 | 17.0.2 | Current rollback point                   |
| Compatibility checkpoint | 16.20.2         | 4.25.9 | 17.0.2 | Isolate Gatsby data-layer/plugin changes |
| Supported target         | latest 24.x LTS | 5.16.1 | 18.3.1 | Deployable result                        |

Node 24 is the verified runtime. React 19, a new package manager, Gatsby Slices, deferred static generation, and unrelated lint cleanup are separate work and are not required to reach Node 24.

### What the reverse investigation found

- A clean build of the unchanged site was attempted with Node 24.12.0 and Yarn 1.22.22. It reaches Gatsby, then fails in Gatsby 3's webpack hashing with `ERR_OSSL_EVP_UNSUPPORTED`.
- Node documents `--openssl-legacy-provider` as a temporary workaround for this OpenSSL 3 failure. We will not add that flag: it would conceal the obsolete build toolchain instead of producing a supported Node 24 build.
- Gatsby 5.16 is the first Gatsby release line with explicit Node 24 support. The current `gatsby@5.16.1` engine range is Node `>=18 <26`; Node 26 is therefore not a valid target yet.
- Gatsby's official v5 migration guide recommends first reaching the latest Gatsby 4 release. Gatsby 4 is no longer a deployment target, so it will be only a local/CI checkpoint on Node 16 and React 17.
- Gatsby 5 requires React 18 or 19. React 18.3.1 is the smaller required change and avoids mixing a React 19 migration into the Node upgrade.
- The current Gatsby 3 install already contains three incompatible plugin versions: `gatsby-transformer-json@4.0.0`, `gatsby-remark-responsive-iframe@5.23.0`, and `gatsby-remark-autolink-headers@5.20.0` declare Gatsby 4 peer ranges. Moving core to Gatsby 4 resolves that mismatch; downgrading them first would be churn.
- React 18 requires attention to direct dependencies. The installed `@reach/router`, `disqus-react`, `react-share`, and `theme-ui` versions had old React peer ranges. The retired account page was the only direct source consumer of the router; leave further dependency cleanup separate from the Auth0 removal. `disqus-react` and `react-share` have maintained React 18-compatible releases; `theme-ui` is not used by source code.
- `gatsby-plugin-algolia@0.22.0` only declares Gatsby 2/3 support; its maintained 1.x release supports Gatsby 5. `gatsby-plugin-react-svg@3.0.1` also needs its maintained Gatsby 5-compatible update.
- `gatsby-plugin-i18n@1.0.1` is old and has no Gatsby peer range. Its node/page hooks overlap with the site's own localization code. Keep it for the Gatsby 4 attempt; if it is the blocker, remove it and require an exact generated-route comparison rather than recreating its behavior speculatively.
- `gatsby-remark-embed-video` remains active and covered by rendering tests. The styled-jsx integrations identified in this original review are now retired after the verified full CSS Modules conversion; they no longer block the platform or a future package-manager review.
- The first fully clean Node 16 baseline took 1,482.1 seconds. Investigation showed that `onCreatePage` registered the entire legacy redirect list once per generated page. Moving that global work to `onPreBuild` reduced `createPagesStatefully` from 127.7 seconds to 0.22 seconds, `onPostBootstrap` from 241.4 seconds to 0.5 seconds, page queries from 846.6 seconds to 44.3 seconds, and the complete clean build to 220.9 seconds while preserving all 562 routes.

### Step 1 — preserve the working baseline

- Keep `.nvmrc` and CI at Node 16.20.2 until the complete Node 24 target build passes.
- Keep the successful 562-page production build and the post-build SEO test as the comparison baseline.
- Record the generated route list, redirects, RSS files, sitemap location and URLs, canonical/hreflang output, and representative image output before dependency changes.
- Do not make the 528 pre-existing lint errors a migration gate. Run targeted lint on changed files; the production build and existing integration checks are the relevant baseline.

Exit criterion: the current Node 16/Yarn build and `yarn test` pass from a frozen lockfile.

#### Automated regression guardrails

- `yarn build` remains the first gate because it exercises plugin loading, schema creation, GraphQL queries, image processing, JavaScript/CSS bundling, and static HTML rendering.
- `yarn test:seo` validates semantic output rather than byte-for-byte HTML. It checks representative schema types, metadata, no-index rules, crawler files, required Netlify headers, and every sitemap URL's generated HTML and canonical URL.
- `yarn test:build-contract` compares the build with the committed `tests/fixtures/build-contract.json`. The contract contains the exact public route set, redirects, sitemap URLs, and RSS entry URLs, but deliberately excludes bundle hashes and complete HTML snapshots that change harmlessly between Gatsby releases.
- `yarn test` runs both suites and is already the CI gate before deployment.
- When a content or routing change is intentional, run `yarn update:build-contract` only after a successful build and review the fixture diff. Migration code must not update the fixture merely to make CI green.
- The Gatsby 5 preview exposed real browser regressions that static checks missed. Add one Playwright-driven Vitest browser test at a time, first proving each test fails on the broken preview and passes on the corrected local build. Five desktop tests compare against committed, reviewed PNGs at 1440×900 with a 3% pixel-difference budget, plus structural and real-image assertions; a sixth checks client-side navigation. The category and English/Polish homepage PNGs are production references. The archive PNG was updated from the corrected local build after making its H1 visible. The article-footer PNG was captured from the corrected local build after the production and preview both showed an unrelated full article in the author slot; separate production captures document that old state. CI runs the tests against its own built site and uploads current/diff screenshots; it does not query production. Refresh baselines explicitly after reviewing intentional design/content changes, never automatically to make a failure green.

The original Node 16 contract recorded 562 routes, 89 redirects, 330 sitemap URLs, and both feed URL sets. After removing the disabled sign-in integration, the post-auth-removal Gatsby 5 checkpoint recorded 556 routes and 80 redirects; the six English/Polish account, billing, and callback routes and their nine redirects are the only removals. Sitemap URLs and feed URL sets are unchanged. One known SEO ambiguity is tracked explicitly: `/pl/anti-patterns/` is in the sitemap but declares the English URL as canonical because `content/pages/anti-patterns` and `content/posts/2024-04-07--anti-patterns` compete for the same localized routes. Resolving it requires an editorial routing choice; until then the verifier permits only this exact mismatch rather than disabling sitemap-wide canonical checks.

### Step 2 — Gatsby 4 diagnostic checkpoint

- On a dedicated migration change, update Gatsby core to `4.25.9` and move Gatsby-maintained plugins to their latest versions whose peer ranges support Gatsby 4. Do this as one dependency batch so core and official plugins are not left mismatched.
- Keep Node 16.20.2 and React 17.0.2 for this checkpoint. This isolates Gatsby's persisted node store and parallel query changes from React and Node changes.
- Follow the official [Gatsby 3 to 4 migration guide](https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v3-to-v4/).
- Run a clean build and the existing SEO integration test, then compare routes, redirects, feeds, sitemap output, Algolia record generation, and images with the Gatsby 3 baseline.
- After the Gatsby 4 build passes on Node 16, run the same frozen dependency tree on Node 24 as a diagnostic checkpoint. Gatsby 4 declares Node `>=14.15` but predates explicit Node 24 support, so passing is useful isolation evidence rather than a reason to retain Gatsby 4 in production. Do not target Node 18 or 20: both are end-of-life as of this plan.
- Fix only failures that are relevant to reaching Gatsby 5. Do not deploy Gatsby 4 and do not add new Gatsby features.

Exit criterion: Gatsby 4 builds on Node 16/React 17 with no route or SEO-output regression. If an old community plugin is the only blocker and replacing it would alter rendering, stop and ask before replacing it.

Checkpoint result (2026-09-23): Gatsby 4.25.9 builds successfully on Node 16/React 17 and preserves the 562-route, 89-redirect, 330-sitemap-URL, and feed contract. Required API updates were limited to feed titles, the sitemap's `SitePage.pageContext` JSON field, and Gatsby 4's `conditions: { language }` redirect shape. The verified build completed in 190.7 seconds with 12 workers. The Node 24 diagnostic reaches page creation but fails in Gatsby 4's legacy `url-loader`/`file-loader` MD4 hashing. No OpenSSL compatibility flag or webpack override will be added; proceed directly to Gatsby 5 for Node 24.

Gatsby 5 diagnostic: resolving `timeToRead` for every article in the global page-creation query invokes full Markdown-to-HTML rendering and stalls page creation for several minutes. The category cards do not need this estimate; removing that field reduced the same 562-page creation step to about 35 seconds. Cards retain their publication date.

Node 24 build finding: Gatsby 5 still uses `url-loader`/`file-loader` with an MD4-based filename hash for imported font files. The deprecated `typeface-open-sans` CSS import triggers this path. Keep the same self-hosted Open Sans CSS and font files under `static/fonts/open-sans/`, linked from the layout, instead of adding an OpenSSL flag or webpack override. Verify the generated stylesheet, font files, and rendered link after a clean build.

The current `gatsby-plugin-algolia` release no longer honors the site's old `skipIndexing` option. Include the plugin only for a credentialed main-branch build; use `ALGOLIA_SKIP_INDEXING=true` when running a production build locally with credentials in `.env`. This avoids unintended index writes and lets offline verification reach Gatsby's post-build steps. Production indexing still needs a live CI check.

### Step 3 — Node 24 target with Gatsby 5

- Update Gatsby core and every Gatsby-maintained plugin together to the 5.16 release line, using `gatsby@5.16.1` as the current target.
- Update React and React DOM to 18.3.1. Update only direct dependencies that block React 18 or Gatsby 5: use the maintained Algolia, React SVG, Disqus, and sharing packages, and replace the direct `@reach/router` import with Gatsby's React 18-compatible router fork.
- Move the ten legacy GraphQL sort queries to Gatsby 5's nested sort input syntax. Gatsby can transform the old syntax at runtime, but committing valid v5 queries removes that compatibility layer and keeps GraphiQL accurate.
- Set `trailingSlash: "always"` explicitly so Gatsby 5 does not silently change URL behavior. Preserve the explicitly configured `/sitemap` output path.
- Install with Yarn 1 and run a clean build directly on the latest Node 24 LTS. Do not use the OpenSSL legacy-provider flag or ignored peer-dependency flags.
- Only after that build passes, update `.nvmrc`, the GitHub Actions Node version, and a new `package.json` `engines.node` declaration together. Regenerate `yarn.lock` with Node 24.
- Follow the official [Gatsby 4 to 5 migration guide](https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v4-to-v5/) and check React 18 hydration output.

Exit criterion: a frozen Yarn install, clean Gatsby build, and SEO integration test all pass on Node 24 without compatibility flags. The local build after Auth0 removal completed with `ALGOLIA_SKIP_INDEXING=true`, generated 556 routes, and passed the reviewed route and SEO contracts. All five local browser tests pass against the built site, including both-language homepage references. CI and a fresh Netlify preview remain the next release checks.

After the Node 24/Gatsby 5 checkpoint is verified, migrate from Yarn 1 to npm as a separate change. Generate a single `package-lock.json`, replace the Yarn commands in package scripts, CI, Netlify, and contributor instructions with npm equivalents, remove `yarn.lock`, and verify `npm ci`, the build, and the same regression tests. Do not maintain two competing lockfiles.

The styling work should also remain incremental and portable to a possible Astro migration. First record browser screenshots and behavior for representative pages. The selected subsequent styling direction is Tailwind plus semantic CSS custom properties, with ordinary scoped CSS for complex rules and article content. Migrate styled-jsx consumers incrementally while preserving appearance; introduce full dark mode and layout redesign separately. This pass deliberately precedes CSS changes. Remove the styled-jsx plugins only when no component needs them, then retry npm without peer-dependency overrides. Keep Yarn as the working deployment path until that point.

The early npm probe exposed peer conflicts that Yarn 1 permits: `eslint-plugin-graphql@4` requires GraphQL <=15 although Gatsby 5 uses GraphQL 16, and `gatsby-plugin-styled-jsx@6.16.0` declares `styled-jsx@^3` although the site uses styled-jsx 4. The GraphQL lint plugin has no configured rules and can be removed. The styled-jsx integration renders much of the site's CSS, so do not suppress its peer conflict or replace/downgrade it without a site-owner decision and a visual regression check. That styled-jsx compatibility blocker is now resolved through the accepted CSS Modules conversion. Keep npm migration deferred as a separate stage; no fresh npm installation result is claimed.

### Step 4 — preview before production

- Deploy a Netlify preview using Node 24 and the same lockfile as CI.
- Verify redirects and headers, Netlify forms, Algolia indexing, RSS, the `/sitemap/sitemap-index.xml` location, `robots.txt`, `llms.txt`, article images, embedded videos, and language switching. The retired sign-in, callback, and billing routes are intentionally absent in both languages.
- Compare the generated page count and canonical URLs with the baseline. A changed count is not accepted until every addition/removal is explained.
- Keep the last Gatsby 3 production commit as the rollback point until the Node 24 preview and production smoke tests pass.

Exit criterion: production runs Gatsby 5.16.x on Node 24 and passes the same checks as the preview.

### After the runtime migration

- Investigate why contact form submissions do not deliver email. Check Netlify form capture, spam handling, notifications, and the current client-side submission flow; then discuss a reliable alternative with the site owner before restoring a form. Until then, the contact page offers the Calendly introductory call.
- Keep the WebFinger response in `static/.well-known/webfinger` so Gatsby copies it into generated `public/` on every build. Generated output must not be the only tracked source of a static file.
- Add a fast smoke check for configuration and GraphQL parsing, then keep the full clean production build and output contract as the release gate. A development server can give quicker visual feedback, but it does not prove static HTML, feeds, redirects, or sitemap output.
- The former component-by-component TypeScript proposal is superseded by the authorized coordinated migration at the top of this plan. Preserve routes and HTML behavior across the whole category.
- Full-project ESLint/Prettier gates are implemented; strict application/tooling/test type-checking is part of the coordinated TypeScript category. The former failing lint baseline is historical.

### Superseded modernization decisions from the runtime-only phase

- Image migration and Gatsby Head migration are complete and verified.
- Gatsby 5 deprecates `<StaticQuery>`; its replacement with `useStaticQuery` is included in the current modernization pass.
- Explicit GraphQL schema types and proven-unused dependency cleanup are included in the current pre-redesign pass.
- Ant Design modernization, React 19, Slices and deferred generation remain deferred. Full-project lint cleanup is subsequently complete; Vitest handles components and Playwright Test handles browsers.

This sequence is intentionally failure-driven. We will not rewrite working integrations pre-emptively; when an unmaintained plugin becomes an actual blocker and replacing it changes visible behavior, implementation pauses for a decision.

## Verification workflow

For the verified Gatsby 5 checkpoint, use Node 24.12.0 and Yarn 1:

```sh
yarn install --frozen-lockfile
yarn generate-llms
ALGOLIA_SKIP_INDEXING=true yarn build
yarn smoke
yarn test
```

Search indexes are now local Gatsby build outputs. CI and previews do not require Algolia credentials or write to an external index. After deployment, repeat technical checks against live URLs because CDN, redirects, headers, forms, and bot protection cannot be fully validated from Gatsby's generated files.

## Gatsby 5 modernization before CSS redesign — 2026-10-04

The build review in `docs/gatsby-5-review.md` is incorporated here. Verified locally: Gatsby Head replaces React Helmet; cards use gatsby-plugin-image; route creation queries only routing metadata; Prism aliases and Browserslist are updated; YouTube uses the maintained embed plugin with a timestamp/referrer adapter. All 96 requested articles have English and Polish files. The current verified output is 694 routes, 222 redirects, 399 sitemap URLs, and 25 browser checks as of the MiniSearch replacement. Historical counts above describe earlier checkpoints, not the current release. CI/deployment and live Algolia verification remain separate pending checks.

Completed local implementation sequence: replace layout StaticQuery with useStaticQuery; clean up listeners, timers and font callbacks; convert Node hooks to native ESM (.mjs) and remove runtime Babel registration; remove proven-unused dependencies and declare direct imports; define nullable frontmatter/routing GraphQL types; cache Yarn and compatible Gatsby outputs in CI; measure cold/warm queries and validate modified/deleted content with warm caches. Preserve appearance, URLs, feeds, metadata and screenshot tolerances. Record verification in todo.md.

Tailwind, semantic theme variables, dark mode, Slices, npm migration and visual redesign are deferred. Keep React 18, Yarn and static generation. Earlier restrictions on optional image/Head/testing modernization have been superseded by the completed work and this sequence. No deployment or third-party indexing is part of this pass.

CI actions are included in this pass: checkout/setup-node/upload-artifact v7, cache v6, CodeQL v4, using GitHub-hosted Ubuntu runners. Validate workflow syntax locally; remote execution remains pending.

Navigation includes existing Polish placeholder pages; SEO alternates remain limited to actual translations. Existing Polish category routes list placeholder articles with canonical English links, matching the article archive. Remove redundant category separators when no recommended section exists.

Imported code fences must retain source syntax metadata, infer clear language patterns when absent, and preserve code bytes/spacing. Kurrent examples use TypeScript rather than plain text. Rewrite known article links across the blog; normalize EventStore/Kurrent blog domain aliases and archived URLs, while retaining unmigrated source references.

### Pre-redesign pass result — 2026-10-04

All listed local modernization tasks are complete: useStaticQuery/lifecycle cleanup, native ESM Node hooks, dependency audit, explicit types, compatible CI caching and action updates. Local frozen install, production build, full tests and 12 browser checks pass. Existing output contracts and screenshot tolerances are preserved. Warm-build verification covers modified/deleted/restored content without publishing a test fixture. Cold/warm builds measured 124.73/28.16 seconds locally; final content build passed in 54.39 seconds. CI execution and deployment are still separate release checks.

The requested article-navigation/category fixes, social profile changes, README reading-order guidance and imported highlighting/cross-links are also verified. JavaScript/js snippet language tags use TypeScript throughout the blog and in future imports; snippet code is unchanged. Polish Event Sourcing shows its six translations plus 82 canonical-English placeholders. See todo.md for current verification evidence and pending external checks.

### Completed pre-redesign pass — legacy routing and lint guardrails

Audit the overlapping gatsby-plugin-i18n hooks against the site's native localization hooks. Remove the plugin only if the exact route/redirect/feed/sitemap contract and English/Polish browser checks pass. Preserve the active react-i18next provider, search UI, and comments. Remove unused direct routing and InstantSearch umbrella dependencies after checking source/configuration/scripts; retain directly used react-instantsearch-dom and Algolia APIs.

Establish a separate correctness-focused ESLint baseline for the modern modules, using native ESM/JSX parsing and React hook checks. Include a TypeScript parser for incremental adoption, without converting the whole project or enforcing legacy formatting. Run the baseline in CI; retain the existing full-project lint command and its documented backlog. Expand the explicit baseline as files are modernized. CSS, Tailwind, dark mode, Slices, search API upgrades and deployment remain separate work.

### Category language parity and localization review

Category membership is shared across article translations: each existing localized category must expose the same unique article slugs, preferring an actual translation and linking untranslated material to a canonical available language. Category indexes and detail pages must use the same selection logic. Populate the Polish Event Sourcing guide with the existing eight-step reading path. Keep localized descriptions and allow independent editorial guide orders. Preserve established category routes; do not invent placeholder articles solely for listing parity.

Review current Gatsby localization integrations against the site's canonical-English placeholders, original-slug redirects, shared category membership and Head metadata. Record migration options before replacing the provider/hooks. Review VitePress-style local search as a possible replacement for Algolia; keep the running search unchanged until the replacement is implemented and validated.

### Search and localization review — 2026-10-05

See `docs/gatsby-search-and-localization-review.md` for the current package comparison and migration acceptance criteria. Recommend a lazy-loaded MiniSearch prototype (the engine used by VitePress local search) as the next search change; measure index size/mobile responsiveness and validate locale fallback before replacing Algolia. Recommend gatsby-plugin-react-i18next 3.0.1 as the localization migration candidate; its Gatsby 5/React 18 peer ranges fit, but i18next/react-i18next need compatible upgrades. Prototype static routes/provider/links first and retain explicit canonical/placeholder policy. Published gatsby-theme-i18n 3.0.0 still targets Gatsby 4/React 17/Helmet and is not the preferred option. No plugin/engine replacement is included in the category fix.

Production baseline: the owner reports deployment since 99519a3c. Its GitHub Build and Deploy run succeeded, and 2026-10-05 public checks confirm representative English/Polish metadata, contact CTAs, imported TypeScript highlighting, sitemap and original-slug redirect behavior. Later commits/local category changes have separate verification status in todo.md.

### Category parity result — 2026-10-05

Shared category selection and the Polish Event Sourcing guide are verified: both languages have 89 unique articles and eight ordered steps, with actual translations preferred and missing translations linked to a canonical available language. The production build, full tests, four category-selection regressions and all 15 browser checks pass; route/redirect/sitemap/feed contracts and existing screenshot tolerances remain unchanged. This simplifies one source of custom localization logic without replacing the provider or route generation. Production checks still showed the pre-fix Polish category; later commits require their own deployment/CI check.

## Historical search/localization plan — 2026-10-05 (implemented)

Implement these before the CSS redesign, in separate stages so search and localization regressions can be isolated. Keep Node 24, React 18, Yarn, existing styles and static generation.

### 1. Replace Algolia with local MiniSearch

Generate language-specific search indexes during the Gatsby build and lazy-load the index/engine when search is used. Prefer genuine translations, include canonical-language fallbacks for untranslated articles, and return one result per article. Preserve relative URLs, localized labels, categories/dates, pagination, keyboard accessibility and useful highlighted snippets, including code identifiers.

First measure compressed index size, initialization time and mobile responsiveness, then integrate the replacement into the existing search layout. Validate English/Polish queries, diacritics, fuzzy/prefix matches, loading/empty/error states and modified/deleted-content updates. After build, full tests and browser checks pass without Algolia requests, remove Algolia/InstantSearch packages, indexing hooks, workflow/configuration references and obsolete cache-key inputs. External account/index deletion is outside this work.

### 2. Simplify localization with gatsby-plugin-react-i18next

Adopt the Gatsby 5/React 18-compatible plugin through a staged migration, upgrading i18next/react-i18next to compatible versions. Start with static routes, the translation provider, localized links and the language picker, then remove the superseded custom logic as each replacement passes verification. Keep article-specific canonical/placeholder policy explicit where the plugin does not cover it.

Preserve `/en/` and `/pl/` URLs, import/original-slug redirects, actual translation availability, placeholder navigation, canonical/hreflang/sitemap/feed rules, category membership/reading order and Gatsby Head behavior during SSR, hydration and navigation. Avoid running overlapping locale route generators. Require the exact output contract and all browser checks to pass before removing old hooks/providers. Record local results separately from CI and deployed verification.

Both stages use the package comparison and acceptance criteria in `docs/gatsby-search-and-localization-review.md`. Theme variables and npm migration are implemented. The portable Tailwind foundation and subsequent shared-layout/theme category at the top of this plan supersede the earlier Tailwind/dark-mode deferral. Slices and broader visual redesign remain later work.

### Deployment verification — 2026-10-05

The owner supplied https://6ac38f11d8f02a012d48ea89--event-driven-io.netlify.app. Its language search manifests and representative HTML are available: one H1 on the homepage, Polish training and Introduction article; Service schema omits the invalid inLanguage property; canonical and sitemap URLs point to event-driven.io. The immutable Netlify URL returns X-Robots-Tag: noindex, so indexing validation belongs on the main domain.

Build/test CI for 2feb984 passed. The CodeQL analysis job completed successfully and alerts 2/3/4 are fixed, but the separate security check fails on new alert 5 at import/import-substack.js:329. Review that finding before claiming security acceptance. The main domain currently returns 404 for /search-index/manifest.json, unlike the supplied deployment; promotion/main-domain asset verification remains pending.

The deployed browser rerun passes all 25 checks (75.25s command time). The first run passed 23/25: two related-article screenshots captured fallback fonts before the asynchronous layout font state updated. Their tests now wait for Open Sans and the existing heading weight, without changing screenshot baselines or tolerances. See todo.md for the repeatable command.

### Main-heading regression guard — 2026-10-05

Require exactly one H1 in every generated standalone HTML page, including translated placeholders, utility routes and 404 pages. Exclude Gatsby's internal HTML fragments. Enforce this through the existing SEO test and CI gate; keep representative hydration/navigation browser checks as a separate guard. The site-wide audit found and corrected duplicate article-body H1s in both GDPR language files and missing headings on the search/newsletter routes. Live training HTML and hydrated pages already have one H1; Bing's indexed report requires a fresh crawl before its warning can be reassessed.

### Production performance and validator follow-up

Use [docs/pagespeed-review.md](docs/pagespeed-review.md) as the research and decision record before further performance changes. Apply obvious fixes that preserve appearance/behavior; obtain agreement before changing interactions, branding, comment providers, publication-time assumptions or restrictive security policies. Compare repeated mobile audits, separating lab/field and first-party/vendor evidence. Keep CSS redesign deferred.

Subscription and comments must remain automatically available without an extra click. Do not introduce click-to-load buttons for these integrations; the owner explicitly rejected that interaction change.

Discuss Giscus as the preferred comment-provider migration candidate, including GitHub login/moderation requirements, stable bilingual thread mapping and an offline dry run of Disqus history migration. No provider switch or external comment writes are authorized by the research request. Keep this decision ahead of spending substantial effort on Disqus-specific work.

Use the repeatable `yarn audit:performance` command with pinned Lighthouse, lockfile Chromium, fresh profiles and three sequential mobile runs per page. Preserve before/after JSON artifacts and compare median metrics; keep live scores outside deterministic deployment gates.

### Authorized safe PageSpeed implementation — 2026-10-05

Implement responsive card sizes, WebP Markdown images with original-format fallback, priority for the known Introduction cover only, the same portrait at higher resolution, selected existing-font preloads and batched menu measurements. Preserve CSS, automatic subscription/comments, routing and content. Add deterministic generated-output and browser regressions; retain existing screenshots. Playwright and its matching official Chromium browser package are project development dependencies. Record review-only choices and their reasons explicitly in the performance review; do not implement provider, interaction, color, timestamp or security-policy changes here.

Local result: final build, full tests including 14 performance regressions, all 18 browser checks, frozen install, smoke and scoped lint pass. The measured 800px Introduction WebP saves about 80% versus PNG with the existing visual tolerance. Native iframe lazy loading defers distant embeds but does not defer Introduction's nearer embed in Chromium; stricter automatic viewport loading remains a review-only decision. Keep CI/deployed checks and any whole-page performance claims separate from these local results.

CI navigation regression follow-up: browser readiness uses DOM plus explicit font/hydration/iframe checks, never networkidle. The newsletter regression deliberately holds a request open to ensure analytics/comment network activity cannot reintroduce the reported navigation timeout. Preserve the native-lazy proximity caveat and real distant-article test.

### Polish font coverage correction — 2026-10-05

Existing Open Sans 1.10 files cover basic Latin only, forcing Polish letters into a system fallback. Add matching Latin Extended subsets for every existing weight/style, with explicit Unicode ranges and consistent self-hosted sources. Preserve font design, sizing and Latin assets. Verify actual rendered glyph fonts through Chromium's platform-font inspection, not just computed font-family; retain existing screenshot tolerances.

Polish coverage result: matching extended subsets are installed and all 19 browser checks (including actual glyph-font inspection), the full tests with 15 performance regressions, build, smoke and scoped lint pass. Existing screenshots/tolerances and output contracts remain. CI/deployment verification is pending.

## Approved PageSpeed follow-up and developer tooling — 2026-10-05

Implement approved choices 1A (automatic newsletter viewport loading, reserved space and subscription fallback), 3A (scoped accessible text colors) and 5A (optional real publication timestamps; preserve historical dates). Choices 2 and 4 remain pending. Adapt Pongo's flat ESLint, Prettier and VS Code conventions for Gatsby/React; add lint-staged and a pre-commit hook. Exclude generated output and imported article text from bulk formatting. Verify lint/format, installation, smoke, full production tests and browser behavior; record local results separately from pending CI/deployment.

Approved follow-up completed locally: choices 1A, 3A and 5A are implemented and verified; comments (2) and the home label (4) remain review decisions. The newsletter fallback fits its existing legend spacing. Current validation is 694 routes, 222 redirects, 399 sitemap URLs, 18 performance/metadata regressions and 24 browser checks; all existing contracts/screenshots pass. CI now checks the complete maintained ESLint/Prettier scope rather than a separate modernized-file list. Gatsby styling/runtime behavior remains; the Node 24-compatible deasync patch was pinned at that stage and is now removed with the retired styling integration. Exact timings and CI/deployment follow-ups are in todo.md.

## MiniSearch implementation — 2026-10-05

Proceed with the approved next search stage. Build per-language local indexes from current canonical Markdown nodes, preferring real translations and linking fallback articles to their canonical language. Measure payload and initialization before adoption. Lazy-load MiniSearch and indexes only when a search is entered; keep the existing result layout, safe snippets, metadata and pagination. Add real bilingual browser searches, failure/retry checks and warm-build modification/deletion verification. Remove Algolia integration/dependencies/CI/cache inputs after the replacement passes. No external account/index deletion or localization-provider migration is included.

MiniSearch replacement is now implemented. The prototype passed a production build, full suite and 25 browser checks before removing the old integration. Algolia build/browser packages, configuration, workflow credentials and cache-key indexing mode are removed; no account/index was deleted. Genuine translations and canonical fallbacks produce 336 unique documents per language, with lazy engine/index downloads and safe snippets. The first-use gzip index cost is about 1.7MB per language. Final post-removal verification and warm-cache results are recorded in todo.md. Localization remains the next separate stage; the original Algolia analytics/indexing tasks are superseded rather than claimed externally verified.

MiniSearch final local acceptance is complete: all five search regressions, full tests, 25 browser checks, frozen install, lint/format, smoke, actionlint and real warm-build modification/deletion/restoration pass. Development indexes also refresh on modification/deletion using Gatsby's supported createPages lifecycle, with a repeatable development check. Routes, redirects, sitemap/feed entries, source content and existing screenshot tolerances remain unchanged. The measured first-use cost is about 1.7MB gzip per language; a standalone 4× CPU-throttled Chromium benchmark measured approximately 0.43–0.44s asynchronous initialization, at most about 22ms per tested query and 16.5MiB retained index memory (medians, excluding network). Engine/index downloads occur only after a query is entered. Keep real-device/network and production verification separate from these local measurements. Localization is the next implementation stage; hosted-search analytics/indexing tasks are retired.

## CodeQL corrections and search presentation — 2026-10-05

Follow-up alert 5 flags assigning a stored link mapping to a Cheerio href attribute. Move canonical link rewriting to Turndown's link conversion boundary instead of mutating HTML. Validate parsed URL protocols, reject ambiguous mapped paths/control characters, and encode Markdown destination delimiters. Preserve relative blog routes, query/fragment values, external links, link titles and local assets. Test unsafe source/mapped URLs and Markdown breakout attempts; hosted alert closure still requires the next scan.

Fix the three alerts from PR #50's CodeQL check without suppressions: replace the ambiguous SVG prefix regex with a forward scan; validate actual imported/mapped link destinations before assigning href, and additionally rebuild partial-word emphasis from allowed tags and encoded text; escape Markdown label backslashes and punctuation together. Add hostile-input regressions and distinguish local checks from the next hosted CodeQL run.

The owner also requested a complete search presentation improvement: reuse the site's accessible green/neutral theme, add optimized local article covers through Gatsby's image pipeline, improve responsive result cards and pagination/focus states, and verify real bilingual mobile/desktop searches. Keep lazy search loading, canonical fallback policy and safe snippets intact. This authorizes search presentation changes, not the deferred whole-site redesign.

Development validation also exposed Gatsby's internal legacy import-order checks. Correct the source with ESM side-effect imports (preserving stylesheet/polyfill order), move the theme import before declarations and replace unused side-effect map calls with forEach. Retain the project's flat ESLint configuration and active integrations. The home-label accessibility warnings remain the previously pending owner decision.

CodeQL/search presentation follow-up is complete locally: all three reported patterns are corrected with regressions, and search has optimized canonical covers, theme-aligned highlights, responsive cards and pagination/focus states. Frozen install, lint, smoke, full tests, all 25 browser checks and development/warm-build updates pass. Routing/SEO/feed contracts remain. The cold build passed but exposed expensive native Sharp work (3,365 jobs); warm restoration completes without the new slow-query warning. No placeholder/encoding policy change was justified by the warmed-query comparison. Hosted CodeQL/CI/deployment confirmation remains pending, with exact results in todo.md. Localization and the prior review-only decisions remain separate.

## Latest article and multilingual provider migration — 2026-10-05

Import the requested “Open Source, a relic, a charity or still the thing?” article into both language routes with local images, source provenance, canonical English fallback and original-slug redirect. Review the exact build-contract delta for the new article before updating its baseline.

The reviewed gatsby-plugin-react-i18next provider and localized navigation stage is implemented with its compatible translation-library peers; final acceptance is recorded below. Source translation JSON through Gatsby and query it on every page. Preserve the site's explicit Markdown/category canonical policy and server-side redirects; configure the plugin to recognize existing language-prefixed routes without generating a second set. Replace the global mutable translation singleton and obsolete provider, keeping the editorial page context for availability. Validate exact routes/redirects/sitemap/feed, full tests and bilingual browser navigation/screenshots. Record local results separately from hosted CI/deployment; do not infer CodeQL closure from local checks.

Current local result: latest article import/cross-links and localization-provider acceptance pass the production build, full suite and 27 browser checks. The CSS foundation now generates framework-independent variables from YAML and migrates summary/footer styles to native CSS Modules; the Node 24 hash fix is configured through the supported PostCSS plugin. Browser tests also check the CSS with JavaScript disabled. The archive baseline changes only for the new first article. Next migrate small Related/NextPrev components and reading cards before typography/navigation, with separate batch acceptance. Warm-cache modification/deletion/restoration passes. The final default-import build/lint checks pass, but its full-suite/browser rerun remains the next local gate. Hosted CI, CodeQL alert closure and deployment remain separate checks in todo.md. Dark mode and redesign have not been implemented.

## CI browser regression repair — 2026-10-05

The owner reverted to commit 4a7e4ee after CI reported an archive screenshot mismatch and a missing html language attribute during reciprocal navigation. Pause CSS work while repairing this checkout. Review the archive baseline against the intentionally imported Open Source article; retain the 3% tolerance. Wait for Gatsby Head to commit language metadata after client navigation, and distinguish the site footer from the article footer. Validate the production build, complete suite and browser checks before recording acceptance; hosted CI/deployment remain separate.

Future imports use an explicit archive-only snapshot command guarded by the expected newest article slug. Review the image/diff before regeneration and rerun the complete browser suite afterward; never enable automatic baseline updates in imports or CI.

CI repair local acceptance: production build, full suite, all 26 browser checks, lint/format and smoke pass. Only the archive PNG was refreshed; other baselines and the 3% tolerance remain unchanged. The wrong-slug update guard was tested and preserves the existing PNG. Hosted CI and deployment confirmation remain pending.

Rebase integration: the CSS foundation is restored on top of the verified CI repair. Preserve its 27th CSS regression alongside the repaired language readiness checks and guarded archive update. Earlier 26-test acceptance covers the pre-CSS checkout; rerun checks for the combined result before claiming CSS acceptance.

## Firefox diagnostics and corrected PageSpeed follow-up — 2026-10-06

Trace production browser messages with a clean Firefox profile and preserve privacy restrictions. Remove only application debug chatter; add repeatable diagnostics and local-file reference coverage. Research and measure the new PageSpeed report against the owner-corrected Introduction article, distinguishing field data from cold mobile lab data and first-party from vendor costs. Update docs/pagespeed-review.md with evidence before further performance changes. Comments/provider and interaction choices remain pending.

Scope correction for the next CSS stage: incremental means categories of work. Complete the remaining CSS Modules conversion as one appearance-preserving stage, isolating only concrete technical difficulties; then remove obsolete styling integrations and run full acceptance. The earlier component-by-component stopping points above are superseded. Tailwind, dark mode and redesign remain later separate categories.

Controlled PageSpeed attribution now prioritizes reviewing the comments stage: three normal production runs score median 62 versus 91 with Disqus blocked only in the audit browser; transferred traffic falls about 1.45MB and best practices 54→100. This authorizes neither a provider switch nor paid subscription. Research records supported Disqus settings, their limitations and Giscus migration preparation. The complete CSS category should investigate font switching/fallback metrics, the font stylesheet request and CSS-only warm-cache invalidation with traces and regressions. Keep final typography and screenshots as acceptance constraints.

Firefox follow-up acceptance: production build, complete tests/lint, all 29 browser checks and fresh Firefox preview verification pass locally. No screenshots or production settings changed. Investigate the preview server's missing root 404 fallback separately. Hosted CI/deployment and owner comments/home-label decisions remain pending.

## Comments alternatives and earlier execution order — 2026-10-06

The owner wants to keep Disqus for now and focus on improvements that preserve the current comment provider and interaction. Optional affiliate linking was disabled by the owner; this is an owner-reported account change, not an action performed or independently verified here. Re-measure its effect before attributing further savings to it.

Retain two future alternatives for a separate comments stage:

- Giscus: GitHub Discussions storage/moderation, with GitHub authorization required for readers to post. Review historical-comment migration and shared EN/PL identifiers before any switch.
- A custom guest-comment system: no reader account, name/comment input, simple replies, one stable article thread across EN/PL, private approve/delete/block moderation, import/export and portable TypeScript client/CSS. A possible backend is Cloudflare Workers + D1 with server-validated Turnstile, rate limits and duplicate/link controls. Free operation depends on traffic and provider quotas; bot protection is not a complete content-spam filter. Start with approval before publication if this option is later chosen. It needs backend operation, backups and abuse handling; it is a feasibility alternative, not an approved implementation or deployment.

Proceed with the existing provider in this order:

1. Complete the entire remaining CSS Modules conversion as one category of work, preserving rendered appearance, routes and behavior. Remove styled-jsx integrations only after the last consumer is replaced; isolate only concrete technical difficulties.
2. Include CSS-only warm-build invalidation checks in that stage: verify both server HTML and hydrated styles change and revert correctly, alongside modified/deleted content checks.
3. Profile first-party font loading and layout shifts. Measure the local font stylesheet request, runtime font/weight switching and fallback metrics before selecting a fix. Preserve Polish glyph coverage and final typography; apply supported, non-invasive improvements only after comparison.
4. Verify the missing root 404 fallback and any remaining application-owned console/network failures with focused regressions. Retain the known output contracts or explicitly review a necessary route delta.
5. Repeat production mobile audits after deployed changes, recording normal-page results separately from diagnostic vendor-blocked runs. Confirm CI/deployment separately from local acceptance.

Do not introduce delayed/click-to-load comments, a new comment provider, paid subscriptions or analytics behavior changes in this stage. Home-label decision 4, Tailwind, dark mode and redesign remain separate reviewed work.

## Complete CSS category — accepted locally, 2026-10-06

All remaining styled-jsx consumers are replaced together with native CSS Modules. Global reset/font fallback rules are plain CSS; existing YAML values generate portable variables, with runtime image/menu/sensor values passed through CSS properties. Retain current typography, routes, content and behavior. Remove the retired Gatsby/styled-jsx integrations and their processors after the last consumer is gone. Named translation components preserve hero markup independently of JSX whitespace formatting; retain dashed CSS exports explicitly.

The CSS-only warm-build probe reproduced stale inline CSS on pages sharing the extracted stylesheet. Use Gatsby's supported PostCSS/css-loader customization to make class exports depend on stylesheet contents, with Webpack dependencies for edits/additions. This invalidates renderers without deleting the data/image cache. Verify baseline, declaration-only edits and restoration against every generated page's current CSS asset and browser computed styles, with and without JavaScript. Keep this opt-in check separate from ordinary content-cache verification.

Local acceptance passes; do not infer a performance gain or CI/deployment success. Cold image generation and warm builds are different workloads. Font profiling, root 404 fallback and post-deployment audits remain the subsequent stages. Disqus loading/provider, analytics, Tailwind, dark mode and layout redesign remain unchanged.
