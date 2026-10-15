# Brand palette and accessibility

Start with [DESIGN.md](../DESIGN.md) for the design process, implementation sources and priorities. This guide describes the applied review version. Local checks and implementation history belong in [todo.md](../todo.md); visual acceptance and deployment are separate.

## Current review direction

Use the existing geometric identity, natural photography and authored yellow hero shape as the anchor. The shape's uncomposited colour is **#ffd800**, with its existing 174/255 opacity. Use that same yellow for interface fills and emphasis. Preserve the authored opacity; a translucent shape over dark tiles will look darker than an opaque button.

Keep the reading surfaces neutral. Text links use an orange family in both themes: #ad5500 on light surfaces and #ffb45c on dark surfaces. The always-dark hero retains underlined yellow links coordinated with its authored shape. Orange provides visible link emphasis beside neutral reading text; yellow identifies primary fills and decorative emphasis. The result keeps the same primary action colour in both themes while changing text foregrounds to suit their surface. Contrast measurements establish legibility, not visual quality; inspect the complete pages and interaction states together.

Orange has a meaningful EventStorming association: Brandolini's [original article](https://ziobrando.blogspot.com/2013/11/introducing-event-storming.html) assigns orange sticky notes to domain events, and the [official resources](https://www.eventstorming.com/resources/) retain that association. It does not prescribe a website palette. Preserve orange in existing assets and authored diagrams; the applied review uses that association for links while retaining yellow controls and artwork. Evaluate those roles together rather than treating a contrast score as visual acceptance.

![Applied review palette: hero yellow fills and readable orange links in both themes](colour-palette-proposal.svg)

## Implemented roles

The source of truth is [tokens.css](../src/theme/tokens.css). Components own their scoped uses. Existing text aliases resolve to the readable link role; decoration and action fills use the yellow brand role.

| Role                      | Light     | Dark      | Use                                                                                 |
| ------------------------- | --------- | --------- | ----------------------------------------------------------------------------------- |
| Page                      | `#ffffff` | `#14181b` | Neutral reading surface.                                                            |
| Alternate surface         | `#fafaf9` | `#20262c` | Cards, hover surfaces and grouped content.                                          |
| Body text                 | `#000000` | `#e5e7eb` | Reading copy.                                                                       |
| Muted text/icons          | `#706e6b` | `#b1b5bb` | Metadata and supporting icons.                                                      |
| Text links                | `#ad5500` | `#ffb45c` | Underlined prose links; readable control text.                                      |
| Primary fill/emphasis     | `#ffd800` | `#ffd800` | Primary actions, selected pagination, reading-order markers and decorative accents. |
| Text/icon on primary fill | `#000000` | `#000000` | Explicit readable label pairing.                                                    |
| Keyboard focus            | `#ad5500` | `#ffb45c` | Contrasting outlines on themed surfaces. The dark hero/header use white focus.      |

The hero remains dark in either theme. Its articles, videos and Emmett links remain yellow and underlined. Secondary actions have less emphasis than the filled primary action. Ordinary navigation, guide counts and metadata stay neutral. Card hover borders may use yellow decoratively; keyboard focus has its own contrasting outline.

Use a visible underline for prose links, an underline on action hover, and an outline on keyboard focus. Selected pagination retains its yellow fill and black label during hover and focus. Do not introduce a permanent contrasting button border merely to compensate for a bright fill.

## Proportions, spacing and imagery

Use one dominant interface accent with neutral reading surfaces and supporting content. Keep the strongest emphasis on actions and meaningful reading-order markers rather than every icon or heading. Editorial covers, diagram notation, status colours and syntax highlighting retain their own meaning.

This small palette is a project recommendation, not a universal colour-count standard. [USWDS](https://designsystem.digital.gov/design-tokens/color/overview/) distinguishes colour families, shades and role tokens; [Material](https://m3.material.io/styles/color/the-color-system) assigns emphasis by purpose. [USWDS theme guidance](https://designsystem.digital.gov/design-tokens/color/theme-tokens/) offers 60/30/10 for non-base colour families, excluding the predominant neutral base. Treat that as a heuristic, not a demand to colour most of a reading page.

Use the shared spacing scale. In the hero, heading, lead, biography paragraphs and action groups have 20px gaps. Compact controls use 10px gaps; larger sections use the existing 40px scale. Keep the full biography and the full-screen desktop hero. Allow scrolling on short phones rather than hiding content or shrinking text to force a fit. Preserve Open Sans, the portrait scale and the single tile background. Asset details belong in [hero exports](../assets/hero-exports.md); responsive layout constraints belong in [Tailwind guidance](tailwind-guidance.md#responsive-hero-and-header-research).

Review homepage, guide overview, numbered guide, article prose, guide-step links, tags and search together in light/dark, EN/PL and mobile/desktop. Include normal, hover, focus and selected states. The existing gallery uses real presentation components with controlled content; actual Gatsby pages establish routing, assets and hydration. An isolated SVG is a colour specimen, not an interactive review or a production screenshot.

## Measured colour pairs

These are local sRGB calculations, not blanket component certification. [WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) requires 4.5:1 for normal text and 3:1 for qualifying large text. Check composited backgrounds and every interaction state as well.

| Pair                                                       | Contrast | Interpretation                    |
| ---------------------------------------------------------- | -------: | --------------------------------- |
| Black on hero yellow `#ffd800`                             |  15.07:1 | Action labels and numbered steps. |
| Orange `#ad5500` on white                                  |   5.15:1 | Light-theme text links.           |
| Orange `#ad5500` on alternate light surface `#fafaf9`      |   4.93:1 | Light hover/raised-surface text.  |
| Light orange `#ffb45c` on dark page `#14181b`              |  10.15:1 | Dark-theme links.                 |
| Light orange `#ffb45c` on alternate dark surface `#20262c` |   8.68:1 | Dark hover/raised-surface links.  |

Yellow text on white is unsuitable. Bright fill contrast against a page and label contrast against a fill are separate questions. [WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) explains why a labelled button does not always require a contrasting boundary. Essential control boundaries, stand-alone icons and keyboard focus still need their own checks.

## Colour vision and themes

Do not encode meaning through orange versus yellow alone. Preserve prose underlines, labelled controls, numbering, visible keyboard focus and programmatic selected states, following [WCAG Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).

Review protanopia, deuteranopia, tritanopia, grayscale and forced colours. [Chromium's vision-deficiency emulation](https://developer.chrome.com/docs/chromium/cvd) is diagnostic, not certification or a substitute for reader feedback. Preserve EventStorming labels/legends. Avoid global image inversion or forced-colour overrides; search highlights use system Mark/MarkText in forced-colour mode.

Retain light, dark and system preferences, the first-paint initializer and the persistent reader override. Neither theme suits every reader or situation. A [controlled proofreading study](https://pubmed.ncbi.nlm.nih.gov/25135324/) favoured dark text on a light background; it does not establish universal preference or long-term health effects. Test both themes independently.

## Next improvements

After reviewing this applied version, improve the vector master of the existing mark and establish a repeatable cover/social-card template where useful. Preserve approved assets until replacements are reviewed. Keep one component catalogue; Storybook, Figma and Astro remain separate incremental decisions under [DESIGN.md](../DESIGN.md). None is required to make the current palette and spacing coherent.
