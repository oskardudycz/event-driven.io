# Regression tests and article publishing

Reviewed 2026-10-12: root suites, browser specs, helpers, npm commands and reported CI artifacts. This review does not certify a deployed build.

## Evidence

[CI run 38278699057](https://github.com/oskardudycz/event-driven.io/actions/runs/38278699057) failed two screenshot comparisons. The archive actual contains the new PgBouncer article; the reference contains the previous Open Source article. The author actual contains the biography edited in that same content commit; the reference contains the old wording. These editorial differences do not demonstrate broken layout. Local `public` still contained both older versions, so passing tests there did not validate current source.

Commit `79d86425` correctly permits additions to the historical route/feed/sitemap contract while rejecting removals. It cannot detect a new source article omitted from the build. Add an independent source-to-output publication check.

## Research and decisions

- [Playwright best practices](https://playwright.dev/docs/best-practices): observable behavior, isolated tests and third-party requests, retrying assertions and controlled visual data. Keep native fixtures/assertions and the current runner.
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots): environment/fonts matter; focused element comparisons are supported. Keep 3% tolerance, explicit review and separate Firefox references. Do not mask content or rewrite the DOM to pass comparisons.
- [Testing Library principles](https://testing-library.com/docs/guiding-principles/): exercise what users see and do. Geometry selectors can identify measured regions; historical prose and unrelated implementation assertions are not behavioral contracts.
- [Gatsby GraphQL component testing](https://www.gatsbyjs.com/docs/how-to/testing/testing-components-with-graphql/): supply representative query data at framework boundaries. Use synthetic article fixtures for routing, not old import manifests and bodies.
- [Astro rendering tests](https://github.com/withastro/astro/blob/main/packages/astro/test/content-collections-render.test.ts) build dedicated fixtures and inspect generated HTML/CSS. [VitePress E2E tests](https://github.com/vuejs/vitepress/tree/main/__tests__/e2e) use a controlled documentation site, including local-search fixtures. Exact text/counts are appropriate for controlled fixtures, not a growing production archive.
- [AstroPaper scripts](https://github.com/satnaing/astro-paper/blob/main/package.json) provide build/type/lint/format checks, but no comparable application regression suite. Fewer scripts are not evidence that this site's locale/security/responsive checks are unnecessary.

Separate current-content completeness from stable representative visual coverage. New posts need no screenshot update. Editing a visual specimen or the author biography can legitimately need review.

## Suite assessment

| Area                            | Decision and regression protected                                                                                                                                                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Archives                        | Replace newest-post screenshot with a fixed representative card. Independently verify real newest cover, hydration, locale and geometry. Replace category-index content screenshot with grid/containment checks; counts change as posts are added. |
| Author/related                  | Compare biography with current source, not old wording or arbitrary length. Keep portrait/fonts/layout, spacing, related covers, focus, locale and reviewed visual checks. Biography edits need review; ordinary posts do not.                     |
| Publication                     | Keep historical URL/redirect/feed protection and add/remove unit cases. Add current-source completeness, archive order/title/date/cover and canonical/feed/search discovery. Expected posts must not come solely from generated output.            |
| Redirects                       | Replace historical import-manifest dependencies and query-string assertions with synthetic opt-in/alias/locale fixtures. Check all current frontmatter aliases in generated redirects; retain historical published aliases through the contract.   |
| Categories                      | Keep membership, locale parity, recommendation order and fallback cases. Determine active guides from current data, not historical contract routes.                                                                                                |
| Indexing/SEO                    | Keep all-page H1/canonical/schema, collision, alternates, sitemap, known public aliases and original feed GUIDs. Replace anti-patterns/workshop prose pins with canonical discovery checks. Remove a test of a test-only link helper.              |
| Performance/fonts/CSS           | Keep cover priority, WebP/lazy loading, intrinsic sizes, contrast, Polish glyphs, CSS extraction/cache and failed-font cases. Await both active weights for screenshots. Remove arbitrary historical output counts.                                |
| Shell/hero/theme/404            | Keep SSR/hydration, painted-artwork overlap, mobile/sticky hit testing, disclosure, theme persistence/system/storage failure, larger fonts and recovery behavior. These remain valuable known regressions.                                         |
| Search                          | Keep fuzzy/diacritic search, safe snippets, locale/covers, retry/fallback and modified/deleted index checks. Remove historical result-count assumptions.                                                                                           |
| Imports/video/images            | Keep synthetic import/rollback/paywall/sanitization, thumbnail-only embedding, headers and systematic image alternatives. These protect durable security and authoring boundaries.                                                                 |
| Tooling/CLI/components/IndexNow | Keep actual ESLint/staging/CLI behavior, semantic component rendering and acknowledgement/retry/deletion tests. Diagram tests are already in `npm test`; retain them. No runner migration is needed for this repair.                               |

## Fast text-editing workflow and remaining visual boundary

Use the running Gatsby development server for Markdown and biography edits; production output is needed only for final production checks/deployment. Do not rebuild between every wording change. README lists the commands and distinguishes source/component checks from generated-output checks.

The owner also requests that biography/article wording edits avoid visual-reference churn. Selecting a named article solves new-post ordering but still couples its own wording to pixels; likewise, the accepted biography reference still changes when its wording changes. These are explicit remaining limitations, not a complete solution for arbitrary text editing. Author and related-article visuals now have separate tests, so a targeted author update cannot refresh the related-card reference.

Next, give author/card visual tests fixed representative data at their component boundary, including short/long titles, Polish glyphs and narrow layouts. Keep real-page/source completeness and responsive checks independent. Use an isolated test fixture rather than mutating production DOM, masking copy, publishing test routes or automatically updating PNGs. Existing Vite/Vitest/Playwright tools should be assessed before adding another tool. Framework adapters must not replace the UI behavior being tested. This follow-up must preserve Gatsby's real image/hydration integration checks.

## Verification status

Implementation and fresh-build checks are pending. Run build, project tests and browsers sequentially. Record local results, reference review and hosted CI separately in `todo.md`. No automatic reference updates or relaxed assertions.
