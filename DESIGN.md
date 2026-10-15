# Design and evolution of event-driven.io

Updated 2026-10-14. Start here for visual work. This is the process recommendation. The accessibility/icon cleanup is implemented locally; the orange palette is now implemented locally, while Storybook, Figma imports and Astro migration remain pending.

The aim is a recognisable personal technical blog that is comfortable to read and straightforward to change. Use a few clear decisions, real components and visible examples. Add tooling when it removes recurring work.

## What lives where

| Place                                                                                                             | Responsibility                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| This file                                                                                                         | Short process, current boundaries and pointers.                                                                                                         |
| [Tokens](src/theme/tokens.css), [global styles](src/theme/global.css), [Tailwind aliases](src/theme/tailwind.css) | Actual implemented colour, type and spacing values. Keep one editable source for values.                                                                |
| Owned components and CSS Modules                                                                                  | Actual markup, presentation and interactions.                                                                                                           |
| Component catalogue                                                                                               | Examples of real components. The [Vite gallery](tests/gallery/editorial.story.tsx) exists today; a lean Storybook is the recommended next tooling step. |
| Figma, when useful                                                                                                | Explore and review visual choices, starting with imported current pages.                                                                                |
| [Testing guidance](docs/testing-guidance.md), [plan](plan.md), [todo](todo.md)                                    | Validation responsibilities, strategy and evidence.                                                                                                     |

Figma and the catalogue present the design. Keep their accepted examples aligned with implementation rather than maintaining independent token systems. Existing code describes current behaviour; inherited assets are not automatically intentional brand choices.

## Baseline and open decisions

Preserve layout, Open Sans, natural photography, hero portrait/yellow diagonal and one coherent tile background. Preserve routes, content, EN/PL navigation and light/dark/system behaviour.

The owner subsequently requested tighter hero height/mobile spacing and coherent lower navigation; the [proportions review](docs/hero-proportions-review.md) records the rejected content-height proposal and the current full-screen comparison. The owner prefers keeping all biography in the hero and also requested an alternative without it. Both gap-adjustment comparisons were rejected. A structural revision is now implemented locally: grouped introduction, biography and service actions, with the article action directly below the service actions, aligned with the copy. The owner rejected the separate centred bottom cue because it was easy to miss. The owner has ruled out the full-height no-biography version; it has been removed from the active gallery. Full biography remains in the hero. Font sizes and authored artwork remain unchanged. Composition acceptance remains pending. The owner subsequently flags overall orange/yellow consistency; the first palette implementation is under visual review, not a settled cohesive brand direction. Review hero, navigation and article cards together before further palette edits. The palette illustration also previews stronger light links and a shared brighter action fill after owner feedback. These colour refinements remain proposals; the implementation below still uses the first authorised palette. The guide's proportion/brand-building rules are in [branding-guide.md](docs/branding-guide.md#proportions-and-visual-hierarchy).

The [branding guide](docs/branding-guide.md) records the owner-authorised orange interaction palette: burnt orange in light mode, lighter orange in dark mode, yellow hero emphasis and neutral reading surfaces. It is implemented locally; hosted/deployed verification is separate. The [image/font review](docs/imagery-and-typography-review.md) records the original icon issues. The owner accepted retaining the existing orange/yellow geometric mark; the icons/references are corrected locally. Its 60px source remains a limitation for large app icons, so a sharper equivalent master is a later refinement. Alternative fonts remain optional comparisons.

## Process

### Checking conformance and responsiveness

Use existing examples and runners to check observable rules from the guide. A screenshot passing is evidence of consistency with its reference, not evidence that the reference is a good design. Owner feedback can change the agreed requirement; update the guide before accepting a new reference.

| Responsibility               | Check                                                                                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Colour roles and readability | Compare actual token/component uses; browser-check normal, hover, focus, selected and composited highlights in both themes. Preserve prose underlines and non-colour state cues.                                                                 |
| Typography and imagery       | Load real Open Sans and approved assets; check fallback fonts, Polish glyphs, transparent artwork and actual text/photo separation.                                                                                                              |
| Responsive behaviour         | Check EN/PL at narrow, tablet and desktop widths, short/tall viewports, enlarged fonts, SSR and hydration. Assert no horizontal overflow, actionable controls and clear fixed navigation.                                                        |
| Homepage composition         | Preserve the full-screen hero. Retain all biography in the primary proposal. Review tighter grouping and responsive actions with the full biography; allow natural scrolling on short phones. Review before adopting new composition references. |
| Visual judgment              | Compare controlled examples and actual page captures. Review hierarchy, spacing, image balance and reading comfort manually. Contrast arithmetic and bounding boxes cannot decide these qualities.                                               |

The existing component/browser/generated tests and Playwright site matrices cover these boundaries; extend their relevant cases when a concrete requirement is missing. Keep screenshot tolerances and runner responsibilities intact. Use the same criteria in a later Storybook catalogue rather than building a separate conformance framework.

### Review and implementation cycle

1. **Establish the baseline.** Reuse accepted references and representative current home/article/archive/search examples. Record the source revision or deployment and wait for real fonts/images. If Figma helps, import rendered pages using [code to canvas](https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/) or its [browser extension](https://www.figma.com/downloads/chrome-extension/). Check fidelity and organise only what we intend to change. Imports do not recover React APIs or responsive rules automatically. Figma is optional; running examples can also support review.
2. **Review a concrete change.** Compare current/proposed appearance with identical content and viewports. Change one coherent responsibility at a time. Initially resolve the accent hierarchy and icon master while retaining typography and hero composition; address demonstrated date/number contrast independently. Separate framework migration from branding changes.
3. **Implement and verify.** Edit shared tokens and owning components. Check affected reading/control states, keyboard/focus, contrast, relevant EN/PL/mobile/desktop/light/dark states and loading/fallback behaviour. Use colour-vision/forced-colour checks where relevant. Keep Vitest for logic/components/generated output and Playwright for actual site integration. Review intentional reference changes; preserve tolerances. Update decisions/examples alongside accepted changes and separate local, hosted CI and deployed evidence.
4. **Adopt a lean catalogue after the palette pass.** Start Storybook with the existing portable AuthorView, ArchiveCard, ReadingList and SearchResult, reusing controlled data. Include typed component stories, theme/locale/viewport selection and an accessibility panel. Add prose, controls and transparent-image examples as work needs them. Load real fonts, global styles and component-owned CSS. Verify compatibility/parity before replacing the manual gallery launcher; maintain one preview catalogue. Keep existing tests initially. MCP can follow once component lookup is useful; its [AI features are preview](https://storybook.js.org/docs/ai/mcp/overview).
5. **Repeat at a useful scale.** An LLM reads this entry, inspects the relevant source/example, changes it and checks the rendered result. Reuse approved assets and verified component APIs; report conflicts/proposals. Extra token pipelines, a custom MCP server or a broad component framework need a concrete recurring problem to justify them.

## Keep the work useful for Astro

[Astro supports React rendering and hydration](https://docs.astro.build/en/guides/integrations-guide/react/). Existing portable views and their stories can remain useful during migration. Keep plain data, native ESM/TypeScript, CSS variables and component-owned styles; use existing adapter boundaries rather than extracting a generic framework or new package.

| Carries forward                                                  | Needs migration work                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Accepted brand decisions, artwork/fonts, tokens and portable CSS | Resource loading, first-paint integration and framework-specific styling dependencies |
| Portable React views, controlled data and component tests        | Gatsby links/images, GraphQL, page generation and layout/provider lifecycle           |
| Domain logic and public route/content/SEO assertions             | Content/Markdown processing, generated-output readers and preview-server setup        |

Astro's [islands architecture](https://docs.astro.build/en/concepts/islands/) offers HTML for reading content with client JavaScript for interactive features. Retain useful React views initially; static views need no hydration. Choose the search/menu/theme interaction boundaries deliberately. [Hydrated island inputs must be serializable](https://docs.astro.build/en/guides/framework-components/#passing-props-to-framework-components): current callback props such as `renderLink` belong inside their rendering tree. React context does not automatically span separate islands.

React Storybook examples validate React views. They do not certify `.astro` layouts, processed images, extracted CSS or island hydration. If a component later becomes `.astro`, move its checks to the appropriate Astro/site boundary and retire redundant React examples. Do not keep a second production component just to satisfy Storybook. Follow the existing [Astro testing guidance](docs/testing-guidance.md#astro-compatibility).

Migration remains a separate decision. When pursued, begin with a representative article and EN/PL route pair, preserving Gatsby as the comparison. Use the [official migration guide](https://docs.astro.build/en/guides/migrate-to-astro/from-gatsby/), evaluate [typed content collections](https://docs.astro.build/en/guides/content-collections/) and verify [image processing](https://docs.astro.build/en/guides/images/) against current needs. Before cutover preserve content, canonical URLs/redirects, category order, translation fallback, search, feeds/sitemap/metadata, image alternatives/transparency, embeds, comments/sharing, analytics and IndexNow.

Expected opportunities are less client JavaScript, simpler content integration and fewer Gatsby-specific dependencies. Measure page payloads, first paint/layout stability, interactions, editorial refresh and cold/warm build/image-processing time. Astro does not guarantee faster image builds or remove third-party payloads. Establish visual and behavioural parity first, then improve it through the same process.

## Improvement order

1. Correct demonstrated accessibility/asset issues: dates/number markers, icon identity/paths and contextual search-field contrast.
2. Apply and verify the authorised palette using current examples; then establish the lean catalogue.
3. Improve specific content experiences: live-text registration/testimonials, useful image descriptions and consistent social-card templates.
4. Profile fonts, page payloads and build cost; make measured improvements with existing tools.
5. Evaluate an Astro parity slice when migration becomes a priority. Add Figma Code Connect, hosted visual review or token synchronisation only when maintaining them replaces recurring manual work.

The supporting [LLM tools review](docs/llm-design-consistency-review.md) holds research and rough Storybook estimates. This is the process entry point; supporting reviews hold detailed evidence. Local contrast and icon fixes are recorded in todo.md; deployed verification is pending. No catalogue installation, Figma import, font replacement or Astro migration is claimed. The local orange-palette implementation and its validation are recorded in todo.md.
