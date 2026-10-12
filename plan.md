# Site modernization plan

Last updated: 2026-10-12. Strategy and settled decisions live here; [todo.md](todo.md) records current implementation and verification. Commands and manual workflows belong in [README.md](README.md). Superseded runtime sequences and duplicated acceptance histories have been consolidated.

## Current baseline

Gatsby 5.16.1, React 19.3.0, Node 24 and npm 11.9 use one lockfile, TypeScript/native ECMAScript modules and Pongo-aligned integrated ESLint/Prettier/editor/staging tools. Keep documented Gatsby module-loader boundaries and meaningful application/Node/browser types. Project-owned Babel configuration, styled-jsx, direct Bluebird/Lodash, unused pngjs, the YAML theme generator, Algolia and the inactive Ant Design contact form are retired. Calendly contact pages remain.

Tailwind 4 runs through Gatsby/PostCSS without Preflight. Global reset/fonts/theme tokens belong to the shared layout; useful CSS Modules remain component-owned. Directly editable CSS variables support light/dark/system with a header control, system detection, persistence and first-paint initialization. Native font loading supports Polish glyphs and readable failure fallbacks. The actual label-click dismissal defect is fixed and tested in Chromium and Firefox; hosted verification is separate.

MiniSearch supplies lazy bilingual indexes, safe snippets and covers. gatsby-plugin-react-i18next owns translation resources/navigation. Canonical identity and visitor locale are separate: related cards, categories, archives and search prefer the current locale whenever a route exists. Untranslated Polish copies are labeled accurately; real translations have their own canonical/hreflang.

Requested imports through Architecture Weekly #189, the latest Open Source article and supplied EventStore/Kurrent posts include provenance, local assets, redirects, highlighting and mapped cross-links. Preserve source links when no blog equivalent exists. YouTube text links stay links; only thumbnail links and explicit players embed. The anti-patterns article owns its former collision route and links the series/talks. Both workshop routes remain with English text on the English route; historical commercial terms await owner updates.

Robots/sitemaps, canonical/hreflang, structured dates, one-H1 guards, useful bilingual 404s, deduplicated llms.txt and systematic image alternatives are implemented. Unknown content stays 404. IndexNow uses canonical fingerprints and acknowledged state in production-only post-deploy CI; first publication establishes a baseline without bulk historical submissions.

## Revised Tailwind work: shared shell verified locally; content patterns next

The owner rejected the property-for-property conversion because it made markup harder to read without simplifying the design. That pass was reverted. The owner has now requested continuation of the revised plan. Start with the shared shell; do not resume the mechanical conversion.

The first group gives Header a stable frame in normal flow on ordinary pages, including while its bar shrinks and becomes fixed. The homepage frame remains an overlay. Article/archive components then remove their header-height allowances. Preserve the existing content widths, typography and responsive thresholds for this structural change; simplify their design together in the content-pattern group. Separate the legacy emphasis-weight token from Tailwind's font-weight namespace. Use named utility breakpoints: sm is 600px and lg is 1024px. Keep their units aligned with the existing module rules and menu measurements, including when a visitor changes their browser's default font size. Keep complex header/observer styling in its owning module, rather than hiding it in utility strings.

Before the follow-up font correction, the implementation passed the Chromium visual gate, CI-mode project tests and the seven-phase warm CSS/utility cache check. Both Firefox homepage failures were reproduced on the unchanged Git build; the shared-shell change produces zero homepage pixel differences in either locale. The owner authorized current production as the baseline and consistent Open Sans for controls. Reviewed production Firefox references now use Playwright's native project-name path, preserving all existing Chromium files and the 3% tolerance. Post-fix verification passes: production build, full CI-mode npm test, lint/format, smoke, 100 Chromium cases (one Firefox-only skip), 53 Firefox header/theme/font cases and four Firefox font-failure cases. The [visual review](docs/header-visual-review.md) records the source, comparison and reference decision. Hosted CI and deployment of this revision remain unverified.

Follow [Tailwind guidance and research](docs/tailwind-guidance.md), required by AGENTS.md. Improve the layout model, semantic markup and shared design scale; do not count deleted CSS lines as success or conceal complicated strings in constants, aliases or @apply.

Before continuing to content patterns, finish the hero and navigation correction. The owner rejected both the centered equal-column composition and the later 3:2 grid: the latter shrinks the artwork instead of moving it. Retain the original portrait/yellow-shape export at its original half-resolution display size (772×722), aligned to the right gutter. Use native overlapping grid areas to let its transparent canvas share space with the wider heading; verify that actual painted artwork never covers copy or controls. Choose its visibility from measured EN/PL fit, including larger browser fonts, rather than window aspect ratio. Preserve one original tile background and the compact dark header. The correction is implemented with a standard 36rem prose measure, independently wide heading and font-relative content-size query. Generated SSR/hydrated overlap checks pass, including the reproduced CI fallback case. The owner accepted the revised composition on 2026-10-12; current browser results and separate hosted checks are recorded in todo.md.

The desktop overflow panel now has an opaque surface, readable names for icon links, coherent link hit areas, focus styling and keyboard dismissal. Follow W3C's disclosure navigation pattern with ordinary links and a disclosure button, not application menu roles. Anchor the panel to its trigger area instead of separate fixed offsets for homepage/sticky states. Keep the existing mobile navigation and locale destinations. New visual references require owner acceptance; hosted CI/deployment remain separate.

### Proportion and spacing follow-up

The owner requests a proportion review and reports hero actions covering the sticky header. Measure the current build before changing layout: verify actual hit testing while actions cross the header, not just its fixed position. The previous unnecessary positioned copy layer has already been removed; retain that root-cause correction rather than escalating header z-index. Make the hero's top inset consistent instead of vertically centering shorter copy in a viewport-sized section. Keep the original artwork scale, readable prose measure and reading-column width.

Unify disclosure/language/theme controls around 44px targets, 20px icons and the existing 10px spacing token. Let flex gap own separation; calculate overflow from measured list/button widths instead of a guessed reserved width. Verify both languages, sticky/initial states, mobile navigation, keyboard access and hover contrast. Record the measured review and local evidence before requesting visual-reference approval.

The mobile brand is left aligned and a single theme control lives in the lower navigation on mobile (desktop retains header placement). Its choices open upward outside the navigation's scroll area; expanded links occupy the row above the controls. Keep the lower navigation available from the start and reserve its space at the layout boundary. Its collapsed links use a single scrollable row even without JavaScript. CI's two SSR overlaps were reproduced with its Arial-compatible Liberation Sans fallback; local Arial resolves to DejaVu Sans and wraps differently. A measured 50rem heading limit applies where artwork is shown, preserving safe space for both fonts. The owner explicitly accepted the revised homepage on 2026-10-12 and authorized updating only its references. Retain the 3% tolerance and all other fixtures; final local results belong in todo.md and hosted verification remains separate.

Planned execution order, grouped by responsibility:

1. **Shell and design-scale foundations — verified locally.** Ordinary headers reserve their own space; the homepage retains its overlay and sticky/shrink interactions. Pages stop compensating for header height. Named breakpoint units align with existing CSS/menu measurements, and emphasis tokens no longer collide with Tailwind weights. Reading widths, spacing and the reset remain stable for this structural group. Native controls now inherit the page's Open Sans family as requested, retaining component sizes/weights and loading-failure fallbacks. Both Firefox screenshot failures are resolved through comparison with the unchanged build and reviewed production references. Post-fix project and browser checks pass; hosted checks remain separate.
2. **Shared content patterns.** Simplify reading/search cards, author/metadata and chronological navigation with flex/grid/gap and actual shared markup where justified. Use readable utilities on semantic elements. Preserve provider features, locale destinations, content, cover behavior, focus and reduced motion. Retain scoped prose/counters/animations when clearer.
3. **Controls/media and redundant rules.** Apply straightforward utilities to video geometry, recovery links and language controls within the consistent design. Remove genuinely redundant styles and obsolete Algolia names after their replacements are verified. Evaluate official Tailwind class sorting with the existing formatter; no custom utility framework or class-count lint limits.

Acceptance includes showing which layout exceptions and duplicated decisions were eliminated. Run types, lint/format, smoke, production build, full CI-mode tests and browser acceptance: EN/PL, mobile/desktop, light/dark, keyboard, reduced motion, search retry/pagination, video activation, scrolling, SSR/hydration and navigation. Keep screenshot tolerances unchanged; intentional fixture changes require explicit review. Verify module/global/literal-utility edits and restoration on warm builds where relevant. Preserve routes/redirects/feed/sitemap and distinguish local results from hosted CI/deployment. This plan does not authorize provider changes or an Astro migration.

## Next: systemic dependency simplification

Use the existing [dependency review](docs/dependency-review.md) and [maintained starter comparison](docs/gatsby-starter-comparison.md). Finish keep/remove/replace decisions from actual imports/configuration/commands and apply supported application-owned simplifications. The goal is modern conventions and removal of obsolete mechanisms; audit counts are supporting evidence, not the objective. Reassess existing compatibility exceptions; do not suppress warnings, patch peer metadata or accumulate speculative transitive overrides.

Gatsby owns its router peer conflict, old CRA lint stack and older compiler/loader/image chains; Netlify owns optional-driver mismatches. Passing npm ci does not establish a compatible tree. Keep exact owners visible rather than replacing framework internals via aliases. Keep Node types aligned with Node 24 and the documented Microsoft TS6 API / TS7 native-checker arrangement while consumers require it. Once application-owned cleanup is exhausted, prepare a separately reviewed Astro parity scope. AstroPaper informs blog patterns; Starlight informs content/localization/theme patterns. No Astro migration is authorized here.

## Follow-up priorities and deferred decisions

- Verify latest hosted CI/deployed behavior, production IndexNow key/state/submission and comparable normal PageSpeed medians. Inspect genuine Search Console failures after recrawl and selected canonicals; redirects/alternate canonicals are expected exclusions. Historic 5xx require hosting logs. Re-run structured-data/crawler/CDN checks when relevant behavior changes.
- Measure font/fallback CLS, remaining expensive GraphQL resolvers and route payloads before further changes. Investigate LMDB scheduleFlush through an upstream-supported correction; do not suppress database warnings or force a database upgrade.
- Extend handwritten descriptions/summaries, related links, Polish learning paths and genuine translations. Obtain current workshop terms and permitted consulting case studies/testimonials before editing commercial claims.
- Add editorial updated/dateModified/sitemap lastmod and useful Breadcrumb data; FAQ markup only for eligible visible content. Tune bilingual search from representative queries and consider archive pagination only when justified by growth.
- Keep static generation, Disqus provider/automatic loading, sharing and analytics behavior. New contact forms, Giscus/custom guest comments, broader redesign, Slices/DSG, font metric changes and Astro adoption require separate review. TSX lint-fixture/component-test refactoring remains explicitly deferred.

## Editorial discovery rules

Recommended category order is controlled by the ordered recommended slugs in data/category-guides.json. Related articles require explicit related frontmatter and valid published targets; there is no broad category fallback. Chronological earlier/later navigation is separate. Use genuine translations for editorial clarity without forcing visitors from Polish routes to English.

## Content frontmatter conventions

Use one primary topic and add genuinely useful secondary topics. Avoid assigning every broadly related topic.

```yaml
title: A concrete, descriptive article title
description: A concise search description explaining what the reader will learn.
summary: A direct visible answer to what the article is about and who it helps.
category: Event Sourcing
categories:
  - CQRS
  - Software Architecture
```

The `description` is primarily metadata and may appear as a search or social snippet. The `summary` is shown to readers below the title. Search engines may still choose a different excerpt when it better matches a query.

## Editorial guidance for Google and AI discovery

The strongest content-level opportunity is clarity, evidence, and useful internal connections:

1. Open important articles with a direct two- or three-sentence summary of the problem, answer, and intended reader.
2. Prefer headings that describe the question answered by a section over clever or generic headings.
3. Keep original diagrams, runnable examples, trade-off tables, failure cases, and production lessons. These are more useful and citable than generic summaries.
4. Make authorship and first-hand experience explicit where it supports the claim; the author profile and service pages should remain easy to reach.
5. Add contextual links between articles that form a sequence, and link relevant technical articles to the training or consulting page that helps apply the material.
6. Update high-value evergreen articles when the advice or tooling changes. A future `updated` field should drive `dateModified` structured data and sitemap last-modified values.

## Substack publishing approach

Reposting is not automatically harmful, but publishing identical full articles in two places can make the preferred source ambiguous and split links and engagement.

- Publish the canonical article on event-driven.io first.
- Prefer a shorter adapted edition or substantial excerpt on Substack, followed by a clear link to the complete original.
- If posting the full version, verify whether the Substack post exposes a canonical URL setting and point it to the original article when possible.
- Link with meaningful anchor text and optional UTM parameters so referrals can be measured.
- Keep the site version as the maintained source: update it, link it into topic paths, and make examples/assets available there.
- After publishing, inspect the rendered Substack HTML and Google Search Console to confirm which URL Google selected as canonical.

## Supporting reviews

[Gatsby standards](docs/gatsby-5-review.md), [CSS research](docs/gatsby-css-review.md), [CSS cache correction](docs/gatsby-css-cache-patch.md), [search/localization](docs/gatsby-search-and-localization-review.md), [PageSpeed/provider decisions](docs/pagespeed-review.md), [indexing](docs/google-indexing-review.md). The documented cache patch stays until an upstream Gatsby release passes edit/restoration regressions. Do not reintroduce stylesheet import-order workarounds.
