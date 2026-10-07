# SEO, content, and platform progress

Last updated: 2026-10-08

This is the live checklist for the strategy in [`plan.md`](./plan.md). Check an item only when its implementation and proportionate verification are complete. Add a short note under blocked or partial items instead of presenting them as finished.

## CodeQL and regression-test cleanup — 2026-10-08

- [x] Read PR #52's two open alerts (6 and 7), confirm both are test-only URL substring checks and review the primary CodeQL guidance.
- [x] Assert exact parsed link destinations, with negative examples for URLs embedded in text or lookalike destinations. Both reported URL substring checks are replaced without suppressions.
- [x] Remove completed-migration assertions and the archive acceptance suite from routine tests. Preserve importer/security, actual rendering, SEO, bilingual navigation and cache regressions; `test:articles` derives article/related-content checks from current generated data. Record this testing rule in AGENTS.md.
- [x] Local acceptance: production build passes (140.62s), full revised suite passes (68.39s), all 34 browser checks pass (62.61s), lint/format and smoke pass (79 source files / 18 queries). README documents `test:articles`; route/feed/sitemap contracts and screenshots pass without fixture updates. No application/content changes or deployment were made. Nine CSS-order and four slow category-query warnings remain separate follow-up work; CSS/content cache algorithms were not changed or re-profiled here.
- [ ] Confirm alerts 6 and 7 close on the next hosted CodeQL analysis; local passing tests do not establish closure.

## Google indexing follow-up — 2026-10-07

- [x] Read the four coverage CSVs and all six sets of URL examples; research Google/Gatsby/Netlify primary documentation before implementation.
- [x] Compare generated canonicals/sitemap/alternates and representative live responses; merge findings into docs/google-indexing-review.md and plan.md.
- [x] Correct six untranslated article flags and two English-original flags; delete the duplicate anti-patterns landing files at the owner’s request, preserving the article, complete series/talk links and one canonical llms.txt entry. Final generated-output checks remain part of acceptance below.
- [x] Implement three reported aliases and 24 legacy category query rules, plus missing-locale topic redirects. Native Netlify parser/engine checks cover spaces, plus/encoded spaces, slash variants and extra tracking parameters.
- [x] Implement bilingual recovery HTML and native 404 rewrites; add canonical/sitemap/alternate/collision/identity regressions and a read-only public indexing audit. Hosted response verification remains pending.
- [x] Translate the English workshop page while preserving both URLs, as requested; correct two copied article titles. Regenerated llms.txt has no repeated URLs or titles.
- [x] Correct YouTube conversion scope: restore 36 text links in 28 files exactly from their original Markdown; retain four linked-thumbnail conversions. Future imports convert only linked thumbnails and preserve text links, including reading lists and standalone links.
- [x] Verify the corrected YouTube scope: all 22 importer tests and six video/header checks pass; the whole content scan finds no unconverted thumbnails; all 36 restored references render as anchors in production HTML. All 34 browser checks pass, including English/Polish text links and thumbnail players. Existing players and mapped webinar recordings remain embedded.
- [x] Replace README’s implementation history with commands and manual operating instructions.
- [x] Move font resource tags from SEO to Gatsby’s SSR document hook and remove the added TSX compilation branch from its test harness.
- [x] Local acceptance: corrected production build passes (49.74s warm), full tests pass (65.48s), all 34 browser checks pass (70.60s), and lint/format pass. Existing build-contract and screenshot fixtures pass without updates for this correction. Hosted CI and deployment remain separate checks below.
- [ ] After deployment, recheck repaired URLs and validate genuine Search Console failures; obtain Google-selected canonicals and hosting logs where needed.

## CSS research and guardrails — 2026-10-06

- [x] Add root AGENTS.md with explicit root-cause/no-workaround rules and component ownership, portability and validation requirements.
- [x] Research Gatsby global CSS/CSS Modules, Webpack extraction and React purity; document primary sources and installed Gatsby findings in docs/gatsby-css-review.md.
- [x] Remove the blanket stylesheet entry, its page imports, speculative metadata-first ordering and its completeness test. They are not an accepted fix.
- [ ] Validate layout-owned globals and consistent order of existing shared dependencies; inspect warnings without suppressing them and preserve screenshots/cache integrity.

## Active follow-up — 2026-10-06

- [ ] Restore root 404 output and provide bilingual recovery links; verify real unknown URLs and client navigation, including JavaScript disabled.
- [ ] Resolve CSS import-order warnings without suppressing them; preserve screenshots and cache regression checks.
- [ ] Profile fonts/CLS and apply only measured improvements preserving typography and Polish glyphs.
- [ ] Verify supplied preview `6ac5341dce0e2e6c2b8846d6` and run comparable sequential mobile audits; distinguish this deployed baseline from new local changes and hosted CI/CodeQL status.

## Current CSS stage — 2026-10-06

- [x] Complete all remaining component/page/layout styles as one CSS Modules category. There are 32 native CSS Modules and no styled-jsx consumers; global reset/font fallback is plain CSS. Existing YAML values, runtime CSS variables, public state hooks and responsive thresholds remain.
- [x] Remove retired styling integrations/processors and obsolete deasync resolution; frozen installation passes.
- [x] Resolve stale CSS-only warm output with content-aware class exports and tracked Webpack dependencies. `yarn test:cache:css` passes baseline/edit/restoration in 138.61s, checking every generated page and browser computed styles with/without JavaScript.
- [x] Rerun content modification/deletion/restoration: `yarn test:cache` passes in 128.72s; article sources and llms.txt restore exactly.
- [x] Document portable styles and repeatable CSS regression commands in README; add responsive article/hero and CSS asset integrity checks.
- [x] Complete final acceptance against restored output: production build, full suite (56.43s), all 30 browser checks (56.41s command time), lint/format and smoke (78 files / 18 queries) pass. Screenshot fixtures and the 3% tolerance are unchanged.
- [ ] Verify hosted CI, CodeQL alert 5 closure and deployment separately; local checks do not establish those results.
- [ ] Next: profile first-party font loading/CLS, investigate the root 404 fallback and rerun comparable normal production audits after deployment.

Keep Disqus and its loading behavior. Giscus/custom guest comments, Tailwind, dark mode, package-manager migration and visual redesign remain deferred. Earlier component-batch results below are historical; the full conversion supersedes their remaining-consumer counts and next-batch instructions.

## Current status

- [x] Technical SEO/content-discovery baseline is deployed and publicly verified; later category parity changes pass locally.
- [x] Bilingual consulting pages and Calendly links are verified on production.
- [x] YouTube gallery/embed baseline is deployed; local browser/build regressions pass.
- [x] Gatsby and Node upgrade sequence is documented and revised around the primary Node 24 target.
- [x] Complete a full Node 16/Yarn production build through static HTML generation.
- [x] Recover from the `categories: null` deployment failure recorded in [GitHub Actions run 35613946351](https://github.com/oskardudycz/event-driven.io/actions/runs/35613946351/job/106379761098); the null-safe fix is now deployed.
- [x] Production review exposed category-page, talks-page, homepage, and article-archive clarity issues; refinements are implemented locally and pass a production build.
- [x] Deploy the Gatsby 5 presentation/runtime baseline: owner confirms changes since 99519a3c are live; main run 37237889809 succeeded. Later category fixes have separate verification below.
- [ ] Finish validating the deployed site.

## Completed locally

### Crawlability and metadata

- [x] Allow public crawlers in `robots.txt` and declare the sitemap index.
- [x] Emit canonical URLs, `hreflang`, and `x-default` alternates.
- [x] Exclude fallback-language duplicates and utility routes from sitemap/indexing where appropriate.
- [x] Emit Article, Service, ProfilePage, WebSite, and CollectionPage structured data.
- [x] Add Open Graph and X/Twitter descriptions, images, and image alt metadata.
- [x] Generate `static/llms.txt` during builds from canonical content.
- [x] Confirm generated `llms.txt` includes both consulting pages and 335 articles.

### Consulting, training, and conversion

- [x] Add English and Polish consulting pages.
- [x] Add the free introductory call link: <https://calendly.com/oskar-dudycz/consulting>.
- [x] Link consulting from the main menu, homepage hero, author profile, and contact form.
- [x] Localise contact labels and validation messages.
- [x] Fix the contact form network-error callback.
- [x] Support visible frontmatter summaries below page and article titles.

### Categories, articles, and search

- [x] Support a primary `category` plus multiple secondary `categories`.
- [x] Add curated English guides for Event Sourcing, Event-Driven Architecture, CQRS, and Software Architecture.
- [x] Turn the category index into a topic overview with descriptions and article counts.
- [x] Add recommended reading order and image cards to category pages.
- [x] Refine category pages after production review with responsive two-column cards, consistent image ratios, reading-order badges, clamped excerpts, and working article-count pluralisation.
- [x] Generate category cover WebPs through template queries; page context now carries IDs only.
- [x] Replace automatic category-based related articles with opt-in, same-language curated links; seed the vertical-slices article with its two cited predecessors.
- [x] Reuse category cards for related reading, place it after the newsletter signup, label chronological navigation, and verify desktop/mobile layouts with screenshots and browser checks.
- [x] Limit the homepage to 12 recent canonical articles and link to the topic index.
- [x] Reduce the homepage blog introduction to one “Latest articles” heading and label the original circular down-arrow control “Read latest articles.”
- [x] Simplify the complete archive header by removing the article-count badge and eliminating the stacked long-form/list spacing.
- [x] Keep the archive H1 in the same layout component as its article list so it remains visible after hydration, and tighten the first-card spacing on both article lists.
- [x] Add a bilingual `/articles/` archive, link “Browse all articles” to it, and keep the category index as a separate curated destination.
- [x] Keep English placeholder articles visible in Polish “Latest” and “All articles” while linking cards to the canonical English URL; switching off `useDefaultLangCanonical` after translation automatically restores the Polish target.
- [x] Fix the mixed-language hero sentence exposed by the visual production review.
- [x] Include multiple categories and result context in Algolia records/results.

### Talks and video

- [x] Add all 23 supplied playlist videos as an ordered gallery.
- [x] Parse plain IDs, `watch?v=`, `youtu.be`, and `/embed/` YouTube URLs correctly.
- [x] Prevent playlist query parameters from corrupting the embed ID.
- [x] Use click-to-load thumbnails and `youtube-nocookie.com` embeds.
- [x] Remove the redundant conference-appearance list and keep the video gallery as the talks page's useful content.
- [x] Remove unused Ant Design styles from the talks route.

### Performance and maintainability

- [x] Convert homepage hero variants to compressed WebP.
- [x] Remove the contradictory fixed hero height.
- [x] Fix static-route language switching and store the selected target language.
- [x] Gate webpack bundle analysis behind `ANALYZE=true` and prevent browser auto-open.
- [x] Align `.nvmrc`, package engines and CI on Node 24 (Node 16 was the historical baseline).
- [x] Remove the obsolete `prettier/react` ESLint configuration entry.
- [x] Document the Gatsby 3 → 4 → 5 migration and Node 24 target in `plan.md`.
- [x] Reverse-test the unchanged Gatsby 3 site on Node 24.12.0 with Yarn 1; record the real `ERR_OSSL_EVP_UNSUPPORTED` webpack failure and reject the temporary OpenSSL legacy-provider workaround.
- [x] Verify the supported target versions and constraints: Gatsby 4.25.9 is the diagnostic checkpoint; Gatsby 5.16.1, React 18.3.1, and the latest Node 24 LTS are the deployment target.
- [x] Audit migration-sensitive dependencies and separate required compatibility work from optional modernisation.
- [x] Add dependency-free post-build SEO assertions, expose them through `verify-seo`, `test:seo`, and `test` package scripts, and run the test in CI before deployment.
- [x] Add a committed build contract for the exact route, redirect, sitemap URL, and feed-entry sets; `yarn test` now compares every build with that baseline before deployment.
- [x] Check every sitemap URL for generated HTML and its expected canonical, and assert the generated Netlify security and `llms.txt` headers.
- [x] Register the legacy redirect set once in `onPreBuild` instead of once per page and remove unused newsletter hero image queries.
  - A clean 562-page build improved from 1,482.1 seconds to 220.9 seconds; `createPagesStatefully` fell from 127.7 seconds to 0.22 seconds and page queries from 846.6 seconds to 44.3 seconds.

## Historical verification checkpoints

- [x] Parse the English/Polish resources in `src/i18n/locales/`, `data/category-guides.json`, and `data/videos.json` successfully.
- [x] Pass `git diff --check`.
- [x] Run `yarn generate-llms` successfully on Node 16.
- [x] Gatsby creates 562 pages and completes all page GraphQL queries.
- [x] Gatsby completes production JavaScript/CSS bundling and writes all 562 `page-data.json` files.
- [x] Pass targeted ESLint checks for the new archive and updated blog/hero components.
- [x] Verify representative canonical URLs, language alternates, schema types, no-index routes, sitemap rules, `robots.txt`, and `llms.txt` from generated production files.
- [x] Inspect generated page data for English and Polish consulting, Event Sourcing category, and talks routes.
- [x] Pass the combined SEO and build-contract suite against the regenerated Node 16 build: 562 routes, 89 redirects, and 330 sitemap URLs.
- [x] Confirm the generated Netlify `_headers` contains the `llms.txt` content type and one-hour cache rule.
- [x] Complete Gatsby static HTML generation locally or confirm a successful GitHub Actions build.
  - The complete local build passed on Node 16.20.2 and Yarn 1.22.22 in 553.65 seconds, including the previously failing post.
  - CI built commit `46dd3b4` and exposed `TypeError: categories is not iterable` in `Post/Meta`. All remaining consumers now normalize `null` to an empty array, and the fix has since deployed successfully.
  - The latest local build, including the simplified archive and “View more” homepage control, generated all 562 pages and completed static HTML in 185.24 seconds.
- [ ] Restore a clean full-project lint run.
  - ESLint now loads, but reports 528 legacy errors, primarily existing Prettier/CRLF and older rule violations.

## Next actions

### P0 — finish and validate this release

- [x] Redeploy the `categories: null` normalization fix successfully.
- [x] Keep the non-delivering contact form hidden and verify both production contact pages offer the Calendly call (2026-10-05 public checks).
- [x] Confirm static HTML generation is slow rather than hung locally; the complete production build finished successfully.
- [ ] Visually approve `/en/`, `/pl/`, `/en/articles/`, `/pl/articles/`, `/en/category/event-sourcing/`, and `/en/talks/` locally at desktop and mobile widths.
- [x] Commit and deploy the original category, talks, homepage, and archive presentation refinements; baseline since 99519a3c is live. The later category parity fix still needs deployment verification.
- [x] Smoke-test the deployed baseline consulting/category/talks/contact pages and language switching; 2026-10-05 HTTP and browser checks pass. Later category fixes require their own deployment check.
- [ ] Complete the release smoke test after the pending deployment.
  - The currently deployed release returns HTTP 200 for both consulting pages, the Event Sourcing category, talks, `llms.txt`, and the robots-declared sitemap at `/sitemap/sitemap-index.xml`.
  - The contact-page Calendly CTA, interactive language switching, the pending `/articles/` routes, and the newly indexed Algolia results still need post-deployment checks. The broken form remains hidden.
- [x] Validate live canonical, alternate-language, robots, structured-data, sitemap, and `llms.txt` output on the currently deployed release.
  - Historical deployment checkpoint: the child sitemap had 328 URLs. The 2026-10-05 deployed baseline has 399; current evidence is recorded below.
  - Representative pages expose canonical URLs, appropriate language alternates, descriptions, social metadata, and BlogPosting, Service, or CollectionPage structured data.
- Superseded by local MiniSearch: canonical deduplication/categories are now tested against local indexes; no live Algolia verification is needed for the replacement.
- [ ] Submit the sitemap in Google Search Console and Bing Webmaster Tools.
- [ ] Request indexing for both consulting pages and selected cornerstone articles.
- [x] Check public CDN/WAF behavior for Googlebot, Bingbot, GPTBot, OAI-SearchBot, and ClaudeBot; each received HTTP 200 for the English consulting page.
- [ ] Measure Core Web Vitals on representative production pages.

### P1 — content work

- [ ] Replace `content/pages/szkolenie-event-sourcing/index.en.md` with an accurate English offer.
  - Current input is needed for the format, next dates or evergreen availability, price, and registration CTA; the Polish source still contains February/March 2025 dates and an old Google Form.
- [x] Add hand-written descriptions and visible summaries to ten cornerstone English articles covering the subjects listed in `plan.md`.
- [ ] Curate additional Polish reading paths; Event Sourcing now shares the eight-step sequence with canonical-language fallbacks.
- [ ] Add permitted consulting case studies, outcomes, and testimonials.
- [ ] Start translations of commercially important English-only articles.
- [ ] Apply the documented canonical/excerpt workflow to future Substack reposts.

### P2 — structured content and quality

- [ ] Add `updated` frontmatter, `dateModified`, and sitemap `lastmod` support.
- [ ] Curate related links for more cornerstone posts when there is a clear editorial connection; no automatic fallback.
- [ ] Audit article-body image alt text.
- [ ] Add Breadcrumb structured data.
- [ ] Add FAQ structured data only to eligible visible FAQs.
- Superseded by MiniSearch: ranking uses title/category boosts and local query regression checks; hosted Algolia analytics are no longer part of the application.

### P3 — completed migration checkpoints and remaining follow-ups

- [x] Complete the Node-first research and reverse probe. Gatsby 3 cannot build on Node 24 without the OpenSSL legacy-provider workaround, which will not be used.
- [x] Step 1: preserve a route/redirect/feed/sitemap snapshot from the known-good 562-page Node 16 build and enforce it in CI.
- [x] Step 2: move Gatsby core and Gatsby-maintained plugins to their Gatsby 4-compatible releases as one batch; keep Node 16 and React 17, then run a clean build and output comparison.
  - Gatsby 4.25.9 builds 562 pages on Node 16 and passes the SEO and exact route/redirect/feed/sitemap contracts.
- [x] Run Gatsby 4 on Node 24 as a diagnostic. It fails in the legacy `url-loader`/`file-loader` MD4 hash path, so do not add an OpenSSL flag or webpack override; move directly to Gatsby 5 for Node 24.
- [x] Step 3: move to Gatsby 5.16.1, React 18.3.1, and Node 24; update only dependencies that actually block those versions.
  - Node 24.12.0 built all 562 pages in 120.6 seconds with local Algolia indexing disabled. Frozen Yarn install, `yarn smoke`, `yarn test`, and `git diff --check` pass.
  - A genuinely fresh `node_modules` install from the frozen lockfile passed `yarn check --integrity`. Its first build failed on the styled-jsx PostCSS worker's 10-second timeout; the unchanged retry completed all 562 pages, and SEO, build-contract, and smoke tests passed. Treat cold-build reliability as unverified until CI confirms it.
  - The legacy font-loader MD4 path was bypassed by self-hosting the same Open Sans files under `static/`; the generated stylesheet link and font files were checked.
  - The upgraded Algolia plugin ignored the old `skipIndexing` option, so it is now loaded only on credentialed main-branch builds. Production indexing still needs a CI/live check.
- [x] Remove the optional category-card reading-minute estimate from the global page-creation query; on Gatsby 5 it invokes full Markdown rendering and stalls creation, while the 562 pages now create in about 35 seconds.
- [x] Convert the ten legacy GraphQL sort queries to Gatsby 5 syntax and set `trailingSlash: "always"` during Step 3; the Node 24 build will verify them.
- [x] Align `.nvmrc`, GitHub Actions, and `package.json` engines on Node 24, refresh `yarn.lock`, and pass a frozen Yarn install.
- [ ] Step 4 follow-up: finish external service and production checks after the Node 24 deployment. CI/build/browser and representative public routes/SEO/redirects pass for the deployed baseline; deployed local search, full CDN behavior and later fixes remain separate checks.
  - The preview revealed duplicated browser markup and blurred article images after hydration. Gatsby's browser-only `SessionCheck` root wrapper differed from SSR; the browser now reuses the SSR wrapper. The disabled sign-in integration, both-language routes, webpack workaround, CI inputs, and package have been removed.
  - [x] Establish the first Playwright/Vitest archive test red on the broken preview (two H1 elements versus one in production; real cover never becomes usable) and green on the corrected local build.
  - [x] Add a second category-index test and commit reviewed 1440×900 screenshots for both routes. The category reference came from production; the archive reference was updated from the corrected local build after making its hidden H1 visible. Normal tests use those local snapshots and do not request production. The preview fails both tests, while the corrected local build passes both.
  - [x] Add a client-side navigation check. It fails on the old preview (two H1s) and passes locally with one H1, one footer, and scroll position 0.
  - [x] Move the archive heading below the 80px desktop header without changing the homepage article-list spacing; confirm the H1 top-position assertion was red before the layout change and green afterward.
  - [x] Run a clean-exit Gatsby 5 build outside the restricted sandbox, `yarn smoke`, `yarn test`, and `yarn test:visual` locally. The restricted-sandbox build's earlier non-zero exit was solely Gatsby's EROFS write to `~/.config/gatsby/`, after all 562 pages had generated.
  - [x] Confirm the twelve pre-redesign browser checks pass on GitHub Actions for 99519a3c; its Chromium comparison step succeeded. The latest fifteen checks require a separate CI run.
  - [x] Rebuild and confirm the six retired English/Polish sign-in, callback, and billing routes and their nine redirects are absent; update the committed route contract only for these intended removals. The Node 24/Gatsby 5 build produced 556 routes, 80 redirects, and the unchanged 330 sitemap URLs; `yarn test` passes.
  - [x] Verify English and Polish homepage snapshots against the corrected local build. All six Playwright/Vitest tests pass locally, including the archive, category, and article-footer comparisons.
  - [x] Capture the production article-footer state for `/en/vertical-slices-and-dependencies/`, add a regression test, and fix the author-note query to select the dedicated `parts` content. The new test failed on the preview and all six visual tests passed on the corrected local build; a fresh preview still needs review.
- [x] Verify `static/.well-known/webfinger`, the self-hosted font stylesheet/files, and the Calendly CTA on both generated contact pages.
- [ ] After Gatsby 5/Node 24 is green, migrate Yarn 1 to npm in a separate change and verify `npm ci`, build, and tests.
  - The earlier npm probe failed on GraphQL lint/styled-jsx peer requirements. Both retired integrations are now removed; this specific blocker is obsolete. npm installation has not been retried, and Yarn remains the approved working path. Do not introduce peer overrides.
  - The complete portable CSS Modules category now passes existing screenshots and behavior checks. Keep npm migration separate and deferred, alongside Tailwind integration, dark mode and layout redesign; Astro portability remains the styling direction.
- [x] Verify static WebFinger is copied to public; the smoke/build checks cover the source and generated output.
- [x] Add and run `yarn smoke` for configuration, WebFinger, source syntax, and GraphQL parsing; keep the full build contract as the release gate.
- [ ] After the runtime and package-manager changes, start incremental TypeScript adoption with shared types and a small source module.
- [x] Add a separate correctness lint baseline for modern JavaScript/TypeScript files and enforce it in CI; expansion and the full-project legacy backlog remain separate work.
- [ ] After the migration, diagnose contact form email delivery and discuss a reliable alternative before restoring a form.
- [ ] Keep React 19, Gatsby Slices, deferred static generation and full lint cleanup deferred. Vitest, image/Head migration, StaticQuery replacement and explicit schema typing are complete; see current verification below.
- [ ] Stop for a decision before replacing `gatsby-plugin-styled-jsx-postcss`, `gatsby-remark-embed-video`, or another integration where the replacement would change visible CSS/content behavior.
- [ ] Resolve the `/en|pl/anti-patterns/` route collision between the page and post sources. Recommended direction: let the richer article own `/anti-patterns/` and move or retire the older talk landing page; this needs confirmation because it changes which template owns the existing URL.

## External input or access needed

- Google Search Console and Bing Webmaster Tools access for submission and canonical inspection.
- Production/CDN/WAF access for crawler verification.
- Permission and source material for client names, testimonials, and measurable consulting outcomes.
- A decision on which English-only articles should be translated first after the Event Sourcing training page.

## Working rule

When implementation continues, update this file in the same change:

1. Move finished items to checked state only after verification.
2. Record partial verification and exact blockers beneath the item.
3. Add newly discovered strategic work to `plan.md`; add its next executable step here.
4. Keep Node/runtime changes aligned across `.nvmrc`, GitHub Actions, `package.json`, and `yarn.lock`.

## Current Gatsby 5 modernization — 2026-10-04

Current baseline: Gatsby 5.16.1 / React 18.3.1 / Node 24 / Yarn 1. Historical build counts above are retained as checkpoint evidence.

- [x] Merge docs/gatsby-5-review.md into plan.md and this checklist before implementation.
- [x] Previous pass: Head API, gatsby-plugin-image, lean route queries, Prism/Browserslist fixes, YouTube adapter and all 96 requested imports (192 language files).
- [x] Previous local verification: production build, full test suite and nine browser checks; 694 routes, 222 redirects and 399 sitemap URLs.
- [x] Replace layout StaticQuery with useStaticQuery without changing markup/styles.
- [x] Clean up resize listeners/timers and asynchronous font callbacks.
- [x] Convert Gatsby Node hooks to native ESM (.mjs); remove runtime Babel registration.
- [x] Remove proven-unused dependencies and declare directly imported packages.
- [x] Define nullable frontmatter/routing types with relative cover-file resolution.
- [x] Cache Yarn downloads and compatible Gatsby outputs in CI; save validated builds only.
- [x] Measure cold/warm builds and verify modified/deleted content against warm caches.
- [x] Run frozen installation, smoke, full production tests and browser checks.
- [x] Verify CI and representative production behavior for the deployed baseline since 99519a3c.
- [ ] Verify later commits and deployed local search independently; local checks do not complete these tasks. The old live Algolia follow-up is superseded.

Deferred: Tailwind/theme variables, dark mode, Slices, npm migration, layout redesign. Preserve current appearance and existing output contracts; no deployment/index mutation in this pass.

- [x] Update and validate build/CodeQL workflow actions against their current upstream releases.

- [x] Fix disappearing article language switcher while preserving canonical-language alternates; include placeholder posts on existing Polish category routes and remove duplicated separator.

- [x] Verify imported code languages/highlighting, importer regression tests, and inbound/outbound relative cross-links across all blog content.
- [x] Verify updated social navigation and README category reading-order documentation.

### Pre-redesign pass verification — 2026-10-04

- Frozen Yarn installation passed with registry access; the local Sharp binary was rebuilt after dependency relinking. Smoke checks cover 70 source files and 17 GraphQL queries.
- Final production build passed in 54.39 seconds. Full `yarn test` passed in 7.38 seconds, including 14 importer tests and six generated-content/navigation checks. All 12 browser checks passed in 32.44 seconds; existing screenshot baselines and tolerances were retained.
- Exact output contract remains 694 routes, 222 redirects and 399 sitemap URLs. All 96 requested articles retain 192 language files.
- Compatible cold/warm builds measured 124.73/28.16 seconds; page queries measured 45.960/0.200 seconds. The revised cache integration check passed in 80.53 seconds and verified modified text, deleted HTML/page data, and restored content. These are local measurements, not CI guarantees.
- Workflow YAML and actionlint validation passed. GitHub execution and deployment remain pending. The former live Algolia indexing follow-up is superseded by local search.
- Polish Event Sourcing lists 88 articles (six translations plus 82 English placeholders). Language-switch navigation includes existing placeholders, while SEO alternates still exclude duplicate translations. No duplicate category separator remains.
- Requested imported English files have 439 explicitly labelled code blocks; all JavaScript/js fence labels throughout content were changed to TypeScript. The Kurrent article renders all 16 TypeScript examples with Prism tokens and visible syntax colors. Code bodies were preserved.
- Eight additional known source links in requested articles and 36 inbound links elsewhere were rewritten to relative canonical blog URLs. Older/unmigrated references remain external, as previously requested.
- No cache-test publication, temporary source marker or fixture entry remains in content or llms.txt. The reusable cache check now uses only an existing non-indexed placeholder and restores sources/index in finally.

### Legacy routing and lint pass — 2026-10-04 (completed locally)

- [x] Audit and remove overlapping gatsby-plugin-i18n only after exact output and browser verification.
- [x] Remove unused direct reach-router and InstantSearch umbrella dependencies; preserve active search/comments APIs.
- [x] Add a clean, scoped correctness lint baseline for modern ESM/JSX modules and future TypeScript files; enforce it in CI without suppressing the full-project backlog.
- [x] Verify frozen install, smoke/lint, production build, full tests and English/Polish browser checks; record results here.
- [ ] Confirm the new gates on GitHub Actions independently of local results.

### Category parity and follow-up reviews

- [x] Share article selection between category indexes/details, with equal unique-slug membership and canonical-language fallback links.
- [x] Add the eight recommended Event Sourcing steps to the Polish guide and validate cards, counts, order and links.
- [x] Research current Gatsby localization options and VitePress-style local search; document trade-offs and the next safe migration step.

### Latest verification and release state — 2026-10-05

- [x] Local category parity build passed in 175.21 seconds; route creation 0.743 seconds and all-query phase 42.078 seconds. Slow archive/category query warnings remain; no speedup is claimed from these configuration-changing builds.
- [x] Full yarn test passed in 14.62 seconds, including four category-selection regression tests. Exact contract remains 694 routes, 222 redirects, 399 sitemap URLs and unchanged feed entries.
- [x] All 15 browser checks passed in 31.63 seconds, including mocked English/Polish search, category language switching, shared reading order and canonical-English fallback navigation. Existing screenshot baselines and tolerances were unchanged.
- [x] Smoke (71 source files / 17 GraphQL queries), scoped lint (28 files / zero warnings), actionlint and git diff --check passed. Lint probes confirmed undefined variables and conditional hooks fail the gate. Frozen installation passed for the dependency cleanup; category changes add no dependencies.
- [x] Category detail/index selection shares one helper. English and Polish Event Sourcing each list the same 89 unique articles and eight reading steps, preferring actual translations and falling back to canonical available languages. Missing placeholder files no longer hide articles. Category routes and native-language editorial descriptions are preserved. The prior 88-card Polish checkpoint above is superseded.
- [x] The legacy routing/lint cleanup is in 0163b29; category source changes are in b5fa19f. Latest browser regression and documentation edits are recorded alongside this validation; no deployment was performed by the agent.
- [x] Verify the owner's deployed baseline since 99519a3c. Its branch CI run [37236735203](https://github.com/oskardudycz/event-driven.io/actions/runs/37236735203) passed Node 24 setup, frozen install, smoke, build, full tests, Chromium comparisons and cache restore/save. Main Build and Deploy run [37237889809](https://github.com/oskardudycz/event-driven.io/actions/runs/37237889809), commit 4707b17, also succeeded. This does not verify later commits.
- [x] Public production probes: 16 sampled pages/assets return HTTP 200; English/Polish homepage/archive/category/consulting/contact metadata are correct, both contact pages expose Calendly, the Kurrent article has 16 TypeScript blocks, sitemap has 399 URLs, llms.txt has no temporary cache publication, WebFinger uses hachyderm.io, and the original Substack slug redirects with HTTP 301 to its English route.
- [x] Production browser smoke: English archive → Polish archive → canonical English article navigation retains one H1/site footer, correct language/title and canonical metadata. Third-party requests were blocked for this read-only check; external widgets/search were not exercised.
- [ ] Verify CI and deployment for the later routing/lint/category changes and all 15 current browser checks. Production still showed English Event Sourcing 89/eight steps versus Polish 88/no steps during the recorded probe.
- [ ] Keep deployed search, CodeQL execution, Search Console/Bing submission and Core Web Vitals as independent external follow-ups. Algolia indexing is superseded by local build output.

### Next planned improvements — before CSS redesign

Implementation order: local search first, then localization simplification. Research and compatibility findings are in [docs/gatsby-search-and-localization-review.md](docs/gatsby-search-and-localization-review.md).

#### 1. Replace Algolia with MiniSearch

- [x] Generate per-language indexes from canonical content with translation preference, fallback links and article deduplication.
- [x] Measure compressed payload, initialization time and mobile responsiveness; lazy-load the engine/index only when search is used.
- [x] Replace the search integration while preserving the existing layout, localized labels, categories/dates, pagination, keyboard access and safe highlighted snippets.
- [x] Verify English/Polish queries, diacritics, code identifiers, fuzzy/prefix matches and loading/empty/error states.
- [x] Test modified/deleted-content index updates and browser search without Algolia credentials or requests.
- [x] Remove Algolia/InstantSearch dependencies, indexing hooks, configuration/workflow references and obsolete cache-key inputs after the replacement passes.
- [x] Pass frozen install, smoke/lint, production build, full tests and browser checks; preserve route/SEO/feed contracts.
- [ ] Verify MiniSearch on CI and after deployment; check searches on a real mobile device/connection.

#### 2. Simplify multilingual routing and providers

- [x] Integrate gatsby-plugin-react-i18next with compatible i18next/react-i18next upgrades; start with static routes, provider, localized links and language picker.
- [x] Preserve prefixed English/Polish URLs and original-slug/import redirects; prevent overlapping locale route generators.
- [x] Preserve actual translation availability and placeholder navigation separately from canonical/hreflang/sitemap/feed rules.
- [x] Verify shared category membership, independent editorial reading orders and canonical-language fallback links.
- [x] Verify Gatsby Head metadata, fonts, SSR/hydration and client navigation in both languages against the existing browser tests.
- [x] Remove superseded custom hooks/providers only after their replacements pass; retain explicit article-specific canonical policy where needed.
- [x] Pass frozen install, smoke/lint, production build, the exact output contract and all 27 browser checks.
- [ ] Verify the localization stage on hosted CI/deployment separately.

Deferred: CSS/Tailwind/theme variables, dark mode, Slices, npm migration and layout redesign. MiniSearch is implemented and verified locally; the localization provider/navigation migration is implemented, with final acceptance tracked below. The owner has now authorized the small portable CSS foundation stage at the top of this document. See the latest deployment verification for hosted search status.

### Site-wide H1 validation — 2026-10-05

Additional research: [production audit review](docs/pagespeed-review.md). Apply only obvious fixes preserving appearance/behavior; review other candidates before implementation. Date/time policy, Giscus, colors/font-fallback metrics, navigation wording and security-header enforcement remain proposals. Safe image delivery and font preloads were subsequently authorized below.

- [x] Remove the rejected subscription/comment click-to-load controls and restore automatic rendering. Revert the experimental brand color, font behavior, navigation wording, image configuration, replacement avatar and guessed publication timestamps. After the owner's clarification, retain only the small Service/iframe/dimension fixes listed below.

- [x] Verify live English/Polish training pages: each has one H1 in raw HTML and after hydration. The indexed Bing warning does not reproduce on the current production pages.
- [x] Require exactly one H1 across all 694 generated standalone HTML pages, including placeholders, noindex routes and 404; exclude only Gatsby's internal HTML fragments. The existing `yarn test:seo`/CI gate enforces this.
- [x] Demonstrate the new check fails on six previous outputs: duplicate article-body H1s on both GDPR pages and missing H1s on both search/newsletter routes; fix the sources and verify the rebuilt output passes.
- [x] Add a training hydration/language-navigation browser test and verify search H1s in the existing bilingual search tests.
- [x] Production build passed (91.79s), full tests passed (15.62s), all 16 browser checks passed (48.26s command time), smoke, scoped lint and git diff --check passed. Exact routes, redirects, sitemap URLs and feeds remain unchanged.
- [ ] Verify these additions on CI and deploy the article/search/newsletter fixes. In Bing inspect `/pl/training/` using Live URL, then Request indexing; reassess the indexed warning after Bing recrawls. No deployment or indexing request was performed by the agent.

### Performance research and repeatable audits — 2026-10-05

- [x] Research the supplied homepage/article reports and reproduce request, image, contrast and schema findings; document options, risks and approval boundaries in docs/pagespeed-review.md.
- [x] Review Giscus and Andrew Lock's migration approach, including login requirements, historical authorship/replies, stable thread mappings, dry-run counts and idempotency. Add the discussion to plan.md without replacing Disqus.
- [x] Add `yarn audit:performance`: Lighthouse 13.5.0, lockfile Chromium, sequential fresh sessions, JSON artifacts/summary and temporary profile cleanup. Help, scoped lint and a one-run production smoke pass. No application dependency added.
- [x] Remove two accidentally generated Lighthouse profile folders; subsequent runner verification writes only designated reports and temporary profiles.
- [x] Validate the small local fixes: omit Service.inLanguage; title/native-lazy subscription iframe; intrinsic dimensions on the existing portrait, preserving visible sizing. Build passed in 129.28s, full tests in 11.36s, all 16 browser checks in 29.52s, smoke, scoped lint and git diff --check passed. Screenshot baselines/tolerances and exact route/redirect/sitemap/feed contracts are unchanged. Final SEO assertions also passed after tightening iframe/schema checks.
- [ ] Verify these small fixes and the audit tooling on CI; confirm Service/iframe output on production after the owner's deployment. No production change was performed here.
- [x] Publication policy approved as 5A: support actual timezone timestamps; preserve legacy date-only values and their remaining validator warnings.
- [ ] Discuss Giscus versus automatically viewport-loaded Disqus. Newsletter viewport loading is approved/applied as 1A; no extra click controls.
- [x] Apply approved 3A scoped accessible link/footer colors; decorative branding is preserved.
- [ ] Review any further font-fallback metric changes separately.
- [ ] Review CSP/COOP/Trusted Types and third-party analytics changes separately; retain current integration behavior until approved.
- [ ] Establish repeated before/after baselines and agreed payload budgets before adding any Lighthouse CI threshold. Live provider scores are not deterministic release gates.

### Authorized safe PageSpeed changes — completed locally

- [x] Implement responsive card sizes/breakpoints, Markdown WebP with original-format fallback, selective EN/PL Introduction cover priority, cacheable higher-resolution same portrait, existing 400/600 font preloads and batched menu measurement. CSS/layout and automatic comments/subscription remain.
- [x] Add 14 performance regressions to `yarn test`/CI: generated images and fallbacks throughout the site, priority exclusions, fonts/portrait dimensions, menu read/write grouping and cover visual detail/byte savings. The 800px Introduction cover is 38,034 bytes as WebP versus 191,674 bytes as PNG; no whole-page Lighthouse improvement is claimed.
- [x] Verify native newsletter request deferral and automatic loading on scroll on the longer GDPR article. Introduction remains within Chromium's native preload distance at desktop/mobile; document stricter automatic viewport loading as a review-only option.
- [x] Verify pinned project Playwright/Chromium 1.63.0, frozen installation (0.68s), recovery scripts and CI browser setup.
- [x] Final smoke (72 source files/17 queries), scoped lint, diff checks, production build (28.84s), full tests (18.11s) and all 18 browser checks (44.06s command time) pass. Five image breakpoints at DPR 1/2 pass; screenshots/tolerances and route/redirect/sitemap/feed contracts are unchanged.
- [x] Update performance review with completed fixes, regression coverage and a dedicated review-only table explaining each decision. README documents repeatable checks; plan records authorized scope.
- [ ] Verify CI and the owner's next deployment, then rerun external validators and repeated production audits. Cold WebP generation is expensive; intermediate cold-query warnings remain possible. Do not compare different cache states as a build speedup.
- [ ] Review the remaining provider/viewport-loading, contrast/wording, timestamp, fallback-font, analytics, security and Lighthouse budget decisions in docs/pagespeed-review.md. No invasive changes are included.

### CI browser navigation timeout follow-up — 2026-10-05

- [x] Remove remaining networkidle navigation/reload waits from the newsletter and training browser checks. Wait for DOM content and explicit font/hydration/iframe conditions instead; third-party activity must not gate site readiness.
- [x] Keep the real distant-article lazy-loading check and mocked newsletter form. Add a deliberately pending same-origin request throughout navigation and scroll to reproduce the reported CI failure condition without external-service timing.
- [x] Final browser validation: all 18 checks passed (40.51s command time), including the deliberately pending-request regression; diff checks passed. No production implementation or screenshot tolerance changes were needed.
- [ ] Verify the next CI run separately; local success does not establish CI success.

### Polish glyph rendering — completed locally

- [x] Reproduce system-font fallback with a failing actual-glyph browser test. Confirm matching Fontsource 4.0.0 Latin files are byte-identical to the bundled legacy Open Sans files.
- [x] Add matching Latin Extended WOFF2/WOFF subsets for normal/italic weights 300/400/600/700/800 and Unicode ranges. Remove installed-font overrides to keep subsets consistent; retain the font design and unchanged Latin assets. Record source/version/license.
- [x] Verify actual glyphs ĄĆĘŁŃÓŚŹŻ/ąćęłńóśźż use web Open Sans for all ten weight/style combinations. Build passed (21.06s), full tests passed (19.73s; 15 performance regressions), all 19 browser checks passed (48.73s). Smoke/lint/diff checks and original screenshots/tolerances pass; routes/redirects/sitemap/feed contracts unchanged.
- [ ] Verify next CI/deployment and Polish typography on production. No deployment was performed here.

## Approved PageSpeed choices and tooling — 2026-10-05

- [x] 1A: automatic newsletter loading near viewport, reserved space, fallback link, observer cleanup and browser regressions.
- [x] 3A: scoped green text/footer colors; check contrast and interaction states without changing decorative branding.
- [x] 5A: nullable real timezone publication timestamps for metadata; preserve date-only legacy values and add validation/tests.
- [x] Adapt Pongo ESLint flat config, Prettier and VS Code; install lint-staged and wire pre-commit/CI checks.
- [x] Run frozen installation, lint/format, smoke, build, full tests and browser checks.
- [ ] Next CI/deployment verification (after local completion).

Local verification: frozen install passed with Husky configured; full lint/format and smoke pass (73 source files, 17 GraphQL queries). Final production build passed in 26.39s. Full tests pass, including 18 performance/metadata regressions and the isolated lint-staged regression. All 24 browser checks pass (49.32s command time); existing screenshots/tolerances and exact route/redirect/sitemap/feed contracts are preserved. The subscription fallback occupies the legend's existing blank line, retaining the existing footer-spacing assertion. No article content, static assets or stored test fixtures were bulk-formatted.

Tooling uses ESLint 9.39.5 (the React plugin supports ESLint through 9), Prettier 3.8.3 and native ESM configuration; CI now runs full lint/format checks. Obsolete lint dependencies/configurations were removed. Installation exposed deasync 0.1.22's missing Node 24 binary; the existing styling integrations now resolve its compatible 0.1.31 patch, with the TypeScript parser peer declared directly. Gatsby warned about three slow category queries during cache rebuilding; the final warm build emitted no Gatsby warnings. No new full-page Lighthouse score improvement is claimed. CI/deployment, comments choice 2 and home-label choice 4 remain pending.

### MiniSearch implementation — completed locally — 2026-10-05

- [x] Build and measure local language indexes; preserve canonical translation/fallback policy and deduplicated results.
- [x] Integrate lazy search with existing layout, safe highlights, keyboard/pagination and localized states.
- [x] Verify real browser searches, failures/retry and content updates; remove superseded Algolia wiring after validation.
- [x] Record final local verification separately from pending CI/deployment; localization remains the next separate stage.

Final MiniSearch verification: frozen installation, full lint/format, smoke (76 source files / 15 GraphQL queries) and actionlint pass. Production build after removing Algolia passed (141.93s); the production baseline after development verification passed (144.46s). Full tests passed in 35.27s, including five search regressions and 18 performance/metadata regressions. All 25 browser checks passed in 61.57s command time; screenshots/tolerances and exact 694-route / 222-redirect / 399-sitemap / feed contracts are unchanged.

`yarn test:cache` passed in 139.76s across modification, canonical deletion and restoration builds. Both language indexes track current content, stale entries/assets are removed, and article sources plus llms.txt are restored exactly. Development checks also passed startup/modification/deletion/restoration; `yarn test:search:dev` repeats that check against a running local dev server. Gatsby's supported `createPages` lifecycle refreshes development data; production uses `onPostBuild`.

Each locale has 336 unique documents. EN: 5,776,878 raw bytes / 1,737,205 gzip bytes; PL: 5,798,520 / 1,742,890. Standalone Chromium, three runs per locale at 4× CPU throttling: median initialization 426.6ms EN / 444.3ms PL; median maximum tested-query time 22.4ms / 22.3ms; retained index heap approximately 16.34MiB / 16.55MiB. These measurements exclude network transfer and do not guarantee real-phone latency. The first-use search payload remains about 1.7MB gzip and is requested only after entering a query; empty search/other pages do not load the index or engine.

Algolia/InstantSearch dependencies, build/browser integration, public settings, CI secrets references, badge and obsolete cache-key inputs are removed. External account/index deletion was not performed. Cache compatibility now includes the search builder/options. Existing legacy styling/Gatsby/Yarn peer/deprecation warnings and cold category-query warnings remain; they are not search failures. CI/deployed behavior is pending. Next implementation stage: localization simplification, separately from CSS redesign and comment-provider decisions.

### CodeQL and search presentation follow-up — 2026-10-05

- [x] Fix all three reported CodeQL findings and add regressions for executable source/mapped links, malicious emphasis, pathological comment prefixes and Markdown title escaping.
- [x] Add optimized canonical cover images and theme-aligned responsive search cards, highlights and pagination.
- [x] Check installation, lint, smoke, production build, full tests and bilingual mobile/desktop browser behavior; record outcomes.
- [ ] Verify the next hosted CodeQL/CI run and deployment separately. Local regressions do not establish hosted alert closure.

Local acceptance: frozen installation, complete lint/format and smoke checks pass. All 19 importer tests (including the four new security regressions), six search tests and the full suite pass (17.89s). Every article cover and generated thumbnail file is checked. All 25 browser tests pass (51.54s command time), including real EN/PL searches, loaded covers, green highlights/hover/focus, responsive dimensions and the two new search-card screenshots. Existing unrelated baselines/tolerances and 694 routes, 222 redirects, 399 sitemap URLs and feed contracts are unchanged.

Development checks pass modification/deletion/restoration (22.98s), and the development bundle rebuilds without errors after the ESM import-order fixes. Three warm production builds pass the same checks, including canonical deletion and exact source/llms restoration (123.77s total); the restored createPages stage took 1.109s, with no slow-query warning. Article source files are restored exactly. llms.txt changes only escape the existing TypeScript generic titles; no verification publications were added.

A full clean production build passed in 732.22s with two workers. Profiling identified Sharp's native image processing: the cold build regenerated 3,365 image jobs, including existing blog images. A preliminary retry exited without a diagnostic, and another was interrupted during image processing; subsequent cold and warm builds completed successfully. Cold createPages/category-query warnings remain, along with the Babel large-bundle note. The two known home-link accessibility warnings are still owner decision 4; no label/branding change was made. Repeated warmed cover queries measured DOMINANT_COLOR at 1,232/759/1,017ms versus NONE at 1,009/766/771ms; the difference was small/inconsistent, so image placeholder settings were retained.

Current indexes contain 336 documents and 331 covers per language (all 328 articles have covers). EN: 5,967,073 bytes / 1,772,809 gzip; PL: 5,988,605 bytes / 1,778,254 gzip. Cover metadata adds roughly 35KB gzip after removing image alt text from snippets. Image files load separately and lazily. Earlier initialization/heap measurements describe the text-only baseline; no new whole-page performance or real-device claim is made.

Hosted CodeQL alert closure, CI and deployment remain pending. No alerts were dismissed/suppressed, and no commit, push or deployment was performed. Localization remains the next separate implementation stage; further cold image-encoding optimization needs its own measured pixel/size comparison.

### Owner-supplied deployment verification — 2026-10-05

- [x] Check the supplied immutable deployment: https://6ac38f11d8f02a012d48ea89--event-driven-io.netlify.app. Both language search manifests, sitemap index and representative pages return 200; canonical/sitemap URLs use event-driven.io. Homepage, Polish training and Introduction article have one H1; Service schema omits inLanguage. The immutable URL returns X-Robots-Tag: noindex.
- [x] Verify hosted build/test CI for 2feb984: https://github.com/oskardudycz/event-driven.io/actions/runs/37304083266 succeeded. CodeQL analysis job https://github.com/oskardudycz/event-driven.io/actions/runs/37304083344 succeeded; original alerts 2/3/4 are marked fixed.
- [x] Implement a correction for new CodeQL alert 5: canonical links are now rewritten directly during Markdown conversion, with parsed protocol checks and destination/title escaping. Stored mappings are no longer assigned to HTML href attributes. See the verification below.
- [ ] Confirm alert 5 closes in the next hosted CodeQL scan. The previously deployed security check failed despite the successful analysis job; no alert was suppressed or dismissed.
- [ ] Confirm/promote the desired deployment on event-driven.io and verify its assets. At this check, the main domain returned 404 for /search-index/manifest.json while the supplied deployment returned 200. Main-domain indexing, external validators and real-mobile checks remain pending.
- [x] Complete the deployed browser rerun after stabilizing font readiness: all 25 checks pass (75.25s command time). The first run passed 23/25; two related-article screenshots captured fallback fonts before layout font state updated. The tests now wait for Open Sans and the existing 600 heading weight; original baselines and 3% tolerance remain unchanged. Test-file lint/format checks pass.

Repeat against this deployment with `VISUAL_BASE_URL=https://6ac38f11d8f02a012d48ea89--event-driven-io.netlify.app yarn test:visual`. Browser checks cover bilingual search/covers, Polish glyph rendering, language navigation, categories, newsletter loading and existing screenshot contracts. They do not replace external rich-result validators, Lighthouse measurements or real-device checks.

### CodeQL alert 5 — importer Markdown boundary — 2026-10-05

- [x] Remove mapped-link assignments to Cheerio href attributes. Rewrite links through Turndown's link rule and keep stored values out of HTML attributes.
- [x] Validate parsed http/https/mailto/tel protocols; reject ambiguous mapped paths and control characters. Encode Markdown destination delimiters and escape link titles while preserving relative routes, fragments, query values and local asset links.
- [x] Extend hostile-input regressions for encoded/mixed-case executable schemes, unsafe mappings, Markdown breakout and HTML attribute delimiters. Parse generated Markdown with the same remark major used by Gatsby, declared directly as a development dependency; the lockfile retains existing resolved versions.
- [x] Record final frozen-install, lint and full-suite results: frozen install passes (16.32s), full lint/format passes, and the full suite passes (24.61s), including all 21 importer regressions. Hosted alert closure remains separate.
- [ ] Confirm hosted CodeQL alert closure after the next push/scan; no scan result is inferred from local tests.

## Latest article and multilingual provider migration — 2026-10-05

Import the requested “Open Source, a relic, a charity or still the thing?” article into both language routes with local images, source provenance, canonical English fallback and original-slug redirect. Review the exact build-contract delta for the new article before updating its baseline.

The reviewed gatsby-plugin-react-i18next provider and localized navigation stage is implemented with its compatible translation-library peers; final acceptance is recorded below. Source translation JSON through Gatsby and query it on every page. Preserve the site's explicit Markdown/category canonical policy and server-side redirects; configure the plugin to recognize existing language-prefixed routes without generating a second set. Replace the global mutable translation singleton and obsolete provider, keeping the editorial page context for availability. Validate exact routes/redirects/sitemap/feed, full tests and bilingual browser navigation/screenshots. Record local results separately from hosted CI/deployment; do not infer CodeQL closure from local checks.

### Article/localization acceptance and portable CSS foundation — 2026-10-05

The latest Open Source article is imported into both language routes with a local cover, source date/provenance and original-slug redirect. Its six cited blog articles link back through curated related cards; its own three related cards use canonical language fallbacks. The query now supplies langKey so Polish related cards link to canonical English articles where appropriate. The exact reviewed contract adds only two routes, one redirect, one sitemap URL and one feed entry: 696 routes, 223 redirects and 400 sitemap URLs, with no existing entry removed.

The localization provider/navigation stage is accepted locally. Every built language page has matching editorial/plugin locale and queried translation resources. Independent EN/PL browser sessions and reciprocal navigation preserve translated labels, canonical metadata and language switching. Server redirects and explicit canonical/placeholder policy remain; duplicate locale routes and automatic browser-language redirects are disabled.

Portable CSS foundation: theme.yaml is the single value source; a native TypeScript generator produces tokens.css before build/development, and summaries/site footers use CSS Modules. The installed Gatsby PostCSS plugin uses SHA-256 class hashes for Node 24 compatibility and default CSS Module imports matching Astro/Vite. No layout, font, color or interaction redesign is introduced. ESLint/lint-staged now cover .mts files. README documents theme regeneration, native styles and later Astro reuse. Two styled-jsx consumers are retired; remaining integrations stay active.

First-batch local acceptance, before the final default-import adjustment: frozen install passed (16.32s), complete lint/format and smoke passed (77 source files / 18 GraphQL queries), production build passed (150.57s), full suite passed (24.61s), and all 27 browser checks passed (56.00s command time). The CSS-specific check also passes in both languages with JavaScript enabled/disabled (3.65s), covering exact default values, the 1024px footer breakpoint and live variable overrides. The new localization test scopes the site footer separately from the existing article footer. The archive screenshot alone is updated after reviewing the newly imported first card; all other baselines and the 3% tolerance are preserved. Existing cold category-query warnings remain.

The final standard default-import build subsequently succeeded; its log reports 2582.87s elapsed across the interrupted session, which is not a comparable build-performance measurement. Final lint/format passed (16.29s). The rebased full-suite/browser reruns subsequently pass; see the current CSS stage above.

- [x] Rerun `yarn test` and all 27 existing browser checks against the rebased final default-import build.
- [x] Warm-cache modification/deletion/restoration verification passed (134.56s): all three builds succeeded, language indexes reflect modified/deleted content, stale pages/assets are removed, and article sources plus llms.txt are restored exactly.
- [ ] Verify hosted CI, CodeQL alert 5 closure and deployment for these changes; no push/deployment was performed.

Related and NextPrev are migrated and verified; List reading-card migration also passes its final checks above. Next: article typography and metadata. Keep theme values and style definitions independent of Gatsby data/routing so Astro can reuse them. Tailwind integration, dark-mode palette/behavior and visual redesign remain later reviewed stages.

## Active CI browser repair — 2026-10-05

- [x] Review archive screenshot difference after importing the Open Source article; update only an intentional content baseline, retaining the 3% threshold.
- [x] Synchronize reciprocal navigation assertions with Gatsby Head updates and count the site footer explicitly.
- [x] Run production build, full tests, all browser checks, smoke and lint on the reverted checkout. Production build passed in 152.46s, full tests in 24.94s and all 26 browser checks in 52.70s. Smoke checked 77 source files/18 queries; lint/format passed. Existing category slow-query warnings remain.
- [ ] Confirm the next hosted CI run succeeds; deployment remains on the owner's previous version meanwhile.

The repair results above cover the pre-CSS checkout. The rebase restores the CSS foundation alongside these fixes; combined-build and all 27 existing browser checks now pass (see the current CSS stage).

- [x] Add an archive-only snapshot update command with an explicit expected-slug guard and document review/rerun steps in README and the fixture guide. Verify a wrong-slug attempt fails while preserving the PNG hash; the reviewed correct-slug update and subsequent complete browser comparison pass.

## Reading CSS Modules acceptance — 2026-10-05

Related, NextPrev and List retire three more styled-jsx consumers. Native scoped styles reuse generated YAML tokens; Link receives module classes directly. Remaining framework styling integrations stay installed for their 29 source-file consumers. Existing routes, content, default appearance, breakpoints, cover images and keyboard focus are preserved. Reduced-motion preferences suppress the existing card translation and arrow scaling. README explains the portable styles and regression checks.

Both component batches pass separately: Related/navigation build and all 28 browser checks, then the List build, complete suite and all 28 browser checks. No screenshot or build-contract fixture was updated; the existing 3% visual tolerance remains. Final warm build has no Gatsby warning lines; existing dependency/deprecation notices remain. The baseline image-generation cost is not a CSS performance improvement. Hosted CI/CodeQL and deployment are still pending.

Next: complete the remaining CSS Modules conversion as one category of work; the earlier component-by-component stopping points are superseded. Keep Tailwind, dark mode, npm migration and visual redesign deferred.

## Firefox / PageSpeed follow-up — 2026-10-06

- [x] Reproduce vendor warnings in a clean Firefox 155 profile on the Open Source article. HTTP 200, English metadata and Disqus frame observed; no local-file references or reproduced file:/// error. Taboola/Criteo exceptions and blocked tracking requests remain vendor findings.
- [x] Trace the GA expiry warning: Google gtag writes duplicate expires attributes; no cookie values captured. Preserve analytics configuration.
- [x] Remove font debug chatter; add optional Firefox installation, a TypeScript console audit and README instructions. Add font browser and all-generated-HTML local-file regressions.
- [x] Complete final local acceptance: component/class production build passes (38.88s), full production suite rerun passes (27.07s), all 29 browser checks pass (51.82s command time), full lint/format rerun passes (7.61s), smoke passes (77 files/18 queries). No snapshots or tolerances changed. The first new HTML scan was corrected to exclude directories ending in .html; the first contrast run correctly caught stale inline CSS and passed after the explicit date-class rebuild.
- [x] Measure three normal and three audit-only blocked-Disqus mobile runs sequentially after build/browser work. Median score 62→91, LCP 4.34→3.04s, TBT 625→166ms, traffic 2,029,679→576,001 bytes, best practices 54→100. Detailed attribution, variability and diagnostic limitations are in docs/pagespeed-review.md; no production behavior changed.
- [ ] Resolve the unreplicated file:/// initiator if it recurs in a clean manual Firefox profile.
- [ ] Deferred comments review: Giscus or a custom guest-comment system; keep Disqus and current loading behavior for now. Home-label option 4 remains a separate open decision.
- [ ] Confirm hosted CI and deployed font-log cleanup separately.

The complete CSS Modules category is now accepted locally. Earlier typography/component-batch stopping points are superseded; see current acceptance below.

Disqus research now includes exact dashboard steps for optional affiliate linking and ad controls, paid-plan limitations, source-specific support evidence, and an offline Giscus history plan. These are documented recommendations, not applied external actions. First exploratory Lighthouse timings overlapped the build and are excluded from comparative acceptance. The existing cover priority/discovery checks pass; vendor scripts dominate the estimated unused JS. Earlier/Later date contrast is corrected using the accessible muted gray and an explicit CSS Module class. A CSS-only warm rebuild retained old inline styles; the component/class rebuild produces the current style. That historical limitation is resolved by the complete CSS stage and its passing CSS-only warm-cache regression below.

Fresh Firefox preview verification on port 9001 returned HTTP 200, lang=en and a Disqus comments frame; a five-second observation had no first-party request failures, exceptions, font debug logs or local-file references. The earlier local diagnostic lost its shared preview connection and is not acceptance evidence. The temporary fresh preview was stopped. Its unmatched-request fallback logged a missing public/404.html; investigate a proper localized 404/fallback separately, without claiming vendor exceptions are globally fixed.

## Current focus without replacing Disqus — 2026-10-06

- [x] Record the owner's decision to keep Disqus for now and retain the custom guest-comment system as an alternative to Giscus in plan.md. No custom backend/provider implementation is approved or started.
- [x] Record owner-reported disabling of optional affiliate linking. Do not claim that it removes iframe affiliate/tracking requests or that the dashboard setting has been independently verified.
- [x] Complete the remaining CSS Modules migration as one category, remove retired integrations and verify full build/test/browser contracts; see current acceptance below.
- [x] Add CSS-only warm-build change/restoration verification covering every generated page plus server/hydrated computed styles; the stale inline-output fix passes.
- [ ] Profile and improve first-party font request/switching/fallback behavior without changing final typography or Polish glyph coverage. Record measured LCP/CLS changes and preserve screenshot tolerances.
- [ ] Investigate the missing root 404 fallback and add an appropriate generated-output/browser regression.
- [ ] Re-run comparable normal production audits after deployment and the owner's affiliate setting change; distinguish vendor costs, application fixes and diagnostic blocked runs.

Deferred alternatives: Giscus with GitHub login, or an independent guest-comment service with moderation, Disqus import/export, portable TypeScript client, and a possible Workers/D1/Turnstile backend. The latter must verify free-tier suitability and backend/backup/abuse responsibilities before selection. Provider replacement, delayed comments, subscriptions and analytics changes are outside the current stage.

## Complete CSS category — final local acceptance, 2026-10-06

- [x] Replace all 29 remaining styled-jsx consumers together: 27 new CSS Modules and removal of two dead style blocks. There are now 32 native CSS Modules and no styled-jsx source consumers. Preserve public state hooks, responsive thresholds, font fallback/switching and dynamic image/menu/sensor values.
- [x] Remove retired Gatsby/styled-jsx packages, arbitrary-tag processors, text-gap processor and obsolete deasync resolution. Frozen installation passed after dependency removal. Plain text-gap pseudo-elements preserve the previous numeric offsets.
- [x] Add generated-HTML CSS integrity checks and responsive article/hero browser coverage. Keep existing screenshot fixtures and the 3% tolerance. Named hero translation components and explicit dashed CSS exports fix migration defects found by browser checks.
- [x] Reproduce the CSS-only warm-cache defect: unchanged HTML references an obsolete extracted CSS asset after a declaration-only edit. Restore the source stylesheet.
- [x] Content-aware class exports resolve the defect across all generated pages and server/hydrated computed styles. CSS warm-cache check passes (138.61s); content modification/deletion/restoration passes (128.72s). Final full suite, all 30 browser checks, lint and smoke pass.
- [ ] Confirm hosted CI, CodeQL and deployment separately; no deployment or provider change was performed.

Earlier full-suite acceptance and the 683.34s cold image-generation build precede the final cache fix. The subsequent 105.49s build uses populated image caches; neither number establishes a CSS performance improvement. Final CSS baseline/change/restoration builds pass in 29.75s / 39.20s / 37.76s with populated caches. Ten mini-css-extract ordering warnings remain between scoped modules; they were not suppressed. Cold category-query and existing dependency/deprecation notices remain possible. These are not performance results. The next stage remains first-party font/CLS profiling, then the root 404 fallback and comparable production audits after deployment.

Browser acceptance note: an initial responsive-image wait timed out while the full suite ran concurrently. The isolated check passed; its setup now explicitly waits for font/hydration readiness, scrolls the lazy image into view and waits for a decoded nonempty image before measuring. The final complete 30-check run passes. Width assertions, WebP requirements, screenshot fixtures and visual tolerance are unchanged. Automated CSS cache checks disable Gatsby telemetry/feedback prompts; local Chromium/child-process sandbox restrictions required running the existing test commands outside the tool sandbox, not changing application behavior. Temporary logs are outside the repository.
