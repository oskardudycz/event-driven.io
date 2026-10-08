# Event-Driven.io

## Setup

Use Node 24 and Yarn 1.

```bash
nvm install
nvm use
yarn --frozen-lockfile
yarn browsers:install
```

On Linux, install Chromium's system libraries with `yarn browsers:install:ci`. Firefox is optional: `yarn browsers:install:firefox`.

Optional local `.env` settings:

```dotenv
GATSBY_DISQUS_NAME=oskar-dudycz
GOOGLE_TAG_ID=your-google-tag-manager-id
```

CI uses the corresponding repository secrets. Search uses local MiniSearch indexes and needs no Algolia credentials.

## Development and production checks

```bash
yarn develop
```

For a production check:

```bash
yarn smoke
yarn lint
env -u DEBUG yarn build
yarn test
env -u DEBUG yarn serve -H 127.0.0.1 -p 9000
```

Keep the server running and execute `yarn test:visual` in another terminal. Set `VISUAL_BASE_URL` to test a deployment preview:

```bash
VISUAL_BASE_URL=https://your-preview.netlify.app yarn test:visual
```

`build` generates theme tokens, `llms.txt`, feeds, sitemaps and search indexes. Tests that inspect generated output require a completed production build. Do not edit content or run another Gatsby process during a build or cache check. To rebuild from an empty cache, run `yarn clean` before `yarn build`.

## Tests

`yarn test` runs all non-browser suites below. Browser tests run separately.

| Command                                                   | Checks                                                                                       |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `yarn smoke`                                              | Source syntax, configuration and GraphQL queries                                             |
| `yarn test:seo` / `yarn verify-seo`                       | Generated headings, metadata, schema, sitemap and security headers                           |
| `yarn test:build-contract` / `yarn verify:build-contract` | Exact routes, redirects, sitemap URLs and feed identities                                    |
| `yarn test:indexing`                                      | Canonical destinations, reciprocal language alternates, fallback markers and Netlify routing |
| `yarn test:404`                                           | Root/localized error HTML, recovery links and native 404 rules                               |
| `yarn test:substack`                                      | Import conversion, assets, code languages and link safety                                    |
| `yarn test:articles`                                      | All published articles: metadata, video markup, language links and related cards             |
| `yarn test:video`                                         | YouTube conversion, player parameters and referrer headers                                   |
| `yarn test:redirects`                                     | Imported article aliases and generated redirects                                             |
| `yarn test:categories`                                    | Category membership, locale parity and reading order                                         |
| `yarn test:performance`                                   | Image priority/lazy loading, local fonts, newsletter and menu regressions                    |
| `yarn test:search`                                        | Local search data, fallback languages and safe result rendering                              |
| `yarn test:localization`                                  | Translation resources, routing and canonical-language policy                                 |
| `yarn test:css`                                           | Generated CSS assets and stale inline styles                                                 |
| `yarn test:tooling`                                       | Lint, formatting and editor configuration                                                    |
| `yarn test:components`                                    | Link destinations, native attributes and locale routing                                      |
| `yarn test:visual`                                        | Browser hydration, navigation, search, mobile layouts and screenshots                        |

Cache checks temporarily modify/delete/restore existing source files and rebuild. Stop development/preview servers and pause content edits first. Wait for the checks to finish before staging, committing or deploying, so temporary edits/deletions are not included:

```bash
env -u DEBUG yarn test:cache
env -u DEBUG yarn test:cache:css
yarn test
```

Run browser checks against the restored build afterward. Cache logs are saved in temporary directories printed by each command.

To check search refresh in development, start `yarn develop -H 127.0.0.1 -p 8001`, then run `yarn test:search:dev` in another terminal. This check also temporarily modifies and restores an article. Set `DEV_SEARCH_BASE_URL` to use another address. Reload the search page after its index changes.

## Formatting and editor setup

```bash
yarn lint
yarn fix
```

Individual commands: `lint:eslint`, `lint:prettier`, `fix:eslint`, `fix:prettier`. `lint:modern` aliases the ESLint check. ESLint parses TypeScript but does not type-check it.

Installation configures Husky. The pre-commit hook runs `yarn lint-staged` against staged files. VS Code settings and extension recommendations are in `.vscode/`. Generated output, imported content and fixtures are excluded from bulk formatting.

## Importing articles

Import a URL, a batch manifest or a saved HTML page:

```bash
yarn import-articles https://www.architecture-weekly.com/p/post-slug --category 'Software Architecture'
yarn import-articles https://kurrentdb.kurrent.io/blog/post-slug/ --category 'Event Sourcing'
yarn import-articles --manifest import/substack-posts.json
yarn import-articles --manifest import/eventstore-posts.json
yarn import-articles https://www.architecture-weekly.com/p/post-slug --html saved-page.html
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
    "recordingEmbeds": {
      "https://publication.substack.com/p/recording-slug": "sQbkUl7-z_U"
    }
  }
]
```

Only `url` is required. The default category is `Software Architecture`. `slug` overrides the source slug. `codeLanguage` overrides plain-text code labels. `youtubeVideo` adds a recording when absent; `recordingEmbeds` replaces mapped recording cards/thumbnails. Video IDs must contain 11 characters.

Imports create `content/posts/YYYY-MM-DD--slug/index.en.md` and `index.pl.md`, download images into that directory and record provenance in `article-source.txt` or `substack-source.txt`. Both files initially have the same body; the Polish file uses `useDefaultLangCanonical: true`. Remove that flag after translating it.

The importer adds `redirectFrom: /source-slug/` and, for custom slugs, `redirectAliases`. Gatsby generates permanent redirects to the English article. Links to available blog versions become relative URLs; references without a blog version retain their source URL. Code labels use TypeScript for JavaScript/TypeScript examples and preserve other languages.

Existing posts are never overwritten. A failed batch retains earlier successful imports; retry with a manifest containing only unfinished entries. Review images, captions, code labels, source links and interactive embeds, then run:

```bash
yarn normalize:youtube
yarn test:substack
env -u DEBUG yarn build
yarn test
```

The Architecture Weekly migration records are [the manifest](import/architecture-weekly-missing.json), [the archive audit](import/architecture-weekly-audit.json) and [the remaining source-link report](import/architecture-weekly-link-report.json). The reviewed archive cutoff is #189, August 5, 2024. Re-running the completed manifest refuses to overwrite its posts.

Legacy repository imports replace their local destination directories:

```bash
yarn import-newsletter
yarn import-architecture-weekly
```

`import-newsletter` replaces `content/newsletter-pl/`; `NEWSLETTER_REPO_URL` can override its repository. `import-architecture-weekly` currently refreshes its repository checkout and the placeholder directory. `import-and-build` runs both commands and a build; it is not the Substack URL importer.

## Article configuration

Content lives in `content/posts/` and `content/pages/`. UI translations live in `src/i18n/locales/en/translation.json` and `src/i18n/locales/pl/translation.json`. Edit site metadata and social links in `content/meta/config.js`.

An article's `related` frontmatter array contains article slugs without locale/date prefixes. Missing references fail the build. The card uses a genuine translation when available, otherwise the canonical original.

Use `publishedAt: '2026-10-05T12:34:56+02:00'` when the source publication time is known. The timezone is required. Filename dates still control display and ordering. Do not invent times for historical date-only posts.

### YouTube videos

```markdown
`youtube: [Video title](https://www.youtube.com/watch?v=sQbkUl7-z_U&start=30)`
```

Use this format for a player. The importer and normalization command automatically convert only standalone images linked to YouTube videos. Text links stay links, including standalone links, reading lists, bare URLs and inline references. Existing explicit players and mapped webinar recordings retain their embeds. Players use the configured Gatsby video plugin; no handwritten iframe is needed. Preserve the `strict-origin-when-cross-origin` referrer policy in Gatsby/Netlify configuration to avoid YouTube error 153.

Check or convert existing Markdown:

```bash
yarn normalize:youtube
yarn normalize:youtube --write
yarn test:video
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

A guide does not create a category route by itself; at least one canonical article in that language must belong to the category. Run `yarn build`, `yarn test:categories` and inspect `/en/category/event-sourcing/` and `/pl/category/event-sourcing/`.

### Styles

Edit component-owned `.module.css` files, `src/theme/global.css` for the shared reset, and `src/theme/theme.yaml` for tokens. `yarn generate-theme-css` regenerates `src/theme/tokens.css`; do not edit generated tokens directly. Production/development startup runs the generator. After changing YAML during a development session, run it again.

Use named CSS exports, for example `import * as styles from './Component.module.css'` and `className={styles.container}`. Dashed local selectors are exported in camel case. Keep Gatsby data/routing adapters separate from reusable presentation components where needed; the reading-list view accepts a link renderer and owns its stylesheet.

After styling changes, run `yarn build`, `yarn test:css`, `yarn test:visual` and `yarn test:cache:css`.

Gatsby 5.16.1 requires the checked-in CSS cache correction in `patches/`. Yarn applies it automatically during installation; after `--ignore-scripts`, run `yarn postinstall` before building. The cache check covers module and global stylesheet edits/restoration. Upgrade/removal instructions are in [the patch notes](docs/gatsby-css-cache-patch.md).

For a focused menu check with the production server running, use `yarn test:visual -t 'persistent menu'`. It checks language switching, localized destinations, overflow icons, opening/closing and mobile/desktop resizing. Run the full browser suite before publishing changes.

## Updating fixtures

For intentional route/feed changes, run `yarn verify:build-contract`, inspect the exact differences, then use `yarn update:build-contract`. Review `tests/fixtures/build-contract.json` and rerun `yarn test:build-contract`. Do not update the fixture to accept unexplained missing routes.

After publishing a new first article, inspect `visual-artifacts/articles-desktop.png` and `articles-desktop-diff.png`. If only the intended archive content changed:

```bash
ARCHIVE_SNAPSHOT_SLUG=reviewed-newest-article-slug yarn test:visual:update:archive
yarn test:visual
```

The command verifies the first card's exact slug and updates only the archive screenshot. Review the PNG diff before committing. `test:visual:update` updates all visual baselines and should be reserved for a reviewed design change. The comparison tolerance remains 3%.

## Audits

Run performance audits sequentially on an idle machine after builds/tests finish. Output belongs in ignored `report/`, not published content.

```bash
yarn audit:performance --base-url http://127.0.0.1:9000 --runs 3 --label local
yarn audit:performance --base-url https://event-driven.io --page /en/introduction_to_event_sourcing/ --runs 3 --label production
yarn audit:console --browser firefox --url https://event-driven.io/en/introduction_to_event_sourcing/ --output report/browser-console/firefox.json
yarn audit:fonts --base-url http://127.0.0.1:9000 --runs 3 --output report/fonts/current
yarn measure:search
```

The performance command downloads pinned Lighthouse 13.5.0 on its first run. Use the same versions/throttling and compare medians. The console audit uses a fresh profile, scrolls to comments and observes for 15 seconds (`--seconds` accepts 1–60). It retains vendor requests. Font profiling blocks vendors to isolate font timing; `--without-polish-preload` provides a same-build comparison.

For a diagnostic comparison that blocks Disqus only in the audit browser:

```bash
yarn audit:performance --base-url https://event-driven.io --page /en/introduction_to_event_sourcing/ --runs 3 --label diagnostic-no-disqus --block-pattern '*disqus*'
```

Blocked-vendor results are diagnostic and do not represent the normal page.

### Indexing and error pages

```bash
yarn generate-llms
yarn test:indexing
yarn test:404
yarn audit:indexing --base-url https://event-driven.io --output report/indexing/production.json
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
yarn deploy       # preview
yarn deploy:prod  # production
```

## License

[Creative Commons BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
