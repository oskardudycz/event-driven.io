# Event-Driven.io

Event-Driven.io - Resources about Event-Driven Architectures, Event Sourcing and pragmatic development

## Importing articles

Install dependencies with Yarn, then import one or more public post URLs:

```sh
npm run import-substack -- https://www.architecture-weekly.com/p/post-slug
npm run import-substack -- https://www.architecture-weekly.com/p/post-slug --category "Event Sourcing"
npm run import-substack -- --manifest import/substack-posts.json
npm run import-articles -- --manifest import/eventstore-posts.json
npm run import-articles -- https://kurrentdb.kurrent.io/blog/post-slug/ --category "Event Sourcing"
npm run test:substack
```

The manifest is an array of `{ "url": "...", "category": "...", "slug": "optional-custom-slug" }` entries. The default category is `Software Architecture`. Dates come from the original publication metadata, and the URL slug determines the blog URL. Imports create `content/posts/YYYY-MM-DD--slug/index.en.md` and `index.pl.md` with identical article text. Polish copies use `useDefaultLangCanonical: true` until translated.

The English article also gets `redirectFrom: /slug/` in its frontmatter. Gatsby uses this to generate an unconditional permanent (301) redirect from `/slug/` to `/en/slug/`, before the catch-all rule. Custom slugs also receive `redirectAliases` for the original source slug at `/source-slug/` and `/en/source-slug/`, pointing to the chosen English URL. No separate redirect file or manual step is needed after importing; redirects take effect when the site is built and deployed. Run `npm run test:redirects` to verify Gatsby's redirect registration and Netlify output.

The Architecture Weekly migration manifest is in [architecture-weekly-missing.json](import/architecture-weekly-missing.json). It records 63 previously missing posts, including webinars, from the newest archive post through **#189, Mastering Database Connection Pooling (2024-08-05), inclusive**. All 63 were imported on 2026-10-04. The [audit](import/architecture-weekly-audit.json) accounts for all 93 archive posts in that range: 63 imported in this batch and 30 already present. Existing posts keep their current canonical blog slugs and have redirects for their original Substack slugs. The manifest is retained as a migration record; running it again refuses to overwrite these articles. Verify the migration with:

```sh
npm run test:archive
```

The audit records the archive IDs, publication dates, existing directories, match evidence, and video mappings. The supplied YouTube playlist contains two of the recordings in this date range; six more were found on the same channel, and two articles already embed their recording. All ten recording posts have `youtubeVideo` IDs in the manifest. `test:archive` checks the reviewed snapshot, manifest coverage, cutoff, recording mappings and existing redirects. The audit's existing/missing statuses reflect the repository when the manifest was prepared; the check also accepts subsequent imports with matching source metadata. If a batch fails, use a separate retry manifest containing only its remaining entries.

For future webinar imports, add `"youtubeVideo": "VIDEO_ID"` to the manifest entry. The importer inserts a YouTube player at the start of the article when that video is absent, including when Substack's native player sits outside the article body. To replace a linked recording card or thumbnail within the text, add `"recordingEmbeds": { "https://publication.substack.com/p/recording-slug": "VIDEO_ID" }`. Mapped cards are replaced before downloading their thumbnails; other article images and contextual embeds remain. IDs must be 11-character YouTube video IDs. Both languages get the same embeds, and source metadata records the mappings.

`import-articles` supports Substack, Kurrent/EventStore blog pages and dated Wayback capture URLs. `import-substack` remains a compatible alias. Archived articles use the original publication date and URL slug, fetch the raw capture without the Wayback toolbar, and download assets from the same capture date. Article links are restored to their original URLs. Kurrent's actual article hero is used as the cover instead of the site's default social logo. SVG diagrams stay as local SVG files; SVG covers also get a PNG thumbnail generated with Sharp. Code languages are preserved from both conventional classes and Kurrent's syntax-highlighted HTML.

The importer extracts the article body, excluding Substack navigation, subscription controls, obsolete paid/trial prompts and comments. It preserves headings, emphasis, lists, quotes, code, tables, links and image captions. Images and the social cover are downloaded into the article directory, deduplicated and referenced locally. Original Substack images are preferred; if a legacy original is unavailable, its publicly available Substack CDN copy is downloaded instead. YouTube players become the Gatsby plugin's Markdown embed syntax; other video/audio players and iframes are retained, with media streams hosted by the provider. Social blockquotes retain their text and links, but provider scripts are omitted, so review these embeds after import. Review unfamiliar interactive embeds manually as well.

Links to available blog articles are rewritten to relative `/en/slug/` URLs, including links to posts later in the same import batch. The importer resolves original source URLs from source metadata, redirect aliases and [verified title/slug aliases](import/architecture-weekly-link-aliases.json). Blog links retain their query parameters and fragments while newsletter tracking parameters are removed. Older posts without a blog version, webinar index pages and source comment threads keep their source links. The [link report](import/architecture-weekly-link-report.json) lists those remaining external references.

For a saved full page, use `npm run import-articles -- POST_URL --html saved-page.html`; images still need network access. Incomplete metadata, detected paywalls and failed/unsupported image downloads fail the import. An empty legacy paywall marker is accepted only when Substack marks the post public and its full source body matches the rendered content. Existing article slugs are never overwritten. Each article is staged before being added; if a batch fails, earlier successful imports remain. Remove successful entries from the manifest before retrying the rest. `article-source.txt` (or `substack-source.txt` for Substack; JSON formatted) records the source URL and downloaded asset URLs for review.

Conversion uses [Turndown](https://github.com/mixmark-io/turndown) and [its GFM plugin](https://github.com/mixmark-io/turndown-plugin-gfm), with Cheerio for Substack extraction and asset rewriting. [Substack2Markdown](https://github.com/timf34/Substack2Markdown) also supports post exports and image downloads, but is a separate Python workflow. [rehype-remark](https://github.com/rehypejs/rehype-remark) is an alternative HTML-to-Markdown pipeline; Turndown's custom rules fit the existing CommonJS import scripts and raw Gatsby embeds.

## YouTube embeds

Markdown articles use the syntax `` `youtube: [Video title](https://www.youtube.com/watch?v=VIDEO_ID&start=30)` ``. Gatsby recommends [gatsby-remark-embed-video](https://www.gatsbyjs.com/docs/how-to/images-and-media/working-with-video/), now updated to 3.2.1 to fix bare video IDs. The local [integration](plugins/gatsby-remark-video/index.js) delegates rendering to that plugin, preserves URL parameters its ID extraction otherwise drops, and configures lazy loading, privacy-enhanced YouTube URLs, player permissions and the referrer policy. Imported article Markdown contains no handwritten YouTube iframe markup.

YouTube embeds require a cross-origin referrer. The Netlify plugin configuration overrides its default `same-origin` referrer policy with `strict-origin-when-cross-origin`; removing this override can cause YouTube player configuration error 153. The click-to-play component and imported YouTube iframes also set this policy explicitly. Run `npm run test:video` to check the generated Netlify headers. See [YouTube's client identity requirements](https://developers.google.com/youtube/terms/required-minimum-functionality#api-client-identity-and-credentials).

Code blocks preserve source language labels; the importer recognizes clear TypeScript, SQL, C#, JSON, shell, XML and INI examples when labels are absent. JavaScript (`javascript`/`js`) labels and unlabelled TS/JS-style examples use `typescript`, as the blog uses TypeScript. Explicit labels for other languages are retained. Plain output and directory trees remain `text`. Set `"codeLanguage": "typescript"` on a manifest entry when the source marks all examples as plain text. Known EventStore/Kurrent domain aliases also resolve to relative blog URLs.

## Category reading order

Edit `data/category-guides.json`. Each entry is identified by `language` (`en` or `pl`) and the category's URL `slug`. Its `description` appears on the category pages. The `recommended` array controls the numbered reading sequence, in exactly the order listed:

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

Use the article URL slug without `/en/`, `/pl/`, surrounding slashes or the date prefix. Each article must belong to that category through a canonical translation's `category` or `categories` frontmatter. The card uses the guide's language when translated, otherwise a canonical available language. Listed articles appear first with reading-order numbers; the remaining articles follow by publication date. An empty array shows the chronological list alone. Missing or out-of-category slugs are currently ignored, so check the rendered page after editing.

English and Polish guide orders are independent. Event Sourcing currently uses the same eight-step sequence in both. Existing localized category pages share the same unique article set, even when a placeholder file is missing. Cards prefer a real translation and otherwise link to the canonical English article (or the original language for a Polish-only article). Placeholder copies do not define category membership. Adding a guide alone does not create a category route: at least one canonical article in that language must belong to the category.

Run `yarn build && yarn test`, then inspect `/en/category/event-sourcing/` or its Polish counterpart. Reading order does not change article dates or URLs. Article-footer recommendations are separate: set an article's `related` frontmatter array to control those links.

## Gatsby 5 build checks

See [the build review](docs/gatsby-5-review.md) for the image and query migrations, warning fixes and further improvements. `yarn test` includes `test:import-build`, which checks the generated HTML for all requested imports. Run the production build before these tests.

## License

This blog is licensed under [License Creative Commons BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## Included configuration

1. Tracking with Google Analytics through Google Tag manager:

- [Setting up the Google Analytics 4 Property with Google Tag Manager](https://www.youtube.com/watch?v=-J4feudVguc)
- [Gatsby Google Tag Manager Config](https://www.gatsbyjs.com/plugins/gatsby-plugin-google-tagmanager/)

## Gatsby validation and lint

Use Node 24 and Yarn 1. Run `yarn smoke` and `yarn lint` for fast syntax, GraphQL and correctness checks. Then run `yarn build` and `yarn test`. For browser checks, serve the generated site on port 9000 and run `yarn test:visual`; matching Playwright and Chromium packages are installed as development dependencies by Yarn. If the browser cache is missing, run `yarn browsers:install`; on Linux CI use `yarn browsers:install:ci` to install OS libraries too.

The SEO checks require exactly one H1 in every generated page, including Polish placeholders, search and 404 pages. Gatsby's internal HTML fragments are excluded. Missing or duplicate main headings fail `yarn test:seo` and the CI gate before deployment. Browser checks also cover training-page hydration and language navigation.

For repeatable mobile Lighthouse audits, run `yarn audit:performance --base-url https://event-driven.io --label baseline`. It uses Lighthouse 13.5.0, the lockfile's Playwright Chromium, three fresh browser sessions per page, and saves JSON reports under the ignored `report/performance/` directory. Browser profiles are temporary and cleaned up. See [the audit procedure and proposals](docs/pagespeed-review.md) for installation, comparable local/production runs, limitations and the proposed Giscus migration. This command audits the site; it does not change the UI, deploy or migrate comments.

`lint:modern` remains a compatibility alias for the full ESLint gate. `eslint.config.mjs` supports ESM, JSX and TypeScript syntax and checks React hooks. It does not type-check TypeScript. `yarn lint` additionally checks Prettier; the previous legacy lint/format backlog has been corrected.

CI runs the full lint/format gate before building. Browser search checks run real local MiniSearch queries in both languages. Builds generate local indexes and never contact a hosted search service. Production search behavior remains a separate deployment check.

Safe performance regressions run with `yarn test:performance` (also included in `yarn test`) after building. They check English/Polish cover priority, lazy loading and WebP fallback throughout generated Markdown, local font preloads, portrait dimensions and batched menu measurements. `yarn test:visual` additionally verifies responsive image slots at DPR 1/2 and automatic offscreen-newsletter loading, alongside the existing layout/navigation screenshots. Decisions needing your review and their reasons are listed in [the PageSpeed review](docs/pagespeed-review.md#decision-record--only-choices-2-and-4-await-review).

## Formatting, linting and editor setup

Run `yarn --frozen-lockfile` on Node 24. Installation runs `prepare` to configure the Husky pre-commit hook. Every commit runs `yarn lint-staged`: staged code receives ESLint fixes (including Prettier), and staged configuration/documentation receives Prettier formatting. Partially staged changes use lint-staged's normal backup/hiding behavior. No build or browser suite runs in the hook; CI runs the full checks.

- `yarn lint`: check ESLint and Prettier across maintained source, scripts, tests and documentation.
- `yarn fix`: apply ESLint fixes, then Prettier formatting.
- `yarn lint:eslint` / `yarn lint:prettier`: run either check separately.
- `yarn lint-staged`: run the same checks used by the pre-commit hook against staged files.

The native ESM `eslint.config.mjs` is the single lint configuration. The existing styling plugins use a pinned `deasync` 0.1.31 patch for Node 24 native-binary compatibility. Like Pongo, this repo uses single quotes, two-space indentation, flat ESLint configuration and Prettier integration. ESLint 9 is used for compatibility with the React plugin's supported peer versions; Pongo's TypeScript-only rules and database-specific restrictions do not apply to Gatsby. VS Code's committed settings and extension recommendations enable Prettier formatting and ESLint fixes on save. Automatic import organization is omitted because this site has side-effect imports and loader imports whose order must be preserved.

Generated output, static assets, imported article content and test fixtures are excluded from bulk formatting. This protects article code examples and stored build contracts. Fixing lint does not modify the article text.

### Actual publication timestamps

An article can optionally include a quoted frontmatter timestamp such as `publishedAt: '2026-10-05T12:34:56+02:00'` when that time is known from the source. The timezone is required. Gatsby uses it for BlogPosting `datePublished` and Open Graph `article:published_time`; invalid timestamps fail validation. The article's displayed date, route and ordering still use its existing filename date. Import scripts retain source timestamps when available. Historical date-only values stay date-only; no midnight publication times are invented, so legacy rich-result warnings may remain.

## Local search

Search cards use shared green/neutral theme tokens and Gatsby-generated local cover thumbnails. Canonical fallback results keep the canonical article’s cover; entries without artwork remain text-only. Run `yarn test:search` for index/rendering checks and `yarn test:visual` for bilingual cover, color, keyboard and responsive-card regressions.

MiniSearch replaces Algolia. `yarn develop` generates the indexes at startup and refreshes them after Markdown changes. Reload the search page to consume a regenerated index. Every Gatsby production build recreates English and Polish indexes under `public/search-index/`, using content-hashed filenames and a refreshed manifest. Readers download only their selected index and the engine after entering a search query. Search prefers genuine translations and labels canonical-language fallback links, returns one hit per article, retains categories/dates and pagination, and supports Polish diacritics, prefixes, typos and code identifiers. Result text is escaped before highlighting.

Run `yarn test:search` after building for index, locale, stale-content and safe-rendering regressions. Run `yarn test:visual` against `yarn serve -H 127.0.0.1 -p 9000` for real browser searches and failure/retry checks. `yarn measure:search` measures initialization, query time and retained heap over three Chromium runs per locale with 4× CPU throttling; these are lab measurements, not real-device guarantees. `yarn test:cache` additionally modifies/deletes/restores an existing article across warm builds and verifies search data follows those changes. Do not run that integration check alongside content edits.

To repeat development refresh checks, start `yarn develop -H 127.0.0.1 -p 8001` and run `yarn test:search:dev` in another terminal. It temporarily modifies/deletes/restores an existing article; keep content edits paused during that check. Set `DEV_SEARCH_BASE_URL` if using another address.

No Algolia credentials are needed for installation, CI or deployment. The old account/index is not deleted by this change; any account cleanup is a separate owner action. Localization-provider migration remains a separate next step.
