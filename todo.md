# Site implementation and verification

Last updated: 2026-10-12. Current strategy is in [plan.md](plan.md); manual commands/importing/category ordering/browser reports/snapshot review are in [README.md](README.md). Local, hosted CI and deployed results are separate evidence.

## Current change: shared shell and design-scale foundations

- [x] Consolidate plan/todo around Node 24, React 19, npm, Tailwind and component-owned styles. Remove superseded runtime migration instructions, duplicated acceptance histories and retired form/YAML/Algolia tasks.
- [x] Revert all 26 tracked source/style/script/test changes from the rejected utility conversion and remove its new presentation test. Preserve previously committed Tailwind/theme/CSS work. No dependency, content, snapshot or Git-history changes.
- [x] Research official Tailwind utility/responsive/theme/reset and Gatsby layout/CSS Module guidance. Store findings, implementation rules and acceptance criteria in [tailwind-guidance.md](docs/tailwind-guidance.md); require it from AGENTS.md.
- [x] Replace the mechanical conversion plan with responsibility-based groups. Store the rollback checkpoint before the owner's subsequent request to continue.
- [x] Put the ordinary header in a stable flow frame, retain the homepage overlay and scrolling behavior, remove page-owned header allowances and the inline sensor-height calculation. Remove duplicate header declarations and the archive's redundant withHeading marker.
- [x] Separate the legacy emphasis-weight token from Tailwind; test standard bold/semibold output. Use named sm/lg variants instead of literal breakpoints. Preserve reading widths, typography and the existing reset; simplify content spacing with the next group rather than mechanically converting it.
- [x] Keep named breakpoint units aligned with the existing 600px/1024px module rules and menu measurements. Reproduce theme/navigation overlap with Firefox's larger default font, fix the unit mismatch and pass its regression case.
- [x] Strengthen homepage/category screenshot readiness with the existing expectFonts helper. Firefox instrumentation showed that document.fonts.ready could resolve before React activated Open Sans; preserve font-loading behavior and screenshot tolerances.
- [ ] Simplify shared content patterns together: reading/search cards, author/metadata and article navigation. Use semantic markup and readable utilities; retain scoped CSS where clearer.
- [ ] Complete straightforward controls/media and remove rules made redundant by the verified structure. Evaluate official class sorting with existing tooling.
- [x] Before the Open Sans follow-up, run production builds, full sequential CI-mode npm test, application/Node/browser types, lint/format and smoke. Pass all 96 Chromium cases, with the Firefox-only preference case explicitly skipped in Chromium. Pass seven-phase module/global/utility cache edits and restoration, including SSR/hydrated CSS and current assets on generated pages.
- [x] Pass the ten-case focused Chromium rerun after strengthening homepage/category font readiness and configurable-header-height assertions. Existing archive/category/homepage comparisons and both locale navigation cases pass.
- [x] Rerun all six focused sticky-header cases in Chromium and Firefox: scroll/shrink/return, native and unavailable IntersectionObserver, EN/PL client navigation, stable content and mobile navigation all pass in both browsers.
- [x] Resolve and explicitly review both Firefox homepage visual failures. An isolated build of Git 74a1705 reproduces the same failures; the shared-shell refactor produces zero homepage pixel differences in either locale. The owner authorized current production as the baseline. Add manually reviewed production Firefox references through Playwright's native project-name path; retain existing Chromium files and the 3% tolerance. All 53 Firefox header/theme/font cases now pass, including both homepage comparisons. Evidence and provenance are in [header-visual-review.md](docs/header-visual-review.md).
- [x] Make native interface controls inherit the page font family, as requested. Reproduce four failing EN/PL mobile/desktop cases before the fix. Open Sans controls now pass in Firefox, with all four regular/semibold loading-failure cases also passing. Production/local differences are limited to the authorized hero-button typography, at 0.197–0.288% across locales/browsers.
- [x] Complete post-fix local verification: production build, full CI-mode npm test, lint/format and smoke pass. Chromium passes 100 cases with one Firefox-only skip; Firefox passes 53 header/theme/font cases plus four font-failure cases. Sticky-header, locale navigation, responsive layout and theme checks are included. Hosted CI and deployment of this revision remain unverified.

The rejected conversion was restored to HEAD before starting this group. The restored baseline passed 25 archive/article/navigation cases. An initial concurrent validation attempt had font-readiness timeouts and a terminated Node process; sequential CI-mode npm test subsequently passed. Actual-font readiness is now required for homepage/category captures. The initial 47/49 Firefox result is superseded by the reviewed production references and passing 53-case rerun above. Both original failures predate this refactor. Existing Chromium snapshots and screenshot tolerances remain unchanged; the two added Firefox references come from production. Normal CI uses Chromium. New hosted results are pending.

Final warm builds still report the transitive Node punycode deprecation. The browser runner also reports the inherited NO_COLOR/FORCE_COLOR environment conflict. Existing installation peer/deprecation owners remain tracked in dependency-review.md; this styling group changes no packages or lockfile. Cache probes are restored. Existing Chromium fixtures and tolerances are unchanged; the two new Firefox references are the reviewed production captures described above.

## Prior completed local checkpoint

Before this presentation change: clean npm ci with Gatsby patch hook, production builds (130.25s after dependency changes; 37.41s subsequent warm build), full CI=true npm test, application/Node/browser types, lint/format and smoke pass. **82/82 Chromium browser cases and 20/20 Firefox theme cases pass**, including visible labels/row padding, keyboard dismissal, EN/PL navigation, Polish glyphs and independent font-loading failures. Existing PNGs and 3% tolerance are unchanged. These results do not certify the new change.

The first post-install build reported slow home/archive queries and transitive punycode; the subsequent warm build reported only punycode. CSS/utility cache and modified/deleted/restored-content checks passed at that checkpoint. The current CSS cache rerun is recorded above; the content-edit check was not repeated in this styling group. Dependency evidence and warning ownership are in [dependency-review.md](docs/dependency-review.md).

## Completed baseline

- [x] Gatsby 5.16.1 / React 19.3.0 / Node 24 / npm 11.9, native ESM TypeScript, explicit GraphQL fields, layout effects/useStaticQuery, build/download CI caches, meaningful types and Pongo-aligned editor/lint/format/staging configuration.
- [x] Tailwind 4/PostCSS without Preflight, direct CSS tokens, shared layout and header light/dark/system control. Fix real label-click dismissal and test label/row clicks in Chromium/Firefox.
- [x] Native font loading, Polish Open Sans glyph coverage/preloads, timer/listener cleanup and readable font-failure fallbacks; remove fontfaceobserver and application debug logs.
- [x] Retire styled-jsx, project-owned Babel setup, direct Bluebird/Lodash, unused pngjs, YAML theme generation, Algolia and inactive Ant Design form. Keep Calendly, active importers, sharing and comments.
- [x] Component-owned CSS Modules, standard named exports/SHA-256 identifiers and reading-list view/adapter boundary. Keep documented Gatsby cache correction until upstream acceptance passes.
- [x] MiniSearch and gatsby-plugin-react-i18next; bilingual category parity, curated order and locale-preserving discovery links independent of canonical identity.
- [x] Requested imports through #189 plus latest Open Source article, local assets, provenance, redirects, highlighting and mapped cross-links. Preserve YouTube text links; embed linked thumbnails/explicit players only.
- [x] SEO/canonical/sitemap/feed/llms.txt contracts, useful bilingual 404s, one-H1/schema/date corrections, anti-patterns collision removal and English workshop translation with historical terms preserved.
- [x] Measured/approved PageSpeed improvements, responsive WebP and cover priority, newsletter loading on scroll, video facades and systematic image alternatives at import/source/staging/generated-output boundaries.
- [x] IndexNow canonical fingerprints, production-only post-deploy submission, batching/retry/deletion safeguards and persisted acknowledged state. First deployment establishes a baseline.
- [x] Native Playwright fixtures/assertions/snapshots/webServer, Vitest component coverage, readable CLI/helpers and observable security-boundary checks. Preserve fixtures; avoid historical body/count/migration-reversion tests.

## Next: systemic dependency cleanup

- [ ] Finish keep/remove/replace decisions for direct packages/custom integrations from existing research, then apply supported simplifications. Modern conventions and fewer obsolete mechanisms are the objective, not audit counts.
- [ ] Reassess existing compatibility exceptions and identify exact Gatsby/Netlify owners for npm ci warnings. Do not suppress warnings, patch peer metadata or add speculative transitive overrides.
- [ ] Validate clean installation, development and production behavior after changes. Latest checkpoint: 79 direct declarations, 2,824 lock entries, three Gatsby peer-warning blocks, transitive deprecations and Netlify optional-driver diagnostics. Two validated security overrides already exist; details remain in the review.
- [ ] Once application-owned cleanup is exhausted, prepare an Astro parity scope for separate review instead of replacing Gatsby internals piecemeal.

## Hosted and production verification

- [x] Owner confirms earlier baseline since 99519a3c deployed. PR #52 merged at e627cc1; its Build and Deploy and CodeQL jobs passed; alerts 6/7 were fixed and the open-alert query was empty at the 2026-10-08 check. Production contact/search-manifest URLs returned 200. These facts supersede the old pending CodeQL/lint/Algolia checkpoints; they do not certify later revisions.
- [x] Owner supplied preview `6ac7e39e32aee76765a22ec6` on 2026-10-09. Its article HTML reproduced the locale-navigation defect before the later local correction.
- [ ] Verify latest hosted CI runner/server/artifacts, CSS/image/security gates, navigation correction and dependency/menu cleanup after publication.
- [ ] Audit the latest deployment's EN/PL home/archive/category/article/search/contact/talks pages at desktop/mobile widths, hydration, metadata, fonts, menus, recovery status and links. Record preview and production evidence separately.
- [ ] Verify production IndexNow key/manifest publication, acknowledged-state restore and a subsequent real changed-page submission after owner deployment. Local mocked tests and dry runs do not establish publication.
- [ ] Repeat normal production mobile audits after deployment and the owner's affiliate-setting change. Keep diagnostic vendor-blocked runs separate; compare repeated medians with the same Lighthouse/browser/throttling settings. Agree payload budgets before adding CI score thresholds.
- [ ] Recheck genuine Search Console failures after recrawl. Submit the sitemap in Google Search Console/Bing, inspect Google's selected canonicals for reported duplicate pages, and request indexing for repaired pages/cornerstones. Redirects and correct alternate canonicals are expected exclusions; crawled-but-unindexed status is not a build failure. Hosting logs are needed to trace historic 5xx responses.
- [ ] Re-run external structured-data validators and crawler/CDN/WAF checks when deployed behavior changes.

## Next technical category

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

TSX test-framework/lint-fixture refactoring, new contact form, Giscus/custom guest comments, analytics changes, broad redesign, Slices/DSG and Astro migration remain separate decisions. Keep existing comments/sharing and static generation. Font metric/fallback changes need measurement and review if appearance changes. Contact pages currently use Calendly; the inactive form and Ant Design are retired.
