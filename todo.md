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
- [x] Reduce the homepage blog introduction to one “Latest articles” heading and label the original circular down-arrow control “Read latest articles.”
- [x] Simplify the complete archive header by removing the article-count badge and eliminating the stacked long-form/list spacing.
- [x] Keep the archive H1 in the same layout component as its article list so it remains visible after hydration, and tighten the first-card spacing on both article lists.
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
- [x] Add dependency-free post-build SEO assertions, expose them through `verify-seo`, `test:seo`, and `test` package scripts, and run the test in CI before deployment.

## Verification progress

- [x] Parse `src/i18n/i18n.json`, `data/category-guides.json`, and `data/videos.json` successfully.
- [x] Pass `git diff --check`.
- [x] Run `yarn generate-llms` successfully on Node 16.
- [x] Gatsby creates 562 pages and completes all page GraphQL queries.
- [x] Gatsby completes production JavaScript/CSS bundling and writes all 562 `page-data.json` files.
- [x] Pass targeted ESLint checks for the new archive and updated blog/hero components.
- [x] Verify representative canonical URLs, language alternates, schema types, no-index routes, sitemap rules, `robots.txt`, and `llms.txt` from generated production files.
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
- [ ] Complete the release smoke test after the pending deployment.
  - The currently deployed release returns HTTP 200 for both consulting pages, the Event Sourcing category, talks, `llms.txt`, and the robots-declared sitemap at `/sitemap/sitemap-index.xml`.
  - Contact submission, interactive language switching, the pending `/articles/` routes, and the newly indexed Algolia results still need post-deployment checks.
- [x] Validate live canonical, alternate-language, robots, structured-data, sitemap, and `llms.txt` output on the currently deployed release.
  - The child sitemap contains 328 URLs, includes representative public pages, and excludes account, callback, search, and 404 routes.
  - Representative pages expose canonical URLs, appropriate language alternates, descriptions, social metadata, and BlogPosting, Service, or CollectionPage structured data.
- [ ] Confirm that Algolia indexing produces one canonical hit per document and displays multiple categories correctly.
- [ ] Submit the sitemap in Google Search Console and Bing Webmaster Tools.
- [ ] Request indexing for both consulting pages and selected cornerstone articles.
- [x] Check public CDN/WAF behavior for Googlebot, Bingbot, GPTBot, OAI-SearchBot, and ClaudeBot; each received HTTP 200 for the English consulting page.
- [ ] Measure Core Web Vitals on representative production pages.

### P1 — content work

- [ ] Replace `content/pages/szkolenie-event-sourcing/index.en.md` with an accurate English offer.
  - Current input is needed for the format, next dates or evergreen availability, price, and registration CTA; the Polish source still contains February/March 2025 dates and an old Google Form.
- [x] Add hand-written descriptions and visible summaries to ten cornerstone English articles covering the subjects listed in `plan.md`.
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

- [ ] Phase A: finish the repeatable Gatsby 3 baseline; automated SEO assertions are now in place, while the legacy lint baseline and performance capture remain.
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
