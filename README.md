# Event-Driven.io

## Setup

Use Node 24 and npm 11.9.0 (the same npm baseline as Pongo). Install it with `npm install --global npm@11.9.0` if needed.

```bash
nvm install
nvm use
npm ci
npm run browsers:install
```

On Linux, install Chromium's system libraries with `npm run browsers:install:ci`. Firefox is optional: `npm run browsers:install:firefox`.

Optional local `.env` settings:

```dotenv
GATSBY_DISQUS_NAME=oskar-dudycz
GOOGLE_TAG_ID=your-google-tag-manager-id
```

CI uses the corresponding repository secrets. Search uses local MiniSearch indexes and needs no Algolia credentials.

## Development and production checks

```bash
npm run develop
```

For a production check:

```bash
npm run typecheck
npm run smoke
npm run lint
env -u DEBUG npm run build
npm run test
npm run test:visual
```

Playwright starts and stops the local production server automatically; it can also reuse a running local server. Set `VISUAL_BASE_URL` to test a deployment preview:

```bash
VISUAL_BASE_URL=https://your-preview.netlify.app npm run test:visual
```

`build` generates theme tokens, `llms.txt`, feeds, sitemaps and search indexes. Tests that inspect generated output require a completed production build. Do not edit content or run another Gatsby process during a build or cache check. To rebuild from an empty cache, run `npm run clean` before `npm run build`. Do this when changing React or Gatsby's JSX runtime so previously compiled runtime artifacts cannot affect verification.

If Gatsby logs an unidentified Node warning, include its dependency stack with:

```bash
NODE_OPTIONS=--trace-warnings env -u DEBUG npm run build
```

## TypeScript and modules

Application components, pages, layouts and Gatsby browser/SSR hooks use `.tsx`; plain browser modules use `.ts`. Node scripts, importers, tests, local remark plugins and build implementations use native ESM `.ts`. Run scripts with Node 24 directly; no ts-node, tsx loader or Babel registration is needed. Use erasable TypeScript syntax (types/interfaces, not runtime enums or parameter properties) and explicit file extensions in Node imports. Gatsby owns JSX compilation and uses its default runtime for Head API compatibility; Vitest uses the automatic JSX runtime.

Gatsby 5 discovers native ESM configuration and Node hooks through `gatsby-config.mjs` and `gatsby-node.mjs`. Those entry points export the typed implementation from `site/*.ts`. ESLint, lint-staged and PostCSS retain their standard `.mjs` configuration entry points. The root package deliberately has no `type: module`: Gatsby still emits CommonJS SSR bundles into `.cache`. Source package scopes (`src`, `content/meta`, `site`, `scripts`, `import`, `tests` and the local plugins) declare `type: module` for `.ts` modules without changing Gatsby-generated files. Gatsby owns application compilation; `npm run typecheck` separately checks all application, tooling and test TypeScript without emitting files. Browser/Vite code uses bundler resolution in `tsconfig.json`; native Node code also passes NodeNext resolution in `tsconfig.node.json`, which catches missing runtime extensions and incompatible module imports. Both run in CI before the build and as part of `npm run test`.

The tooling configuration starts from Pongo: `tsconfig.shared.json`, `.prettierrc.json` and `.editorconfig` are copied; ESLint retains its general recommended/type-checked/Prettier/type-only-import configuration. Gatsby overrides add browser/JSX support, no-emit checking and this repository's source/output locations. React hooks and image accessibility checks are enabled for site code; Pongo's database/Cloudflare rules do not apply here. The copied strict optional-property and indexed-access checks remain enabled. Browser and native Node configurations extend the same shared settings.

The native TypeScript 7 checker supplies `tsc`; the `typescript` import is Microsoft's TS6 compatibility alias for Gatsby, ESLint and compiler-API tools. Install the recommended TypeScript native VS Code extension to use the matching editor service. Do not point the editor at the compatibility package's missing tsserver.

VS Code settings, extension recommendations, tasks and the component-test debugger also start from Pongo, with root paths, Node 24 and npm. TypeScript formatting runs through ESLint's Prettier integration; imports are organized on save. `npm run typecheck:watch` runs the editor's watch task. Select the component or Node test debugger for the current test file. `npm run fix` applies formatting and lint fixes manually; lint-staged checks staged code and article image descriptions.

ESLint anchors its project path to the configuration directory, so opening `src` or a component folder in the editor does not change tsconfig resolution. Vitest's TypeScript configuration lives in the ESM `tests` scope; `npm run test:components` and the debugger select it explicitly.

Shared content/query types live in `src/types/content.ts`. Keep each page's data type limited to its query. Use published dependency types where available; the narrow declarations in `src/types/vendors.d.ts` cover untyped integrations.

## Dependency maintenance

Scoped npm overrides retain the tested ESLint and localization versions where upstream peer ranges lag behind. They are listed with their rationale in [the dependency review](docs/dependency-review.md); installations use normal peer resolution without `--force` or `--legacy-peer-deps`.

Run `npm outdated` to compare installed, wanted and latest registry versions. [The dependency review](docs/dependency-review.md) records tested upgrades and remaining compatibility work. Check imports, Gatsby/PostCSS configuration, scripts and peer requirements before removing a dependency. `npm explain <package>` shows which packages still require it transitively; an unused root declaration can be removed even when Gatsby retains its own dependency. Gatsby supplies its compiler configuration; the project uses TypeScript for smoke/lint parsing and Vitest for component rendering tests, with no direct Babel setup. npm runs patch-package from the postinstall lifecycle to apply the Gatsby CSS cache correction; the Yarn-only postinstall-postinstall helper is removed.

After changing dependencies:

```bash
npm install
npm ci
npm run smoke
npm run lint
npm run clean
env -u DEBUG npm run build
npm run test
npm run test:visual
```

Review both package.json and package-lock.json. Dependency cleanup should pass existing screenshots without regenerating them.

Run `npm audit` to inspect advisories and `npm audit fix --dry-run` to preview compatible fixes. Review the proposed updates before applying them, then repeat installation/build/test checks. Some remaining Gatsby dependencies require upstream changes; the audit's `--force` suggestion can downgrade Gatsby plugins and is not a safe routine update.

## Tests

`npm run test` runs all non-browser suites below. Browser tests run separately.

| Command                                                         | Checks                                                                                       |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `npm run typecheck`                                             | Strict application, Node tooling, importer and test types without emitting files             |
| `npm run smoke`                                                 | Source syntax, configuration and GraphQL queries                                             |
| `npm run test:seo` / `npm run verify-seo`                       | Generated headings, metadata, schema, sitemap and security headers                           |
| `npm run test:build-contract` / `npm run verify:build-contract` | Exact routes, redirects, sitemap URLs and feed identities                                    |
| `npm run test:indexing`                                         | Canonical destinations, reciprocal language alternates, fallback markers and Netlify routing |
| `npm run test:404`                                              | Root/localized error HTML, recovery links and native 404 rules                               |
| `npm run test:substack`                                         | Import conversion, assets, code languages and link safety                                    |
| `npm run test:articles`                                         | All published articles: metadata, video markup, language links and related cards             |
| `npm run test:video`                                            | YouTube conversion, player parameters and referrer headers                                   |
| `npm run test:redirects`                                        | Imported article aliases and generated redirects                                             |
| `npm run test:categories`                                       | Category membership, locale parity and reading order                                         |
| `npm run test:performance`                                      | Image priority/lazy loading, local fonts, newsletter and menu regressions                    |
| `npm run test:search`                                           | Local search data, fallback languages and safe result rendering                              |
| `npm run test:localization`                                     | Translation resources, routing and canonical-language policy                                 |
| `npm run test:css`                                              | Generated CSS assets and stale inline styles                                                 |
| `npm run test:tooling`                                          | Lint, formatting, editor configuration and audit CLI validation                              |
| `npm run test:components`                                       | Link/reading-list routing, safe search markup and SEO timestamp rendering                    |
| `npm run test:images`                                           | Markdown descriptions, import alternatives and all generated image/link alternatives         |
| `npm run test:indexnow`                                         | Production URL validation, content diffs, dry runs, submissions and failure-safe state       |
| `npm run test:visual`                                           | Browser hydration, navigation, search, mobile layouts and screenshots                        |

Internal discovery links (archive, related cards, category reading lists and search) preserve the current interface language when that article route exists. An untranslated `/pl/` copy can still declare its English original as canonical; canonical metadata does not change the navigation destination. Search labels the actual content language. When there is no route in the selected language, links use the available version.

Cache checks temporarily modify/delete/restore existing source files and rebuild. Stop development/preview servers and pause content edits first. Wait for the checks to finish before staging, committing or deploying, so temporary edits/deletions are not included:

```bash
env -u DEBUG npm run test:cache
env -u DEBUG npm run test:cache:css
npm run test
```

Run browser checks against the restored build afterward. Cache logs are saved in temporary directories printed by each command.

To check search refresh in development, start `npm run develop -- -H 127.0.0.1 -p 8001`, then run `npm run test:search:dev` in another terminal. This check also temporarily modifies and restores an article. Set `DEV_SEARCH_BASE_URL` to use another address. Reload the search page after its index changes.

### Browser test commands and helpers

Browser tests live in `tests/browser/*.spec.ts` and run with Playwright Test. React component tests use Vitest. `npm run test:browser-types` checks the browser tests and configuration with TypeScript; it is also part of `npm run test`.

```bash
npm run test:visual -- --list
npm run test:visual -- search.spec.ts
npm run test:visual -- --grep 'persistent menu'
npm run test:visual -- --debug --grep 'article language switch'
npm exec -- playwright show-report visual-artifacts/report
```

Use Playwright's `page` fixture, `test.use` for browser options, and retrying assertions such as `await expect(locator).toHaveText(...)`. Import `test` and `expect` from `./fixtures` in browser specs: it blocks live third-party requests; `page.route` supplies explicit widget mocks when needed. Use `expectFonts` and `expectImageLoaded` from `./readiness` for repeated font/image readiness. Vitest clears component mocks automatically and supports `test.each` for input variants.

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
npm run import-articles -- https://www.architecture-weekly.com/p/post-slug --category 'Software Architecture'
npm run import-articles -- https://kurrentdb.kurrent.io/blog/post-slug/ --category 'Event Sourcing'
npm run import-articles -- --manifest import/substack-posts.json
npm run import-articles -- --manifest import/eventstore-posts.json
npm run import-articles -- https://www.architecture-weekly.com/p/post-slug --html saved-page.html
```

`import-substack` is an alias for the same importer. It supports Substack, Kurrent/EventStore and dated Wayback captures. Images require network access even with `--html`.

Manifest format:

```json
[
  {
    "url": "https://www.architecture-weekly.com/p/source-slug",
    "category": "Event Sourcing",
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

Only `url` is required. The default category is `Software Architecture`. `slug` overrides the source slug. `codeLanguage` overrides plain-text code labels. `youtubeVideo` adds a recording when absent; `recordingEmbeds` replaces mapped recording cards/thumbnails. Video IDs must contain 11 characters.

Imports create `content/posts/YYYY-MM-DD--slug/index.en.md` and `index.pl.md`, download images into that directory and record provenance in `article-source.txt` or `substack-source.txt`. Both files initially have the same body; the Polish file uses `useDefaultLangCanonical: true`. Translate the body and image descriptions, then remove that flag.

The importer adds `redirectFrom: /source-slug/` and, for custom slugs, `redirectAliases`. Gatsby generates permanent redirects to the English article. Links to available blog versions become relative URLs; references without a blog version retain their source URL. Code labels use TypeScript for JavaScript/TypeScript examples and preserve other languages.

Existing posts are never overwritten. A failed batch retains earlier successful imports; retry with a manifest containing only unfinished entries. Review images, captions, code labels, source links and interactive embeds, then run:

```bash
npm run normalize:youtube
npm run test:substack
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
npm run test:images
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
npm run test:video
```

Future article imports perform the same normalization automatically.

### Category reading order

Edit `data/category-guides.json`:

```json
{
  "language": "en",
  "slug": "event-sourcing",
  "description": "Learn Event Sourcing from the fundamentals to production.",
  "recommended": [
    "introduction_to_event_sourcing",
    "projections_and_read_models_in_event_driven_architecture"
  ]
}
```

`recommended` controls the numbered order. Use article slugs without dates, locale prefixes or surrounding slashes. Each article must belong to the category through `category` or `categories` on its canonical version. Remaining articles follow by date; an empty array uses chronological order only. English and Polish guides are independent. Missing/out-of-category recommendations are ignored, so inspect the resulting category page after editing.

A guide does not create a category route by itself; at least one canonical article in that language must belong to the category. Run `npm run build`, `npm run test:categories` and inspect `/en/category/event-sourcing/` and `/pl/category/event-sourcing/`.

### Styles

Edit component-owned `.module.css` files, `src/theme/global.css` for the shared reset, and `src/theme/tokens.css` for colors, spacing and other design tokens. Tokens are ordinary CSS variables; no generator is needed.

Tailwind 4 runs through Gatsby's PostCSS pipeline. Shared configuration lives in `src/theme/tailwind.css`; it imports the theme and utilities while preserving the existing reset. Use literal utility classes in `.tsx` files, such as `min-h-[80vh]`, `text-accent` or `gap-gutter`. Avoid constructing class names from string fragments: Tailwind scans complete names. Existing component CSS Modules remain supported. Prefer direct CSS variables in modules; utilities do not need to be copied into modules with `@apply`.

The styling baseline is Safari 16.4+, Chrome 111+ and Firefox 128+. The existing reset is in the `base` cascade layer so utilities can override it deliberately. Unlayered component CSS takes precedence over layered utilities, so remove an old property from its module when deliberately moving that property to a utility. A new reset and broader visual redesign remain separate work.

The footer's **Theme / Motyw** selector offers system, light and dark modes. Preference is stored as `color-theme` in local storage. System mode follows OS changes; explicit choices persist across reloads and EN/PL navigation. `src/theme/preference.ts` provides the small document-head initializer so saved preferences apply before React loads. Without JavaScript, the site uses the light stylesheet and the selector is disabled. Storage failures fall back to system preference without preventing a change on the current page.

Edit light values in `:root` and dark overrides in `:root[data-theme='dark']` in `src/theme/tokens.css`. Transparent article diagrams keep a white canvas for readable labels. Embedded third-party widgets retain their provider's own appearance. Run `npm run test:visual -- theme.spec.ts` for theme behavior, and the full browser suite for shared styling/navigation changes.

Use named CSS exports, for example `import * as styles from './Component.module.css'` and `className={styles.container}`. Dashed local selectors are exported in camel case. Keep Gatsby data/routing adapters separate from reusable presentation components where needed; the reading-list view accepts a link renderer and owns its stylesheet.

After styling changes, run `npm run build`, `npm run test:css`, `npm run test:visual` and `npm run test:cache:css`.

Gatsby 5.16.1 requires the checked-in CSS cache correction in `patches/`. npm applies it automatically during installation; after `--ignore-scripts`, run `npm run postinstall` before building. The cache check covers module and global stylesheet edits/restoration. Upgrade/removal instructions are in [the patch notes](docs/gatsby-css-cache-patch.md).

For a focused menu check, use `npm run test:visual -- --grep 'persistent menu'`. It checks language switching, localized destinations, overflow icons, opening/closing and mobile/desktop resizing. Run the full browser suite before publishing changes.

## Updating fixtures

For intentional route/feed changes, run `npm run verify:build-contract`, inspect the exact differences, then use `npm run update:build-contract`. Review `tests/fixtures/build-contract.json` and rerun `npm run test:build-contract`. Do not update the fixture to accept unexplained missing routes.

After publishing a new first article, run `npm run test:visual` and inspect the expected, actual and diff images in the Playwright report. If only the intended archive content changed:

```bash
ARCHIVE_SNAPSHOT_SLUG=reviewed-newest-article-slug npm run test:visual:update:archive
npm run test:visual
```

The command verifies the first card's exact slug and updates only the archive screenshot in `tests/fixtures/visual/`. Review the PNG diff before committing. `test:visual:update` updates all visual baselines and should be reserved for a reviewed design change. The comparison tolerance remains 3%.

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
npm run test:indexing
npm run test:404
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
