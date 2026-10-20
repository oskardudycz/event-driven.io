# gatsby-plugin-sharp placeholder sharing

`patches/gatsby-plugin-sharp+5.16.0.patch` corrects repeated placeholder generation in gatsby-plugin-sharp 5.16.0. It is a local patch, not an upstream release or a documented plugin option. Upstream `master` has the same code.

## Cause and correction

Listing pages (`index.tsx`, `articles.tsx`, `newsletter-pl.tsx`, `TagTemplate.tsx`) request covers with identical `gatsbyImageData(... placeholder: BLURRED)` arguments, so a cover's 20px placeholder has one cache key. The plugin's `cachifiedProcess` reads the cache, generates on a miss, and writes the result afterwards. Page queries run in parallel; on a cold cache every query that lists the cover misses before the first write and decodes the full source image again.

The patch keeps the pending result per cache key and returns it to concurrent requests. The result, cache key, cache writes and query arguments are unchanged; generated images and HTML stay the same.

Reproduction: `tests/images/placeholders.int.test.ts` makes four concurrent placeholder requests for one cover through the real plugin and Gatsby cache, in a separate Node process because Gatsby's reporter replaces the console. Without the patch it records four generations; with it, one, and all four results are the same data URI.

## Measured effect

One local cold build each, same source copy, 2 cores, timing hook loaded in both:

| Measurement                                | Unpatched | Patched |
| ------------------------------------------ | --------: | ------: |
| Query phase                                |    233.6s |  140.7s |
| Queries over 15s                           |        12 |       9 |
| Slowest (`/en/articles/tag/architecture/`) |      140s |     64s |
| Summed query time                          |      909s |    551s |

The remaining warnings are on tag pages. Gatsby's 2,564 image-processing jobs (564s) start during the query phase and compete for the same cores; the warning measures wall time. Placeholder strategy and cover source sizes are separate owner decisions.

## Installation and maintenance

- gatsby-plugin-sharp is pinned to 5.16.0. Normal npm installation applies the patch through `postinstall`; patch failures stop installation. After `--ignore-scripts`, run `npm run postinstall`.
- Gatsby cache compatibility already includes the patch directory.
- Before upgrading, run the placeholder test against the unpatched candidate. Remove the patch and pin when a release passes it.
