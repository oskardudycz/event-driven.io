# AstroPaper structure and native-feature review — 2026-10-21

The earlier feature review did not remove the temporary two-app structure or whole-page React hydration. This review addresses both, using the same two pinned templates from the original research:

- [AstroPaper tree](https://github.com/satnaing/astro-paper/tree/35cfa7fbe0b897306d27670d3819e55d5205f3dd): standard source/public/output boundaries, native layouts, validated glob collections and explicit client behavior.
- [Tailwind Next.js starter](https://github.com/timlrx/tailwind-nextjs-starter-blog/tree/b45bef66b40c63b6f57c15ee8cd090682238df4c): presentation organization and server/client responsibility; its Next.js routing/configuration is not an Astro architecture reference.

The pinned trees and AstroPaper configuration, layout and collection source were inspected. Redundant ESM-only package manifests under source/tooling directories were removed; the root package is the module boundary. Official Astro documentation was checked through the Astro MCP. Context7 tools are unavailable in this session.

| Finding                                                                          | Applied change                                                                                                                                                                                      |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Temporary `astro/src` application beside shared `src`                            | Consolidate routes, layouts, collections, components and libraries in `src`; remove the secondary package/tsconfig and extend Astro’s strict TypeScript preset with the existing stronger checks.   |
| Generated `public` and authored `static` invert Astro conventions                | Use default `public` source and ignored `dist` output. Update hosting, CI, scripts, tests and clean behavior together. Add a clean safety test preserving authored assets.                          |
| Whole-page `client:load` serializes static article/archive data                  | Render static views on the server. Let the Astro layout own main/footer and hydrate only the header and individual interactive features with small props; pass native HTML slots into static views. |
| Class-based asynchronous sharing loader                                          | Remove it; render sharing markup consistently and hydrate it with a native client directive. Keep comments on `client:load`, preserving the existing provider initialization lifecycle.             |
| GraphQL image fields and Gatsby rendering hooks                                  | Use direct cover/image contracts and component-owned semantic image/code hooks. Preserve source licenses and external account/event identities.                                                     |
| React Head factories still model framework-managed head state                    | Use pure metadata functions consumed by `Document.astro`; retain meaningful metadata tests beside these functions and generated head checks.                                                        |
| Application-owned image optimizer/cache and publication writer (previous review) | Native `getImage`, imported images/attachments, deferred glob, static endpoints and official RSS. No custom image file writes, development serving middleware or post-build rewriting.              |

## Deliberate differences from AstroPaper

These are supported Astro usage or preservation of this site's existing behavior, rather than migration scaffolding:

- Root `content/` remains the editorial/import destination. Native glob accepts this base. Moving every article and adjacent attachment would add churn without changing rendering, and nested standalone code examples should stay outside the application TypeScript input.
- Existing React presentation and CSS Modules remain to preserve appearance. Static React components produce HTML without hydration; native slots allow interactive islands inside that HTML. A wholesale Astro markup/Tailwind rewrite is unnecessary for the requested migration.
- Local fonts, bilingual route semantics, MiniSearch covers/results, custom remark editorial semantics and configured providers remain. AstroPaper's fonts/search/content dialect are not substitutes for those requirements.
- The explicit `.cache/astro` location matches CI caching. `build.format: 'preserve'` permits established directory routes alongside literal recovery HTML aliases. These overrides have a concrete hosting purpose.
- Native image transformations feed portable picture markup. The transparency metadata read prevents incorrect backgrounds and performs no optimization or cache writes.
- Maintenance scripts and whole-site tests remain separate from application source. Component/module tests remain beside their owners.

## Verification boundaries

The local generated and browser checks must pass after this structural/islands change. Earlier green suites do not establish that the changed island boundaries work. Current evidence and any unresolved checks are maintained at the top of [todo.md](../todo.md); hosted CI and deployment remain separate.

Official references: [project structure](https://docs.astro.build/en/basics/project-structure/), [islands](https://docs.astro.build/en/concepts/islands/), [framework children and named slots](https://docs.astro.build/en/guides/framework-components/#passing-children-to-framework-components), [image generation](https://docs.astro.build/en/guides/images/#generating-images-with-getimage), [deferred glob](https://docs.astro.build/en/reference/content-loader-reference/#deferrender), [static endpoints](https://docs.astro.build/en/guides/endpoints/#static-file-endpoints).

## Browser lifecycle findings

Native island wrappers require checking visible order and measured element spacing rather than direct DOM sibling classes. Existing geometry values and screenshot tolerances are retained. Stylesheet/font readiness is independent of hydration; style fingerprints wait for navigation items to fit, and the reading flow verifies initial interactive-header readiness and the restored checked theme control before forcing reload. Its strict no-console-error assertion remains, and 15 repeated runs pass.

The CommonJS Disqus named export worked during server rendering but failed as a direct Astro browser island. A small default-exported React component keeps the package boundary inside the React bundle. Comments retain `client:load`, matching their previous initialization behavior.

Rapid reload/navigation before controls hydrate intermittently emitted [React #424](https://react.dev/errors/424) (an early update interrupts hydration). The retained production trace identifies the official React renderer’s unmount callback during the first guide-card click, before header hydration completes. The official integration's concurrent hydration/unmount lifecycle was inspected; the available 7.1.1 patch has identical client renderer code, so it was not installed as a speculative fix. No warning suppression or package patch was added. This early-abort report is not claimed resolved; the hydrated reading-flow check and separate pre-hydration navigation checks cover their respective behaviors.

## Final local evidence

- Native build: 1m 38s with warm caches; 775 HTML routes, 286 redirects and 470 sitemap URLs. Contract and SEO verification pass.
- 91 unit checks; 149 integration/component checks, including the corrected three-check tooling subset after removing redundant package manifests.
- All 73 generated checks pass (19 files, 90.20s). All page heads/publication identities and normalized main text match the preceding native baseline, excluding the retired sharing placeholder/widget markup.
- Complete final production browser suite: 288 pass / 2 existing skips (3.9m); accepted screenshots and tolerances unchanged. All 64 affected hero/reading checks also pass independently.
- Eight cold development interactions pass (24.7s). A temporary unreferenced source article passes addition, edit, deletion, restoration and cleanup in both live HTML and search. Authored source bytes and all 73 moved public assets remain unchanged.
- Lint and strict TypeScript/Astro checks pass (289 checked files). No editorial or visual-reference diff remains.

The English archive's serialized island props shrink from 728,590 characters to 3,375; its static content stays in HTML. This measures transfer structure, not deployed navigation speed. Hosted CI, deployed providers and network performance remain unverified. The pre-hydration React early-abort report described above remains open despite the successful hydrated-flow gate.
