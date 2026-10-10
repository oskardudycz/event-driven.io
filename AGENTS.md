# Repository guidance

- Fix demonstrated root causes using documented Gatsby, React and CSS mechanisms. Never hide a problem with blanket imports, unrelated coupling, warning suppression, relaxed assertions or automatic snapshot updates; research the supported approach and verify it before calling the issue fixed.
- Keep each component's CSS Module with its owning component. Global reset, fonts and theme tokens belong to the shared layout. Do not import every component stylesheet into page or application entry points to control extraction order.
- Use native ECMAScript modules and TypeScript for new code. Keep styles portable for a possible Astro migration.
- Preserve existing layout, typography, routes, content and interactions unless the user authorizes a change. Apply measured, non-invasive improvements; discuss provider switches and redesign decisions first.
- Reproduce regressions and validate the actual behavior, including SSR, hydration, English/Polish navigation and relevant responsive states. Preserve screenshot tolerances; review intentional fixture changes explicitly.
- Test current behavior and security boundaries with representative fixtures and generated output. Do not add permanent checks that a completed migration was not reverted, pin historical article bodies/counts, or require a particular implementation when the observable behavior can be tested.
- Update plan.md and todo.md with current implementation and evidence. Distinguish local verification from hosted CI and deployed results; document unresolved warnings instead of claiming completion.
- Keep code readable for manual maintenance: use descriptive names, small functions with one responsibility, explicit control flow and clear input/output types. Separate command parsing, domain logic and network/filesystem effects. Avoid nested ternaries, dense callback chains, speculative abstraction and mixing unrelated tasks in one script.
- Prefer removability over maintainability, don't add useless abstractions when they're not needed.
- Use simple functions and data when possible, compose them together instead of making one that fits all.
- Don't use classes but module pattern if it doesn't makes things harder or make it non-idiomatic for framework.
