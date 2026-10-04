# SEO, content, and platform progress

Last updated: 2026-10-04

This is the live checklist for the strategy in [`plan.md`](./plan.md). Check an item only when its implementation and proportionate verification are complete. Add a short note under blocked or partial items instead of presenting them as finished.

## Current status

- [x] Technical SEO and content-discovery implementation is prepared locally.
- [x] Bilingual consulting pages and Calendly conversion paths are prepared locally.
- [x] YouTube playlist gallery and broken embed fix are prepared locally.
- [x] Gatsby and Node upgrade sequence is documented and revised around the primary Node 24 target.
- [x] Complete a full Node 16/Yarn production build through static HTML generation.
- [x] Recover from the `categories: null` deployment failure recorded in [GitHub Actions run 35613946351](https://github.com/oskardudycz/event-driven.io/actions/runs/35613946351/job/106379761098); the null-safe fix is now deployed.
- [x] Production review exposed category-page, talks-page, homepage, and article-archive clarity issues; refinements are implemented locally and pass a production build.
- [ ] Approve the updated layouts in local `gatsby develop`, then commit and deploy them.
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

- [x] Parse `src/i18n/i18n.json`, `data/category-guides.json`, and `data/videos.json` successfully.
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
- [ ] Keep the non-delivering contact form hidden and verify the English and Polish contact pages offer the Calendly call after deployment.
- [x] Confirm static HTML generation is slow rather than hung locally; the complete production build finished successfully.
- [ ] Visually approve `/en/`, `/pl/`, `/en/articles/`, `/pl/articles/`, `/en/category/event-sourcing/`, and `/en/talks/` locally at desktop and mobile widths.
- [ ] Commit and deploy the category, talks, homepage, and archive presentation refinements found during production review.
- [ ] Deploy a preview and smoke-test `/en/consulting/`, `/pl/consulting/`, `/en/category/event-sourcing/`, `/en/talks/`, the contact-page Calendly CTA, and language switching.
- [ ] Complete the release smoke test after the pending deployment.
  - The currently deployed release returns HTTP 200 for both consulting pages, the Event Sourcing category, talks, `llms.txt`, and the robots-declared sitemap at `/sitemap/sitemap-index.xml`.
  - The contact-page Calendly CTA, interactive language switching, the pending `/articles/` routes, and the newly indexed Algolia results still need post-deployment checks. The broken form remains hidden.
- [x] Validate live canonical, alternate-language, robots, structured-data, sitemap, and `llms.txt` output on the currently deployed release.
  - The child sitemap contains 328 URLs, includes representative public pages, and excludes account, callback, search, and 404 routes.
  - Representative pages expose canonical URLs, appropriate language alternates, descriptions, social metadata, and BlogPosting, Service, or CollectionPage structured data.
- [ ] Confirm that Algolia indexing produces one canonical hit per document and displays multiple categories correctly.
- [ ] Submit the sitemap in Google Search Console and Bing Webmaster Tools.
- [ ] Request indexing for both consulting pages and selected cornerstone articles.
- [x] Check public CDN/WAF behavior for Googlebot, Bingbot, GPTBot, OAI-SearchBot, and ClaudeBot; each received HTTP 200 for the English consulting page.
- [ ] Measure Core Web Vitals on representative production pages.

### P1 — content work

- [ ] Replace `content/pages/szkolenie-event-sourcing/index.en.md` with an accurate English offer.
  - Current input is needed for the format, next dates or evergreen availability, price, and registration CTA; the Polish source still contains February/March 2025 dates and an old Google Form.
- [x] Add hand-written descriptions and visible summaries to ten cornerstone English articles covering the subjects listed in `plan.md`.
- [ ] Curate Polish reading paths after enough Polish articles are available.
- [ ] Add permitted consulting case studies, outcomes, and testimonials.
- [ ] Start translations of commercially important English-only articles.
- [ ] Apply the documented canonical/excerpt workflow to future Substack reposts.

### P2 — structured content and quality

- [ ] Add `updated` frontmatter, `dateModified`, and sitemap `lastmod` support.
- [ ] Curate related links for more cornerstone posts when there is a clear editorial connection; no automatic fallback.
- [ ] Audit article-body image alt text.
- [ ] Add Breadcrumb structured data.
- [ ] Add FAQ structured data only to eligible visible FAQs.
- [ ] Tune Algolia ranking using production query analytics.

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
- [ ] Step 4: deploy a Node 24 preview and verify routes, SEO files, Netlify behavior, Algolia, images, videos, and language switching before production.
  - The preview revealed duplicated browser markup and blurred article images after hydration. Gatsby's browser-only `SessionCheck` root wrapper differed from SSR; the browser now reuses the SSR wrapper. The disabled sign-in integration, both-language routes, webpack workaround, CI inputs, and package have been removed.
  - [x] Establish the first Playwright/Vitest archive test red on the broken preview (two H1 elements versus one in production; real cover never becomes usable) and green on the corrected local build.
  - [x] Add a second category-index test and commit reviewed 1440×900 screenshots for both routes. The category reference came from production; the archive reference was updated from the corrected local build after making its hidden H1 visible. Normal tests use those local snapshots and do not request production. The preview fails both tests, while the corrected local build passes both.
  - [x] Add a client-side navigation check. It fails on the old preview (two H1s) and passes locally with one H1, one footer, and scroll position 0.
  - [x] Move the archive heading below the 80px desktop header without changing the homepage article-list spacing; confirm the H1 top-position assertion was red before the layout change and green afterward.
  - [x] Run a clean-exit Gatsby 5 build outside the restricted sandbox, `yarn smoke`, `yarn test`, and `yarn test:visual` locally. The restricted-sandbox build's earlier non-zero exit was solely Gatsby's EROFS write to `~/.config/gatsby/`, after all 562 pages had generated.
  - [ ] Confirm all twelve current browser checks pass on GitHub Actions' Chromium/Linux runner and review its screenshot artifacts before deploying the fix.
  - [x] Rebuild and confirm the six retired English/Polish sign-in, callback, and billing routes and their nine redirects are absent; update the committed route contract only for these intended removals. The Node 24/Gatsby 5 build produced 556 routes, 80 redirects, and the unchanged 330 sitemap URLs; `yarn test` passes.
  - [x] Verify English and Polish homepage snapshots against the corrected local build. All six Playwright/Vitest tests pass locally, including the archive, category, and article-footer comparisons.
  - [x] Capture the production article-footer state for `/en/vertical-slices-and-dependencies/`, add a regression test, and fix the author-note query to select the dedicated `parts` content. The new test failed on the preview and all six visual tests passed on the corrected local build; a fresh preview still needs review.
- [x] Verify `static/.well-known/webfinger`, the self-hosted font stylesheet/files, and the Calendly CTA on both generated contact pages.
- [ ] After Gatsby 5/Node 24 is green, migrate Yarn 1 to npm in a separate change and verify `npm ci`, build, and tests.
  - A plain `npm install --package-lock-only` failed on the unused GraphQL ESLint plugin, then on `gatsby-plugin-styled-jsx`'s `styled-jsx@^3` peer requirement. The unused lint plugin was removed. Do not add `--legacy-peer-deps`; decide how to handle the styled-jsx integration before switching lockfiles.
  - The site owner is open to a gradual styling migration, with a possible later Astro move. First establish browser screenshots/smoke checks, then migrate styled-jsx components incrementally to portable CSS Modules and CSS variables while preserving appearance. Remove the plugin only after its 35 consumers are migrated; retry npm afterward without overrides. The selected future direction is Tailwind plus CSS variables; this pre-redesign pass defers all CSS migration.
- [x] Verify static WebFinger is copied to public; the smoke/build checks cover the source and generated output.
- [x] Add and run `yarn smoke` for configuration, WebFinger, source syntax, and GraphQL parsing; keep the full build contract as the release gate.
- [ ] After the runtime and package-manager changes, start incremental TypeScript adoption with shared types and a small source module.
- [ ] Add an ESLint baseline for changed JavaScript/TypeScript files and expand it as the existing lint backlog is addressed.
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
- [ ] Verify CI/deployment and live Algolia independently; local checks do not complete these tasks.

Deferred: Tailwind/theme variables, dark mode, Slices, npm migration, layout redesign. Preserve current appearance and existing output contracts; no deployment/index mutation in this pass.

- [x] Update and validate build/CodeQL workflow actions against their current upstream releases.

- [x] Fix disappearing article language switcher while preserving canonical-language alternates; include placeholder posts on existing Polish category routes and remove duplicated separator.

- [x] Verify imported code languages/highlighting, importer regression tests, and inbound/outbound relative cross-links across all blog content.
- [x] Verify updated social navigation and README category reading-order documentation.

### Current verification results

- Frozen Yarn installation passed with registry access; the local Sharp binary was rebuilt after dependency relinking. Smoke checks cover 70 source files and 17 GraphQL queries.
- Final production build passed in 54.39 seconds. Full `yarn test` passed in 7.38 seconds, including 14 importer tests and six generated-content/navigation checks. All 12 browser checks passed in 32.44 seconds; existing screenshot baselines and tolerances were retained.
- Exact output contract remains 694 routes, 222 redirects and 399 sitemap URLs. All 96 requested articles retain 192 language files.
- Compatible cold/warm builds measured 124.73/28.16 seconds; page queries measured 45.960/0.200 seconds. The revised cache integration check passed in 80.53 seconds and verified modified text, deleted HTML/page data, and restored content. These are local measurements, not CI guarantees.
- Workflow YAML and actionlint validation passed. GitHub execution, live Algolia indexing and deployment remain pending.
- Polish Event Sourcing lists 88 articles (six translations plus 82 English placeholders). Language-switch navigation includes existing placeholders, while SEO alternates still exclude duplicate translations. No duplicate category separator remains.
- Requested imported English files have 439 explicitly labelled code blocks; all JavaScript/js fence labels throughout content were changed to TypeScript. The Kurrent article renders all 16 TypeScript examples with Prism tokens and visible syntax colors. Code bodies were preserved.
- Eight additional known source links in requested articles and 36 inbound links elsewhere were rewritten to relative canonical blog URLs. Older/unmigrated references remain external, as previously requested.
- No cache-test publication, temporary source marker or fixture entry remains in content or llms.txt. The reusable cache check now uses only an existing non-indexed placeholder and restores sources/index in finally.


### Next pre-redesign pass — 2026-10-04

- [ ] Audit and remove overlapping gatsby-plugin-i18n only after exact output and browser verification.
- [ ] Remove unused direct reach-router and InstantSearch umbrella dependencies; preserve active search/comments APIs.
- [ ] Add a clean, scoped correctness lint baseline for modern ESM/JSX modules and future TypeScript files; enforce it in CI without suppressing the full-project backlog.
- [ ] Verify frozen install, smoke/lint, production build, full tests and English/Polish browser checks; record results here.
- [ ] Confirm the new gates on GitHub Actions independently of local results.
