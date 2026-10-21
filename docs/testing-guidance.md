# Testing and publication guidance

Read this before changing regression tests or visual references. Commands for everyday editing are in [README.md](../README.md); the investigation and suite assessment are in [test-review.md](test-review.md).

## Editorial changes must remain routine

Use `npm run dev` while editing articles or biographies. Astro refreshes changed Markdown; do not rebuild production output after every wording edit. `npm run check:edit` checks source image alternatives, unit, integration and controlled browser examples without a production build. Keep the browser examples open with `npm run dev:components` for immediate CSS/component feedback.

GitHub Actions already builds, validates and publishes: pull requests receive a Netlify preview after passing checks; merges to main publish production and then notify IndexNow. Keep that one publication path. Production static output still requires a build. Do not bypass tests for content commits, deploy stale `public`, automatically approve screenshots or replace the publisher with another script.

## Three complementary boundaries

1. **Current source to generated output.** Read expected posts independently from `content/posts`, then compare with generated pages and discovery output. Check current titles, author notes, locale/canonical, archive membership/order/covers, search, feeds, redirects and authored link destinations. New articles should pass automatically; missing or stale published content should fail. Keep historical public URL/feed protections, but do not freeze article counts or old prose.
2. **Real website integration.** Use production pages for SSR, hydration, actual responsive images, locale-preserving client navigation, metadata, sticky/mobile controls, fonts, search loading/retry and provider boundaries. Isolate third-party traffic through the shared Playwright fixture. Use native retrying assertions and the existing font/image readiness helpers. A changed URL alone does not prove that navigation has finished.
3. **Controlled presentation examples.** Use fixed, representative props for author/archive/reading/search layout comparisons. These examples import the real presentation components, component-owned CSS and the shared global tokens/reset/fonts. Their wording and cover are test data, independent of editorial files. Keep English/Polish, mobile/desktop, long titles and Polish glyphs. Keep real responsive image and routing checks in boundary 2; ordinary anchors/native fixture images in the gallery do not certify framework integration.

The author/archive/search components separate framework adapters from their portable presentation. Follow that boundary when useful; do not mock the UI under test or introduce a generic component framework solely for testing.

## Feature organization and component examples

Component/module tests are colocated with their owners. Whole-site/generated checks and cross-feature matrices remain under `tests/`. Execution type is a suffix, not the folder hierarchy: `*.unit.test.ts`, `*.int.test.ts/tsx`, `*.browser.test.tsx`, `*.generated.test.ts`, and `*.e2e.spec.ts`. Colocate tests with their owning component/module; keep shared or cross-feature matrices under feature folders in `tests/`. Do not create a duplicate component hierarchy under `tests/`. Use a dedicated support folder when it would be artificial to attach cross-feature fixtures or presentation matrices to a single component. The owner requested this Pongo/Emmett-style organization on 2026-10-13.

`tests/vitest.config.ts` defines disjoint `unit`, `integration`, `browser` and `generated` projects. Integration and browser checks require no production build. Generated checks and Playwright E2E run after one production build. `npm test` runs all groups; `check:edit` runs source/unit/integration/browser only. CI does not repeat the quick groups after building. Native `sequence.groupOrder` runs the projects in unit → integration → browser → generated order, with file parallelism disabled to bound build-output parsing and browser/linters. This also makes `test:int -- <feature>` filter both integration projects in one Vitest invocation. Use project and feature filters, not one script per test file; working commands are in README. See [Vitest project ordering](https://vitest.dev/config/sequence#sequence-grouporder).

Controlled presentation uses the documented `@vitest/browser-playwright` provider and `vitest-browser-react` renderer. `tests/editorial/presentation.browser.test.tsx` renders `tests/gallery/editorial.story.tsx` directly. `tests/helpers/browser/component-setup.ts` loads only the real shared global CSS/fonts and resets document appearance; the renderer owns React cleanup. Component CSS stays imported by each component. No global `window.mount`, custom test renderer or Gatsby test route remains. `dev:components` retains a manual Vite gallery for live previews; it is not the test server.

The native screenshot assertion reads the existing accepted `tests/fixtures/visual/components/` PNGs through its documented path resolver. Pixel threshold stays 0.2 and maximum mismatch ratio stays 0.03. The root Vitest config sets `update: 'none'`, including missing references. Use `--update=all -t <reviewed case>` only after explicit review. Failure captures/diffs and native Playwright traces stay under `visual-artifacts/components/`; website artifacts remain under `visual-artifacts/results/` and `report/`.

Playwright Test's full-site `webServer` has an explicit repository `cwd`; reuse is local only. Vitest owns a separate native browser server and requires no gallery startup command. Validate runner/config changes with `CI=true npm run check:edit` and cold server startup, not just an existing preview. Never run Astro dev and production generation against the same generated directories concurrently.

## Reference review and useful assertions

Normal tests never create or update references, including missing ones. Preserve the existing 3% pixel tolerance and investigate unexplained differences. For an intentional styling change, inspect actual/expected/diff captures, obtain explicit review, then use the targeted native update command and review its Git diff. Editorial edits must not require this step. Homepage comparisons still use the actual homepage because its composition is the behavior under review.

Keep tests for demonstrated durable regressions and security boundaries. Prefer a synthetic fixture or current-source expectation over historical wording/count/manifest assertions. Test observable output rather than query strings, filenames, implementation choices or a completed migration's continued absence. Do not delete meaningful coverage merely because a reference is brittle: move visual coverage to controlled data and keep real integration assertions.

Run build, project tests and browsers sequentially. Record actual local timings/results and unresolved warnings in `todo.md`; distinguish hosted CI and deployed verification. Do not claim a cached build validates newer source.

## Runner and helper direction

The [runner research](test-review.md#runner-and-helper-research) records the reasons for this split. Playwright remains the browser engine. Use named Vitest projects for logic, generated output and controlled React browser tests; use the documented Playwright provider and React renderer for that browser project. React Testing Library is a supported alternative, not another required dependency alongside the renderer.

For full-site navigation, SSR, hydration, browser-context isolation and production screenshots, retain Playwright Test. The owner accepted this division on 2026-10-13. Do not navigate Vitest's orchestrator page to the website, recreate Playwright Test's reporting/context/screenshot lifecycle, or wrap its CLI in a Vitest test to claim a single runner.

Group tests by feature, identifying execution boundaries with filename suffixes, with shared helpers only for actual repeated setup. Prefer native `test.extend`, lifecycle cleanup, role/label locators and retrying assertions. Geometry reads are instantaneous, unlike Playwright's auto-waiting clicks: poll exact observable layout conditions during transitions rather than add sleeps, disable animations globally or allow larger errors. A URL change alone does not establish completed client rendering.

The `test:e2e:dev` command selects existing `@dev` client-interaction cases through the same native Playwright config/server lifecycle. It provides quick feedback through Fast Refresh. They do not certify production HTML or bundle extraction. Keep production generation/tests separate, and avoid simultaneous dev/build processes sharing generated directories. Consolidate commands around groups and documented filtering instead of creating a script for every test file.

## Using Vitest and Playwright together

This division was researched and implemented on 2026-10-13. Current commands and feature/suffix conventions are above; validation results and remaining work are in todo.md. The two runners have separate configuration and lifecycle; share representative data and small domain helpers, not a wrapper around their test APIs.

| Boundary                                      | Runner and setup                                                                 | What it establishes                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Logic, import/security rules and CLI behavior | Vitest Node project, native hooks/fixtures and temporary directories             | Fast behavior checks without a site build                                                                |
| Generated publication output                  | Separate Vitest Node project reading the freshly built output                    | Current-source completeness, HTML/metadata, redirects and discovery contracts                            |
| Portable React rendering                      | Vitest Node project for explicit static-rendering contracts                      | Server markup without pretending to test layout or hydration                                             |
| React interaction and controlled presentation | Vitest Browser Mode with `@vitest/browser-playwright` and `vitest-browser-react` | Real DOM, CSS, accessibility-facing interactions and focused visual comparisons                          |
| Website integration                           | Playwright Test against the built site, plus a selected dev-mode group           | Actual routing, assets, SSR/no-JavaScript, hydration, locale/storage isolation and responsive navigation |

### Configuration and helpers

- Give Vitest projects explicit names and disjoint include patterns. Restrict discovery to owned test directories: article code snippets, Playwright specs and generated files must not become Vitest tests. Use `--project` and feature/path filters. Configure project-specific plugins/options explicitly. The installed Vitest 5 inherits root options for inline projects; keep Node and browser settings at the appropriate boundary. Node projects must not load browser-only setup.
- Keep the Vitest provider version compatible with Vitest and resolve one compatible Playwright installation for both runners. Use the lockfile's Playwright CLI to install browsers in CI. Browser Mode owns its Vite test server; it does not need the site server or the old gallery mount bridge. Keep a manual gallery only if it remains useful for previewing scenarios.
- Use the React renderer's asynchronous `render`, role/label locators and automatic unmount cleanup. Await `expect.element` assertions in Browser Mode; use Playwright Test's `await expect(locator)` in E2E. Preserve explicit React SSR tests where server markup is the contract. React Testing Library remains an alternative, not an additional mandatory stack. [Vitest React helpers](https://vitest.dev/api/browser/react), [projects](https://vitest.dev/guide/projects).
- Vitest's provider creates a context per file and shares its page between that file's tests. Reset owned storage keys, document language/theme and installed listeners/mocks in native hooks/fixtures; React unmount does not reset browser storage. Do not run state-mutating component cases concurrently in the same page. Keep independent visitor/locale tests in Playwright Test's per-test contexts. [Provider isolation](https://vitest.dev/config/browser/playwright).
- Retain native Playwright fixtures for request isolation and additional visitor contexts. Block or mock external provider requests at their boundary, without replacing the application behavior being tested. Prefer roles, labels and observable readiness over CSS structure, `networkidle` or sleeps. Poll measured geometry when transitions are relevant. [Playwright best practices](https://playwright.dev/docs/best-practices).

### Feedback, CI and visual references

Keep quick source/unit/component checks before production generation. Build once, then run generated-output tests and production E2E sequentially against that output. Type checking and linting remain separate checks; passing transformed TypeScript tests does not establish type correctness. Preserve each runner's native failure reports/traces in separate artifact directories, uploaded even on failure. Do not merge E2E results into Vitest coverage or call a shell wrapper a Vitest test.

Use Playwright's `webServer`, `baseURL` and explicit package `cwd`; reuse servers only locally. CI must prove cold startup and cleanup. A dev-mode project may select shared client-interaction cases, while production-only checks stay outside it. [Server lifecycle](https://playwright.dev/docs/test-webserver).

Controlled screenshots map the current pixelmatch color threshold `0.2` and mismatch ratio `0.03` to Vitest's `threshold` and `allowedMismatchedPixelRatio`. Keep verifying viewport, device scale, fonts, image readiness, clipping, animation policy and browser/environment naming against accepted captures before retiring the old runner. Vitest's native assertion is `toMatchScreenshot`; its options are not Playwright's `toHaveScreenshot` options. Keep normal runs from creating missing references; validate that behavior during migration. No masking editorial text, loosened tolerances or automatic updates. [Vitest visual testing](https://vitest.dev/guide/browser/visual-regression-testing).

### Astro compatibility

Astro's official [testing guide](https://docs.astro.build/en/guides/testing/) documents Vitest for unit/integration tests and Playwright Test for E2E, with build-then-preview validation. It also permits framework-specific helpers such as React Testing Library. Our two-runner split matches that documented approach; choosing Vitest Browser Mode for our React components is our application decision, not an Astro requirement.

For tests needing native Astro compilation, use `getViteConfig()` from `astro/config` for tests that need Astro compilation/settings. Keep portable logic and React presentation tests. Generated readers inspect actual published HTML; E2E uses Netlify's local static preview because redirects and localized HTTP 404s are part of the publication contract. Astro preview alone does not apply hosting rules. Preserve public route/locale/metadata assertions. Test `.astro` server rendering through the documented [Container API](https://docs.astro.build/en/reference/container-reference/), currently experimental, rather than passing `.astro` files to the React renderer. Container HTML assertions alone do not prove browser script execution, extracted CSS or island hydration; retain built-site E2E for those boundaries.

The [Starlight package](https://github.com/withastro/starlight/blob/main/packages/starlight/package.json) provides a concrete maintained Astro example with separate Vitest and Playwright E2E commands and [native Playwright configuration](https://github.com/withastro/starlight/blob/main/packages/starlight/playwright.config.ts). Astro's [own framework test scripts](https://github.com/withastro/astro/blob/main/packages/astro/package.json) also separate unit/integration/types and Playwright E2E; they are not an all-Vitest application template. Adopt the boundary, not monorepo-specific helpers or warning overrides. The full Astro cutover retains these runner boundaries.

## Sources

- [Playwright component testing](https://playwright.dev/docs/test-components): application-owned gallery and native mount fixture, using the application's own bundler and styles. Verified against the installed Playwright 1.64 types/runtime.
- [Playwright best practices](https://playwright.dev/docs/best-practices): observable behavior, isolated tests, controlled data and external boundaries.
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots): stable environments, focused captures and explicit reference updates.
- [Testing Library principles](https://testing-library.com/docs/guiding-principles/): test how the UI is used.
- [Gatsby Fast Refresh](https://www.gatsbyjs.com/docs/reference/local-development/fast-refresh/): use the development feedback loop rather than repeated production builds while editing.
- [Vitest projects](https://vitest.dev/guide/projects), [test fixtures](https://vitest.dev/guide/test-context), [React browser renderer](https://vitest.dev/api/browser/react) and [E2E boundary](https://vitest.dev/guide/browser/why): supported grouping, lifecycle and component/E2E responsibilities.
- [Playwright retrying assertions](https://playwright.dev/docs/test-assertions) and [development servers](https://playwright.dev/docs/test-webserver): native synchronization and server lifecycle.

Node integration tests use `deps.interopDefault: false` to preserve native Node behavior for the CommonJS Markdown tools; React browser tests retain bundler semantics. This is Vitest’s [documented dependency setting](https://vitest.dev/config/deps#deps-interopdefault), not a plugin-export monkeypatch. Vitest 5 distinguishes exact `toHaveTextContent` from substring/regex `toMatchTextContent`; preserve the original assertion meaning when migrating helpers.

### Development and CI environment parity

`test:e2e:dev` starts Astro with normal development semantics, including under `CI=true`. Its managed server sets `ASTRO_DEV_BACKGROUND=0` so Playwright owns a foreground process even when Astro detects an agent; this is Astro's [documented lifecycle setting](https://docs.astro.build/en/guides/build-with-ai/#background-mode). No Gatsby query-on-demand variable remains. The existing server startup limits, browser assertions, screenshot references and tolerances are retained. Development refresh checks modify, delete and restore a real source file in `finally`, then confirm the search index is current. Image URLs now come from native Astro assets; test complete, decodable generated files and working authored links rather than Gatsby filename equality. Document fonts initialize independently of React; EN/PL browser checks block external JavaScript and retain native navigation. Keep captured pointer/hydration regressions reproducible without relaxing assertions. Repeat unchanged requests must reuse rendering/image work; source changes invalidate it through current Astro collection values, while Vite tracks imported parts/images. No filesystem revision bridge is used. Production output is static and has no per-request Markdown or image processing.

Keep test files out of route discovery. Native Vitest discovery lists owned application/tooling directories; Playwright selects owned component/full-site specs, excluding content examples and output. Tailwind excludes colocated tests through documented source patterns. Historical Gatsby cold-start and query-on-demand findings are recorded in todo.md; they no longer describe the active server.
