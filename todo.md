# SEO, content, and platform progress

Last updated: 2026-10-09

This is the live checklist for [plan.md](./plan.md). Completed categories are consolidated here; dated research and earlier timings remain in the plan and linked reviews. A local pass, a hosted CI pass and a deployed check are separate evidence.

## Current work

- [ ] Complete the authorized coordinated TypeScript/native-ESM migration across application, Node tooling/importers, local plugins and tests, respecting documented Gatsby/configuration loader boundaries.
- [ ] Add meaningful no-emit type-checking to commands/CI and update imports, component paths, cache inputs, fixtures and README together.
- [ ] Validate types/lint/smoke/build/full tests/browser screenshots; preserve existing content, route/feed/sitemap contracts and screenshot tolerance.

- [x] Audit dependency imports, configuration, commands, peer requirements and installation hooks; record the bounded cleanup and supporting documentation in plan.md before changing packages.
- [x] Remove proven unused direct declarations, stale Stylelint command, unused configuration and Facebook Comments/old Talks files; use native promises instead of Bluebird. Remove project-owned Babel setup using TypeScript parsing and existing Vitest; explicitly declare matching runtime types. Keep active/deferred integrations and Gatsby-owned compiler/plugin dependencies.
- [x] Validate dependency cleanup with frozen installation, lint/smoke, production build, full tests and unchanged browser screenshots. Record local results separately from hosted CI/deployment.
- [x] Reconcile obsolete/duplicated checklist entries. Node 24 is the runtime; CSS Modules, lint cleanup, root 404 recovery, English workshop translation, anti-patterns collision removal and image descriptions are complete. Theme variables are implemented; Algolia and styled-jsx are retired.
- [x] Inspect the supplied `6ac7e39e32aee76765a22ec6` preview: the Polish article's generated related card targets `/en/open-source-a-relict-a-charity-or/`. Trace the canonical-only selection and forced-English adapters before implementation.
- [x] Preserve the visitor's locale in related cards, archives, category reading lists and search whenever a matching route exists. Retain canonical indexing policy and accurate content-language labels; test SSR and reciprocal hydrated navigation.
- [x] Complete the bounded CLI/script/Node-test readability category using built-in argument parsing, actual shared traversal and test-context cleanup. Preserve commands, importer security boundaries and observable behavior.
- [x] Run proportionate focused checks, full lint/smoke/nonvisual tests, production build and browser regressions. Preserve route/feed/sitemap contracts and screenshot tolerance; record evidence below.

## Completed implementation

- [x] Gatsby 5.16.1 / React 18 / Node 24 / Yarn 1 baseline; native ESM Gatsby hooks, useStaticQuery wrapper, layout cleanup, explicit GraphQL types, current CI actions and build/download caching. The original Node 16/22 checkpoints are historical, not targets.
- [x] Local MiniSearch replaces Algolia. Lazy bilingual indexes, safe snippets, covers, retry/error/empty/loading states, canonical content deduplication and modified/deleted-content checks are implemented. No external indexing account is required for search.
- [x] gatsby-plugin-react-i18next owns translation resources/provider/navigation; avoid overlapping locale generators. EN/PL routes, genuine translations and untranslated copies remain explicit.
- [x] Complete portable CSS Modules conversion and component ownership; global reset/fonts/tokens belong to shared layout. theme.yaml generates CSS variables. Remove obsolete styled-jsx packages and blanket imports.
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
- [x] Native Playwright Test fixtures/assertions/snapshots/webServer replace manual browser cleanup, PNG comparison and CI server polling. Seven TypeScript suites report 55 browser cases; Vitest remains for components with automatic mock cleanup. README covers focused/debug/report/trace and explicit snapshot review. Existing PNGs and the 3% tolerance are unchanged.
- [x] Replace historical migration/body/count assertions with current generated-output and security checks. Earlier CodeQL fixes use parsed URLs and safe Markdown destinations rather than HTML attribute injection; no findings are suppressed.

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

- [ ] Repair the legacy generate-app-icons command: it calls npx sharp, but the sharp library has no CLI binary. Use its already declared library API in the next manual-tooling pass. This audit does not run the broken command or change icon assets.
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

- Contact form repair/restoration: deferred at the owner's request. The live page offers Calendly; preserve unreferenced form files/dependencies until a frontend/Netlify detection/delivery solution is approved and verified.
- Giscus or custom guest comments remain alternatives. Giscus requires GitHub authorization; a guest backend needs moderation, spam/rate controls, backups and operations. Keep Disqus and current automatic loading now; no click-to-load/provider switch is approved.
- Tailwind, dark-mode palette/behavior, visual redesign, Slices/DSG, React 19 and npm migration are separate reviewed categories. Keep Yarn, React 18, existing styles and static generation.
- The coordinated TypeScript/native-ESM migration is now authorized and tracked under Current work; retain documented framework loader boundaries.
- Home-label decision 4, analytics/security-policy changes and font fallback metric changes need explicit review if they alter visible behavior.

## Manual operation

[README.md](README.md) contains install/build/test commands, browser reports/snapshot review, importer manifests/image overrides, category reading order and IndexNow operation. Google/Bing accounts and hosting logs require owner access; client names/testimonials need permission. Update this checklist with verified evidence in the same change; do not infer hosted success from local results.
