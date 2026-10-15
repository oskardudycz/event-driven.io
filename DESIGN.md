# Design guide

Use this file for current design decisions and how to make changes. Research and implementation history belong in the linked documents, not here.

## Aim

Keep event-driven.io recognisable, readable and easy to evolve. Use a small warm palette, consistent typography and spacing, real photography and the existing geometric identity. Prefer a few clear choices over another framework or token pipeline.

## Current recommendations

- **Colours:** retain main’s palette: green brand accents (`#709425` / `#bddc84`), darker green light-mode brand text (`#55701c`), yellow hero controls and emphasis, and orange attention accents. Keep the shared variables and component styling structure. The experimental orange, gold and charcoal replacements have been withdrawn at the owner’s request. See [current palette roles](docs/branding-guide.md#current-palette).
- **Hierarchy:** use one consistent primary control treatment across pages. Keep ordinary navigation, metadata and supporting icons quiet. Give secondary actions less emphasis. Avoid colouring every icon, heading and border just because a brand token exists.
- **Readability:** choose text and fill shades separately. Bright fills need a verified label colour; light-mode links need enough darkness. Keep prose links underlined, visible keyboard focus and explicit selected states. Colour must not carry meaning alone. Check both themes, including composited highlights and forced colours.
- **Typography and spacing:** retain Open Sans and the shared type/spacing scale. Use 20px between hero heading, lead, biography paragraphs and action groups, with 10px within compact control groups; use the existing 40px scale for section separation. Let headings wrap naturally; decorative icons belong beside their titles. Avoid manual line breaks and one-off margins as layout fixes.
- **Homepage:** retain the full-screen hero, full biography and one coherent tile background. Keep the article action near the service actions in the reading flow. Show the portrait where text and artwork can coexist clearly. Allow scrolling on short phones; do not shrink or hide biography to force an above-fold fit. Composition still needs review.
- **Guides and articles:** review the guide overview, numbered reading lists, article guide-step links and tag chips alongside the homepage. Keep descriptions and metadata readable and mostly neutral. Editorial covers and diagram notation may contain their own colours; do not recolour them to enforce a UI palette.
- **Images and identity:** preserve natural photography and authored transparency. Keep the existing geometric mark close to its current form. After the palette decision, create a sharper vector master and a repeatable cover/social-card template if needed; retain approved assets until replacements are reviewed.

The owner requested restoring main’s colour values while retaining variables. Layout and guide-icon fixes remain separate from the withdrawn palette experiments. Review any future branding proposal as a complete composition before applying it.

## Sources of truth

| What                                             | Where                                                                                                                                               |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Implemented colours, typography and spacing      | [Tokens](src/theme/tokens.css), [global styles](src/theme/global.css), [Tailwind aliases](src/theme/tailwind.css)                                   |
| Component behaviour and scoped styles            | Owning component and its CSS Module under `src/components/`                                                                                         |
| Logo, hero artwork and fonts                     | [Image/font inventory](docs/imagery-and-typography-review.md), [hero sources and exports](assets/hero-exports.md), `static/icons/`, `static/fonts/` |
| Rendered component examples                      | Existing [Vite gallery](tests/gallery/gallery.tsx); run `npm run dev:components`                                                                    |
| Colour rationale, evidence and open alternatives | [Branding guide](docs/branding-guide.md)                                                                                                            |
| Current tasks and verification                   | [plan.md](plan.md), [todo.md](todo.md)                                                                                                              |

## Change process

1. Inspect the real component, shared values and approved assets. Reproduce the issue with representative content. State the intended behaviour and identify open design decisions.
2. Review a concrete comparison using the same content and viewport. For palette work include the hero, guides, article prose and search; an isolated button swatch cannot establish cohesion. Label proposals clearly.
3. Implement the agreed change in shared tokens and owning components. Preserve routes, translations, content and interactions. Simplify the layout before adding breakpoints or utilities; follow [Tailwind and asset guidance](docs/tailwind-guidance.md).
4. Check the rendered result in light/dark, EN/PL and relevant mobile/desktop states, including short windows, fallback/enlarged fonts, keyboard use, SSR and hydration where affected. Use contrast measurements and colour-vision simulations alongside visual judgment.
5. Run the relevant existing checks under [testing guidance](docs/testing-guidance.md). Keep Vitest for logic, components and generated output; keep Playwright for actual-site E2E. Preserve screenshot tolerances and review intentional reference changes explicitly. Record local, hosted CI and deployed evidence separately in `todo.md`.

A passing screenshot establishes agreement with its reference. It does not establish that the design is good. Update the agreed rule when owner feedback changes the requirement.

## Tooling and evolution

Keep one component catalogue. Add a lean Storybook when ongoing component work justifies it: reuse the portable views/data, real fonts and theme/locale/viewport controls, then retire the manual gallery launcher after parity. Do not require Storybook or MCP to finish the current design corrections.

Figma is optional for exploring and reviewing pages. Import current rendered pages when useful; imports do not recover responsive rules or React APIs automatically. Keep tokens and approved assets in the repository rather than maintaining a second independent design system. See the [tooling review](docs/llm-design-consistency-review.md).

Keep CSS, native ESM/TypeScript, plain data and presentation views portable for a possible Astro migration. Gatsby routing, images and data stay in adapters where a real boundary is useful. Evaluate Astro separately with a representative bilingual article/guide slice and route, SEO, content and interaction parity; measure payloads and build cost before claiming an improvement. Follow the [Astro testing boundary](docs/testing-guidance.md#astro-compatibility).

## Priority order

1. Correct demonstrated readability, hierarchy, asset and responsive defects.
2. Agree and implement one coherent palette across the homepage and new guide experience.
3. Keep the examples and this guide aligned with accepted behaviour; add lean Storybook when proceeding with component work.
4. Improve the logo master and cover templates, then profile fonts and page/build performance where measurements justify work.
5. Pursue Astro, Figma integrations or MCP when they solve a concrete recurring need.
