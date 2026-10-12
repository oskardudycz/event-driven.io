# Testing and publication guidance

Read this before changing regression tests or visual references. Commands for everyday editing are in [README.md](../README.md); the investigation and suite assessment are in [test-review.md](test-review.md).

## Editorial changes must remain routine

Use `npm run dev` while editing articles or biographies. Gatsby refreshes changed Markdown; do not rebuild production output after every wording edit. `npm run check:edit` checks source image alternatives, isolated React behavior and controlled browser examples without a Gatsby build. Keep the browser examples open with `npm run dev:components` for immediate CSS/component feedback.

GitHub Actions already builds, validates and publishes: pull requests receive a Netlify preview after passing checks; merges to main publish production and then notify IndexNow. Keep that one publication path. Production static output still requires a build. Do not bypass tests for content commits, deploy stale `public`, automatically approve screenshots or replace the publisher with another script.

## Three complementary boundaries

1. **Current source to generated output.** Read expected posts independently from `content/posts`, then compare with generated pages and discovery output. Check current titles, author notes, locale/canonical, archive membership/order/covers, search, feeds, redirects and authored link destinations. New articles should pass automatically; missing or stale published content should fail. Keep historical public URL/feed protections, but do not freeze article counts or old prose.
2. **Real Gatsby integration.** Use production pages for SSR, hydration, actual Gatsby images, locale-preserving client navigation, metadata, sticky/mobile controls, fonts, search loading/retry and provider boundaries. Isolate third-party traffic through the shared Playwright fixture. Use native retrying assertions and the existing font/image readiness helpers. A changed URL alone does not prove that navigation has finished.
3. **Controlled presentation examples.** Use fixed, representative props for author/archive/reading/search layout comparisons. These examples import the real presentation components, component-owned CSS and the shared global tokens/reset/fonts. Their wording and cover are test data, independent of editorial files. Keep English/Polish, mobile/desktop, long titles and Polish glyphs. Keep real Gatsby image and routing checks in boundary 2; ordinary anchors/native fixture images in the gallery do not certify framework integration.

The author/archive/search components separate framework adapters from their portable presentation. Follow that boundary when useful; do not mock the UI under test or introduce a generic component framework solely for testing.

## Component gallery

The existing Vite/React dependencies serve `tests/gallery/`; Playwright's built-in `mount` fixture calls the gallery's `window.mount`/`window.unmount` contract. No additional component-testing package is needed. The gallery is outside Gatsby's page sources and is never a production route.

- `tests/gallery/editorial.story.tsx` owns fixed scenarios.
- `tests/gallery/gallery.tsx` owns mounting and the shared font/theme setup.
- `tests/component-browser/editorial.spec.ts` owns assertions and focused component screenshots.
- `tests/component-browser/playwright.config.ts` owns the local gallery server and component report/reference paths.

Nested Playwright configurations must set `webServer.cwd` to the package directory that owns the startup command. Playwright otherwise starts the server in the configuration directory; npm can resolve a different nested package there. Validate server/configuration changes with `CI=true npm run check:edit` and port 9001 free: CI disables server reuse and exercises startup and cleanup. A passing run against an already-running gallery does not verify its startup command.

Use this documented gallery mechanism rather than mutating live page DOM, rewriting generated page-data, masking text or creating production test pages. CSS Modules remain with their owning components; importing shared global CSS in the gallery mirrors the real application entry. Do not gather component styles into a global test stylesheet.

## Reference review and useful assertions

Normal tests never create or update references, including missing ones. Preserve the existing 3% pixel tolerance and investigate unexplained differences. For an intentional styling change, inspect actual/expected/diff captures, obtain explicit review, then use the targeted native update command and review its Git diff. Editorial edits must not require this step. Homepage comparisons still use the actual homepage because its composition is the behavior under review.

Keep tests for demonstrated durable regressions and security boundaries. Prefer a synthetic fixture or current-source expectation over historical wording/count/manifest assertions. Test observable output rather than query strings, filenames, implementation choices or a completed migration's continued absence. Do not delete meaningful coverage merely because a reference is brittle: move visual coverage to controlled data and keep real integration assertions.

Run build, project tests and browsers sequentially. Record actual local timings/results and unresolved warnings in `todo.md`; distinguish hosted CI and deployed verification. Do not claim a cached build validates newer source.

## Runner and helper direction

The [runner research](test-review.md#runner-and-helper-research) and plan distinguish the current implementation from the proposed refactor. Playwright remains the browser engine. Use named Vitest projects for logic, generated output and controlled React browser tests; use the documented Playwright provider and React renderer for that browser project. React Testing Library is a supported alternative, not another required dependency alongside the renderer.

For full-site navigation, SSR, hydration, browser-context isolation and production screenshots, the documented recommendation remains a dedicated E2E runner. Do not navigate Vitest's orchestrator page to the website, recreate Playwright Test's reporting/context/screenshot lifecycle, or wrap its CLI in a Vitest test to claim a single runner. Record the scope decision before migrating production E2E.

Group tests by feature inside execution boundaries, with shared helpers only for actual repeated setup. Prefer native `test.extend`, lifecycle cleanup, role/label locators and retrying assertions. Geometry reads are instantaneous, unlike Playwright's auto-waiting clicks: poll exact observable layout conditions during transitions rather than add sleeps, disable animations globally or allow larger errors. A URL change alone does not establish completed client rendering.

Development-mode browser checks provide quick client-interaction feedback through Fast Refresh. They do not certify production HTML or bundle extraction. Keep production generation/tests separate, and avoid simultaneous dev/build processes sharing Gatsby's generated directories. Consolidate commands around groups and documented filtering instead of creating a script for every test file.

## Sources

- [Playwright component testing](https://playwright.dev/docs/test-components): application-owned gallery and native mount fixture, using the application's own bundler and styles. Verified against the installed Playwright 1.64 types/runtime.
- [Playwright best practices](https://playwright.dev/docs/best-practices): observable behavior, isolated tests, controlled data and external boundaries.
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots): stable environments, focused captures and explicit reference updates.
- [Testing Library principles](https://testing-library.com/docs/guiding-principles/): test how the UI is used.
- [Gatsby Fast Refresh](https://www.gatsbyjs.com/docs/reference/local-development/fast-refresh/): use the development feedback loop rather than repeated production builds while editing.
- [Vitest projects](https://vitest.dev/guide/projects), [test fixtures](https://vitest.dev/guide/test-context), [React browser renderer](https://vitest.dev/api/browser/react) and [E2E boundary](https://vitest.dev/guide/browser/why): supported grouping, lifecycle and component/E2E responsibilities.
- [Playwright retrying assertions](https://playwright.dev/docs/test-assertions) and [development servers](https://playwright.dev/docs/test-webserver): native synchronization and server lifecycle.
