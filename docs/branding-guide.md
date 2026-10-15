# Branding colours and accessibility

Reviewed 2026-10-14. **The owner authorised the orange palette, now implemented locally.** Production deployment is not established by local verification. This guide records the brand rationale, actual pairings and pre-change audit evidence; it is not a complete accessibility certification.

Current process: [DESIGN.md](../DESIGN.md) covers review, the lean catalogue, optional Figma imports and Astro portability. [todo.md](../todo.md) records current verification.

The owner has subsequently challenged the overall orange/yellow consistency. The implementation below records the first authorised pass, not final visual acceptance. Current review must assess the whole homepage: neutral navigation and supporting icons, a clear interaction accent, restrained yellow emphasis, and heading/action proportions across the hero and article cards. Do not infer cohesion from contrast scores or test passes. These adjustments remain proposals until reviewed together.

## Brand direction

Orange is the primary interaction accent, yellow remains the distinctive hero accent, and neutral surfaces carry the reading experience. General links, controls, metadata icons and quotation accents now use the orange theme. Preserve existing typography, layout, artwork and editorial diagrams.

This is a design judgment, rather than a scientific finding that green and orange cannot coexist. They can. The problem here is hierarchy: the homepage presents yellow/charcoal, article decorations use orange, and links/actions introduce an unrelated olive identity. Orange offers a stronger story for an event-driven architecture blog through the orange domain-event notes used in EventStorming. See Brandolini's [Introducing EventStorming sample](https://www.datocms-assets.com/56821/1693555618-introducing_eventstorming-sample.pdf); the indexed excerpt describes orange notes, but the research browser could not retrieve the full PDF. The recommendation also follows the owner's stated association, rather than depending on that unavailable full text.

The brand story is **clear explanations of how systems change**: orange marks an action or a useful connection, yellow highlights an invitation to explore, and quiet reading surfaces keep attention on the explanation. Avoid making every heading, icon and box orange. Distinguish actions through wording and form as well as colour.

### Proportions and visual hierarchy

Use proportions by purpose rather than enforcing a percentage of coloured pixels. Neutral surfaces and readable text dominate articles; orange appears selectively on links, actions and small supporting details. Yellow remains concentrated in the hero artwork and its calls to action. An article, a search result and the homepage naturally have different colour balances. There is no approved numerical split such as 60/30/10.

Judge changes against representative rendered pages: can readers identify the main action, follow the heading hierarchy and read comfortably without accents competing with the content? Preserve the measured text/photo/background relationships in the [hero proportions review](hero-proportions-review.md), including fallback fonts and narrower viewports. Repeated spacing, type sizes and reading widths come from the existing tokens and components; new ratios require a concrete example and review.

Build recognition through repetition of the same small set of choices: orange interactions, yellow hero emphasis, the geometric mark, natural photography and consistent typography. Extend those relationships to future social cards and workshop pages before adding more colours or another visual motif. Editorial images and EventStorming notation retain their own meaning.

## Audit baseline before the palette change

The palette lives in [tokens.css](../src/theme/tokens.css), with Tailwind aliases in [tailwind.css](../src/theme/tailwind.css). Component CSS owns its uses. The light theme has white surfaces, black body copy, charcoal secondary text, olive decoration `#709425` and darker olive links `#55701c`. Dark mode has a blue-charcoal surface `#14181b`, off-white copy and pale green `#bddc84`. Hero styling keeps a dark surface and yellow accents in both themes. Orange appears in quotations and navigation arrows; several hero/quotation colours are literal CSS values rather than shared tokens.

The original hero artwork was visually inspected: the yellow shape is part of the authored imagery. Preserve its composition and colours. The flat `yellow` CSS accent (`#ffff00`) and the artwork's textured gold are distinct; there is no need to sample the image to determine header contrast.

Ratios below use WCAG's sRGB relative-luminance calculation, without rounding before comparison. They describe the stated pair, not blanket component compliance. [WCAG contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) requires 4.5:1 for normal text and 3:1 for large text (at least 18pt regular or 14pt bold). Meaningful control/state graphics require 3:1 against adjacent colours under [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

| Current use / pair                                |   Light |    Dark | Assessment                                                                                                                                                                                     |
| ------------------------------------------------- | ------: | ------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Body copy on page                                 | 21.00:1 | 14.42:1 | Strong text contrast; a rebrand need not change it.                                                                                                                                            |
| General charcoal/off-white text on page           | 10.72:1 | 14.42:1 | Passes normal text.                                                                                                                                                                            |
| Brand links on page                               |  5.64:1 | 11.68:1 | Passes normal text. Olive is not inherently inaccessible.                                                                                                                                      |
| Muted text on page                                |  5.08:1 |  8.67:1 | Passes normal text.                                                                                                                                                                            |
| Reading-order number on brand fill                |  3.53:1 | 11.68:1 | Light-mode white numbers fail normal-text contrast. `.ordered li::before` uses the decorative brand token as a text background. Source finding; this state is absent from the current gallery. |
| Related-card dates, text at 70% opacity over page |  4.43:1 |  7.56:1 | Light mode falls below normal-text minimum. Chromium confirms 13.33px text and opacity in the gallery. Use explicit muted text instead of opacity.                                             |
| Search field border on page                       |  2.23:1 |  8.00:1 | Light border is below 3:1. Review identification of the complete field; strengthen it if the border is needed to identify the input. This is not a claim that every low-contrast border fails. |
| General card/separator border on page             |  1.19:1 |  1.74:1 | May be decorative; do not darken every divider solely to reach 3:1.                                                                                                                            |
| Named `orange` on page                            |  1.97:1 |  9.04:1 | Unsuitable as small text or an essential stand-alone icon on white. Current quotation stripes and arrows accompanying text can be decorative/redundant.                                        |
| Unused `--color-date` on page                     |  3.02:1 |  7.42:1 | Latent issue, not the actual rendered date colour. Remove or align it when consolidating tokens.                                                                                               |

Reading-order and date findings are independent of accepting orange. Existing article-body links are already underlined; preserve that useful behaviour. Card links have structural cues, so they do not all need prose-style underlines. Audit hover, focus and selected states individually, including translucent tints composited over their actual surface.

## Implemented palette

![Proposed refinement of orange links and buttons on existing reading surfaces](colour-palette-proposal.svg)

The illustration previews refinements under review; it is not a production screenshot or test reference. The implementation retains existing surfaces and body colours. Accent values differ by mode:

**Pending button refinement:** the owner found the light illustration's burnt-orange workshop button visually detached. The illustration now previews the same `#f97316` fill with black text in both modes (7.49:1), while retaining theme-specific readable link colours. This warmer button fill is a proposal, not an implemented or accepted token. White text on that fill would yield only 2.80:1. The owner rejected an outlined variant; retain the clean fill and review a distinct focus indicator. A contrasting button boundary is not universally required when the visible label already identifies the control, as explained in [WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Review its relationship to the yellow hero before adopting a separate action-fill role; the table below still describes the implementation.

**Pending link refinement:** the owner also found the light illustration's links insufficiently readable. The implemented `#c2410c` passes AA at 5.18:1 on white, but that threshold alone does not establish comfortable reading. The illustration now previews `#9a3412`, giving 7.31:1 on white and 7.00:1 (rounded; actually below 7) on the alternate light surface. Keep the underline and compare actual Open Sans rendering before adopting this change. WCAG's contrast guidance recommends stronger contrast for thin text. The dark link remains `#fb923c`; a single shared button fill does not require identical link colours across contrasting backgrounds.

| Role                       | Light              | Dark               | Intended use                                                      |
| -------------------------- | ------------------ | ------------------ | ----------------------------------------------------------------- |
| Page                       | `#ffffff`          | `#14181b`          | Retain current reading surfaces.                                  |
| Raised / alternate surface | `#fafaf9`          | `#20262c`          | Retain current alternate surfaces.                                |
| Body text                  | `#000000`          | `#e5e7eb`          | Retain current body copy.                                         |
| Secondary text             | `#3e3e3c`          | `#e5e7eb`          | Retain current heading/card text.                                 |
| Muted text                 | `#706e6b`          | `#b1b5bb`          | Dates and metadata without opacity reduction.                     |
| Interactive accent         | `#c2410c`          | `#fb923c`          | Underlined prose links, action fills, appropriate focus outlines. |
| Text on accent             | `#ffffff`          | `#14181b`          | Buttons and numbered markers.                                     |
| Hero accent                | Existing `#ffff00` | Existing `#ffff00` | Preserve hero buttons/emphasis and authored yellow artwork.       |

The light accent has **5.18:1 on white** and **4.96:1 on the alternate light surface**. The dark accent has **7.89:1 on the dark page** and **6.75:1 on the raised dark surface**. Inverse button text has 5.18:1 in light mode and 7.89:1 in dark mode. These pairings are above AA; rendered/composited states still require their own checks.

Do not replace green with CSS `orange` globally: `#ffa500` is only 1.97:1 on white. Even the more saturated `#ea580c` is only 3.56:1. Stronger-looking orange is not necessarily more readable. Dark mode also needs dark text on a light orange fill; carrying white button text into both modes would defeat that contrast.

Keep the palette small. Select the accent by its role and relationship to existing artwork; adjust lightness for the background, then tune chroma. [CSS Color 4's OKLCH](https://www.w3.org/TR/css-color-4/#ok-lab) separates lightness, chroma and hue and can help explore variants. It does not guarantee WCAG contrast or distinguishability. Hex tokens remain a straightforward portable implementation; a colour library or generated ten-step scale is unnecessary for this scope.

Decoration and text-on-fill responsibilities must retain their explicit foreground/background pairing. The current orange accent supports both roles on the verified surfaces. Keep semantic tokens in the shared theme and component-owned CSS at its owner. Introduce a new token only for an actual distinct use. Status colours and syntax highlighting have different responsibilities from branding; preserve editorial diagram conventions and third-party brand marks.

## Colour vision and accessibility

Red-green colour vision deficiency is the most common type, while blue-yellow deficiencies also exist. A warm palette is not automatically accessible, nor does replacing green remove the need to check it. See the [National Eye Institute's description of types](https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/color-blindness/types-color-vision-deficiency).

Apply [WCAG Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html): colour cannot be the only visual way of communicating information. Keep prose links underlined; use a visible marker and programmatic state for selections, and labels/icons for statuses. Orange and yellow must not be the only distinction between two meaningful states. EventStorming diagrams should retain explicit event/command labels, legends and useful text alternatives; a site rebrand should not recolour historical diagrams into one brand hue.

Review protanopia, deuteranopia, tritanopia and grayscale simulations, plus reduced contrast. Chromium provides these through its [vision-deficiency emulation](https://developer.chrome.com/docs/chromium/cvd) and [DevTools protocol](https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setEmulatedVisionDeficiency). Simulations are diagnostic aids, not a substitute for labelled information, contrast measurement or feedback from readers. A subsequent local search review captures normal, the four named simulations and forced colours across EN/PL, light/dark and 390/1440px. All eight contact sheets were inspected; this is a scoped diagnostic matrix, not an accessibility certification or a reduced-contrast audit.

Include keyboard focus and Windows/high-contrast forced-colour rendering in implementation review. A single orange focus outline may work against the page but disappear against an orange control; check actual adjacent colours and use an offset or contrasting ring where needed. Do not disable browser colour adjustments globally.

## Light and dark mode

Keep light, dark and system choices, with system as the initial preference and a persistent explicit override. The current [theme preference module](../src/theme/preference.ts) already does this with a first-paint initializer; the [picker](../src/components/ThemePicker/ThemePicker.tsx) follows OS changes. A palette review does not justify replacing that mechanism.

There is no universal winner. A [controlled proofreading study by Piepenbrock, Mayr and Buchner](https://pubmed.ncbi.nlm.nih.gov/25135324/) found better performance with dark text on light backgrounds and smaller pupils; this supports taking light-mode reading seriously, not forcing it on every reader. It does not establish long-term health effects or everyone's preferred mode. Keep reader choice and validate both themes independently.

Retain current dark/off-white surfaces initially. Pure black, pure white, warmer neutrals and reduced contrast are design choices requiring review; dark mode does not automatically require lowering text contrast. Avoid inverted assets. The current article-diagram white canvas is intentional, transparent workshop artwork has separate verified behaviour, and Prism Okaidia supplies its own code colours in both modes. Check code, diagram labels, images, embeds, selection, search marks and browser controls as part of a later implementation, rather than assuming theme tokens reach them all.

## Branding guide, gallery or Storybook?

Use this small guide to agree the colour hierarchy and allowed pairings. Keep the existing Open Sans typography, reading widths, spacing, hero composition and image treatment as the baseline. More branding work is justified only if it resolves a concrete inconsistency.

The repository already has a lightweight catalogue: `npm run dev:components`, documented in [README](../README.md), serves real author, archive, reading-list and search-result components with controlled English/Polish examples. Append `?story=Editorial/English&theme=light` or `?story=Editorial/Polish&theme=dark`. The `editorial.story.tsx` filename does not mean Storybook is installed. Existing Vitest browser tests and Playwright site tests have separate responsibilities.

| Option                        | Benefit                                                                              | Cost / limitation                                                                                                   | Recommendation                                                |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Guide + existing Vite gallery | Uses current components, tokens and preview server; easy to remove.                  | Currently lacks a theme toolbar, prose specimen, ordered markers and full control-state examples.                   | Current baseline; retire its launcher after Storybook parity. |
| Storybook                     | Searchable component docs, interactive props, theme toolbar and accessibility panel. | Adds dependencies/configuration and ongoing examples; cannot establish Gatsby SSR/routing or decide brand identity. | Recommended lean catalogue for ongoing design/LLM work.       |

Storybook supports our `data-theme` approach via [withThemeByDataAttribute](https://storybook.js.org/docs/essentials/themes#data-attributes) and [axe-based accessibility checks](https://storybook.js.org/docs/writing-tests/accessibility-testing). Those are concrete benefits, but automated checks still require manual review. If adopted, reuse the same components and controlled data, and retain the documented Vitest/component and Playwright/full-site boundary. No Storybook installation is proposed as a prerequisite to this palette change.

## Imagery and typography

The [extended image/font review](imagery-and-typography-review.md) inventories active hero assets, social artwork, avatars, icons and representative editorial/workshop images. They support keeping yellow/orange, personal photography and the existing geometric hero. It also identifies inconsistent grey “HB” icons and mismatched HTML/manifest paths as concrete follow-up work. Preserve natural image colours and diagram conventions rather than tinting all content to match the brand.

Keep Open Sans initially. Local Chromium inspection confirms custom Open Sans for a Polish glyph specimen; the existing family/loading/subsets offer a stable baseline. Review small metadata, image-based text and line length before replacing fonts. Source Sans 3 and Inter are optional future comparisons, not installed or approved changes. The extended review records evidence and accessibility requirements separately from aesthetic preferences.

## Consistency when working with LLMs

The [LLM tools and workflow research](llm-design-consistency-review.md) compares repository design guidance, Storybook MCP, Figma Code Connect, Penpot/Pencil, v0, Builder, Supernova, token tooling and image-reference workflows. Start with approved decisions linked to actual tokens, components and assets, plus rendered feedback. Storybook has a stronger optional role for agent-queryable component knowledge than for palette choice alone; its AI features are currently preview. The existing gallery is used for this palette pass and remains operational until Storybook parity is verified. Tooling remains uninstalled.

## Follow-up and evidence boundaries

Follow [DESIGN.md](../DESIGN.md) for implementation/review order. The owner authorised palette implementation. The calculations above do not certify every site state; current rendered checks and hosted limitations are recorded in todo.md.

At the initial research checkpoint, evidence comprised source/token usage audit; WCAG arithmetic for the tables; visual inspection of original hero artwork and existing Chromium gallery captures at 1280×900 in both themes; computed related-card date styles confirming opacity and size. The gallery's green cover is a controlled fixture, not evidence that editorial images are predominantly green. Temporary captures were under `/tmp/blog-theme-{light,dark}.png`, outside the accepted reference set. That checkpoint changed no production UI, packages, tests or references and included no fresh build or palette browser validation. Subsequent implementation evidence is recorded below and in todo.md; hosted CI and deployed verification remain separate.

## Local correction checkpoint

The first implementation pass retained the green palette and typography. Reading numbers used the darker text-brand fill (5.64:1 light); reading dates received explicit muted text without opacity (5.08:1 light). Search received a dedicated control-border token (3.48:1 on white), separating its identification requirement from decorative borders. The owner accepted the existing orange/yellow geometric icon mark; PNG/ICO outputs and document/manifest filenames were corrected. Original measurements above remain baseline evidence; the subsequent orange pass changes the brand fill. See [todo.md](../todo.md) for current validation and hosted limitations.

## Orange palette implementation

`--color-brand` is `#c2410c` in light mode and `#fb923c` in dark mode. General links, brand text, metadata icons and heading hover roles reference that value through CSS aliases. Quotations and arrows use the same attention alias; yellow hero controls/artwork, neutral reading surfaces, fonts and layout remain unchanged. Editorial images, code highlighting and the green controlled cover fixture retain their own colours.

Light hover/highlight tint is `#c2410c0c` (12/255 opacity); dark tint is `#fb923c18` (24/255). Copying the old 24/255 opacity into light orange would yield only 4.34:1 for highlighted text over `#fafaf9`. The lighter tint yields 4.64:1 there and 4.84:1 over white. These are calculated sRGB composite ratios; the browser matrix checks actual highlight states. Navigation hover uses the shared tint rather than a white overlay that brightens the dark surface.

Before/after component captures and colour-only diffs are in ignored `visual-artifacts/orange-palette-review/`. Twelve author/archive/search references were reviewed and explicitly regenerated through Vitest; related-card references are unchanged. Dimensions and typography are unchanged, with measured component differences of 0.079–1.487%. Because these changes fall below the existing 3% tolerance, Vitest's updater initially retained the passing references. The twelve specific files were backed up and recreated with the native explicit update command; no thresholds were changed. Full-site references remain independent. See todo.md for final test/simulation evidence.

The forced-colour review finds dark search marks at 1.17:1: the browser's dark mark text is paired with the author's nearly transparent background. The scoped correction uses `MarkText` and `Mark`, taking both colours from the reader's system palette. It keeps browser colour adjustment enabled, following [MDN's forced-colour guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors). Normal light/dark rendering is unchanged. The browser matrix now checks these highlights with forced colours enabled; current results are recorded in todo.md.

Actual Open Sans prose comparisons for the proposed darker light link are captured at 390/1440px in EN/PL, excluding image-only links. They remain review material, not accepted references. Palette validation also reveals a pre-existing hydration issue: text typed into the SSR search field before React attaches stays visible without entering search state. Two delayed-script cases reproduce it; a mount effect adopts the retained input value. Both browser search/palette selections pass after that correction. This is a functional root-cause fix discovered during review, not a reason to delay input or relax the colour assertions.
