# Tailwind styling guidance

Reviewed 2026-10-11 against the official sources below. These are repository rules for styling work. The rejected utility conversion has been reverted. The owner's subsequent request to continue authorizes the revised responsibility-based plan, starting with the shared shell.

## Goal and boundaries

Use Tailwind to make the layout easier to understand and change. Translating every CSS declaration into a utility, reducing stylesheet counts or moving an unreadable class string elsewhere does not satisfy that goal. Keep the existing Tailwind installation, theme switcher and useful component-owned styling.

Semantic HTML expresses meaning: article, nav, headings, lists, links and buttons. Utility names express presentation. Preserve both readable markup and accessible behavior; adding a class named article does not make a layout semantic.

Tailwind's documentation deliberately uses utility lists, including responsive and state variants. It does not promise short class attributes or prescribe a maximum class count. Our requirement is that the underlying design is simple enough to explain, with meaningful component boundaries and consistent values. A formatter cannot make a complicated layout simple.

## Findings before the revised implementation

| Evidence                                                                                                                                                                                                       | Consequence                                                                                             | Planned correction                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Header.module.css makes the desktop header absolute, then fixed when scrolled. Article.module.css compensates with `calc(var(--space-default) * 2 + 90px)`; Blog.module.css adds a different header allowance. | Page components depend on header geometry. Copying these offsets into utilities preserves the coupling. | Make the shared shell own header/content placement. Evaluate normal document flow for ordinary pages separately from the homepage overlay. Preserve sticky/shrink behavior and test scrolling before choosing a mechanism.     |
| Styles repeat numeric media thresholds such as 600px and 1024px.                                                                                                                                               | Literal min-[…] variants spread those decisions through markup.                                         | Choose one named, mobile-first breakpoint set. Prefer Tailwind defaults unless content demonstrates a need for custom thresholds. Define any custom thresholds once; review resulting layout differences.                      |
| The attempted conversion retained floats, margins, unusual dimensions and long formulas.                                                                                                                       | JSX became a transcription of the old stylesheet.                                                       | Use flex/grid and gap where they remove rules. Give containers one width constraint and a small set of responsive spacing decisions. Retain distinctive styling only when it remains useful.                                   |
| Tailwind runs without Preflight. The attempted author border-y plus border-solid left unintended side borders.                                                                                                 | Utility behavior depended on an assumed reset that this site does not load.                             | Check generated/computed CSS against the actual global reset. Make border width/style explicit on the intended edges. Do not add Preflight or a blanket reset as an incidental fix.                                            |
| tokens.css defines --font-weight-bold as 600, also a Tailwind theme-variable name. Converted author links became lighter.                                                                                      | Legacy token names can change the meaning of standard utilities.                                        | Audit namespace collisions before expanding utility usage. Separate legacy names from Tailwind's scale or intentionally define the shared scale with verified output. Preserve current typography unless a change is reviewed. |

The header correction is a proposal derived from the code, not a Gatsby requirement to use sticky positioning. Gatsby supports compositional shared layouts; CSS positioning remains an application design decision.

## Shared-shell implementation

The first revised group keeps a stable header frame in normal document flow. Its bar can become fixed and shrink without moving content. The homepage frame alone overlays the hero. The visibility sensor follows the frame's bottom, replacing the inline height calculation. Articles retain their existing desktop reading gap of 50px; the former 90px header allowance and the archive's separate 80px allowance are removed. Reading widths and typography stay unchanged during this structural work.

Utilities use two named breakpoints: sm at 600px and lg at 1024px. Reset the default breakpoint namespace before defining these two, keeping a single unit system aligned with existing module rules and menu measurements. Mixing Tailwind's default rem thresholds with pixel-based header/menu rules would change their relative behavior when a visitor changes their browser's default font size. Remaining module media rules stay with their owners until their content-pattern group is simplified. The legacy emphasis token is --weight-emphasis, preserving its 600 weight without overriding Tailwind's standard font-bold (700). Pipeline tests check the standard bold/semibold weights, and browser checks cover the gallery threshold and header/content geometry.

These choices remove page/header coupling and repeated literal variants. They are foundations for the content-pattern work, not a claim that replacing CSS Modules with utility lists is itself an improvement.

## Rules for implementation

1. Describe the layout responsibility and the rules being eliminated before editing. If the result has the same exceptions in a different syntax, reconsider the design.
2. Use standard utilities and a consistent spacing/type/width scale. Keep meaningful surface, text, accent and border roles backed by the shared light/dark CSS variables. Do not create a token for every historical number or calculation.
3. Use named responsive variants. Arbitrary values are a documented feature, suitable for justified exceptions; repeated literal breakpoints and header-compensation formulas signal an unresolved design problem.
4. Use semantic elements and existing React components. Extract a component when it owns useful behavior, meaningful markup or a repeated pattern. Avoid a new wrapper for every class list or a generic variant framework for hypothetical reuse.
5. Keep small utility lists beside the elements they style. Do not move a large list into a constant, invent an alias or use @apply merely to make the JSX appear shorter. Loops and actual shared components can remove genuine duplication.
6. Keep authored prose, syntax highlighting, reading-order counters and intricate animation in their owning CSS where that remains clearer. Tailwind adoption does not require deleting every CSS Module.
7. Preserve CSS ownership: shared reset/fonts/theme in the layout, component styles with their owner. No extraction-order imports, specificity escalation, !important rescue rules or duplicated global selectors.
8. Review SSR and hydrated output. Preserve locale navigation, focus, keyboard controls, reduced motion, theme persistence, provider behavior and existing content. Keep Gatsby data/routing adapters separate from portable presentation.

For example, an article container should need to express centering, reading width and gutters. It should not know the header's height or reproduce its positioning rules. A shared card should own cover, heading and metadata markup because these form a repeated content pattern, rather than exist solely to conceal utility classes.

## Execution groups and acceptance

Start with the shell and design scale together. Inspect article, archive, homepage, category, search and 404 layouts to find all header compensation. Compare proposed desktop/mobile arrangements, including the homepage overlay, before expanding the conversion. The owner accepts a close, well-designed result; preserve typography and interactions, and explicitly review intentional geometry changes.

Next, migrate shared content patterns together: reading/search cards, metadata/author information and article navigation. Use consistent layouts and states across their consumers. Preserve reading order, localized destinations, covers, sharing features and accessible labels.

Finish with straightforward controls/media and remove rules made redundant by the new structure. Leave complex scoped styling where it remains clearer. Measure generated output before claiming a performance improvement.

Before accepting each group:

- Explain which layout exceptions, duplicated decisions or DOM wrappers were removed, and show the resulting source for readability review.
- Run types, lint/format, smoke checks, production build and the full test suite. Run relevant browser tests in EN/PL, light/dark, mobile/desktop, plus keyboard, reduced motion, scrolling and client navigation.
- Keep screenshot tolerances unchanged. Review intentional differences and update fixtures only for an explicitly accepted change; never regenerate snapshots to make a failing conversion pass.
- Test CSS/utility edit and restoration on warm builds when stylesheet ownership or utility generation changes. Check SSR/hydration for consistent appearance.
- Before hydrated screenshots, use expectFonts from tests/browser/readiness.ts. Browser font readiness can resolve while Arial is still active, before React requests and activates Open Sans; waiting for document.fonts.ready alone does not establish the final typography. This was observed in Firefox's font registry and computed styles. Run project/browser suites sequentially as CI does when validating readiness deadlines.
- Interface controls inherit the page's font family from the shared base layer. Native buttons and fields otherwise use browser-specific defaults even when body text uses Open Sans. Preserve component-owned font sizes/weights and the existing loading-failure fallback; do not enable all of Preflight just to normalize fonts. The owner explicitly requested consistent Open Sans on 2026-10-11.
- Record actual local results, remaining warnings and separate hosted/deployed evidence in todo.md.

Keep visual references specific to the browser/platform they certify. The initial two Firefox homepage failures also occur on the unchanged Git build; before the authorized Open Sans correction, the shared-shell refactor produces zero homepage pixel differences. The owner authorized current production as the baseline on 2026-10-11. Manually reviewed production Firefox captures now have their own project-name path, with existing Chromium files and the 3% limit unchanged. All 53 selected Firefox header/theme/font cases and four loading-failure cases pass. Evidence and the reference decision are in [the visual review](header-visual-review.md). Do not alter layout or typography to make different rendering engines produce identical pixels.

Official Tailwind class sorting can standardize ordering later. Evaluate its compatibility with the existing Pongo-aligned Prettier/ESLint setup before adding it. Sorting is formatting support, not an architecture check. Do not add arbitrary class-count limits or migration-reversion tests.

## Sources and interpretation

- [Tailwind: styling with utility classes](https://tailwindcss.com/docs/styling-with-utility-classes) documents design constraints, arbitrary values and managing duplication with loops/components. The repository's readability requirement is our acceptance criterion, not a claim that Tailwind prohibits long class lists.
- [Tailwind: responsive design](https://tailwindcss.com/docs/responsive-design) documents mobile-first named variants, resetting the default breakpoint namespace and using consistent units. This site's two pixel-based named thresholds keep existing CSS and menu behavior aligned, including browser font preferences.
- [Tailwind: theme variables](https://tailwindcss.com/docs/theme) explains the namespaces that generate utilities. The font-weight collision above is observed in this site's tokens and failed conversion.
- [Tailwind: Preflight](https://tailwindcss.com/docs/preflight) documents its border reset and how to omit it. This site intentionally omits it; future work must account for that.
- [Gatsby: layout components](https://www.gatsbyjs.com/docs/how-to/routing/layout-components/) describes React composition and persistent shared layouts. It supports putting shared shell responsibilities together, without prescribing this site's visual design.
- [Gatsby: CSS Modules](https://www.gatsbyjs.com/docs/how-to/styling/css-modules/) documents scoped, portable component styling. Keeping appropriate modules is a supported choice alongside utilities.
- [MDN: FontFaceSet.ready](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/ready) describes readiness for current font loads/layout. Waiting for the application's computed font family as well is based on the observed React activation timing above.
- [MDN: styling form fonts](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Styling_web_forms#fonts_and_text) documents that native controls may not inherit their parent's font and recommends explicit inheritance. This is the supported shared reset mechanism used for consistent Open Sans, rather than per-component font overrides.
- [Playwright: visual comparisons](https://playwright.dev/docs/test-snapshots) explains why browsers/platforms require separate reference images. This site's shared reference path predated the broader Firefox run; the optional project-name template now separates its reviewed production references from default Chromium images.
