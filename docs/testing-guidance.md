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

For full-site navigation, SSR, hydration, browser-context isolation and production screenshots, retain Playwright Test. The owner accepted this division on 2026-10-13. Do not navigate Vitest's orchestrator page to the website, recreate Playwright Test's reporting/context/screenshot lifecycle, or wrap its CLI in a Vitest test to claim a single runner.

Group tests by feature inside execution boundaries, with shared helpers only for actual repeated setup. Prefer native `test.extend`, lifecycle cleanup, role/label locators and retrying assertions. Geometry reads are instantaneous, unlike Playwright's auto-waiting clicks: poll exact observable layout conditions during transitions rather than add sleeps, disable animations globally or allow larger errors. A URL change alone does not establish completed client rendering.

Development-mode browser checks provide quick client-interaction feedback through Fast Refresh. They do not certify production HTML or bundle extraction. Keep production generation/tests separate, and avoid simultaneous dev/build processes sharing Gatsby's generated directories. Consolidate commands around groups and documented filtering instead of creating a script for every test file.

## Using Vitest and Playwright together

This is the agreed refactoring target, researched on 2026-10-13. Current commands and the existing gallery above remain valid until the migration is implemented and verified. The two runners have separate configuration and lifecycle; share representative data and small domain helpers, not a wrapper around their test APIs.

| Boundary                                      | Runner and setup                                                                 | What it establishes                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Logic, import/security rules and CLI behavior | Vitest Node project, native hooks/fixtures and temporary directories             | Fast behavior checks without a site build                                                                |
| Generated publication output                  | Separate Vitest Node project reading the freshly built output                    | Current-source completeness, HTML/metadata, redirects and discovery contracts                            |
| Portable React rendering                      | Vitest Node project for explicit static-rendering contracts                      | Server markup without pretending to test layout or hydration                                             |
| React interaction and controlled presentation | Vitest Browser Mode with `@vitest/browser-playwright` and `vitest-browser-react` | Real DOM, CSS, accessibility-facing interactions and focused visual comparisons                          |
| Website integration                           | Playwright Test against the built site, plus a selected dev-mode group           | Actual routing, assets, SSR/no-JavaScript, hydration, locale/storage isolation and responsive navigation |

### Configuration and helpers

- Give Vitest projects explicit names and disjoint include patterns. Restrict discovery to owned test directories: article code snippets, Playwright specs and generated files must not become Vitest tests. Use `--project` and feature/path filters. Root plugins/options are not automatically inherited by every project; use documented `extends`/shared configuration deliberately. Node projects must not load browser-only setup.
- Keep the Vitest provider version compatible with Vitest and resolve one compatible Playwright installation for both runners. Use the lockfile's Playwright CLI to install browsers in CI. Browser Mode owns its Vite test server; it does not need the Gatsby server or the old gallery mount bridge. Keep a manual gallery only if it remains useful for previewing scenarios.
- Use the React renderer's asynchronous `render`, role/label locators and automatic unmount cleanup. Await `expect.element` assertions in Browser Mode; use Playwright Test's `await expect(locator)` in E2E. Preserve explicit React SSR tests where server markup is the contract. React Testing Library remains an alternative, not an additional mandatory stack. [Vitest React helpers](https://vitest.dev/api/browser/react), [projects](https://vitest.dev/guide/projects).
- Vitest's provider creates a context per file and shares its page between that file's tests. Reset owned storage keys, document language/theme and installed listeners/mocks in native hooks/fixtures; React unmount does not reset browser storage. Do not run state-mutating component cases concurrently in the same page. Keep independent visitor/locale tests in Playwright Test's per-test contexts. [Provider isolation](https://vitest.dev/config/browser/playwright).
- Retain native Playwright fixtures for request isolation and additional visitor contexts. Block or mock external provider requests at their boundary, without replacing the application behavior being tested. Prefer roles, labels and observable readiness over CSS structure, `networkidle` or sleeps. Poll measured geometry when transitions are relevant. [Playwright best practices](https://playwright.dev/docs/best-practices).

### Feedback, CI and visual references

Keep quick source/unit/component checks before production generation. Build once, then run generated-output tests and production E2E sequentially against that output. Type checking and linting remain separate checks; passing transformed TypeScript tests does not establish type correctness. Preserve each runner's native failure reports/traces in separate artifact directories, uploaded even on failure. Do not merge E2E results into Vitest coverage or call a shell wrapper a Vitest test.

Use Playwright's `webServer`, `baseURL` and explicit package `cwd`; reuse servers only locally. CI must prove cold startup and cleanup. A dev-mode project may select shared client-interaction cases, while production-only checks stay outside it. [Server lifecycle](https://playwright.dev/docs/test-webserver).

When moving controlled screenshots, explicitly map the current pixelmatch color threshold `0.2` and mismatch ratio `0.03` to Vitest's `threshold` and `allowedMismatchedPixelRatio`. Verify viewport, device scale, fonts, image readiness, clipping, animation policy and browser/environment naming against accepted captures before retiring the old runner. Vitest's native assertion is `toMatchScreenshot`; its options are not Playwright's `toHaveScreenshot` options. Keep normal runs from creating missing references; validate that behavior during migration. No masking editorial text, loosened tolerances or automatic updates. [Vitest visual testing](https://vitest.dev/guide/browser/visual-regression-testing).

### Astro compatibility

Astro's official [testing guide](https://docs.astro.build/en/guides/testing/) documents Vitest for unit/integration tests and Playwright Test for E2E, with build-then-preview validation. It also permits framework-specific helpers such as React Testing Library. Our two-runner split matches that documented approach; choosing Vitest Browser Mode for our React components is our application decision, not an Astro requirement.

On a future Astro migration, use `getViteConfig()` from `astro/config` for tests that need Astro compilation/settings. Keep portable logic and React presentation tests; replace Gatsby adapters/output readers and change the E2E server to Astro preview. Preserve public route/locale/metadata assertions. Test `.astro` server rendering through the documented [Container API](https://docs.astro.build/en/reference/container-reference/), currently experimental, rather than passing `.astro` files to the React renderer. Container HTML assertions alone do not prove browser script execution, extracted CSS or island hydration; retain built-site E2E for those boundaries.

The [Starlight package](https://github.com/withastro/starlight/blob/main/packages/starlight/package.json) provides a concrete maintained Astro example with separate Vitest and Playwright E2E commands and [native Playwright configuration](https://github.com/withastro/starlight/blob/main/packages/starlight/playwright.config.ts). Astro's [own framework test scripts](https://github.com/withastro/astro/blob/main/packages/astro/package.json) also separate unit/integration/types and Playwright E2E; they are not an all-Vitest application template. Adopt the boundary, not monorepo-specific helpers or warning overrides. No Astro dependency or site migration is required for this testing refactor.

## Sources

- [Playwright component testing](https://playwright.dev/docs/test-components): application-owned gallery and native mount fixture, using the application's own bundler and styles. Verified against the installed Playwright 1.64 types/runtime.
- [Playwright best practices](https://playwright.dev/docs/best-practices): observable behavior, isolated tests, controlled data and external boundaries.
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots): stable environments, focused captures and explicit reference updates.
- [Testing Library principles](https://testing-library.com/docs/guiding-principles/): test how the UI is used.
- [Gatsby Fast Refresh](https://www.gatsbyjs.com/docs/reference/local-development/fast-refresh/): use the development feedback loop rather than repeated production builds while editing.
- [Vitest projects](https://vitest.dev/guide/projects), [test fixtures](https://vitest.dev/guide/test-context), [React browser renderer](https://vitest.dev/api/browser/react) and [E2E boundary](https://vitest.dev/guide/browser/why): supported grouping, lifecycle and component/E2E responsibilities.
- [Playwright retrying assertions](https://playwright.dev/docs/test-assertions) and [development servers](https://playwright.dev/docs/test-webserver): native synchronization and server lifecycle.
