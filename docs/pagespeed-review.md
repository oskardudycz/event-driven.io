# PageSpeed and schema review — updated 2026-10-06

The sections below separate completed work from choices awaiting your decision. Completed changes passed local validation. **The next CI run and production deployment have not been verified here.** User approved **1A, 3A and 5A** on 2026-10-05. Choices **2 and 4** remain open.

The 2026-10-06 [Firefox findings](#firefox-and-new-production-audit--2026-10-06), [supported Disqus remedies](#supported-disqus-remedies--research-not-applied) and [controlled production comparison](#controlled-production-attribution--2026-10-06) are below. New local fixes remove font debug chatter and improve navigation-date contrast. Disqus settings/provider changes remain recommendations for review.

## Current approved follow-up

- **1A applied:** an IntersectionObserver sets the newsletter iframe URL automatically within 200px of its section. Its existing 320px height is reserved. A subscription link works without JavaScript or when loading fails; unsupported observers load automatically. The observer disconnects after loading or on unmount. No click-to-load interaction.
- **3A applied:** green text links and cover-title hover text use `#55701c`; footer text uses `#706e6b`. Decorative brand backgrounds, borders and icons keep their existing colors. Browser checks cover actual link background and normal/hover/focus states.
- **5A applied:** optional quoted `publishedAt` timestamps with a real timezone are supported in frontmatter, imports and article metadata. Invalid values are rejected. Existing date-only article dates and visible dates are preserved; their rich-result warning can remain.
- **Developer tooling applied:** Pongo-style native ESM flat ESLint config, Prettier 3, single quotes, VS Code save fixes, lint-staged and Husky pre-commit integration. CI checks the full lint/format scope. Bulk formatting excludes article content, static assets and fixtures.

**Local verification passed:** frozen install, full lint/format, smoke, production build, full tests (including 18 performance/metadata regressions and the lint-staged regression), and all 24 browser checks. CI and deployment remain separate pending checks.

## Earlier applied fixes and validation (before this follow-up)

| Issue                                  | What changed                                                                                                                                                                                                                    | Verification                                                                                                                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate/missing main headings        | Corrected GDPR body headings and added search/newsletter main headings. Every generated standalone page must have exactly one H1.                                                                                               | SEO tests check all 694 pages; browser checks cover hydration and language navigation.                                                                                                                                     |
| Invalid Service metadata               | Removed `inLanguage` from Service JSON-LD; retained page-language metadata.                                                                                                                                                     | Generated-page schema checks.                                                                                                                                                                                              |
| Newsletter accessibility/loading       | Added an iframe title and native `loading="lazy"`. The form still loads automatically without a button.                                                                                                                         | Mocked request test verifies no initial request on the distant GDPR article, then automatic loading on scroll. **Introduction still loads its nearer embed early in Chromium.**                                            |
| Article image formats                  | Enabled WebP at quality 80 through Gatsby's Markdown image pipeline, retaining original-format fallback.                                                                                                                        | Tests inspect generated Markdown images across the site for WebP/fallback and lazy-loading behavior.                                                                                                                       |
| Introduction cover priority            | Only its known leading EN/PL cover loads eagerly with high fetch priority.                                                                                                                                                      | Exactly one priority image per Introduction page; unrelated/later images remain lazy. The 800px cover is 38,034 bytes as WebP versus 191,674 bytes as PNG, about 80% smaller, within existing visual tolerance.            |
| Oversized archive/homepage covers      | Added responsive variants and corrected Gatsby Image sizes to match actual card widths.                                                                                                                                         | Browser checks at 390/600/768/1024/1440px and DPR 1/2; WebP delivery required.                                                                                                                                             |
| Blurry portrait / image dimensions     | Replaced the 60px source with the same portrait as a cacheable 180×180 WebP; added actual dimensions. Existing displayed sizes and CSS remain.                                                                                  | Dimension checks and existing screenshots.                                                                                                                                                                                 |
| Font loading                           | Preloaded the existing 400/600 Latin WOFF2 files. Font-loading lifecycle, weights and font-display remain.                                                                                                                      | Checks for exactly two existing local font preloads; font/navigation browser tests.                                                                                                                                        |
| Polish glyph mismatch                  | Added matching Open Sans 1.10 Latin Extended files for all five weights and italics, with Unicode ranges and consistent self-hosted sources. Existing Latin WOFF2 files are unchanged and byte-identical to the source release. | The new regression failed before the fix (DejaVu Sans fallback), then passed: Chromium confirms ĄĆĘŁŃÓŚŹŻ/ąćęłńóśźż use web Open Sans for all ten weight/style combinations. CSS/output tests check all font files/ranges. |
| Repeated menu layouts                  | Grouped class writes, width reads and final overflow writes; one state update.                                                                                                                                                  | Read/write-order and exact-fit tests; sticky header, resize and mobile-menu browser checks.                                                                                                                                |
| Repeatable browser/performance tooling | Pinned Playwright and matching Chromium as project dev dependencies, added browser-install scripts, wired CI installation and added the Lighthouse audit command.                                                               | Frozen install, smoke and lint pass; `yarn test:performance` is included in `yarn test`/CI. Audit-runner smoke was verified separately.                                                                                    |
| CI navigation timeout                  | Replaced networkidle with DOM plus explicit hydration/iframe readiness checks. A request deliberately stays open during the newsletter test.                                                                                    | All 18 browser checks pass, including the pending-request regression. Screenshot tolerances unchanged.                                                                                                                     |

**Previous local result:** production build passed after the Polish font fix; full tests include 15 performance regressions; all 19 browser checks passed. Routes, redirects, sitemap URLs, feeds and screenshot baselines remain unchanged. Detailed timings and remaining build warnings are in [Local verification](#local-verification).

## Decision record — only choices 2 and 4 await review

There are **two remaining choices** to make: comments (2) and the home label (4). You can reply with option codes, for example `2A, 4A`, and add any constraints. Choices 1A, 3A and 5A are now implemented; other options are not applied. Choosing a prototype authorizes that prototype only; a provider switch or external account/comment writes would still need a concrete migration review.

### 1. Newsletter loading — 1A approved and implemented

See the implementation and test status at the top. Subscription still loads automatically; no button was added.

### 2. Should we start the Giscus migration?

**Recommendation: 2A**, matching your interest in Giscus. Prepare a local/preview prototype and an offline migration plan first. Keep Disqus on production until the result is reviewed.

- **2A — Prototype Giscus and plan history migration.** Readers would need GitHub login/authorization to comment after a future switch. Recommend shared EN/PL threads per article and preserving history through a reviewed offline mapping/dry run; repository/category and actual import details come in that review.
- **2B — Keep Disqus and add automatic viewport loading.** Retains current accounts/history; delays early requests without a button. Disqus advertising/cookies remain when it loads.
- **2C — Leave comments unchanged for now.** Existing early Disqus/vendor requests remain.

**Why your decision is needed:** a future provider switch changes reader login, moderation and historical-comment handling. A prototype is not authorization to publish imported comments or install an app into your GitHub account.

### 3. Text contrast — 3A approved and implemented

The approved text colors are applied to links/footer text. Decorative brand colors are preserved.

### 4. What should the home navigation link be called?

**Recommendation: 4A**, preserving visible wording.

- **4A — Keep visible “Start”; add localized accessible names `Start (Home)` / `Start (Strona główna)`.** Preserves layout and includes the visible label in the accessible name. Recheck the specific Lighthouse link-text finding afterward; an accessible name is not a guarantee that every audit clears.
- **4B — Change visible wording to “Home” / “Strona główna”.** Clearer visible navigation, but the longer Polish label can affect menu overflow.
- **4C — Leave the label unchanged.** Keep the current audit finding for later review.

**Why your decision is needed:** this changes navigation wording for either assistive-technology users or all readers.

### 5. Publication dates — 5A approved and implemented

Actual timezone timestamps are supported; legacy date-only metadata stays unchanged. No timestamp convention was adopted.

### No decision needed now — keep deferred

These are future investigations, not additional approvals you need to supply today:

| Item                                  | Current recommendation and reason                                                                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Font fallback metrics / size-adjust   | Keep the applied preloads; prototype metrics only if repeated measurements still show meaningful shifts. Metrics can change wrapping/menu layout.                |
| GTM/analytics scheduling              | Keep current measurement behavior. First establish which events/timing you rely on before proposing a concrete change.                                           |
| CSP/COOP/Trusted Types/HSTS expansion | Keep current policies. Any later enforcement needs a tested policy covering Gatsby, embeds, styles and authentication; a report-only proposal should come first. |
| Lighthouse CI thresholds              | Save repeated comparable baselines first, then propose concrete budgets. Do not gate deployment on a single live score.                                          |

### Verification after deployment — actions, not design decisions

After the normal deployment, rerun Rich Results/Schema.org and the repeatable production audits. If Bing still shows its old duplicate-H1 warning, inspect the Live URL and request reindexing. Verify the next CI run independently. These checks do not require choosing a comment provider, colors or a timestamp convention.

## What the reports actually show

The supplied mobile reports cover `/en/` (performance/accessibility/best practices/SEO: 80/96/96/100) and `/en/introduction_to_event_sourcing/` (37/92/50/92). Both report passing real-user Core Web Vitals, LCP 2.1s and CLS 0, with no available INP. Their lab results differ substantially: the article has LCP 24.1s, 660ms blocking time and about 4.65MiB transferred.

Independent Lighthouse 13.5.0 production runs reproduced the types of failures, not identical scores. The first homepage/article runs scored 56/46 for performance and transferred about 0.67/4.08MiB. They were run concurrently and are diagnostic evidence, not controlled comparison baselines. A subsequent sequential test of the new audit runner scored 98 on the same unchanged live homepage. Network/provider variation and resource contention matter; one score is not proof of improvement.

The article audit attributed approximately 1.63MiB to substackcdn.com, 0.41MiB to substack.com and 0.10MiB to the embedded newsletter document. Disqus/ad-related domains contributed roughly another MiB. First-party requests contributed approximately 0.46MiB. The primary problem is eager third-party work, not evidence that Gatsby's own bundle alone needs a rewrite. Removing Disqus will not eliminate the larger Substack payload.

## Findings and proposed responses

| Finding                                            | Evidence and Gatsby 5 approach                                                                                                                                                | State / decision                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Service.inLanguage` invalid                       | `inLanguage` is emitted on every root schema object; Service is not a CreativeWork. Omit it from Service while retaining HTML language and valid language metadata elsewhere. | Small fix applied locally; generated-output test added.                                                                                                                                                                                                                                          |
| Date/time warning                                  | Legacy sources provide dates rather than exact times.                                                                                                                         | 5A approved/applied: nullable real timezone timestamps are used when supplied; legacy date-only values remain and can still warn.                                                                                                                                                                |
| Missing iframe title                               | The subscription iframe has no accessible title.                                                                                                                              | Title and React `frameBorder` spelling corrected locally.                                                                                                                                                                                                                                        |
| Eager subscription iframe                          | Native lazy loading allowed Introduction to load Substack early.                                                                                                              | 1A approved/applied: automatic IntersectionObserver gating within 200px, reserved iframe height, subscription fallback and cleanup.                                                                                                                                                              |
| Eager Disqus, third-party cookies and advertising  | Current article footer immediately mounts DiscussionEmbed, loading Disqus and ad networks.                                                                                    | Discuss Giscus replacement below. Alternative: automatically load Disqus as its section approaches the viewport, without a button, and reserve space. Not implemented.                                                                                                                           |
| Image dimensions                                   | Header/author avatar has CSS dimensions but no intrinsic width/height.                                                                                                        | Intrinsic dimensions and `height: auto` preserve displayed sizing. The authorized higher-resolution same-portrait asset now declares its actual 180×180 dimensions.                                                                                                                              |
| Low-resolution avatar                              | Source is only 60×60, shown up to 60 CSS pixels on high-DPI screens.                                                                                                          | The same [public GitHub portrait](https://github.com/oskardudycz.png?size=180) is now a cacheable local 180×180 WebP with intrinsic dimensions; existing 44/48/60px CSS display sizes remain. Browser screenshots and dimension tests verify it.                                                 |
| Article cover format and LCP discovery             | Introduction cover is an approximately 187KiB PNG, marked lazy, and is the LCP element.                                                                                       | WebP enabled at quality 80 with original-format fallback. A native ESM Remark plugin prioritizes only the measured Introduction cover in EN/PL; later images stay lazy. Generated-output tests enforce both formats and exactly one priority image.                                              |
| Oversized homepage covers                          | FULL_WIDTH image data declares `sizes="100vw"` although cards sit in a narrower container.                                                                                    | Gatsby Image sizes now match measured card widths, with additional responsive breakpoints. Browser tests compare declared/actual slots at 390/600/768/1024/1440px at DPR 1 and 2 and require WebP delivery.                                                                                      |
| Font stylesheet / layout shifts                    | Article shifts correlate with font loading; layout changes font family and weights again after FontFaceObserver resolves.                                                     | Preload the existing Latin 400/600 WOFF2 fonts, with crossorigin. Tests verify two valid local font resources. Existing family/weight transitions and font-display remain. Metric-compatible fallback/size-adjust changes are deferred because font metrics can change wrapping/menu layout.     |
| Forced layout                                      | Menu repeatedly changes classes and measures item widths; Lighthouse reports React/app layout work.                                                                           | Menu now restores all classes, reads all widths, then applies overflow classes and updates state once. Existing sticky/mobile-menu/navigation browser regressions remain mandatory. This removes interleaved writes/reads; no quantified Lighthouse speedup is claimed.                          |
| Contrast                                           | Green links (#709425 on white) measure about 3.52:1; small footer text about 3.02:1.                                                                                          | Darker text/link colors can meet 4.5:1. Choose scoped accessible text colors rather than globally changing branding. Color changes require review; reverted prototype.                                                                                                                           |
| Non-descriptive link                               | Lighthouse flags the menu's “Start” link.                                                                                                                                     | Consider localized “Home” / “Strona główna”, or an explicit descriptive accessible name with current visible wording retained. Discuss wording/layout; not applied.                                                                                                                              |
| Cache lifetimes                                    | Reproduced article cache warnings mostly concern Disqus/Substack resources. First-party homepage caching did not fail the audit.                                              | We cannot change vendor headers. Reduce when vendor resources load; inspect our hashed assets separately. Never give mutable page-data/HTML immutable caching merely to improve a score.                                                                                                         |
| Unused JS/CSS, old JS, minification and long tasks | Much of the article payload comes from external applications, ads and fonts. Homepage unused-JS findings point to Google Tag Manager/Analytics.                               | Measure first-party and vendor contributions separately. Gatsby Script can schedule controlled scripts, but does not rewrite scripts inside cross-origin iframes. Preserve analytics until its loading/measurement trade-off is discussed.                                                       |
| DOM size                                           | Long articles and vendor embeds add nodes.                                                                                                                                    | Keep article text visible and indexable. Reducing vendor DOM is preferable to hiding or virtualizing the article.                                                                                                                                                                                |
| Deprecated APIs, console/Issues warnings           | Vendor/browser-dependent findings vary between runs. Local reproduction did not reproduce the supplied deprecation count. It did report requests for /404/.                   | Inspect source locations and normal browser network traces before changing application code. Expected diagnostic 404 requests are not evidence of a broken article link by themselves.                                                                                                           |
| CSP, HSTS, COOP, Trusted Types                     | These are security recommendations, not automatic proof of poor performance. Production already serves one-year HSTS.                                                         | Review CSP hashes/allowlists against Gatsby bootstrap, inline styles, article HTML, analytics and embeds. COOP can affect OAuth popups; enforcing Trusted Types can break current HTML sinks. Propose/test a report-only policy first; no blind enforcement or HSTS preload/subdomain expansion. |

The generated 800px Introduction cover is 38,034 bytes as WebP versus 191,674 bytes as PNG (about 80% smaller for this asset). Its dimensions and pixel comparison pass the existing 3% screenshot tolerance. This is an asset comparison, not a measured whole-page LCP/score improvement.

Implemented items have regression coverage; pending decisions are listed explicitly below. This is not a claim that every audit is fixed. Third-party cookie/cache behavior remains controlled by providers once their embeds load.

Primary implementation references: [Gatsby performance](https://www.gatsbyjs.com/docs/how-to/performance/improving-site-performance/), [Gatsby Image](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/), [Gatsby Script](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-script/), [native iframe lazy loading](https://web.dev/articles/iframe-lazy-loading), [font layout-shift mitigation](https://web.dev/articles/optimize-cls), [Google Article timestamps](https://developers.google.com/search/docs/appearance/structured-data/article), [Schema.org datePublished](https://schema.org/datePublished), [Service](https://schema.org/Service), [Netlify headers](https://docs.netlify.com/manage/routing/headers/), and [CSP](https://developer.chrome.com/docs/privacy-security/csp).

## Disqus versus Giscus — discussion before migration

[Giscus](https://giscus.app/) uses GitHub Discussions and advertises no ads or tracking. It supports English/Polish UI, themes and a React integration. Readers need a GitHub account and app authorization to comment. The discussion repository must be public, have Discussions enabled and have the Giscus app installed. This is a good candidate for a developer audience, but we should measure its actual initial payload instead of promising a score.

| Option                                  | Benefit                                                                                      | Trade-off                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Keep Disqus, automatic viewport loading | Keeps current login and comment history; reduces early work without an extra click           | Ad networks, cookies and vendor cache policies remain when loaded               |
| Replace with Giscus                     | Removes Disqus advertising integration; fits GitHub-oriented readers; supports future themes | GitHub login requirement, repository/app setup, provider and moderation changes |

[Andrew Lock's migration article](https://andrewlock.net/migrating-comments-from-dsqus-to-giscus/) shows why importing historical comments is a separate project: XML export, filtering, author attribution, flattening deep replies, URL repair, rate limits and restartable checkpoints. Imported comments do not automatically become posts authored by the original GitHub users. Avoid unsolicited mentions/notifications.

Proposed migration sequence, subject to agreement:

1. Choose a dedicated public discussion repository or the site's existing repository; choose category and moderation policy.
2. Decide whether English/Polish versions share a discussion. Prefer a stable explicit article identity rather than titles that can change; preserve existing Disqus identifiers and URL mappings in the migration manifest.
3. Export Disqus and produce an offline dry-run inventory: thread/comment counts, exclusions, attribution, flattened reply structure and destination mappings. Retain the original export and review it before any GitHub writes.
4. Prototype Giscus in a preview with automatic availability, EN/PL labels and no extra “Show comments” button. Test authentication, navigation, dark/light theme compatibility and error states.
5. Import reviewed historical data with idempotent checkpoints, validate totals and sample threads, then switch provider. External account/app installation and comment publication require a concrete reviewed migration.

No Giscus installation, repository mutation, comment export/import or provider switch has been performed.

## Repeatable testing

The repository now has `yarn audit:performance`. It pins Lighthouse 13.5.0, uses the lockfile's Playwright Chromium, audits pages sequentially with fresh browser profiles, and saves JSON plus a summary. Browser profiles are temporary and cleaned up, avoiding chrome-launcher's WSL profile folders in the repo. The default reports directory `report/performance/` is ignored by Git.

Playwright and the matching official `@playwright/browser-chromium` package are pinned project development dependencies (1.63.0). Yarn installs Chromium automatically. If its browser cache is missing, recover it with:

```sh
yarn browsers:install
```

On Linux CI use `yarn browsers:install:ci` to install browser OS dependencies too; the workflow uses this command.

Take a production baseline before changes:

```sh
yarn audit:performance --base-url https://event-driven.io --label production-before
```

The default is three mobile runs each for the homepage and Introduction to Event Sourcing. Lighthouse's pinned npm package is fetched on first use; it is not added as an application dependency. Add a representative route explicitly:

```sh
yarn audit:performance --base-url https://event-driven.io --page /pl/training/ --label training-before
```

For local comparisons, build with the same environment/indexing/analytics/comment settings for both revisions, then serve in one terminal:

```sh
ALGOLIA_SKIP_INDEXING=true yarn build
yarn test
yarn serve -H 127.0.0.1 -p 9000
```

In another terminal:

```sh
yarn audit:performance --base-url http://127.0.0.1:9000 --label local-before
```

Repeat with `--label local-after` after a candidate change. Keep the lockfile, browser, Lighthouse version, build environment and machine fixed. Run audits sequentially without builds or other heavy tasks in parallel. Fresh profiles provide cold browser caches; CDN caches and vendor responses are not controlled. Do not compare a credential-free local build to production with analytics/Disqus enabled and call that a performance improvement.

Compare **median** LCP, blocking time, CLS and transfer bytes across three runs, plus concrete failed audit IDs and affected URLs/elements. Summary includes browser/Lighthouse versions. Reports retain request origins and details, so distinguish first-party regressions from vendor changes. Scores are diagnostics, not a deterministic CI gate. The browser test checks native iframe lazy loading initially and on scroll on the longer GDPR article, with the form available without a click. Chromium can preload nearer embeds; Introduction loaded its embed initially at both desktop and mobile sizes. Do not claim that its vendor payload is deferred by this attribute.

Keep deterministic `yarn smoke`, `yarn lint`, `yarn test` and `yarn test:visual` gates. The existing CI gate now checks headings across all 694 generated standalone pages; the small Service/iframe fixes have output checks. Continue external Rich Results/Schema.org validation after deployment. PageSpeed field data covers a rolling period and cannot immediately prove a new deployment's effect; the supplied reports do not provide INP.

A useful later CI extension is a saved Lighthouse artifact on a controlled runner, with request/payload budgets agreed from a repeated baseline. Do not make a single live Lighthouse score fail deployment.

## Local verification

Before the Polish coverage follow-up: frozen Yarn installation passed (0.68s); smoke passed with 72 source files and 17 GraphQL queries; scoped lint and diff checks passed; final production build passed (28.84s); full tests passed (18.11s), including all 14 new performance regressions; all 18 browser checks passed (44.06s command time). Existing screenshots and tolerances were retained. Exact routes, redirects, sitemap URLs and feeds remain unchanged; the existing SEO gate still checks all 694 standalone pages.

`yarn test:performance`, included in `yarn test` and therefore CI, checks EN/PL cover priority, WebP with original fallback, lazy loading across generated Markdown images, real local font preloads, portrait dimensions, image-priority exclusions, grouped menu DOM reads/writes and cover visual detail/byte savings. `yarn test:visual` verifies image slot widths/WebP delivery at five breakpoints and DPR 1/2, plus distant-newsletter request deferral and automatic loading on scroll. Existing hydration, font, sticky menu, language switching, metadata and screenshots remain regression gates. The CI browser installation now uses `yarn browsers:install:ci`.

The first WebP-generation build took substantially longer and encountered a workspace-only permission error while saving Gatsby's user configuration after generating pages. The permitted retry passed (144.77s); final warm validation passed in 28.84s. Intermediate cold-query warnings over 15s still occurred; the final warm build had no Gatsby warnings. These timings are different cache states, not a controlled speedup claim. Yarn still reports its existing url.parse deprecation on installation. No lockfile/package-manager/runtime migration is included.

The audit runner's earlier help, scoped lint and one-run production smoke passed with Lighthouse 13.5.0 and Chromium 153.0.8010.12, leaving reports in /tmp and no profile folders in the repository. No new full-page before/after Lighthouse improvement is claimed for this implementation. The measured asset saving is separate from vendor payload and native-lazy proximity limits described above.

CI execution and deployed Rich Results/Schema.org/PageSpeed verification remain pending. No production deployment, provider migration, external indexing request or account mutation was performed.

### CI navigation timeout follow-up

The reported older CI test timed out waiting for networkidle on Introduction. The current distant-article version retained that unreliable wait, so both newsletter and training checks now use DOM readiness plus explicit font/hydration/iframe conditions. A mocked request deliberately remains open through navigation and newsletter scroll, proving the check does not need network inactivity. The test still verifies zero initial newsletter requests on the distant article and automatic loading on scroll; no production behavior or screenshot tolerance is changed. See [Playwright's readiness guidance](https://playwright.dev/docs/api/class-page#page-goto-option-wait-until).

Final local validation: all 18 browser checks passed in 40.51s command time, with existing screenshots/tolerances retained; diff checks passed. The next CI run remains pending.

### Polish glyph coverage fix

The old basic-Latin font files lack Polish extended glyphs. A real Chromium glyph-font regression reproduced fallback to DejaVu Sans Light. Added the matching Open Sans 1.10 Latin Extended WOFF2/WOFF subsets for normal/italic weights 300/400/600/700/800, with Unicode ranges; removed installed-font overrides so different local versions cannot mix with the self-hosted subset. All ten existing Latin WOFF2 files exactly match Fontsource 4.0.0's corresponding files, preserving the design/metrics rather than upgrading the font family. Source/version/license are recorded in static/fonts/open-sans/README.md and LICENSE.fonts. See [Fontsource subset guidance](https://fontsource.org/docs/getting-started/subsets).

Local validation: production build passed (21.06s); full tests passed (19.73s), including 15 performance regressions; all 19 browser checks passed (48.73s command time), including actual glyph-font inspection for uppercase/lowercase Polish characters across all ten weight/style combinations. Smoke, scoped lint and diff checks passed. Existing screenshot baselines/tolerances and route/redirect/sitemap/feed contracts are preserved. CI and deployed font checks remain pending; this coverage correction was explicitly requested, and does not authorize the separate fallback-metric prototype proposed above.

## Follow-up implementation references

The viewport observer uses the [MDN Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). Developer tooling follows the [ESLint flat-config migration guidance](https://eslint.org/docs/latest/use/configure/migration-guide), [lint-staged setup](https://github.com/lint-staged/lint-staged#installation-and-setup), [Husky installation](https://typicode.github.io/husky/get-started.html) and [Prettier ignore guidance](https://prettier.io/docs/ignore). Pongo's source/editor configuration was inspected locally; its database/type-checking restrictions and unrelated testing settings were not copied.

## Approved follow-up verification — 2026-10-05

Final production build passed in 26.39s. Frozen installation, full ESLint/Prettier and smoke (73 source files / 17 GraphQL queries) pass. Full tests cover all existing SEO/import/route/redirect/sitemap/feed contracts, 18 performance/metadata regressions and an isolated lint-staged regression. All 24 browser checks passed in 49.32s command time with existing screenshots and tolerances. The fallback link uses the newsletter legend's existing blank line; the original footer-spacing assertion remains unchanged and passes.

New checks verify no initial Substack URL/request on Introduction, automatic scrolling loads on EN/PL desktop plus EN mobile, reserved height, JavaScript-free subscription link, unsupported-observer fallback and observer cleanup during navigation. Contrast checks inspect actual white backgrounds and normal/hover/focus link colors; token checks ensure decorative brand colors are unchanged. Publication checks render the actual Head component with real timezone timestamps, retain legacy date-only values and reject missing timezones/invalid dates. Import checks verify timestamps in both language files. The isolated lint-staged test formats staged source, preserves article content and rejects actual lint errors without touching the workspace Git index.

Pongo conventions are adapted with ESLint 9.39.5 for React plugin peer compatibility and Prettier 3.8.3. VS Code settings and recommendations are committed; the Husky hook is installed, and CI runs the full lint/format gate. Obsolete ESLint configuration/dependencies are removed. The existing styling plugins' old native deasync dependency lacked a Node 24 binary; its compatible 0.1.31 patch is pinned. No styling-provider migration was performed. Source/configuration/docs were normalized; imported article text, static assets and test fixtures are excluded.

Cache-rebuilding builds still reported three slow category queries; the final warm build emitted no Gatsby warnings. This does not establish a general cold-build improvement. No new whole-page Lighthouse score is claimed. Next CI, deployment and external rich-result/PageSpeed verification remain pending. Only choices 2 (comments) and 4 (home label) still need a decision.

## Firefox and new production audit — 2026-10-06

**Applied:** removed the layout's font-success/failure debug logs, preserving font loading, fallback and unmount handling. Added a console audit command using the existing Playwright dependency and an optional matching Firefox install command. Added browser coverage for silent successful font loading and generated-page coverage against local-file resource/link URLs. Build/test results will be recorded in todo.md; this is not a PageSpeed score fix.

**Observed on production:** Firefox 155, fresh extension-free profile, Open Source article returned HTTP 200 with `lang=en`, loaded a Disqus comments frame and had no top-document local-file links. The supplied privacy/referrer/autoplay warnings and VigLink opaque-response blocking reproduced. The run also caught exceptions from Disqus's Taboola video integration and Criteo's sync callback. These are real vendor errors, not application exceptions. No `file:///` warning reproduced; its origin remains unresolved, rather than attributed to an extension without evidence.

| Message                                                  | Origin / meaning                                                                                                                                                  | Action                                                                                                                                                                                                                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `_ga_…` expires overwritten                              | A temporary setter trace showed Google `gtag/js` writing two `expires` attributes in one cookie assignment. Only attribute names and calling stack were recorded. | Leave tracking configuration unchanged. Inspect the GA/GTM cookie settings if it affects tracking; no evidence of a Gatsby cookie writer.                                                                                                              |
| `font400/600 is available`                               | Our layout debug logging.                                                                                                                                         | Removed locally.                                                                                                                                                                                                                                       |
| Fingerprinting/screen dimensions and partitioned storage | Firefox protections applied to the Disqus embed.                                                                                                                  | Preserve protections; [Mozilla explains fingerprinting protection](https://support.mozilla.org/en-US/kb/firefox-protection-against-fingerprinting) and [partitioning](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/State_Partitioning). |
| Unsupported `autoplay` policy                            | Disqus declares a feature this Firefox implementation does not support.                                                                                           | Vendor compatibility warning; do not monkey-patch its iframe.                                                                                                                                                                                          |
| Weaker referrer policy ignored                           | Vendor requests attempt to use a policy Firefox restricts.                                                                                                        | Preserve the browser policy; [MDN documents the policies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy).                                                                                                        |
| VigLink `sync.gif` blocked                               | Firefox's opaque-response security check rejected a vendor request.                                                                                               | Do not bypass security or proxy the tracking resource.                                                                                                                                                                                                 |
| `file:///` security error                                | A web page attempted to associate/load a local-file URL; initiator absent from the pasted message.                                                                | Generated-page regression added. Reproduce with console stack/network initiator in a clean profile; source still unconfirmed.                                                                                                                          |

**Still for owner review:** comments decision **2A/2B/2C** above. A Giscus prototype could remove the Disqus advertising integration after a separately reviewed switch; it changes login/history/moderation. Automatic viewport loading could defer its early cost, but would retain vendor warnings when loaded. Neither is implemented or authorized by this diagnostic request.

**New PageSpeed report (URL corrected by owner to Introduction to Event Sourcing):** performance 51, accessibility 96, best practices 54, SEO 92; mobile lab FCP 3.9s, LCP 17.8s, TBT 310ms, CLS 0.077, Speed Index 8.4s and 2,677KiB transferred. Estimated unused JS is 767KiB, render blocking 720ms, image savings only 12KiB. The separate 28-day field section reports LCP 2.1s/CLS 0 and passes the available Core Web Vitals assessment; INP is unavailable. The pasted report does not establish whether field values are page-level or origin-level. This does not invalidate the poor cold mobile lab result.

Priority: identify the measured LCP element and break down discovery/download/render delay; attribute unused JS, errors, contrast and link-text findings to exact resources/elements. Compare three pinned mobile runs on this corrected URL. Do not assume the cover or Disqus accounts for all 17.8s, and do not treat the summed opportunity estimates as additive savings. [Google's LCP guidance](https://web.dev/articles/optimize-lcp) explains this distinction. Keep provider, click-to-load, branding and restrictive-header choices under review rather than applying them to chase a score.

### Supported Disqus remedies — research, not applied

**Recommended immediate account check:** open [Disqus Admin → Settings → Advanced](https://disqus.com/admin/settings/advanced/), select `oskar-dudycz`, and disable affiliate linking if it is enabled. [Disqus documents this setting](https://help.disqus.com/en/articles/1717122-how-to-disable-affiliate-linking). It prevents optional rewriting of links in the blog content, but Disqus explicitly says it cannot disable affiliate linking within its comments iframe. Therefore this is not a guaranteed fix for the iframe's VigLink sync request.

**If keeping Disqus:** open Admin → Settings → Ads and review enabled positions/types. The [Basic plan remains advertising-supported](https://help.disqus.com/en/articles/1717058-updating-your-advertising-settings); complete ad removal requires a plan that permits it. After subscribing, ads must still be disabled in each forum's Ads Settings according to the [subscription FAQ](https://help.disqus.com/en/articles/1717307-ads-free-subscription-payments-faq). This could remove the ad-vendor portion of the requests, but does not promise removal of Disqus's own cookies, referrer warnings or outdated API calls. Account eligibility and current pricing need review in the dashboard; no purchase or setting change has been made.

**Vendor bug to report yourself:** send Disqus support the Introduction URL, browser/version and the source stack from the audit. Chromium reports `NotSupportedError` for `document.browsingTopics()` in Disqus's `lounge.bundle` and deprecated unload listeners in `common.bundle`. Firefox also reports Taboola's missing video slot and Criteo's missing `TRC.getRTUS` callback. These stacks identify code the vendor must change. [Chromium's removal notice](https://groups.google.com/a/chromium.org/g/blink-dev/c/_R85yctz4Rs/m/FZrHIU1zAQAJ) confirms the Topics API change. Updating our React wrapper cannot update remote Disqus bundles. No support message has been sent.

**Preferred longer-term option remains Giscus prototype (2A):** [Giscus](https://giscus.app/) uses GitHub Discussions without its own ads/tracking, with GitHub authorization required to comment. Prepare a separately reviewed preview and offline history conversion before switching production. Use the existing stable `disqusId || slug` as the shared article key for EN/PL, rather than locale-dependent page titles or pathname mappings that split threads. Review repository/category, theme, loading behavior and login flow before adoption.

For history, request an export in Disqus Admin → Setup → Export; [Disqus describes its queued gzip export and availability limitations](https://about.disqus.com/disqus-101/how-to-optimize-disqus-for-your-community). Keep the original privately, map only real blog threads, review spam/deleted/orphan replies, preserve visible author/date attribution, and exclude private account fields. Imported comments would be created by the importing account, not become the original author's GitHub posts. Use checkpoints to prevent duplicates, review a dry-run report and avoid automatic @mentions. [Andrew Lock's migration](https://andrewlock.net/migrating-comments-from-dsqus-to-giscus/) provides a concrete example of mapping, reply conversion, orphan handling and checkpointing. Actual export/import, app installation and production provider switching remain external/review steps.

**No supported application fix identified** for disabling all fingerprinting, iframe cookie/referrer or unsupported-feature messages while retaining the current remote embed. Do not mask console output, override browser APIs, inject into cross-origin frames or relax Firefox protection. Automatic viewport loading (2B) defers cost but does not repair the remote scripts once loaded.

The GA expiry warning is separate from Disqus. In GTM, inspect the Google tag's configuration/shared settings for `cookie_flags` containing an explicit `expires=` alongside `cookie_expires`; if present, keep one supported expiration configuration after reviewing the intended lifetime. [Google documents `cookie_expires` and Analytics UI overrides](https://developers.google.com/tag-platform/security/guides/customize-cookies). The trace proves duplicate attributes and a Google-script caller, but does not prove your dashboard configuration caused them. No duration or tracking behavior was changed.

Initial local Lighthouse runs overlapped a Gatsby build and are retained only as exploratory attribution under `report/performance/production-2026-10-06`; their scores/TBT are not comparable performance benchmarks. They identify the leading cover as LCP with initial-HTML discovery, eager loading and high priority already passing; only the site's font CSS was listed as render-blocking. Estimated unused JS in run 1 was 654KiB, of which about 22KiB was the app bundle and the remainder vendor scripts. Contrast failures were the Earlier/Later dates; these now use the existing accessible muted gray. The SEO link-text finding is the pending “Start” home-label decision 4.

### Controlled production attribution — 2026-10-06

Three normal mobile runs followed by three audit-only blocked-Disqus runs used Lighthouse 13.5.0 and the same Playwright Chromium, after builds/browser tests finished. This is a local lab comparison, not a replication of Google's 17.8s report or a production fix. Reports: ignored `report/performance/production-idle-2026-10-06/` and `diagnostic-no-disqus-2026-10-06/`; the latter records `blockedPatterns: ["*disqus*"]`.

| Median               | Current production | Diagnostic with Disqus blocked |
| -------------------- | ------------------ | ------------------------------ |
| Performance score    | 62 (runs 62/64/53) | 91 (runs 91/80/94)             |
| LCP                  | 4.34s              | 3.04s                          |
| Total blocking time  | 625ms              | 166ms                          |
| Layout shift         | 0.220              | 0 (one run still 0.216)        |
| Transferred bytes    | 2,029,679          | 576,001                        |
| Best practices score | 54                 | 100                            |
| Accessibility / SEO  | 96 / 92            | 96 / 92                        |

Blocking Disqus removes its descendants too, so this measures the embed plus its ad/tracking chain, not just `embed.js`. About 1.45MB less traffic and the best-practices difference support prioritizing the comments decision. It does not prove a Giscus deployment will score 91: that replacement has its own assets, and the diagnostic removes comments entirely.

The remaining layout shift in a blocked sample and the render-blocking local font stylesheet warrant a separate first-party investigation. The layout currently changes body font/heading weight after FontFaceObserver resolves; assess its contribution with traces and CSS font/fallback metrics during the complete CSS stage, preserving the final typography. Lighthouse's shift attribution to the article body/author image alone is not sufficient to assign the entire shift to that image. No font behavior or layout change was made in this pass.
