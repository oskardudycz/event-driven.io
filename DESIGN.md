# Design and evolution of event-driven.io

Updated 2026-10-14. Start here for visual work. This is the process recommendation. The accessibility/icon cleanup is implemented locally; the proposed palette, Storybook, Figma imports and Astro migration remain pending.

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

The [branding guide](docs/branding-guide.md) proposes orange interaction accents with yellow hero emphasis and neutral reading surfaces. This palette is **proposed**, not current. The [image/font review](docs/imagery-and-typography-review.md) records the original icon issues. The owner accepted retaining the existing orange/yellow geometric mark; the icons/references are corrected locally. Its 60px source remains a limitation for large app icons, so a sharper equivalent master is a later refinement. Alternative fonts remain optional comparisons.

## Process

1. **Establish the baseline.** Reuse accepted references and representative current home/article/archive/search examples. Record the source revision or deployment and wait for real fonts/images. If Figma helps, import rendered pages using [code to canvas](https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/) or its [browser extension](https://www.figma.com/downloads/chrome-extension/). Check fidelity and organise only what we intend to change. Imports do not recover React APIs or responsive rules automatically. Figma is optional; running examples can also support review.
2. **Adopt a lean catalogue.** Start Storybook with the existing portable AuthorView, ArchiveCard, ReadingList and SearchResult, reusing controlled data. Include typed component stories, theme/locale/viewport selection and an accessibility panel. Add prose, controls and transparent-image examples as work needs them. Load real fonts, global styles and component-owned CSS. Verify compatibility/parity before replacing the manual gallery launcher; maintain one preview catalogue. Keep existing tests initially. MCP can follow once component lookup is useful; its [AI features are preview](https://storybook.js.org/docs/ai/mcp/overview).
3. **Review a concrete change.** Compare current/proposed appearance with identical content and viewports. Change one coherent responsibility at a time. Initially resolve the accent hierarchy and icon master while retaining typography and hero composition; address demonstrated date/number contrast independently. Separate framework migration from branding changes.
4. **Implement and verify.** Edit shared tokens and owning components. Check affected reading/control states, keyboard/focus, contrast, relevant EN/PL/mobile/desktop/light/dark states and loading/fallback behaviour. Use colour-vision/forced-colour checks where relevant. Keep Vitest for logic/components/generated output and Playwright for actual site integration. Review intentional reference changes; preserve tolerances. Update decisions/examples alongside accepted changes and separate local, hosted CI and deployed evidence.
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
2. Establish the lean catalogue and review the accent palette on real examples.
3. Improve specific content experiences: live-text registration/testimonials, useful image descriptions and consistent social-card templates.
4. Profile fonts, page payloads and build cost; make measured improvements with existing tools.
5. Evaluate an Astro parity slice when migration becomes a priority. Add Figma Code Connect, hosted visual review or token synchronisation only when maintaining them replaces recurring manual work.

The supporting [LLM tools review](docs/llm-design-consistency-review.md) holds research and rough Storybook estimates. This is the process entry point; supporting reviews hold detailed evidence. Local contrast and icon fixes are recorded in todo.md; deployed verification is pending. No catalogue installation, Figma import, palette/font replacement or Astro migration is claimed.
