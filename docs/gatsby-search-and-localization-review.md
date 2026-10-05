# Gatsby search and localization review

## MiniSearch implementation status — 2026-10-05

The approved local-search replacement is implemented. Gatsby generates one English and one Polish index from current Markdown nodes; real translations take precedence, placeholders are excluded, and untranslated articles link to the canonical language with a visible language label. The engine and index are requested only after typing. Results retain the existing card/metadata/pagination styling and escape text before highlighting; loading, empty, error/retry and keyboard controls are localized. Content-hashed files plus a revalidated manifest replace stale indexes on each build.

The prototype passed the production build, full tests, five search regressions (including rendered XSS checks) and all 25 browser checks before Algolia removal. Algolia/InstantSearch packages, public configuration, build indexing, credentials in CI, branding and cache-key indexing partitions have now been removed. The external account/index remains untouched. Final post-removal verification passes: full tests, all 25 browser checks, frozen install, lint/format, smoke, actionlint and warm-cache modification/deletion/restoration. Exact route/redirect/sitemap/feed contracts and screenshots are unchanged. CI/deployment remain separate checks. The localization-provider migration below is still a later stage.

Prototype size: 336 unique documents per language, approximately 5.8MB raw / 1.7MB gzip. This is a first-use search download, not a cost added to other pages or an empty search. Full article text remains searchable and supplies contextual snippets, including code identifiers. Asynchronous loading avoids treating all initialization as one synchronous task. Controlled Chromium measurements with 4× CPU throttling check initialization/query time and retained heap; this is not a real-phone or slow-network guarantee. Run `yarn measure:search` for a repeatable three-run measurement on the current build. Brotli size in final build metrics is an estimate at quality 4, not a claim about a CDN's encoding.

The implementation uses [MiniSearch loadJSONAsync](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html#loadJSONAsync) and [documented search options](https://lucaong.github.io/minisearch/types/MiniSearch.SearchOptions.html). The remaining comparison below records the original research/selection rationale rather than pending approval for MiniSearch.

Reviewed on 2026-10-05 against Gatsby 5.16.1, React 18.3.1, i18next 20.4 and react-i18next 11.11. Package compatibility below comes from the published manifests, not assumptions based on the plugin directory.

## Search without Algolia

Gatsby provides the data/build APIs and documents search integrations; it does not bundle a site-search UI or engine. VitePress's local-search option uses MiniSearch for browser-side fuzzy full-text search. We can use the same engine without changing frameworks. [Gatsby search guide](https://www.gatsbyjs.com/docs/how-to/adding-common-features/adding-search/), [VitePress search](https://vitepress.dev/reference/default-theme-search).

| Option                     | Fit for this blog                                                                                                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MiniSearch directly        | Recommended next prototype. Version 7.2.0 has no runtime dependencies; supports prefix/fuzzy matches, field boosts and filtering. Generate the index during Gatsby's build and load it only on the search route. |
| gatsby-plugin-local-search | Published 2.0.1 accepts Gatsby >=2.20.0, but uses FlexSearch 0.6 and Lunr 2.3 rather than MiniSearch. Its broad peer range does not prove compatibility; build/browser verification would still be necessary.    |
| Current Algolia            | Keep operational until the local replacement passes. It provides hosted ranking and analytics; replacing it changes ranking and moves index transfer/memory costs into the browser.                              |

Sources: [MiniSearch documentation](https://github.com/lucaong/minisearch), [published MiniSearch manifest](https://registry.npmjs.org/minisearch/7.2.0), [published local-search plugin manifest](https://registry.npmjs.org/gatsby-plugin-local-search/2.0.1).

The current site already has canonical article paths, categories, publication dates, language information and searchable Markdown content in its Gatsby graph. No external crawler or search server is required to generate local search data. The current Algolia transformer excludes placeholder translations and emits 4500-character chunks; local search should deduplicate article hits and preserve useful code text, headings and contextual snippets.

Next implementation sequence:

1. Build a measured MiniSearch prototype from the existing content graph. Record compressed index size, initialization time and mobile memory/use responsiveness before adopting it.
2. Generate separate locale indexes and load the engine/index only when search is opened. Prefer genuine translations, with canonical-language fallback for untranslated articles, matching category discovery. Keep relative article URLs and exclude utility/no-index pages.
3. Retain the existing search layout and localized labels, categories, dates, pagination and keyboard accessibility. Add safe highlighting/snippets, loading, empty and failure states. Check English/Polish queries, diacritics, typos, prefix matching and code identifiers.
4. Verify static generation, client navigation and modified/deleted-content index updates. Browser tests must perform real local searches without Algolia credentials or network requests; retain the route/SEO contract.
5. Remove Algolia build/browser packages, public configuration, indexing credentials in workflow references and cache-key indexing partitions after the replacement passes. Removing repository references does not delete an external account or its index.

No search engine was replaced in this pass. The unused InstantSearch umbrella package was removed; the active DOM integration remains and has English/Polish mocked browser regression coverage.

## Multilingual Gatsby options

Gatsby's localization guide describes React libraries and routing integrations rather than a built-in multilingual mode. The site already uses react-i18next for UI translations; the custom part is routing, language availability, fallback/canonical policy and page metadata. [Gatsby localization guide](https://www.gatsbyjs.com/docs/how-to/adding-common-features/localization-i18n/).

| Option                                            | Verified compatibility and implications                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| gatsby-plugin-react-i18next 3.0.1                 | Best migration candidate. Its published peers target Gatsby ^5.2.0 and React ^18, but require i18next ^22.0.6 and react-i18next ^12.0.0, so the current translation packages need an upgrade. Provides localized Link/navigation, provider/context, browser language detection and GraphQL-loaded translation resources. |
| gatsby-theme-i18n 3.0.0                           | The published release targets Gatsby ^4 and React/ReactDOM ^17 and requires React Helmet and its Gatsby plugin. Not the preferred replacement for the current Gatsby 5/Head setup.                                                                                                                                       |
| Current react-i18next with smaller shared helpers | Lowest-change path. Keeps the existing provider and explicit Gatsby hooks, but consolidates shared selection and path rules so components/indexes cannot drift. Category selection was consolidated in this pass.                                                                                                        |

Sources: [react-i18next Gatsby plugin README](https://github.com/microapps/gatsby-plugin-react-i18next), [published plugin manifest](https://registry.npmjs.org/gatsby-plugin-react-i18next/3.0.1), [official theme documentation](https://www.gatsbyjs.com/plugins/gatsby-theme-i18n/), [published theme manifest](https://registry.npmjs.org/gatsby-theme-i18n/3.0.0).

The plugin can remove boilerplate, but it cannot decide the site's editorial translation policy. Our required behavior is explicit:

- Keep `/en/` and `/pl/` paths and existing original-slug redirects, including unconditional English import redirects.
- Let readers navigate to existing placeholder routes, while canonical/hreflang/sitemap/feed output advertises only genuine translations.
- Keep Gatsby Head metadata correct during English/Polish hydration and client navigation.
- Localized category routes share unique article membership, prefer actual translations and link to another canonical language when needed. A missing placeholder file must not hide an article.
- Preserve the established category route set; a locale needs a canonical article to establish a topic route. Reading guides remain editable independently by language.

Recommended next step: prototype gatsby-plugin-react-i18next on static routes and the language picker in isolation, upgrade the translation libraries to the compatible peer ranges, and compare the exact output contract. Keep Markdown article creation and canonical policy explicit until representative native/placeholder articles pass. Check language detection against existing redirect behavior, resource loading against the current shared JSON keys, and browser/SSR provider consistency. Replace each overlapping hook/provider only after its replacement passes; do not enable two route generators simultaneously. Slices remain deferred with the CSS/layout work.

The superseded gatsby-plugin-i18n 1.0.1 is not this candidate. It was removed in commit 0163b29 because its old hooks overlap with the site's own logic; that removal passed the local route/metadata/browser checks.

## Final local search measurements and verification

| Locale  | Unique documents | Raw bytes | Gzip bytes | Median initialization at 4× CPU | Median maximum tested-query time | Retained index heap |
| ------- | ---------------: | --------: | ---------: | ------------------------------: | -------------------------------: | ------------------: |
| English |              336 | 5,776,878 |  1,737,205 |                         426.6ms |                           22.4ms |            16.34MiB |
| Polish  |              336 | 5,798,520 |  1,742,890 |                         444.3ms |                           22.3ms |            16.55MiB |

Three fresh standalone Chromium runs per language. Initialization excludes network transfer; heap is measured after garbage collection and is not the whole site's footprint. The approximately 1.7MB first-use gzip download is a material trade-off of full-text local search. No whole-page Lighthouse or real-phone speedup is claimed. If deployment checks show this first-use cost is too high, shared fallback data or smaller/sharded indexes are later options that need their own measured comparison.

Final production build passed after Algolia removal; full tests (35.27s), 25 browser checks (61.57s), frozen install, lint/format, smoke and actionlint pass. The warm-cache check (139.76s) verifies modified content, canonical deletion, fallback behavior, stale asset cleanup and exact source/llms restoration. Development checks verify the same source refresh lifecycle; `yarn test:search:dev` is available alongside `yarn test:search`, `yarn test:cache` and `yarn measure:search`. Browser checks prove no engine/index download before typing, real EN/PL searches, code identifiers, pagination, empty states, failure/retry and no hosted requests. Rendering checks verify malicious source text is escaped while matched terms remain highlighted.

Development regeneration uses Gatsby's documented [createPages](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#createPages) and [onPostBootstrap](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#onPostBootstrap); production generation uses [onPostBuild](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#onPostBuild). Reload a development search page to consume regenerated data. CI execution and production/mobile checks remain pending. No external search account/index was deleted and no localization-provider migration was included.
