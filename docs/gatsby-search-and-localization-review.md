# Gatsby search and localization review

Reviewed on 2026-10-05 against Gatsby 5.16.1, React 18.3.1, i18next 20.4 and react-i18next 11.11. Package compatibility below comes from the published manifests, not assumptions based on the plugin directory.

## Search without Algolia

Gatsby provides the data/build APIs and documents search integrations; it does not bundle a site-search UI or engine. VitePress's local-search option uses MiniSearch for browser-side fuzzy full-text search. We can use the same engine without changing frameworks. [Gatsby search guide](https://www.gatsbyjs.com/docs/how-to/adding-common-features/adding-search/), [VitePress search](https://vitepress.dev/reference/default-theme-search).

| Option | Fit for this blog |
| --- | --- |
| MiniSearch directly | Recommended next prototype. Version 7.2.0 has no runtime dependencies; supports prefix/fuzzy matches, field boosts and filtering. Generate the index during Gatsby's build and load it only on the search route. |
| gatsby-plugin-local-search | Published 2.0.1 accepts Gatsby >=2.20.0, but uses FlexSearch 0.6 and Lunr 2.3 rather than MiniSearch. Its broad peer range does not prove compatibility; build/browser verification would still be necessary. |
| Current Algolia | Keep operational until the local replacement passes. It provides hosted ranking and analytics; replacing it changes ranking and moves index transfer/memory costs into the browser. |

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

| Option | Verified compatibility and implications |
| --- | --- |
| gatsby-plugin-react-i18next 3.0.1 | Best migration candidate. Its published peers target Gatsby ^5.2.0 and React ^18, but require i18next ^22.0.6 and react-i18next ^12.0.0, so the current translation packages need an upgrade. Provides localized Link/navigation, provider/context, browser language detection and GraphQL-loaded translation resources. |
| gatsby-theme-i18n 3.0.0 | The published release targets Gatsby ^4 and React/ReactDOM ^17 and requires React Helmet and its Gatsby plugin. Not the preferred replacement for the current Gatsby 5/Head setup. |
| Current react-i18next with smaller shared helpers | Lowest-change path. Keeps the existing provider and explicit Gatsby hooks, but consolidates shared selection and path rules so components/indexes cannot drift. Category selection was consolidated in this pass. |

Sources: [react-i18next Gatsby plugin README](https://github.com/microapps/gatsby-plugin-react-i18next), [published plugin manifest](https://registry.npmjs.org/gatsby-plugin-react-i18next/3.0.1), [official theme documentation](https://www.gatsbyjs.com/plugins/gatsby-theme-i18n/), [published theme manifest](https://registry.npmjs.org/gatsby-theme-i18n/3.0.0).

The plugin can remove boilerplate, but it cannot decide the site's editorial translation policy. Our required behavior is explicit:

- Keep `/en/` and `/pl/` paths and existing original-slug redirects, including unconditional English import redirects.
- Let readers navigate to existing placeholder routes, while canonical/hreflang/sitemap/feed output advertises only genuine translations.
- Keep Gatsby Head metadata correct during English/Polish hydration and client navigation.
- Localized category routes share unique article membership, prefer actual translations and link to another canonical language when needed. A missing placeholder file must not hide an article.
- Preserve the established category route set; a locale needs a canonical article to establish a topic route. Reading guides remain editable independently by language.

Recommended next step: prototype gatsby-plugin-react-i18next on static routes and the language picker in isolation, upgrade the translation libraries to the compatible peer ranges, and compare the exact output contract. Keep Markdown article creation and canonical policy explicit until representative native/placeholder articles pass. Check language detection against existing redirect behavior, resource loading against the current shared JSON keys, and browser/SSR provider consistency. Replace each overlapping hook/provider only after its replacement passes; do not enable two route generators simultaneously. Slices remain deferred with the CSS/layout work.

The superseded gatsby-plugin-i18n 1.0.1 is not this candidate. It was removed in commit 0163b29 because its old hooks overlap with the site's own logic; that removal passed the local route/metadata/browser checks.
