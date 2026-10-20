# Event-Driven.io

## Setup

Use Node 24 and npm 11.9.0 (the same npm baseline as Pongo). Install it with `npm install --global npm@11.9.0` if needed.

```bash
nvm install
nvm use
npm ci
npm run browsers:install
```

On Linux, install Chromium's system libraries and fallback fonts with `npm run browsers:install:ci`. Use this for local parity with CI: installing the browser alone can leave different Arial/sans-serif substitutions, which changes SSR line wrapping. Firefox is optional: `npm run browsers:install:firefox`.

Optional local `.env` settings:

```dotenv
GATSBY_DISQUS_NAME=oskar-dudycz
GOOGLE_TAG_ID=your-google-tag-manager-id
```

CI uses the corresponding repository secrets. Search uses local MiniSearch indexes and needs no Algolia credentials.

## Development and production checks

```bash
npm run dev
```

For a production check:

```bash
npm run typecheck
npm run smoke
npm run lint
env -u DEBUG npm run build
npm test
```

Playwright starts and stops the local production server automatically; it can also reuse a running local server. Set `VISUAL_BASE_URL` to test a deployment preview:

```bash
VISUAL_BASE_URL=https://your-preview.netlify.app npm run test:e2e
```

`build` generates `llms.txt`, feeds, sitemaps and search indexes. Theme tokens are edited directly in CSS. Tests that inspect generated output require a completed production build. Do not edit content or run another Gatsby process during a build or cache check. To rebuild from an empty cache, run `npm run clean` before `npm run build`. Do this when changing React or Gatsby's JSX runtime so previously compiled runtime artifacts cannot affect verification.

If Gatsby logs an unidentified Node warning, include its dependency stack with:

```bash
NODE_OPTIONS=--trace-warnings env -u DEBUG npm run build
```

## TypeScript and modules

Application components, pages, layouts and Gatsby browser/SSR hooks use `.tsx`; plain browser modules use `.ts`. Node scripts, importers, tests, local remark plugins and build implementations use native ESM `.ts`. Run scripts with Node 24 directly; no ts-node, tsx loader or Babel registration is needed. Use erasable TypeScript syntax (types/interfaces, not runtime enums or parameter properties) and explicit file extensions in Node imports. Gatsby owns JSX compilation and uses its default runtime for Head API compatibility; Vitest uses the automatic JSX runtime.

Gatsby 5 discovers native ESM configuration and Node hooks through `gatsby-config.mjs` and `gatsby-node.mjs`. Those entry points export the typed implementation from `site/*.ts`. ESLint, lint-staged and PostCSS retain their standard `.mjs` configuration entry points. The root package deliberately has no `type: module`: Gatsby still emits CommonJS SSR bundles into `.cache`. Source package scopes (`src`, `content/meta`, `site`, `scripts`, `import`, `tests` and the local plugins) declare `type: module` for `.ts` modules without changing Gatsby-generated files. Gatsby owns application compilation; `npm run typecheck` separately checks all application, tooling and test TypeScript without emitting files. Browser/Vite code uses bundler resolution in `tsconfig.json`; native Node code also passes NodeNext resolution in `tsconfig.node.json`, which catches missing runtime extensions and incompatible module imports. Both run in CI before the build; type checking is separate from transformed test execution.

The tooling configuration starts from Pongo: `tsconfig.shared.json`, `.prettierrc.json` and `.editorconfig` are copied; ESLint retains its general recommended/type-checked/Prettier/type-only-import configuration. Gatsby overrides add browser/JSX support, no-emit checking and this repository's source/output locations. React hooks and image accessibility checks are enabled for site code; Pongo's database/Cloudflare rules do not apply here. The copied strict optional-property and indexed-access checks remain enabled. Browser and native Node configurations extend the same shared settings.

The native TypeScript 7 checker supplies `tsc`; the `typescript` import is Microsoft's TS6 compatibility alias for Gatsby, ESLint and compiler-API tools. Install the recommended TypeScript native VS Code extension to use the matching editor service. Do not point the editor at the compatibility package's missing tsserver.

VS Code settings, extension recommendations, tasks and the component-test debugger also start from Pongo, with root paths, Node 24 and npm. TypeScript formatting runs through ESLint's Prettier integration; imports are organized on save. `npm run typecheck:watch` runs the editor's watch task. Select “Debug Current Vitest File” for any Node/React Vitest test. Use the Playwright extension or `--debug` for full-site tests. `npm run fix` applies formatting and lint fixes manually; lint-staged checks staged code and article image descriptions.

ESLint anchors its project path to the configuration directory, so opening `src` or a component folder in the editor does not change tsconfig resolution. Vitest's TypeScript configuration lives in the ESM `tests` scope; group commands and the debugger select it explicitly.

Shared content/query types live in `src/types/content.ts`. Keep each page's data type limited to its query. Use published dependency types where available; the narrow declarations in `src/types/vendors.d.ts` cover untyped integrations.

## Dependency maintenance

Scoped npm overrides retain the tested ESLint/localization versions where upstream peer ranges lag behind and replace pinned vulnerable Lodash/Immutable utilities with patched versions. Their owners, rationale and validation are in [the dependency review](docs/dependency-review.md); installations use normal peer resolution without `--force` or `--legacy-peer-deps`.

Run `npm outdated` to compare installed, wanted and latest registry versions. [The dependency review](docs/dependency-review.md) records tested upgrades and remaining compatibility work. Check imports, Gatsby/PostCSS configuration, scripts and peer requirements before removing a dependency. `npm explain <package>` shows which packages still require it transitively; an unused root declaration can be removed even when Gatsby retains its own dependency. Gatsby supplies its compiler configuration; the project uses TypeScript for smoke/lint parsing and Vitest for component rendering tests, with no direct Babel setup. npm runs patch-package from the postinstall lifecycle to apply the Gatsby CSS cache correction and the gatsby-plugin-sharp placeholder correction; the Yarn-only postinstall-postinstall helper is removed.

After changing dependencies:

```bash
npm install
npm ci
npm run smoke
npm run lint
npm run clean
env -u DEBUG npm run build
CI=true npm test
```

Review both package.json and package-lock.json. Dependency cleanup should pass existing screenshots without regenerating them.

Run `npm audit` to inspect advisories and `npm audit fix --dry-run` to preview compatible fixes. Review the proposed updates before applying them, then repeat installation/build/test checks. Some remaining Gatsby dependencies require upstream changes; the audit's `--force` suggestion can downgrade Gatsby plugins and is not a safe routine update.

Use `npm ls --all` to diagnose invalid or stale transitive resolutions and `npm explain <package>` to find their owners. A successful install alone does not establish a consistent tree. Gatsby's published router and legacy lint dependencies still have incompatible peer declarations; see the dependency review for the remaining upstream limitations. Do not routinely delete the lockfile: any fresh resolution needs its own reviewed lock diff, clean install and full acceptance checks.

## Tests

Tests live beside their owning components/modules. Cross-feature and generated-site checks stay under `tests/`, organized by feature. For example, `src/search/` contains search logic tests; `tests/search/` contains generated-index and website search checks; `src/components/Menu/` contains navigation checks. Test type is a filename suffix, not the primary folder hierarchy. Shared browser fixtures and the controlled cross-component gallery have their own supporting directories.

| Command                  | Build needed? | Scope                                                                                                              |
| ------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm run test:unit`      | No            | Pure logic and injected security/protocol behavior (`*.unit.test.ts`)                                              |
| `npm run test:int`       | No            | Node/React integration (`*.int.test.ts/tsx`), then real Chromium component checks                                  |
| `npm run test:browser`   | No            | Controlled React presentation/interaction (`*.browser.test.tsx`) via Vitest and Playwright                         |
| `npm run test:generated` | Yes           | Current-source publication, metadata, discovery, assets and redirects (`*.generated.test.ts`)                      |
| `npm run test:e2e`       | Yes           | Full-site Playwright Test: SSR, hydration, routing, responsive behavior and homepage screenshots (`*.e2e.spec.ts`) |
| `npm test`               | Yes           | All four groups in order: unit → integration/components → generated → E2E                                          |
| `npm run test:watch`     | No            | Live Vitest reruns for unit, integration and component browser projects                                            |
| `npm run typecheck`      | No            | Strict application, tooling and all test types; separate from test execution                                       |
| `npm run smoke`          | No            | Source syntax, configuration and GraphQL queries                                                                   |

`npm run check:edit` adds source image checks to the two no-build groups. For the full local publication gate use `npm run verify:publication`: smoke/lint/types, quick checks, one build, generated-output checks and production E2E. CI runs the same boundaries without repeating the quick suites after the build. Ordinary text edits use `npm run dev` and live feedback; they do not require a production build or screenshot updates.

Use feature/path filters rather than a command for every test file. `test:file` is the raw Vitest entry point; specify projects when a filter might include generated output:

```bash
npm run test:unit -- search
npm run test:int -- import
npm run test:file -- --project integration tooling
CI=true npm run test:file -- --project integration tooling
npm run test:file -- --project integration .int.test.tsx
npm run test:generated -- seo
npm run test:browser -- -t 'pl editorial'
npm run test:watch -- search
npm run test:e2e -- search.e2e.spec.ts
```

For quick real-site interactions without a production build, run `npm run test:e2e:dev`. It starts Gatsby development on port 8001 and runs the existing `@dev` theme/storage/keyboard/locale cases. If `npm run dev -- -H 127.0.0.1 -p 8001` is already running, it reuses that server locally for Fast Refresh and repeat checks. CI mode proves fresh startup and uses Gatsby’s explicit query-on-demand-in-CI setting so it retains normal development semantics. Stop development before building or validating `public`: Gatsby dev/build share generated directories. Development checks do not replace the final production gate.

Vitest owns its native browser server and React cleanup; Playwright Test owns the full-site server, visitor contexts, reports and traces. Both use Playwright Chromium from the same locked installation. Full-site tests remain separate because Vitest Browser Mode is component testing, not a replacement for website E2E. See [testing guidance](docs/testing-guidance.md#using-vitest-and-playwright-together) for the researched Astro-compatible boundary.

Local measurements for the testing refactor (2026-10-13): unit checks were about 2s, controlled Chromium component checks about 6s, and the eight development interactions took 15.8s with a running server. Cold managed Gatsby development needed 91s to reach HTTP readiness; the complete cold dev check took 1.8m. Initial content-graph/webpack work still costs time. Use the component gallery/Vitest watch for the smallest feedback loop, and reuse Gatsby development while editing site content.

Internal discovery links (archive, related cards, category reading lists and search) preserve the current interface language when that article route exists. An untranslated `/pl/` copy can still declare its English original as canonical; canonical metadata does not change the navigation destination. Search labels the actual content language. When there is no route in the selected language, links use the available version.

Cache checks temporarily modify/delete/restore existing source files and rebuild. Stop development/preview servers and pause content edits first. Wait for the checks to finish before staging, committing or deploying, so temporary edits/deletions are not included:

```bash
env -u DEBUG npm run verify:cache
env -u DEBUG npm run verify:cache:css
npm run test
```

Run browser checks against the restored build afterward. Cache logs are saved in temporary directories printed by each command.

To check search refresh in development, start `npm run dev -- -H 127.0.0.1 -p 8001`, then run `npm run verify:search:dev` in another terminal. This check also temporarily modifies and restores an article. Set `DEV_SEARCH_BASE_URL` to use another address. Reload the search page after its index changes.

### Browser test commands and helpers

Full-site tests live beside their features as `tests/**/*.e2e.spec.ts` and run with Playwright Test. All other suites use the named Vitest projects in `tests/vitest.config.ts`. `npm run typecheck` includes both runners and their configurations.

```bash
npm run test:e2e -- --list
npm run test:e2e -- search.e2e.spec.ts
npm run test:e2e -- --grep 'persistent menu'
npm run test:e2e -- --debug --grep 'article language switch'
npm exec -- playwright show-report visual-artifacts/report
```

Use Playwright's `page` fixture, `test.use` for browser options, and retrying assertions such as `await expect(locator).toHaveText(...)`. Import `test` and `expect` from `./fixtures` in browser specs: it blocks live third-party requests; `page.route` supplies explicit widget mocks when needed. Use `expectFonts` and `expectImageLoaded` from `./readiness` for repeated font/image readiness. Before hydrated screenshots, wait for `expectFonts`: `document.fonts.ready` alone can resolve while the fallback font is still active, before React starts the web-font request. Vitest clears component mocks automatically and supports `test.each` for input variants.

Failed browser tests retain screenshots and traces under `visual-artifacts/results/`; the HTML report links to them and CI uploads the whole directory. Open a retained trace with `npm exec -- playwright show-trace path/to/trace.zip`. Normal runs never update missing or changed baselines. Each viewport/language/JavaScript variant is reported separately; retries are disabled.

## Formatting and editor setup

```bash
npm run lint
npm run fix
```

Individual commands: `lint:eslint`, `lint:prettier`, `fix:eslint`, `fix:prettier`. `lint:modern` aliases the ESLint check. ESLint uses TypeScript type information for lint rules; `npm run typecheck` reports compiler diagnostics.

Installation configures Husky. The pre-commit hook runs `npm run lint-staged` against staged files. VS Code settings and extension recommendations are in `.vscode/`. Generated output, imported content and fixtures are excluded from bulk formatting.

## Importing articles

Import a URL, a batch manifest or a saved HTML page:

```bash
npm run import-articles -- https://www.architecture-weekly.com/p/post-slug --tag Architecture
npm run import-articles -- https://kurrentdb.kurrent.io/blog/post-slug/ --tag 'Event Sourcing' --tag CQRS
npm run import-articles -- --manifest import-substack-posts.json
npm run import-articles -- --manifest import/eventstore-posts.json
npm run import-articles -- https://www.architecture-weekly.com/p/post-slug --html saved-page.html
```

`import-substack` is an alias for the same importer. It supports Substack, Kurrent/EventStore and dated Wayback captures. Images require network access even with `--html`.

Manifest format:

```json
[
  {
    "url": "https://www.architecture-weekly.com/p/source-slug",
    "tags": ["Event Sourcing", "CQRS"],
    "slug": "optional-custom-slug",
    "codeLanguage": "typescript",
    "youtubeVideo": "sQbkUl7-z_U",
    "imageAlts": {
      "https://source.example/diagram.png": "Requests enter a FIFO queue before processing."
    },
    "recordingEmbeds": {
      "https://publication.substack.com/p/recording-slug": "sQbkUl7-z_U"
    }
  }
]
```

The importer retains source alt text. If a body image has no description, add an `imageAlts` override keyed by its source URL (the original image URL reported in the error, or the CDN URL). An explicit empty string marks a decorative image and records its local filename in `decorativeImages` frontmatter. Missing descriptions fail the import and remove its temporary directory; no guessed descriptions are added.

Only `url` is required. `tags` defaults to `["Architecture"]`; the first tag is the primary one. `slug` overrides the source slug. `codeLanguage` overrides plain-text code labels. `youtubeVideo` adds a recording when absent; `recordingEmbeds` replaces mapped recording cards/thumbnails. Video IDs must contain 11 characters.

Imports create `content/posts/YYYY-MM-DD--slug/index.en.md` and `index.pl.md`, download images into that directory and record provenance in `article-source.txt` or `substack-source.txt`. Both files initially have the same body; the Polish file uses `useDefaultLangCanonical: true`. Translate the body and image descriptions, then remove that flag.

The importer adds `redirectFrom: /source-slug/` and, for custom slugs, `redirectAliases`. Gatsby generates permanent redirects to the English article. Links to available blog versions become relative URLs; references without a blog version retain their source URL. Code labels use TypeScript for JavaScript/TypeScript examples and preserve other languages.

Existing posts are never overwritten. A failed batch retains earlier successful imports; retry with a manifest containing only unfinished entries. Review images, captions, code labels, source links and interactive embeds, then run:

```bash
npm run normalize:youtube
npm run test:file -- import-substack
env -u DEBUG npm run build
npm run test
```

The Architecture Weekly migration records are [the manifest](import/architecture-weekly-missing.json), [the archive audit](import/architecture-weekly-audit.json) and [the remaining source-link report](import/architecture-weekly-link-report.json). The reviewed archive cutoff is #189, August 5, 2024. Re-running the completed manifest refuses to overwrite its posts.

Legacy repository imports replace their local destination directories:

```bash
npm run import-newsletter
npm run import-architecture-weekly
```

`import-newsletter` replaces `content/newsletter-pl/`; `NEWSLETTER_REPO_URL` can override its repository. `import-architecture-weekly` currently refreshes its repository checkout and the placeholder directory. `import-and-build` runs both commands and a build; it is not the Substack URL importer.

## Image descriptions

Give informative Markdown images a description of what they convey:

```markdown
![Messages enter an inbox, are deduplicated, then update the projection.](./inbox.png)
```

For complex diagrams, explain the flow or data in the surrounding article as well. Describe an image-only link by its action or destination. A card cover next to the same linked title, a video thumbnail in a named play button, or a redundant icon can have empty alt text. For deliberately decorative Markdown images, record the exact image path:

```yaml
decorativeImages:
  - ./separator.png
```

Use `![](./separator.png)` for that image. Raw HTML images require an explicit `alt` attribute; use `alt=""` only when decorative. JSX linting checks native images, `GatsbyImage` and `StaticImage`.

```bash
npm run check:images
npm run test:file -- images
```

The source check runs before production builds and on staged Markdown. The generated-output test checks every HTML page for missing alt attributes and unnamed image-only links. Automated checks cannot judge whether a description is accurate: inspect new diagrams and their text alternatives manually, and check images with a screen reader when reviewing content.

## IndexNow

The production workflow prepares a content manifest, deploys, verifies the public key/manifest and changed pages, then notifies IndexNow. Preview deployments never submit. The first production deployment establishes a baseline without sending the historical archive; later deployments submit added, changed and deleted canonical URLs. Content/metadata/link/image changes affect fingerprints; CSS classes, inline styles and client scripts do not.

The public verification key is configured in `data/indexnow.json`; its matching UTF-8 file is in `static/`. It needs no repository secret or Bing account setup. Deployment must publish both the key and `indexnow-manifest.json` before submission. IndexNow acknowledgement is not a guarantee of indexing; retain the sitemap and Search Console workflow.

For manual deployment:

```bash
npm run build
npm run test
npm run indexnow:prepare
npm run indexnow -- --restore
npm run indexnow -- --dry-run
npm run deploy:prod
npm run indexnow -- --submit
```

Run `--restore` **before** deploying: it retains `.indexnow/submitted.json` when present, otherwise downloads the previous production manifest. Preserve that local state between manual releases. CI retains successful acknowledgements in a separate production cache; if it expires, the previous deployed manifest supplies the comparison baseline. If that fallback follows an earlier failed notification, retry those URLs explicitly. Failed verification/API responses never advance acknowledgement state or save a new CI state cache. Notification failure does not roll back an already successful deployment.

To inspect or retry specific recently changed URLs after deployment:

```bash
npm run indexnow -- --dry-run --url /en/article-slug/
npm run indexnow -- --submit --url /en/article-slug/
```

Repeat `--url` for multiple pages. One-off notifications do not acknowledge other pending changes. Paths must be canonical production English/Polish URLs with trailing slashes and no tracking query or fragment; previews, foreign hosts and language-fallback duplicates are rejected. A deleted/moved URL must return 404/410 or a redirect. HTTP 200/202 count as received; throttling or errors require a later retry. Local tests mock submissions and never contact the API.

## Article configuration

Content lives in `content/posts/` and `content/pages/`. UI translations live in `src/i18n/locales/en/translation.json` and `src/i18n/locales/pl/translation.json`. Edit site metadata and social links in `content/meta/config.ts`.

An article's `related` frontmatter array contains article slugs without locale/date prefixes. Missing references fail the build. The card links to the article's route in the visitor's interface language, including an untranslated copy. It uses another available language only when that route does not exist. Canonical tags remain independent of this navigation choice.

Use `publishedAt: '2026-10-05T12:34:56+02:00'` when the source publication time is known. The timezone is required. Filename dates still control display and ordering. Do not invent times for historical date-only posts.

### YouTube videos

```markdown
`youtube: [Video title](https://www.youtube.com/watch?v=sQbkUl7-z_U&start=30)`
```

Use this format for a player. The importer and normalization command automatically convert only standalone images linked to YouTube videos. Text links stay links, including standalone links, reading lists, bare URLs and inline references. Existing explicit players and mapped webinar recordings retain their embeds. Players use the configured Gatsby video plugin; no handwritten iframe is needed. Preserve the `strict-origin-when-cross-origin` referrer policy in Gatsby/Netlify configuration to avoid YouTube error 153.

Check or convert existing Markdown:

```bash
npm run normalize:youtube
npm run normalize:youtube -- --write
npm run test:file -- video import/youtube
```

Future article imports perform the same normalization automatically.

## Mermaid diagrams

Gatsby doesn't render Mermaid. Articles embed diagrams as PNG files, named `YYYY-MM-DD-mermaidN.png` and placed next to `index.en.md`:

```md
![mermaid1](./2026-10-12-mermaid1.png)
```

Keep the Mermaid sources in the article folder, as `.mmd` files whose names start with the diagram number, for example `1-session-mode.mmd`. They can live in any subfolder; the Gatsby `posts` source ignores `code/` folders, so `code/diagrams/` is a good place. Then render them all:

```sh
npm run render-diagrams content/posts/2026-10-12--connection-pooler-modes-advisory-locks
```

The script finds every `.mmd` file in the folder (skipping `node_modules`), uses the folder's date prefix and the file's number to name the output, and renders it with [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli) through `npx`, at 3x scale on a white background. The CLI version is pinned in [render-mermaid.ts](scripts/render-mermaid.ts), and the theme and fonts are in [mermaid-config.json](scripts/mermaid-config.json). The first run downloads Mermaid CLI and its headless Chromium, so it takes a while. Rerun the command after changing a diagram, and commit both the `.mmd` source and the PNG. `npm run test:file -- render-mermaid` checks the file discovery and naming.

### Tags and reading order

Articles list their topics in `tags` frontmatter. The first tag is the primary one: it is shown first and used for `article:section`. Use the English tag name in both language versions; tag URLs come from that name, so they are identical in English and Polish. To show a Polish name, add it under `tags.labels`, keyed by the tag's URL slug, in `src/i18n/locales/pl/translation.json`. Tags without a translation show their English name.

```yaml
tags:
  - Event Sourcing
  - CQRS
```

When merging tags, add the former value to `mergedTags` in `src/utils/tag-redirects.ts`; its old tag URL then redirects to the merged tag page.

Each tag has a page at `/{en,pl}/articles/tag/{slug}/` listing its articles, newest first. A language has the page when at least one of the tag's articles has a route in that language, including an English copy published under `/pl/`. Article tag links point to the page in the article's language, or to the English page when there is no Polish one. `/{en,pl}/articles/` links to every tag page of its language, most used first.

To describe a tag, add a sentence under `tags.descriptions`, keyed by the tag's URL slug, in `src/i18n/locales/{en,pl}/translation.json`. It is shown below the heading and used as the page's meta description. A language without a description uses `tags.defaultDescription`; descriptions do not fall back to the other language.

```json
"descriptions": {
  "event-sourcing": "Learn Event Sourcing from the fundamentals to production."
}
```

Former `/category/` URLs redirect permanently to the tag pages, and `/{en,pl}/category/` to the guides. Run `npm run build`, `npm run test:file -- tests/articles/tags.generated.test.ts` and inspect `/en/articles/tag/event-sourcing/` and `/pl/articles/tag/event-sourcing/`.

### Learning paths

A learning path is an ordered list of articles, independent of tags. Each path has a folder in `content/paths/`, named `NN--slug`, where `NN` sets the paths' order; it holds `index.en.md` and `index.pl.md`:

```markdown
---
title: Event Sourcing foundations
articles:
  - how_to_get_the_current_entity_state_in_event_sourcing
  - should_you_throw_exception_when_rebuilding_state_from_events
---

Optional introduction in Markdown.
```

`articles` uses article slugs without dates, locale prefixes or slashes. Both language files list the same articles in the same order; a Polish path links to the English article when there is no Polish version. An unknown slug or a mismatch between the two files fails the build. Run `npm run test:int -- learning-paths` to check the paths without building. Paths are not published yet: they have no pages, menu entry or search entries.

### Styles

Edit component-owned `.module.css` files, `src/theme/global.css` for the shared reset, and `src/theme/tokens.css` for colors, spacing and other design tokens. Tokens are ordinary CSS variables; no generator is needed.

Tailwind 4 runs through Gatsby's PostCSS pipeline. `site/config.ts` passes the plugins from `postcss.config.mjs` directly to the loader: the installed loader does not unwrap ESM default exports during file discovery. Shared styling configuration lives in `src/theme/tailwind.css`; it imports the theme and utilities while preserving the existing reset. Use literal utility classes in `.tsx` files, such as `min-h-[80vh]`, `text-accent` or `gap-gutter`. Avoid constructing class names from string fragments: Tailwind scans complete names. Existing component CSS Modules remain supported. Prefer direct CSS variables in modules; utilities do not need to be copied into modules with `@apply`.

The styling baseline is Safari 16.4+, Chrome 111+ and Firefox 128+. The existing reset is in the `base` cascade layer so utilities can override it deliberately. Unlayered component CSS takes precedence over layered utilities, so remove an old property from its module when deliberately moving that property to a utility. A new reset and broader visual redesign remain separate work.

The **Theme / Motyw** icon opens light, dark and system choices. It lives in the header on desktop and the lower navigation on mobile; mobile choices open above the bar, including when the navigation is expanded. System is the default and detects your device's appearance automatically. The icon shows a sun, moon or monitor for the selected preference. Use Enter/Space to open it, Tab to reach the native radio choices, and Escape to close and return focus; clicking outside also closes it. Preference is stored as `color-theme` in local storage. System mode follows OS changes; explicit choices persist across reloads and EN/PL navigation. `src/theme/preference.ts` provides the small document-head initializer so saved preferences apply before React loads. Without JavaScript, the site uses the light stylesheet and theme selection is disabled. Storage failures fall back to system preference without preventing a change on the current page.

Edit light values in `:root` and dark overrides in `:root[data-theme='dark']` in `src/theme/tokens.css`. Transparent article diagrams keep a white canvas for readable labels. Embedded third-party widgets retain their provider's own appearance. Run `npm run test:e2e -- theme.e2e.spec.ts` for theme behavior, and the full browser suite for shared styling/navigation changes. Theme checks click the visible labels and row padding, and cover keyboard dismissal, saved preferences before React loads, OS changes, blocked storage, synchronization between tabs, and dark home/archive/tag/article/search pages in both languages at mobile and desktop widths. To repeat these checks in Firefox, run `npm run browsers:install:firefox`, then `npm run test:e2e -- theme.e2e.spec.ts --browser firefox`.

For a manual appearance review, run `npm run build` and `npm run serve`, then use the theme icon in the desktop header or lower mobile navigation on the home page, an article, a category and search. Review the dark palette, image canvases and mobile navigation. Switch EN/PL and reload to check persistence; open a second tab to check synchronized selection. Choose **System / Systemowy** and change your OS appearance to check automatic updates. Third-party comments, newsletter and calendar embeds keep their own provider styling.

Use named CSS exports, for example `import * as styles from './Component.module.css'` and `className={styles.container}`. Dashed local selectors are exported in camel case. Keep Gatsby data/routing adapters separate from reusable presentation components where needed; the reading-list view accepts a link renderer and owns its stylesheet.

After styling changes, run `npm run build`, `npm run test:generated -- theme`, `npm run test:e2e` and `npm run verify:cache:css`.

For shared header changes, run `npm run test:e2e -- navigation.e2e.spec.ts theme.e2e.spec.ts fonts.e2e.spec.ts`. These checks cover content staying in place when the header shrinks, changed header-height tokens, the homepage overlay, EN/PL client navigation, responsive layouts and server-rendered pages without JavaScript. Repeat in Firefox with `npm run test:e2e -- navigation.e2e.spec.ts theme.e2e.spec.ts browser-fonts.e2e.spec.ts fonts.e2e.spec.ts --browser firefox`, including both homepage comparisons and a larger browser-default-font check. Default Chromium references keep their existing paths; Firefox homepage references use `tests/fixtures/visual/firefox/`. Missing browser references fail normally. The [header visual review](docs/header-visual-review.md) records their production provenance and measured differences. Named Tailwind breakpoints are defined in `src/theme/tailwind.css`; keep their units and thresholds aligned with module media rules and the menu measurements.

Run `npm run test:e2e -- hero.e2e.spec.ts navigation-disclosure.e2e.spec.ts` for hero reflow/retained artwork size and dropdown labels, hover contrast, separate control targets, keyboard dismissal and sticky-header hit testing. The theme control lives in the desktop header navigation and the lower mobile bar; `npm run test:e2e -- theme.e2e.spec.ts header-avatar.e2e.spec.ts` checks left-aligned branding and upward-opening mobile theme choices with collapsed and expanded navigation. Add `--browser firefox` to repeat in Firefox; `browser-fonts.e2e.spec.ts --browser firefox` also checks enlarged browser fonts. Hero tests inspect visible image pixels against text and controls, including JavaScript-disabled pages. Original artwork export details are in [hero-exports.md](assets/hero-exports.md). Intentional homepage changes still require reviewing captures before updating references; diagnostic test selections do not replace the full visual gate.

Native buttons and form fields inherit the page font family in `src/theme/global.css`, so interface text uses Open Sans once loaded. Component sizes/weights remain local. Run `npm run test:e2e -- fonts.e2e.spec.ts` for EN/PL mobile/desktop checks and `npm run test:e2e -- styles.e2e.spec.ts --grep 'usable fallback'` to verify controls remain readable when either font weight fails. Append `--browser firefox` to repeat these cases in Firefox.

Gatsby 5.16.1 requires the checked-in CSS cache correction in `patches/`. npm applies it automatically during installation; after `--ignore-scripts`, run `npm run postinstall` before building. The cache check temporarily edits/restores module CSS, global CSS and a literal Tailwind class, then verifies generated output and computed styles before and after hydration. It rebuilds the restored sources in `finally`; do not run other builds or edit those files concurrently. Upgrade/removal instructions are in [the patch notes](docs/gatsby-css-cache-patch.md).

gatsby-plugin-sharp 5.16.0 is pinned for a second patch that shares pending placeholder work between parallel page queries. `npm run test:file -- tests/images/placeholders.int.test.ts` checks it; maintenance notes are in [the placeholder patch notes](docs/gatsby-sharp-placeholder-patch.md).

For a focused menu check, use `npm run test:e2e -- --grep 'persistent menu'`. It checks language switching, localized destinations, overflow icons, opening/closing and mobile/desktop resizing. Run the full browser suite before publishing changes.

## Editing articles and biographies

Keep the development server running while editing Markdown. Gatsby automatically refreshes content; no production build or reference update is needed after each edit.

```sh
npm run dev
# Open http://localhost:8000/en/ or http://localhost:8000/pl/.
```

For quick automated checks without a Gatsby build:

```sh
npm run check:edit
```

This checks source image descriptions, isolated React behavior and browser rendering of controlled English/Polish author, archive, related and search examples. It starts/stops the component gallery automatically. The pre-commit hook also checks image descriptions in staged Markdown. Actual current article content, generated links, SEO and Gatsby hydration are verified after the production build in CI.

| Command                      | Purpose                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run dev`                | Live article/bio preview at localhost:8000                                                               |
| `npm run check:content`      | Source image-description checks only; no build                                                           |
| `npm run check:edit`         | Source, unit, integration and component browser checks; no Gatsby build                                  |
| `npm run dev:components`     | Live component/style preview at localhost:9001                                                           |
| `npm run test:browser`       | Compare controlled components; failure paths and traces are printed in the terminal                      |
| `npm run test:e2e:report`    | Open the production browser report and traces                                                            |
| `npm run verify:publication` | Run smoke/lint/types, quick checks, one build, generated output and production browsers; stop on failure |

To preview the controlled components, start `dev:components`, then open `http://127.0.0.1:9001/?story=Editorial/English` or `?story=Editorial/Polish`. These are test examples, not production pages. CSS and component edits refresh immediately. Their fixed text/cover keeps visual comparisons independent of editorial changes; real Gatsby cover loading and routing have separate production-page checks.

### Guide heading review

The component gallery includes `?story=Guides/English&theme=light` and `?story=Guides/Polish&theme=dark` for the real heading and numbered reading-card components. These use controlled content and native images/anchors, not the Gatsby guide adapter. Review the icon alignment and current palette alongside the existing hero/editorial examples.

Hero design review uses `?story=Hero/English` or `?story=Hero/Polish`, with optional `&theme=dark`. These examples render the actual HeroView and its owned styles, with current UI translations and original portrait. The gallery header is preview context; it does not reproduce production navigation. The website keeps the full biography, Gatsby image loading and routing; verify those through the site tests. Hero examples are review material, not automatically accepted screenshot references.

For normal publishing, edit/import → preview locally → commit/push the PR → inspect its Netlify preview → merge. GitHub Actions runs quick checks before the build, then all project/production browser checks. It deploys the preview after passing validation; merging to main automatically publishes production and notifies IndexNow. No manual snapshot-update or deploy command is required for article/bio wording changes. Superseded PR runs are cancelled; production runs stay sequential. This requires the existing repository Netlify credentials. `verify:publication` reproduces the validation locally without publishing; it is optional during editing and never updates references.

Static production output still needs a build. CI caches npm downloads and compatible Gatsby outputs, but there is no promise of instant production builds. Do not validate new source against old `public` output. Do not edit content or run competing builds during production/cache validation.

## Updating fixtures

Editorial text and newly added articles need no visual-reference update. Current-source publication tests check all articles and biographies against generated output; layout screenshots use controlled component props. Homepage references still protect the actual homepage composition. The existing 3% tolerance is unchanged. See [the test assessment](docs/test-review.md) and [testing guidance](docs/testing-guidance.md).

For an intentional component styling change, run `npm run test:browser` and inspect the reported reference/actual/diff PNG paths under `visual-artifacts/components/`. Open a failure trace with `npx playwright show-trace <trace.zip>`. Review the visual change before using Vitest’s native targeted update:

```sh
npm run test:browser -- --update=all -t 'en editorial components at 1440px'
npm run test:browser
```

That example updates only the reviewed English desktop author/archive/related/search captures. Omit `-t` only when all component references were reviewed. Normal checks never update missing or changed references. Reference updates remain a last resort for intentional visual changes, not part of ordinary publication.

For an explicitly reviewed homepage change, update only its English/Polish captures:

```sh
npm run test:e2e:update -- navigation.e2e.spec.ts --grep 'homepage renders one complete hero'
npm run test:e2e:update -- navigation.e2e.spec.ts --grep 'homepage renders one complete hero' --browser firefox
npm run test:e2e
```

Review the four changed homepage PNGs and keep unrelated references unchanged. Investigate unexplained differences before updating any fixture.

The historical build contract fails when a protected route, redirect, sitemap URL or feed entry disappears. New articles pass automatically and are listed as additions. For intentional removals, run `npm run verify:build-contract`, inspect the exact differences, then use `npm run update:build-contract` and review `tests/fixtures/build-contract.json`. Run the update occasionally to protect newly published URLs too. Do not update it to accept unexplained missing routes.

## Audits

Run performance audits sequentially on an idle machine after builds/tests finish. Output belongs in ignored `report/`, not published content.

```bash
npm run audit:performance -- --base-url http://127.0.0.1:9000 --runs 3 --label local
npm run audit:performance -- --base-url https://event-driven.io --page /en/introduction_to_event_sourcing/ --runs 3 --label production
npm run audit:console -- --browser firefox --url https://event-driven.io/en/introduction_to_event_sourcing/ --output report/browser-console/firefox.json
npm run audit:fonts -- --base-url http://127.0.0.1:9000 --runs 3 --output report/fonts/current
npm run measure:search
```

The performance command downloads pinned Lighthouse 13.5.0 on its first run. Use the same versions/throttling and compare medians. The console audit uses a fresh profile, scrolls to comments and observes for 15 seconds (`--seconds` accepts 1–60). It retains vendor requests. Font profiling blocks vendors to isolate font timing; `--without-polish-preload` provides a same-build comparison.

For a diagnostic comparison that blocks Disqus only in the audit browser:

```bash
npm run audit:performance -- --base-url https://event-driven.io --page /en/introduction_to_event_sourcing/ --runs 3 --label diagnostic-no-disqus --block-pattern '*disqus*'
```

Blocked-vendor results are diagnostic and do not represent the normal page.

### Indexing and error pages

```bash
npm run generate-llms
npm run test:file -- seo/indexing
npm run test:generated -- site/routing
npm run audit:indexing -- --base-url https://event-driven.io --output report/indexing/production.json
```

Use a Netlify preview origin to audit an unpublished deployment. Optional `--urls-file /path/to/urls.json` accepts a JSON array of Search Console example URLs. The audit checks robots, sitemaps, HTTP statuses, canonicals, headings, reciprocal alternates and direct localized 404 responses. It does not submit URLs to Google.

Netlify serves unknown `/en/*` and `/pl/*` addresses with localized recovery pages and HTTP 404, preserving the requested URL. Gatsby's local server can return 200 for its localized client fallback; check actual HTTP error/query routing on Netlify. Editorial redirects precede the final error rules.

In Search Console:

1. Open **Indeksowanie → Strony**, select an issue and export its **Przykłady** URLs. Overview exports contain counts only.
2. Paste a complete URL into the inspection bar at the top.
3. Expand **Indeksowanie stron / Page indexing** in the indexed result. Copy **Strona kanoniczna wybrana przez Google / Google-selected canonical**, the user-declared canonical and **Ostatnie indeksowanie / Last crawl**. The live test does not show Google's canonical choice.
4. After deploying a repair, run **Sprawdź opublikowany URL / Test live URL** on its destination. Request indexing for maintained canonical pages when needed. Use **Sprawdź poprawkę / Validate fix** for repaired failures; normal redirects and proper canonical alternatives remain excluded.

Investigation records: [indexing](docs/google-indexing-review.md), [PageSpeed](docs/pagespeed-review.md), [Gatsby/CSS](docs/gatsby-css-review.md). Current work is tracked in [plan.md](plan.md) and [todo.md](todo.md).

## Deployment

CI configuration is in `.github/workflows/ci.yml`; CodeQL is in `.github/workflows/codeql-analysis.yml`. CI runs installation, smoke, lint, build, full tests and browser comparisons before saving build caches and deploying.

For manual deployment, configure `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`, finish the checks above, then run:

```bash
npm run deploy       # upload the existing build as a preview
npm run deploy:prod  # upload the existing build to production
```

## License

[Creative Commons BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
