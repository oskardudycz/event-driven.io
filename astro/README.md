# Astro site

Astro 7.4.1 is the production publisher. `npm run build` writes the complete bilingual site to `public/`; CI builds and validates that output before its existing Netlify deployment. Gatsby, its adapters/plugins and installation patches have been removed. The former 40-route slice is historical.

```sh
npm ci
npm run dev                         # http://localhost:4321/en/
npm run build
npm run serve -- --port 9000        # Netlify static preview, including redirects/404s
npm run verify:publication         # full local validation; does not publish
```

`ASTRO_OUTPUT_DIR` optionally isolates comparison output. To compare two builds of identical source:

```sh
npm run compare:builds -- --baseline /path/to/baseline --candidate public
```

The historical comparison checks exact routes, ordered redirects, sitemap URLs, feed identities and parsed per-page metadata. Native image filenames intentionally differ, so image metadata URLs are now checked for valid published assets rather than exact Gatsby filename equality. Current-source generated tests separately check actual content, assets, discovery and language relationships; historical fixtures do not pin article bodies/counts. Local cutover results and remaining hosted checks are recorded in [todo.md](../todo.md).

## Implementation

- `src/content.config.ts` uses Astro's built-in `glob()` loader with `deferRender` and retained raw bodies. Astro owns source watching and schema validation. Collection values invalidate derived development render caches; Vite tracks imported parts/images. There are no filesystem revision markers or custom loader.
- `src/lib/site.ts` builds the localized route model, validates guide references and rejects collisions. `getStaticPaths()` discovers routes without rendering content or writing publication files. Each page renders within Astro's page lifecycle.
- `src/layouts/Document.astro` owns metadata, fonts/theme resources and `ClientRouter`. The existing React presentation uses the official React integration and `client:load`; shared locale/theme/menu contexts remain together. Head initialization prevents font/theme flashes and preserves readiness across client navigation. Component-owned CSS and accepted visual references remain intact.
- `src/lib/images.ts` supplies existing presentation markup with URLs from `astro:assets` `getImage()` and imported `ImageMetadata`. Astro owns optimization, output identities, cache, dev image serving and static asset generation. Crops, widths, formats and image priority remain presentation responsibilities. A Sharp metadata read checks alpha so blurred placeholders never sit behind transparent artwork; it does not transform or cache files. Generated Gatsby image URLs are no longer a compatibility requirement. Vite `?url` imports own unprocessed SVG/GIF/download assets.
- Static endpoints under `src/pages` publish feeds (using official `@astrojs/rss`), sitemaps, localized recovery aliases, search data, redirects and the manifest. Static headers and the service-worker retirement script live in `../static`. No generated assets are served through custom Vite middleware and no files are rewritten after the build. Netlify preview remains necessary for hosting redirects and HTTP error statuses.
- The editorial remark plugins preserve authored inline footnotes, headings, code annotations, typography, videos, excerpts and Twitter fallbacks. These are content semantics rather than framework replacements. Bounded provider lookups and persisted source/renderer-aware excerpts keep archive rendering practical; Astro has no equivalent excerpt API for these requirements.

Public environment names remain `GATSBY_DISQUS_NAME`, `GOOGLE_TAG_ID` and `FB_APP_ID` for existing deployment configuration. The legacy `gatsby-route-change` analytics event identity is retained for existing GTM triggers; its name does not imply a Gatsby runtime. No provider/account switch is included.

## Verification boundaries

Vitest checks portable logic, real transforms, generated output and controlled React examples. Playwright Test checks actual SSR/no-JavaScript pages, hydration, client navigation, EN/PL, responsive controls, images, search/provider boundaries and unchanged visual references. See [testing guidance](../docs/testing-guidance.md).

The same-source Gatsby baseline is retained locally under `/tmp/astro-full-gatsby-current`. It was generated and browser-tested before removing Gatsby. Diagnostic content/paired-visual evidence lives under ignored `visual-artifacts/astro-full/`; these are review artifacts, not new accepted references. Live provider accounts, hosted CI and deployed behavior require separate verification after publication. No deployment or IndexNow submission is part of the local migration.

Initial migration acceptance on 2026-10-21 (before the native-feature review below): all 775 routes/heads and publication contracts match the same-source baseline; 79 unit, 162 integration/component and 72 generated checks pass. Full production E2E passes 288 cases with two existing Firefox-only skips; after the final fixed-portrait display correction, all 74 affected hero/homepage checks pass again. All 56 paired captures pass (maximum difference 0.0436%; all homepage pairs identical). No accepted reference or tolerance changed.

Local production navigation including hydration measured 0.42–0.64s. Repeated dev navigation measured 0.96–1.05s; first visits took 1.67–4.64s, with initial post-invalidation archive rendering around 5.5s. These are local measurements with warm persisted assets, not hosted performance promises. The preview is restored on port 4321. Cold dev interactions and real-source search refresh/restoration pass. Full evidence and unresolved dependency/runtime warnings are in todo.md.

## Native-feature review after hosted CI

The first hosted run caught an empty archive cover. The old application-owned image cache used non-atomic filesystem writes/copies; the precise CI interleaving was not reproduced locally. That writer and URL hashing have been removed rather than extended. Current review/verification results are tracked at the top of [todo.md](../todo.md); the earlier timings and counts above describe the initial implementation.

Official references: [Astro images/getImage](https://docs.astro.build/en/guides/images/#generating-images-with-getimage), [dynamic image imports](https://docs.astro.build/en/recipes/dynamically-importing-images/), [glob/deferRender](https://docs.astro.build/en/reference/content-loader-reference/#deferrender), [static endpoints](https://docs.astro.build/en/guides/endpoints/#static-file-endpoints), [RSS](https://docs.astro.build/en/recipes/rss/).
