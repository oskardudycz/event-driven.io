# Brand palette and accessibility

Start with [DESIGN.md](../DESIGN.md). At the owner’s request, main’s colour values are restored while shared variables remain. The orange/yellow, gold and charcoal replacement proposals are withdrawn. This records the current implementation, not approval of a new brand direction.

## Current palette

The source of truth is [tokens.css](../src/theme/tokens.css). Existing and added semantic variables remain available; their values map to main’s palette.

| Role                  | Light            | Dark             |
| --------------------- | ---------------- | ---------------- |
| Page                  | `#ffffff`        | `#14181b`        |
| Body text             | `#000000`        | `#e5e7eb`        |
| General links         | `#666666`        | `#c5c9d0`        |
| Brand accents/icons   | `#709425`        | `#bddc84`        |
| Brand text            | `#55701c`        | `#bddc84`        |
| Hero emphasis/actions | yellow `#ffff00` | yellow `#ffff00` |
| Attention accents     | orange `#ffa500` | orange `#ffa500` |

Hero artwork, photography, fonts, layout changes and the inline guide-icon fix are separate from the palette restoration. The main component colour references are restored without generating new screenshots.

## Guidance for future proposals

Evaluate the whole composition: hero artwork, mark, primary controls, text links and supporting icons. Include both themes, EN/PL and relevant mobile/desktop states, plus hover, keyboard focus and selected controls. Passing contrast checks does not establish visual cohesion or owner acceptance.

[WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) requires at least 4.5:1 for normal text and 3:1 for qualifying large text. [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) requires information beyond colour alone. [Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) covers essential control boundaries and indicators. Restoring main does not certify every existing pairing.

[USWDS colour roles](https://designsystem.digital.gov/design-tokens/color/theme-tokens/) provide a useful distinction between base, primary and supporting colours; they do not prescribe this site’s palette. Orange’s connection to domain events comes from [Brandolini’s EventStorming description](https://ziobrando.blogspot.com/2013/11/introducing-event-storming.html), without prescribing website colour values.

## Colour vision and themes

Do not encode meaning through orange versus yellow alone. Preserve prose underlines, labelled controls, numbering, visible keyboard focus and programmatic selected states, following [WCAG Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).

Review protanopia, deuteranopia, tritanopia, grayscale and forced colours. [Chromium's vision-deficiency emulation](https://developer.chrome.com/docs/chromium/cvd) is diagnostic, not certification or a substitute for reader feedback. Preserve EventStorming labels/legends. Avoid global image inversion or forced-colour overrides; search highlights use system Mark/MarkText in forced-colour mode.

Retain light, dark and system preferences, the first-paint initializer and the persistent reader override. Neither theme suits every reader or situation. A [controlled proofreading study](https://pubmed.ncbi.nlm.nih.gov/25135324/) favoured dark text on a light background; it does not establish universal preference or long-term health effects. Test both themes independently.
