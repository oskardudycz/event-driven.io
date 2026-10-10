# SEO, content, and platform progress

## Portable styling and dependency quick wins — 2026-10-10

- [x] Agree the shorter scope: keep useful CSS Modules, finish the portable foundation, then one coordinated Tailwind shared-layout/theme change. No blanket utility conversion, automatic snapshot acceptance or Astro migration in this stage.
- [x] Fix Tailwind 4 integration through documented Gatsby/PostCSS inline configuration, without Preflight. The loader's ESM discovery returned a namespace instead of its default configuration. Production CSS now emits utilities without uncompiled directives, and the generated-output regression check plus responsive computed-style tests pass.
- [x] Implement direct CSS-variable token editing and remove YAML generation and the unused runtime ThemeContext. Final appearance/cache acceptance remains part of the foundation checks below.
- [x] Remove unused pngjs and inert resolver configuration. Replace direct Lodash usage with one native category-slug function shared by build/browser code, preserving all 37 current category mappings. Retain the active Turndown importer and Gatsby-owned transitive utilities.
- [x] Keep Pongo's ESLint/Prettier integration; remove the rejected separate-tool proposal from current recommendations.
- [x] Record Starlight inspiration, Astro migration tradeoffs and sharing alternatives in the comparison. Keep Gatsby and existing sharing behavior for this pass.
- [ ] Run installation, types/lint, production build, full tests and existing browser checks; distinguish filesystem/approval restrictions from code failures and pending hosted validation.
- [ ] Investigate and resolve installation warnings where supported fixes exist; list Gatsby-owned unresolved warnings explicitly rather than suppressing them or claiming warning-free acceptance.
- [ ] After foundation acceptance, finish the single coordinated shared-layout/theme pass already drafted in the working tree: Tailwind for shell/reusable presentation, retained scoped typography/complex styles, and light/dark/system selection. Preserve routing/content/language behavior; review intentional layout changes within the owner's close-enough allowance. No exhaustive module-to-utility conversion.
- [x] Resolve both focused browser failures through the PostCSS fix: the video grid now switches between one/two columns, and the 390px viewport has no document overflow. All five theme/grid/mobile/system/storage checks pass; no width-hiding rule or relaxed assertion was added.
- [ ] Run the full browser suite with existing screenshot tolerances, EN/PL navigation, theme first paint/persistence/system changes, responsive menus and diagrams. Recheck CSS modification/restoration with warm Gatsby caches after fixing the real PostCSS integration. Record hosted CI and deployment separately.

Current evidence: the corrected production build, smoke checks, types and lint pass locally; focused browser checks are **5 passed / 0 failed**. Full nonvisual and 62-case browser acceptance is running, followed by clean installation and the extended warm CSS/utility cache check. Earlier 57-case browser acceptance predates this layout/theme change. Installation still emits Gatsby-chain peer/deprecation warnings and the audit remains at 111 affected entries; the warning-free target is open. Hosted CI/deployment remain pending.

## Starter research and authorized form retirement — 2026-10-10

- [x] Download and compare the official minimal/blog Gatsby starters and maintained modern Tailwind references; exclude the archived Gatsby 2 example from recommendations. Record pinned commits, maintenance, manifest/source comparisons, isolated Linux npm resolutions, peer/security causes and all 84 starting dependency dispositions in [gatsby-starter-comparison.md](docs/gatsby-starter-comparison.md).
- [x] Retire the unused Contact component/barrel/CSS, form-only EN/PL translations and Ant Design, as authorized. Preserve the live Calendly pages and routes. At that checkpoint the lockfile dropped from 3,040 to 2,970 entries without retained version changes. After foundation cleanup and direct Lodash/type removal it contains 2,906 entries; the manifest has 81 direct declarations (37 dependencies, 44 development tools/types).
- [x] Verify clean npm ci with Gatsby patch hook, strict types and all 19 component cases. Further build/browser results will be recorded below when complete.
- [ ] Validate production output and bilingual contact/navigation behavior after retirement; hosted CI/deployment remain separate.
- [x] Apply the demonstrated cleanup category: unused pngjs declaration, inert resolver configuration and unused runtime theme provider. Final foundation validation is tracked above.
- [ ] Resolve project-owned lint/localization peer exceptions and investigate Gatsby's nested dependency/security chains. Current audit: 111 affected entries (19 low, 31 moderate, 61 high; no critical), representing 29 distinct advisory URLs. Fresh starters reproduce some upstream problems; that does not make this graph accepted as clean.
- [x] Record settled choices: Tailwind alongside useful modules, modern browser CSS, CSS variables as editable tokens, and Pongo's integrated formatting rules. Keep share features pending a measured replacement review. Astro remains a later decision.

## Dependency acceptance and npm migration — 2026-10-10

- [x] Resolve the demonstrated Sharp native-loader failure with clean npm ci; strict types, real lint/fix/format and tooling acceptance pass.
- [x] Migrate commands, lockfile, CI/download and Gatsby caches, hooks, editor configuration and README to npm; retain one lockfile.
- [x] Validate npm ci, types, smoke, lint/fix/format, build, full tests, browser screenshots and content/CSS cache modification/deletion/restoration.
- [ ] Verify hosted CI/deployment separately after publication.
- [ ] Remediate the remaining audit chains as tracked in the current research above. The earlier 112-entry audit fell to 111 with form retirement; compatible fixes had removed both critical advisories. Avoid audit-force plugin downgrades.

Last updated: 2026-10-10

This is the live checklist for [plan.md](./plan.md). Completed categories are consolidated here; dated research and earlier timings remain in the plan and linked reviews. A local pass, a hosted CI pass and a deployed check are separate evidence.

## Current work

- [x] Check every direct dependency against its latest stable release; test and validate ESLint 10 and the latest Gatsby-supported React 19 with matching types/icons and native sticky-header visibility. Record current versions and tested peer compatibility exceptions in the dependency review.

- [x] Align TypeScript/ESLint/Prettier/editor tooling with Pongo; use ordinary .ts/.tsx sources with explicit ESM package scopes and document Gatsby's tested root-ESM limitation.
- [x] Complete the authorized coordinated TypeScript/native-ESM migration across application, Node tooling/importers, local plugins and tests, respecting documented Gatsby/configuration loader boundaries.
- [x] Add meaningful no-emit type-checking to commands/CI and update imports, component paths, cache inputs, fixtures and README together.
- [x] Validate types/lint/smoke/build/full tests/browser screenshots; preserve existing content, route/feed/sitemap contracts and screenshot tolerance.

- [x] Audit dependency imports, configuration, commands, peer requirements and installation hooks; record the bounded cleanup and supporting documentation in plan.md before changing packages.
- [x] Remove proven unused direct declarations, stale Stylelint command, unused configuration and Facebook Comments/old Talks files; use native promises instead of Bluebird. Remove project-owned Babel setup using TypeScript parsing and existing Vitest; explicitly declare matching runtime types. Keep active/deferred integrations and Gatsby-owned compiler/plugin dependencies.
- [x] Validate dependency cleanup with frozen installation, lint/smoke, production build, full tests and unchanged browser screenshots. Record local results separately from hosted CI/deployment.
- [x] Reconcile obsolete/duplicated checklist entries. Node 24 is the runtime; CSS Modules, lint cleanup, root 404 recovery, English workshop translation, anti-patterns collision removal and image descriptions are complete. Theme variables are implemented; Algolia and styled-jsx are retired.
- [x] Inspect the supplied `6ac7e39e32aee76765a22ec6` preview: the Polish article's generated related card targets `/en/open-source-a-relict-a-charity-or/`. Trace the canonical-only selection and forced-English adapters before implementation.
- [x] Preserve the visitor's locale in related cards, archives, category reading lists and search whenever a matching route exists. Retain canonical indexing policy and accurate content-language labels; test SSR and reciprocal hydrated navigation.
- [x] Complete the bounded CLI/script/Node-test readability category using built-in argument parsing, actual shared traversal and test-context cleanup. Preserve commands, importer security boundaries and observable behavior.
- [x] Run proportionate focused checks, full lint/smoke/nonvisual tests, production build and browser regressions. Preserve route/feed/sitemap contracts and screenshot tolerance; record evidence below.

## Completed implementation

- [x] Gatsby 5.16.1 / React 19.3.0 / Node 24 / npm 11.9.0 baseline; native ESM Gatsby hooks, useStaticQuery wrapper, layout cleanup, explicit GraphQL types, current CI actions and build/download caching. The original Node 16/22 checkpoints are historical, not targets.
- [x] Local MiniSearch replaces Algolia. Lazy bilingual indexes, safe snippets, covers, retry/error/empty/loading states, canonical content deduplication and modified/deleted-content checks are implemented. No external indexing account is required for search.
- [x] gatsby-plugin-react-i18next owns translation resources/provider/navigation; avoid overlapping locale generators. EN/PL routes, genuine translations and untranslated copies remain explicit.
- [x] Complete portable CSS Modules conversion and component ownership; global reset/fonts/tokens belong to shared layout. CSS variables are now edited directly in src/theme/tokens.css; the earlier YAML generator is retired. Remove obsolete styled-jsx packages and blanket imports.
- [x] Resolve CSS extraction-order cause through the reading-list adapter/view boundary; use standard named exports and SHA-256 loader identifiers. Keep the documented [Gatsby CSS cache correction](docs/gatsby-css-cache-patch.md) until an upstream release passes edit/restoration regressions. Module/global CSS and modified/deleted-content warm builds pass.
- [x] Bilingual root/localized 404 recovery with generated-output and browser checks. Unknown URLs retain HTTP 404 and noindex; confirmed historical aliases redirect to actual replacements. Unknown content is not redirected to unrelated pages.
- [x] Fix H1 multiplicity, structured-data timestamps/timezones, Service schema language handling, canonical/hreflang/sitemap rules and anti-patterns page/post collision. The article owns the route, links the series/talks and appears once in llms.txt.
- [x] Preserve both workshop routes with English text on the English route. Keep historical commercial terms unchanged pending editorial updates.
- [x] Import the requested archive through #189 and latest Open Source article with source provenance, local assets, original-slug redirects, code highlighting and mapped cross-links. Preserve YouTube text links; embed linked video thumbnails and explicit players only. Remove paid-promotion text.
- [x] Article/category discovery, shared bilingual category membership and Event Sourcing reading order; curated related cards, chronological navigation and useful cover alternatives. Homepage, talks gallery and archive changes retain reviewed screenshots.
- [x] Approved PageSpeed 1A/3A/5A changes, responsive WebP output, priority for the measured article LCP cover, automatic viewport newsletter loading/reserved space, iframe metadata and contrast/date adjustments. Disqus provider/loading behavior stays unchanged.
- [x] Polish Open Sans glyph coverage, self-hosted fonts/preloads and removal of application font debug logs. Further fallback/CLS changes require measurement.
- [x] Full ESLint/Prettier gates, Pongo-inspired editor/staging setup, lint-staged and Husky. Source Markdown formatting is preserved; code/image errors block staging.
- [x] Image descriptions: inspect 137 references, add 264 descriptions across 142 files and declare 14 decorative occurrences. Validate all 643 Markdown files, staged absolute paths, native/Gatsby JSX images and generated HTML/image-only links. Imports preserve descriptions and require overrides for missing alt text; failed imports leave no partial post.
- [x] IndexNow CLI/domain/submission separation, public verification key, canonical content fingerprints, dry runs, deletion/batching/retry safeguards and production-only post-deploy CI. Recover acknowledged state across cache expiry; first deployment establishes a baseline without bulk historical submissions. No real notification was sent locally.
- [x] Native Playwright Test fixtures/assertions/snapshots/webServer replace manual browser cleanup, PNG comparison and CI server polling. Seven TypeScript suites report 57 browser cases; Vitest remains for components with automatic mock cleanup. README covers focused/debug/report/trace and explicit snapshot review. Existing PNGs and the 3% tolerance are unchanged.
- [x] Replace historical migration/body/count assertions with current generated-output and security checks. Earlier CodeQL fixes use parsed URLs and safe Markdown destinations rather than HTML attribute injection; no findings are suppressed.

## Local acceptance — final dependencies / npm — 2026-10-10

- Read Pongo's actual npm/workflow, TypeScript, lint, Prettier, EditorConfig and VS Code files again. Shared TS/Prettier/EditorConfig compare byte-for-byte equal. Use its npm 11.9.0 baseline and npm ci/run conventions; retain documented Gatsby JSX/DOM/generated-output and module-loader differences.
- Clean npm ci passes before and after compatible security updates. npm postinstall applies the Gatsby patch and fails on a rejected patch; remove the Yarn-only installation helper and yarn.lock. Sharp 0.35.5 loads libvips 8.18.7 in a fresh process, and the native icon command verifies all 19 PNG sizes. No library-path workaround is added.
- npm outdated reports only @types/node: keep 24.19.2 for the Node 24 runtime rather than install Node 26 types. The manifest has 84 direct declarations. The full before/current inventory and explicit peer overrides are in docs/dependency-review.md.
- Root/NodeNext/browser TypeScript checks, smoke (79 source files / 18 GraphQL queries), actual npm run fix, full lint/Prettier and uncached ESLint pass. All 12 tooling/CLI cases pass, including source-subdirectory editor resolution, deprecated iframe attributes, real staging rejection and local repository imports. Sandbox child-process restrictions required unrestricted local tooling/test execution; assertions were retained.
- All 19 component tests and the full npm run test command pass. Update the ref-forwarding assertion to Gatsby's current ref API. Move Vitest configuration into the existing ESM tests scope and update its command/debugger path; Vite's CommonJS-config warning is gone.
- First npm production build: 163.53s. Final security-updated graph: 120.08s. All 57 browser cases pass (2.8m), including EN/PL hydration/navigation, screenshots, fonts, mobile menus, sticky navigation, search and newsletter behavior. Preserve screenshot PNGs/tolerances and the 697-route/feed/sitemap contract.
- Warm content modification, canonical deletion and restoration pass (build phases 38.38s / 36.52s / 35.69s), including search indexes and exact publication/llms restoration. Module/global CSS edits and restoration pass across every generated page and browser computed styles with/without JavaScript; five warm build phases take 31.10–33.44s. These are local build timings, not a PageSpeed or hosted performance claim.
- Workflow YAML parses; manual Netlify deploy help and npm argument forwarding are verified. Netlify CLI 27 deploy commands use its documented --no-build flag so CI uploads the already validated build and prepared IndexNow manifest. Gatsby cache compatibility now includes package-lock.json and a new cache generation; save still follows successful test gates.
- Compatible npm audit fix removes both critical findings (loader-utils 2.0.4 / shell-quote 1.12.0) and reduces 126 findings to 112: 19 low, 32 moderate, 61 high, zero critical. Remaining Gatsby/Netlify dependency chains require separate review; do not accept proposed incompatible plugin downgrades. Peer/deprecation warnings remain visible. Builds still report slow category queries and dependency punycode deprecation (Gatsby labels the warning UNKNOWN but exits successfully). No warning suppression, deployment or real indexing submission is performed. Hosted CI/deployment remain pending.

## Local acceptance — React 19 / ESLint 10 / package audit — 2026-10-09

- Audit all 86 direct declarations against the registry. Gatsby 5.16.1 and official plugins are current. Upgrade React/React DOM to 19.3.0, matching types to 19.3.0, react-icons to 5.7.0, ESLint to 10.12.0 and @eslint/js to 10.0.1. Remove react-visibility-sensor: 85 declarations remain; 35 still differ from latest, including Node types intentionally matching Node 24. [The complete inventory](docs/dependency-review.md) records before/current/latest versions and the remaining upgrade batches.
- Replace the header's actual findDOMNode dependency with a native IntersectionObserver and disconnect on unmount. Use passive scroll/resize events with cleanup when observers are unavailable. Browser regressions cover sticky scrolling in EN/PL home/archive pages through both paths. The existing unsupported-observer newsletter case caught the missing header fallback; it passes after correction.
- An isolated full uncached ESLint 10 probe passes before installation. The installed tool then passes lint, TypeScript staging/accessibility fixtures and the full suite. Frozen installation passes (1.17s), Gatsby patch reapplied and Husky skipped in the sandbox; smoke passes (79 source files / 18 queries), as do strict root/NodeNext checks and formatting.
- The automatic JSX experiment builds but fails browser fonts/screenshots: it bypasses Gatsby's React.createElement Head compatibility interception and React document singleton handling removes live font attributes. Keep Gatsby's default runtime. A clean build is required when switching runtimes; the clean production build passes (676.97s, including 3375 image jobs taking 615.051s). The final header-fallback build passes (122.64s). No React compatibility patch or weakened assertion is added.
- Final restored-build full suite passes (170.50s), including 19 component tests, importer/security/image/indexing/IndexNow checks, staging fixtures and browser TypeScript. All 57 browser cases pass (186.31s). The 697-route/feed/sitemap contract, screenshot PNGs and 3% tolerance remain unchanged.
- Warm-cache modification, canonical deletion and restoration pass (155.77s); article sources and llms.txt restore exactly. Compare rendered article markup across 694 pages with the pre-cleanup baseline: unchanged after excluding React's empty text hydration comments. Source article text, static assets and contract fixtures are unchanged. Search measurement completes all six EN/PL runs (15.29s); this verifies the migrated command, not a measured performance improvement.
- Remaining diagnostics stay visible: slow category/page queries and dependency punycode deprecation. The localization plugin's current peer declaration still targets React 18; React/accessibility ESLint plugins still declare older ESLint ranges. Their actual integrations pass local compiler/lint/staging/browser checks; metadata is not patched or suppressed. Earlier traced Gatsby-pinned LMDB timer warnings remain a separate investigation. Hosted CI, deployment and production audits remain pending.

## Local acceptance — copied Pongo tooling / TypeScript — 2026-10-09

- Copy Pongo's tsconfig.shared.json, .prettierrc.json and .editorconfig exactly. Root/browser/NodeNext/lint configs extend the shared strict settings, including exact optional properties and indexed-access checking. Fix exposed type/lint errors without blanket any/ts-ignore declarations or relaxed recommended rules. VS Code settings, extensions, tasks and debuggers start from Pongo with Gatsby paths, Node 24 and Yarn adjustments.
- Application, scripts, importers, local plugins and tests use ordinary .ts/.tsx with native ESM source package scopes. Five .mjs configuration entry points remain for documented loader discovery. A clean root-type-module experiment fails in Gatsby-generated CommonJS SSR output; standard source package scopes pass without rewriting that output or installing a loader.
- Frozen install (1.70s), strict root/NodeNext checks, lint/format and smoke (79 source files / 18 queries) pass. Production build passes (214.28s). Full nonvisual suite passes (209.85s), including 19 component tests, importer/security/image/indexing/IndexNow checks and actual TypeScript lint-staged fixtures. All 55 browser cases pass (205.34s), preserving screenshot PNGs and the 3% tolerance.
- Warm-cache content modification, canonical deletion and restoration pass (350.11s). Publication sources and llms.txt restore exactly. No article text/assets or build-contract fixtures are changed. These results precede the separately requested React/ESLint candidate below; hosted CI/deployment remain pending.

## Local acceptance — dependency cleanup — 2026-10-09

- Remove 29 unused direct dependencies and add three explicit Node 24/React 18 type packages: 112 direct declarations become 86. Lockfile selectors decrease from 3636 to 3434; retained selector versions are unchanged. Gatsby owns Babel, Bluebird and core-js internally. Project tooling uses TypeScript parsing and standard Vitest mocks instead of manual Babel/CommonJS compilation.
- Frozen installation passes (0.81s), with the Gatsby patch reapplied and Husky skipped in the sandbox. Lint/format and smoke pass (77 source files / 18 queries). The final production build passes (44.47s); the unchanged route/feed/sitemap contract covers 697 routes.
- Full nonvisual suite passes (124.15s), including import/security/image/indexing/IndexNow checks, seven audit CLI checks, 19 component checks and strict browser TypeScript. All 55 browser cases pass (122.95s). Screenshot PNGs and the 3% tolerance are unchanged; no content/static asset changes are included.
- Compare rendered article markup against the pre-cleanup output across all 694 generated pages: exact match. This comparison caught an incorrect Twitter-plugin removal caused by a standalone remark audit missing Gatsby's bare-URL auto-linking; the active plugin/configuration was restored before acceptance.
- Acceptance also reproduced stale menu overflow after header/container resizing. A regression failed before the fix; the owning nav now uses native ResizeObserver with lifecycle cleanup. Mobile/desktop/container resize cases pass across three repeated runs (9/9, 83.48s), with no observer errors. No CSS changes or extra delays were added.
- The diagnostic cold build passes (666.62s, including 3375 image jobs taking 644.56s); it preceded Twitter restoration and is not the final content acceptance. The corrected build passes (148.13s), followed by the final warm build above. Cold and warm timings are not directly comparable.
- Remaining warnings stay visible: Yarn 1 reports gatsby-plugin-image's root Babel peer metadata after removing the unused declaration, as well as existing Gatsby/Ant Design/webpack peers. Official image-enabled starters also omit root Babel; the cold build confirms compilation. Dependency punycode deprecation remains; the cold build also reports slow queries and the previously traced Gatsby-pinned LMDB negative timers. No warning suppression, database override or active package upgrade is included. Hosted CI and deployment remain pending.

## Local acceptance — locale/readability — 2026-10-09

- Frozen Yarn installation passes (1.01s); Gatsby patch reapplied, Husky skipped in the sandbox. Lint/format and smoke (80 source files / 18 queries) pass.
- Production build passes (191.96s), with the unchanged 697-route/feed/sitemap contract. The exact reported page now emits a Polish related destination and retains the English canonical. No content translation or screenshot update is included.
- Full nonvisual suite passes (94.41s), including importer/security/image/IndexNow checks, seven audit CLI cases, component checks and strict browser TypeScript. All 54 browser cases pass (137.88s): the original scenarios plus two Polish archive SSR/hydration cases. Existing PNGs and the 3% tolerance remain unchanged.
- Four audit CLIs now use native parseArgs with early argument validation. Native globSync replaces repeated traversal; eight Node suites use a small test-context temporary-directory fixture. Shared integer validation stays separate from argument definitions. The search profiler loads its real options through native browser module imports instead of removing export declarations from source text; six real EN/PL measurement runs complete (12.77s). This verifies operation, not a performance improvement.
- Initial verification found a visitor callback returning an array length (interpreted by unist-util-visit as a traversal instruction), and an older category assertion requiring English canonical destinations. Corrected the callback and changed the assertion to require an available locale route while preserving canonical category membership; the full rerun passes.
- The first build also emitted slow-query warnings and three negative timer warnings presented as UNKNOWN logs, but exited successfully. The traced repeat identifies lmdb 2.5.3 scheduleFlush (dist/index.cjs:512), a pinned Gatsby dependency, as the timer-warning source. This is not an application exception; the negative interval itself still needs dependency investigation. The traced repeat also passes (154.70s). Keep warnings visible, avoid an unverified database override, and document the trace command in README. Warm-cache modification/deletion/restoration passes (153.93s); source files and llms.txt are restored exactly. The restored build also passes its unchanged 697-route/feed/sitemap contract, search checks (2.39s) and all five focused bilingual/archive/category/search browser cases (18.74s). Hosted CI/deployment of this correction remain pending.

## Latest local acceptance before this change — 2026-10-08

- Frozen Yarn install: 0.84s, Gatsby patch reapplied, Husky skipped in the sandbox.
- Full lint/format, smoke (80 source files / 18 queries), strict browser/configuration TypeScript and full nonvisual suite (147.22s, including 17 component checks) pass.
- Production build: 144.53s; route/feed/sitemap contract: 697 routes; all 52 browser cases: 113.34s. Existing screenshots/tolerances unchanged. No CSS extraction or slow-query warning in that run; dependency punycode deprecation remains. Cold build timings are not directly comparable with warm runs.
- CSS module/global edit/restoration and content modification/deletion/restoration passed in the preceding CSS category. Image/import/IndexNow/security regressions are included in the full suite.

## Hosted and production verification

- [x] Owner confirms earlier baseline since 99519a3c deployed. PR #52 merged at e627cc1; its Build and Deploy and CodeQL jobs passed; alerts 6/7 were fixed and the open-alert query was empty at the 2026-10-08 check. Production contact/search-manifest URLs returned 200. These facts supersede the old pending CodeQL/lint/Algolia checkpoints; they do not certify later revisions.
- [x] Owner supplies preview `6ac7e39e32aee76765a22ec6` on 2026-10-09. Its article HTML reproduces the current navigation defect.
- [ ] Verify latest hosted CI runner/server/artifacts, CSS/image/security gates, navigation correction and dependency/menu cleanup after publication.
- [ ] Audit the latest deployment's EN/PL home/archive/category/article/search/contact/talks pages at desktop/mobile widths, hydration, metadata, fonts, menus, recovery status and links. Record preview and production evidence separately.
- [ ] Verify production IndexNow key/manifest publication, acknowledged-state restore and a subsequent real changed-page submission after owner deployment. Local mocked tests and dry runs do not establish publication.
- [ ] Repeat normal production mobile audits after deployment and the owner's affiliate-setting change. Keep diagnostic vendor-blocked runs separate; compare repeated medians with the same Lighthouse/browser/throttling settings. Agree payload budgets before adding CI score thresholds.
- [ ] Recheck genuine Search Console failures after recrawl. Submit the sitemap in Google Search Console/Bing, inspect Google's selected canonicals for reported duplicate pages, and request indexing for repaired pages/cornerstones. Redirects and correct alternate canonicals are expected exclusions; crawled-but-unindexed status is not a build failure. Hosting logs are needed to trace historic 5xx responses.
- [ ] Re-run external structured-data validators and crawler/CDN/WAF checks when deployed behavior changes.

## Next technical category

- [x] Accept the implemented tooling, browser, CSS/localization/compiler and manual-tool upgrades in [the dependency review](docs/dependency-review.md); keep Node types aligned with the actual runtime. Cache acceptance is tracked above.

- [x] Replace the broken npx sharp icon command with the native TypeScript Sharp API command. The existing tooling fixture verifies all 19 output sizes; this was completed during npm/manual-tool acceptance.
- [ ] Profile first-party font requests, runtime switching and fallback layout shifts; apply only measured improvements preserving final typography and Polish glyph coverage.
- [ ] Trace any application-owned console/network failures reproduced in a clean browser. Investigate a file:/// initiator only if it recurs; third-party Disqus/Firefox policy warnings are documented in [pagespeed-review.md](docs/pagespeed-review.md).
- [ ] Investigate the reproduced LMDB scheduleFlush negative interval and a Gatsby-supported upstream correction; preserve cache integrity and do not suppress warnings or force a database upgrade.
- [ ] Reassess expensive GraphQL resolvers and JavaScript/CSS payload using comparable cold/warm profiles when further performance evidence justifies changes.

## Editorial follow-up

- [ ] Add handwritten descriptions/summaries beyond the ten cornerstone articles and curate more related links/Polish reading paths where useful.
- [ ] Prioritize real Polish translations of commercially/topically important English articles. An untranslated Polish route preserves navigation; it is not a translation.
- [ ] Obtain current workshop schedule, pricing and registration terms before updating the historical offer.
- [ ] Add permitted case studies, measurable consulting outcomes and testimonials.
- [ ] Add updated frontmatter with dateModified/sitemap lastmod, Breadcrumb structured data and only eligible visible FAQ markup.
- [ ] Review bilingual search quality with curated queries before tuning boosts/fuzzy behavior.
- [ ] Use the documented canonical/excerpt workflow for future Substack reposts.

## Deferred decisions

- New contact form: old inactive form and Ant Design are now retired by owner decision. Keep Calendly; design the replacement separately using native controls and verified hosted processing/delivery. Research and acceptance requirements are in the starter comparison.
- Giscus or custom guest comments remain alternatives. Giscus requires GitHub authorization; a guest backend needs moderation, spam/rate controls, backups and operations. Keep Disqus and current automatic loading now; no click-to-load/provider switch is approved.
- Tailwind integration and the coordinated shared-layout/theme draft are in progress; the current checklist records their acceptance blockers. Broader visual redesign and Slices/DSG remain later categories. npm migration is locally complete; dependency compatibility/security remediation remains open. Preserve useful CSS Modules and static generation. The authorized React 19.3.0 upgrade passed earlier local application acceptance; hosted CI/deployment are separate checks.
- Home-label decision 4, analytics/security-policy changes and font fallback metric changes need explicit review if they alter visible behavior.

## Manual operation

[README.md](README.md) contains install/build/test commands, browser reports/snapshot review, importer manifests/image overrides, category reading order and IndexNow operation. Google/Bing accounts and hosting logs require owner access; client names/testimonials need permission. Update this checklist with verified evidence in the same change; do not infer hosted success from local results.
