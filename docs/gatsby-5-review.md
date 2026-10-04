# Gatsby 5 build review

Reviewed on 2026-10-04 against Gatsby 5.16.1 and the 694-page build.

## Changes made

- Route creation queries only IDs, routing metadata, categories and titles. Excerpts and processed covers are queried by the category and article templates instead of being duplicated in page context. Recommendation order remains the frontmatter order. The first local build measured `createPages` at 0.436 seconds; the reported CI run took 36.703 seconds. These are different machines, so this is a diagnostic comparison rather than a controlled benchmark.
- Blog, homepage and newsletter cards use `gatsby-plugin-image` and `gatsbyImageData`, replacing `gatsby-image` and deprecated `fluid` fields. The crop retains the previous 800:360 ratio. JPEG/PNG and WebP remain enabled; AVIF is deliberately omitted to avoid extra image processing.
- Hero image lookup uses the original image path rather than a deprecated `fluid` filter.
- Prism aliases `sh` and `env` to Bash, supporting shell commands and environment variable assignments without changing article text.
- Browserslist's `caniuse-lite` database was updated in `yarn.lock`.
- The intermediate Babel restriction removed the SSR formatting warning. The current pass removes registration entirely: the original ES6 hooks live in native `gatsby-node.mjs`, sharing browser-safe ESM localization settings. Gatsby supports native ESM entrypoints from 5.3.
- YouTube Markdown uses `gatsby-remark-embed-video` 3.2.1 through a local adapter that preserves timestamps and applies the referrer policy required by YouTube.
- Every page and template now exports Gatsby `Head`; `react-helmet` and its Gatsby plugin have been removed. Head receives page context explicitly and uses a fixed-language translator, preserving SEO during parallel SSR and client navigation. The shared font stylesheet is emitted from Head as well. The root translation provider initializes its shared instance once; Gatsby also wraps Head with that provider, so repeated initialization would reset the Polish page to English during hydration. A browser regression check covers both visible headings and metadata.
- `yarn test` now checks the actual HTML of all 192 requested language pages for migrated links, article content and recording markup.

The image migration build completed successfully in 267.63 seconds, with 56.847 seconds spent running page queries and 132.013 seconds processing 659 image jobs. The subsequent Head migration build completed in 138.66 seconds with 45.117 seconds spent running page queries; cached image outputs required no new image jobs. The final rebuild with the translation-provider fix completed in 84.50 seconds. The full `yarn test` suite and all nine browser checks passed. Some archive and category queries still exceed the 15-second warning threshold; moving work out of route creation enables parallel execution but does not eliminate the cost of computing excerpts and image data. CI caching is the next performance improvement to measure.

The schema-definition message and node counts are normal informational output. The Babel deoptimization message concerns code formatting, not an unsuccessful build.

## Further improvements

| Priority | Improvement | Reason and validation |
| --- | --- | --- |
| Implemented; CI verification pending | Cache Gatsby `.cache` and generated `public` between compatible CI builds | The workflow now restores compatible Gatsby caches and saves them after successful build and test gates. Image processing dominates cold builds. Key caches by OS, Node and lockfile/configuration; compare warm build timings and verify the existing output contract. Avoid unconditional `gatsby clean`. |
| Medium | Use Gatsby Slices for the shared header and footer | Updating shared content currently affects every page. Prototype on the layout first and measure rebuild time; verify the existing hydration, scrolling and visual tests. |
| Medium | Audit legacy React dependencies and unused Gatsby plugins | `react-addons-perf` was removed as unused. Active InstantSearch, Facebook widgets and the old internationalization plugin still warrant a separate compatibility review. Check actual usage before removing or upgrading; verify search and language navigation independently. |
| Implemented | Native ESM Gatsby Node hooks | Original ES6 hooks are preserved in gatsby-node.mjs; runtime Babel registration is removed. |
| Implemented | Explicit GraphQL types for stable frontmatter | This can improve schema stability. Schema generation currently takes less than a second, so it is not the current performance bottleneck. |

## Verification

Run `GATSBY_CPU_COUNT=4 yarn build`, then `yarn test`. Start `yarn serve --host 127.0.0.1 --port 9000` and run `yarn test:visual`. This includes a metadata check across client navigation and both languages. Review screenshot differences rather than increasing the comparison tolerance.

## References

- [Gatsby build performance: query only the fields needed to create pages](https://www.gatsbyjs.com/docs/how-to/performance/improving-build-performance/)
- [Migration from gatsby-image](https://www.gatsbyjs.com/docs/reference/release-notes/image-migration-guide/)
- [Gatsby image API](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/)
- [Gatsby Head API](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/)


## Pre-redesign modernization pass

Layout StaticQuery is replaced by useStaticQuery with its class behavior preserved. Resize listeners/timers are cleaned up and font callbacks are guarded after unmount. Stable nullable frontmatter and routing fields have explicit GraphQL types. Proven unused performance/spinner/offline/external-link and obsolete loader/Babel dependencies were removed; directly imported libraries are declared at their existing versions. Search, comments and styled-jsx APIs remain intact.

Build and CodeQL workflow actions now follow current upstream majors (checkout/setup-node/upload-artifact v7, cache v6, CodeQL v4). Yarn downloads and Gatsby output caches are configured; Gatsby cache compatibility includes actual Node runtime, lockfile/configuration, local plugin code, theme/localization and generated public environment values plus indexing mode. Cache save follows build and both test gates. actionlint and YAML parsing pass locally; GitHub execution is pending.

Polish category pages include existing untranslated placeholders with English canonical links. Article navigation includes existing placeholder-language routes, independently of SEO alternates, which still list only genuine translations. Category pages without recommended reading use one divider. Social navigation is LinkedIn, GitHub, Mastodon, Bluesky, YouTube and RSS; README documents per-language category reading order.

`yarn test:cache` is an opt-in integration check using an existing article and its non-indexed Polish placeholder. It modifies/deletes/restores content across warm builds, restores sources and llms.txt in finally, and always disables Algolia indexing. It creates no test publication. Run it only against a local production build with no concurrent source edits.


Final validation: frozen installation, smoke checks, full yarn test, twelve browser checks and actionlint pass. Output remains 694 routes / 222 redirects / 399 sitemap URLs. Final production build: 54.39 seconds. Compatible cold/warm builds: 124.73 / 28.16 seconds, with page-query phases 45.960 / 0.200 seconds. The revised cache integration check passed in 80.53 seconds.

Remaining cold-query work includes MarkdownRemark.excerpt (which invokes the transformed Markdown AST pipeline) and Sharp cover data. Source inspection identifies these as expensive dependencies of the archive/category queries; these measurements are phase timings, not isolated per-resolver timings. The attempted OpenTracing run did not emit resolver spans, so no resolver-level speedup is claimed. Retain needed excerpts/media, preserve caches and profile further before changing their semantics.

Imported code blocks now have explicit syntax labels; JavaScript/js snippets use TypeScript as requested. The Kurrent article's sixteen formerly plain-text examples render Prism keyword tokens and syntax colors. Known source links are relative across article bodies and inbound blog references; unmigrated sources remain external. No temporary cache fixture remains in llms.txt or source content.
