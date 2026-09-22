# SEO, content, and platform progress

Last updated: 2026-09-22

This is the live checklist for the strategy in [`plan.md`](./plan.md). Check an item only when its implementation and proportionate verification are complete. Add a short note under blocked or partial items instead of presenting them as finished.

## Current status

- [x] Technical SEO and content-discovery implementation is prepared locally.
- [x] Bilingual consulting pages and Calendly conversion paths are prepared locally.
- [x] YouTube playlist gallery and broken embed fix are prepared locally.
- [x] Gatsby and Node upgrade sequence is documented.
- [x] Complete a full Node 16/Yarn production build through static HTML generation.
- [x] Recover from the `categories: null` deployment failure recorded in [GitHub Actions run 35613946351](https://github.com/oskardudycz/event-driven.io/actions/runs/35613946351/job/106379761098); the null-safe fix is now deployed.
- [x] Production review exposed category-page, talks-page, homepage, and article-archive clarity issues; refinements are implemented locally and pass a production build.
- [ ] Approve the updated layouts in local `gatsby develop`, then commit and deploy them.
- [ ] Finish validating the deployed site.

## Completed locally

### Crawlability and metadata

- [x] Allow public crawlers in `robots.txt` and declare the sitemap index.
- [x] Emit canonical URLs, `hreflang`, and `x-default` alternates.
- [x] Exclude fallback-language duplicates and utility routes from sitemap/indexing where appropriate.
- [x] Emit Article, Service, ProfilePage, WebSite, and CollectionPage structured data.
- [x] Add Open Graph and X/Twitter descriptions, images, and image alt metadata.
- [x] Generate `static/llms.txt` during builds from canonical content.
- [x] Confirm generated `llms.txt` includes both consulting pages and 266 articles.

### Consulting, training, and conversion

- [x] Add English and Polish consulting pages.
- [x] Add the free introductory call link: <https://calendly.com/oskar-dudycz/consulting>.
- [x] Link consulting from the main menu, homepage hero, author profile, and contact form.
- [x] Localise contact labels and validation messages.
- [x] Fix the contact form network-error callback.
- [x] Support visible frontmatter summaries below page and article titles.

### Categories, articles, and search

- [x] Support a primary `category` plus multiple secondary `categories`.
- [x] Add curated English guides for Event Sourcing, Event-Driven Architecture, CQRS, and Software Architecture.
- [x] Turn the category index into a topic overview with descriptions and article counts.
- [x] Add recommended reading order and image cards to category pages.
- [x] Refine category pages after production review with responsive two-column cards, consistent image ratios, reading-order badges, clamped excerpts, and working article-count pluralisation.
- [x] Generate category cover WebPs once and reuse them through page context.
- [x] Add automatic same-language related articles without an extra GraphQL query per post.
- [x] Limit the homepage to 12 recent canonical articles and link to the topic index.
- [x] Label the homepage blog section and add a quiet “View more” label beside the original circular down arrow.
- [x] Simplify the complete archive header by removing the article-count badge and eliminating the stacked long-form/list spacing.
- [x] Add a bilingual `/articles/` archive, link “Browse all articles” to it, and keep the category index as a separate curated destination.
- [x] Fix the mixed-language hero sentence exposed by the visual production review.
- [x] Include multiple categories and result context in Algolia records/results.

### Talks and video

- [x] Add all 23 supplied playlist videos as an ordered gallery.
- [x] Parse plain IDs, `watch?v=`, `youtu.be`, and `/embed/` YouTube URLs correctly.
- [x] Prevent playlist query parameters from corrupting the embed ID.
- [x] Use click-to-load thumbnails and `youtube-nocookie.com` embeds.
- [x] Remove the redundant conference-appearance list and keep the video gallery as the talks page's useful content.
- [x] Remove unused Ant Design styles from the talks route.

### Performance and maintainability

- [x] Convert homepage hero variants to compressed WebP.
- [x] Remove the contradictory fixed hero height.
- [x] Fix static-route language switching and store the selected target language.
- [x] Gate webpack bundle analysis behind `ANALYZE=true` and prevent browser auto-open.
- [x] Add `.nvmrc` pinned to the current Node 16.20.2 baseline.
- [x] Remove the obsolete `prettier/react` ESLint configuration entry.
- [x] Document the Gatsby 3 → 4 → 5 migration and Node 24 target in `plan.md`.

## Verification progress

- [x] Parse `src/i18n/i18n.json`, `data/category-guides.json`, and `data/videos.json` successfully.
- [x] Pass `git diff --check`.
- [x] Run `yarn generate-llms` successfully on Node 16.
- [x] Gatsby creates 562 pages and completes all page GraphQL queries.
- [x] Gatsby completes production JavaScript/CSS bundling and writes all 562 `page-data.json` files.
- [x] Pass targeted ESLint checks for the new archive and updated blog/hero components.
- [x] Inspect generated page data for English and Polish consulting, Event Sourcing category, and talks routes.
- [x] Complete Gatsby static HTML generation locally or confirm a successful GitHub Actions build.
  - The complete local build passed on Node 16.20.2 and Yarn 1.22.22 in 553.65 seconds, including the previously failing post.
  - CI built commit `46dd3b4` and exposed `TypeError: categories is not iterable` in `Post/Meta`. All remaining consumers now normalize `null` to an empty array, and the fix has since deployed successfully.
  - The latest local build, including the simplified archive and “View more” homepage control, generated all 562 pages and completed static HTML in 185.24 seconds.
- [ ] Restore a clean full-project lint run.
  - ESLint now loads, but reports 528 legacy errors, primarily existing Prettier/CRLF and older rule violations.

## Next actions

### P0 — finish and validate this release

- [x] Redeploy the `categories: null` normalization fix successfully.
- [x] Confirm static HTML generation is slow rather than hung locally; the complete production build finished successfully.
- [ ] Visually approve `/en/`, `/pl/`, `/en/articles/`, `/pl/articles/`, `/en/category/event-sourcing/`, and `/en/talks/` locally at desktop and mobile widths.
- [ ] Commit and deploy the category, talks, homepage, and archive presentation refinements found during production review.
- [ ] Deploy a preview and smoke-test `/en/consulting/`, `/pl/consulting/`, `/en/category/event-sourcing/`, `/en/talks/`, contact submission, and language switching.
- [ ] Validate live canonical, alternate-language, robots, structured-data, sitemap, and `llms.txt` output.
- [ ] Confirm that Algolia indexing produces one canonical hit per document and displays multiple categories correctly.
- [ ] Submit the sitemap in Google Search Console and Bing Webmaster Tools.
- [ ] Request indexing for both consulting pages and selected cornerstone articles.
- [ ] Check CDN/WAF behavior for Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, and other desired crawlers.
- [ ] Measure Core Web Vitals on representative production pages.

### P1 — content work

- [ ] Translate `content/pages/szkolenie-event-sourcing/index.en.md`, which currently contains Polish content.
- [ ] Add hand-written summaries to the cornerstone articles listed in `plan.md`.
- [ ] Curate Polish reading paths after enough Polish articles are available.
- [ ] Add permitted consulting case studies, outcomes, and testimonials.
- [ ] Start translations of commercially important English-only articles.
- [ ] Apply the documented canonical/excerpt workflow to future Substack reposts.

### P2 — structured content and quality

- [ ] Add `updated` frontmatter, `dateModified`, and sitemap `lastmod` support.
- [ ] Add hand-picked related-article overrides with automatic fallback.
- [ ] Audit article-body image alt text.
- [ ] Add Breadcrumb structured data.
- [ ] Add FAQ structured data only to eligible visible FAQs.
- [ ] Tune Algolia ranking using production query analytics.

### P3 — Gatsby and Node migration

- [ ] Phase A: establish a repeatable Gatsby 3 build baseline and automated SEO assertions.
- [ ] Phase B: migrate shared `gatsby-image` usage to `gatsby-plugin-image`, define the GraphQL schema explicitly, and audit community plugins.
- [ ] Phase C: use Gatsby 4 as a short-lived compatibility checkpoint on Node 16/React 17.
- [ ] Phase D: upgrade Gatsby packages to 5.16+, React to 18, and test Node 22 and Node 24 in CI.
- [ ] Make Node 24 the default in `.nvmrc`, GitHub Actions, and `package.json` as soon as the Gatsby 5 build is green; use Node 22 only as a documented temporary fallback.
- [ ] Phase E: measure before adopting Slices, deferred static generation, or further bundle changes.

## External input or access needed

- Google Search Console and Bing Webmaster Tools access for submission and canonical inspection.
- Production/CDN/WAF access for crawler verification.
- Permission and source material for client names, testimonials, and measurable consulting outcomes.
- A decision on which English-only articles should be translated first after the Event Sourcing training page.

## Working rule

When implementation continues, update this file in the same change:

1. Move finished items to checked state only after verification.
2. Record partial verification and exact blockers beneath the item.
3. Add newly discovered strategic work to `plan.md`; add its next executable step here.
4. Keep Node/runtime changes aligned across `.nvmrc`, GitHub Actions, `package.json`, and `yarn.lock`.
