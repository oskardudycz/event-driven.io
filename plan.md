# SEO, discoverability, and services plan

This document records the improvements made to event-driven.io and the remaining work. The goal is not only higher search rankings. It is to make the site easy for people, search engines, and AI-assisted discovery tools to understand, navigate, and cite while giving consulting and training a clear path to conversion.

## How progress is tracked

- `plan.md` is the durable strategy: goals, decisions, priorities, and the Gatsby migration sequence.
- `todo.md` is the live execution checklist: completed work, verification state, current blockers, and the next actionable tasks.
- Update both files when scope or architecture changes. For ordinary implementation progress, update `todo.md` and change `plan.md` only when the strategy or remaining-work list changes.

## Outcomes we are aiming for

- Google and Bing can crawl, index, and correctly canonicalise the public English and Polish content.
- AI crawlers can access useful, self-contained articles and service pages and discover a generated `llms.txt` index.
- Visitors can move naturally from an article or talk to related material, training, consulting, and a free introductory call.
- Category pages act as curated learning paths rather than flat tag archives.
- Search results identify the content type, language context, categories, and publication date without duplicates.
- The home and talks pages avoid unnecessarily expensive images and third-party embeds.

## Implemented

### Crawlability and technical SEO

- Public crawling is allowed in `robots.txt`, with the sitemap index declared explicitly.
- Canonical URLs and language alternates are emitted consistently, including `x-default` where appropriate.
- Duplicate fallback-language documents are excluded from indexable lists and the sitemap.
- Utility routes such as account, callback, billing, search, and 404 are kept out of the search index.
- Structured data covers articles, services, the author profile, and the website.
- Open Graph and X/Twitter metadata include descriptions, images, and image alternative text.
- `llms.txt` is generated from the site's canonical content during every build instead of being maintained by hand.

### Services and conversion paths

- Added full English and Polish consulting pages covering architecture reviews, Event Sourcing adoption or recovery, modelling workshops, and hands-on implementation support.
- Added prominent links to a free introductory call at <https://calendly.com/oskar-dudycz/consulting>.
- Linked consulting from the main menu, homepage hero, author profile, contact form, and related workshop copy on the consulting page.
- Added visible summaries below page and article titles when a `summary` frontmatter field is present. The same content can also support search snippets and AI-oriented summaries.

### Content discovery

- Posts can now belong to a primary `category` and any number of additional `categories`.
- Category landing pages show curated topic descriptions, article counts, and recommended reading paths.
- Individual category pages show cover images and separate the recommended sequence from the remaining articles.
- Posts surface automatically selected related articles in the same language and topic.
- The homepage shows a focused recent selection and links to the complete topic index instead of rendering the full archive.
- Algolia records use stable canonical records, include multiple categories, and search results show content type, categories, and date.

### Talks and video

- Added the 23 videos from the supplied YouTube playlist as a separate, ordered video gallery.
- Fixed playlist URL parsing: only the 11-character YouTube video ID is passed to the player.
- Replaced eager YouTube embeds with thumbnail facades. The privacy-enhanced `youtube-nocookie.com` player is created only after a visitor clicks play.
- Conference appearances remain a separate chronological list, with recording links where available.

### Accessibility, language, and performance

- Fixed language switching so it uses the target language and works for static routes.
- Added useful alternative text to article and category cover images.
- Localised contact form labels and errors and fixed its network-error callback.
- Converted homepage hero image variants to compressed WebP and limited the initial article list.
- Removed the contradictory fixed height from the full-height hero.
- Removed unused Ant Design styles from the talks page.
- Gated the webpack bundle analyzer behind `ANALYZE=true` and disabled automatic browser opening so normal CI builds do not run an interactive analysis step.

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

## Remaining work, in priority order

### P0 — validate the deployed result

- Deploy and inspect representative English and Polish pages, category paths, consulting pages, the talks gallery, `robots.txt`, `llms.txt`, and the sitemap index.
- Submit the sitemap index in Google Search Console and Bing Webmaster Tools; request indexing for the consulting pages and a few cornerstone articles.
- Use URL Inspection to compare the declared and Google-selected canonical URLs.
- Test Article and Service structured data with Google's Rich Results Test and Schema.org Validator.
- Check CDN/WAF logs or rules to make sure Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, and other desired agents are not blocked upstream of `robots.txt`.
- Measure Core Web Vitals on the homepage, an article, a category page, a workshop page, and the talks page after deployment.

### P1 — high-value content work

- Translate `content/pages/szkolenie-event-sourcing/index.en.md`; it currently contains Polish and should not be promoted as an English page until translated.
- Add hand-written `summary` fields to cornerstone articles first: Event Sourcing basics, projections/read models, versioning, idempotency, ordering, sagas/process managers, and Outbox/Inbox.
- Curate Polish recommended reading paths once enough Polish translations are available.
- Add concise case studies to consulting: starting situation, constraints, intervention, and measurable outcome. Use anonymised examples if necessary.
- Add specific testimonials or client evidence to the consulting page where permission allows.
- Translate the most commercially and topically important English-only articles, starting with the articles linked from training and consulting.

### P2 — stronger content relationships and freshness

- Add an `updated` frontmatter field and emit `dateModified` in structured data and `lastmod` in the sitemap.
- Allow hand-picked related-article overrides for cornerstone content; keep automatic related links as the fallback.
- Review image alternative text in article bodies. Decorative images should have empty alt text; diagrams and screenshots should explain the useful information.
- Add Breadcrumb structured data to categories, articles, training, and consulting pages.
- Add FAQ structured data only where the visible FAQ and its answers meet Google's current eligibility rules; do not create FAQ markup only for rankings.
- Review Algolia analytics and tune searchable attributes/ranking based on real queries after the new index has collected data.

### P3 — larger engineering work

- Upgrade Gatsby in controlled stages using the migration plan below. The current CI intentionally uses Node 16 and Yarn; runtime and framework changes should not be mixed into the SEO release.
- Revisit the global CSS and JavaScript payload after measuring production coverage. Ant Design remains necessary for the contact form but should not leak into unrelated routes.
- Consider archive pagination if the topic and article indexes grow enough to create large HTML pages.
- Add automated assertions for canonical URLs, `hreflang`, no-index routes, sitemap exclusions, and generated `llms.txt` entries.

## Gatsby upgrade plan

Yes, this can be gradual. Each phase should have a successful production build and a short smoke-test checklist. Keep Yarn for the migration; changing the package manager at the same time would add risk without helping the Gatsby upgrade. Node should be raised at the first framework checkpoint that supports a maintained release rather than left on 16 after the migration.

### Phase A — lock down the Gatsby 3 baseline

- Keep the new `.nvmrc` at Node 16.20.2 so local and CI builds use the same runtime until the Gatsby upgrade starts.
- Record representative HTML assertions for canonical URLs, language alternates, structured data, sitemap entries, and no-index routes.
- Capture a baseline build duration and Lighthouse/Core Web Vitals results.
- The obsolete `prettier/react` configuration mismatch is removed. Triage the remaining legacy lint backlog (currently 528 errors, mostly pre-existing formatting/CRLF and older rule violations) so lint can become a migration guard.
- Remove or replace obviously unused plugins and dependencies before asking newer Gatsby versions to resolve them.

Exit criterion: `yarn --frozen-lockfile`, lint, tests, and `yarn build` pass on the current main branch.

### Phase B — prepare while still on Gatsby 3

- Replace deprecated `fields___prefix` sort syntax with the newer nested sort form where the installed GraphQL schema permits it; finish the syntax change during the v5 step if Gatsby 3 cannot express it.
- Replace `gatsby-image` and legacy `fixed`/`fluid` fragments with `gatsby-plugin-image`, `GatsbyImage`, and `StaticImage` incrementally. Start with shared components, then article bodies and category cards.
- Audit community plugins, especially `gatsby-plugin-i18n`, `gatsby-plugin-styled-jsx-postcss`, `gatsby-remark-responsive-iframe`, `gatsby-remark-embed-video`, and the older social/auth integrations. Replace abandoned plugins with small local Gatsby APIs or maintained alternatives.
- Move any global layout data away from deprecated `StaticQuery` if found.
- Add explicit GraphQL schema types for frontmatter fields such as `summary`, `categories`, and the future `updated` field so sparse content does not break inference.

Exit criterion: the Gatsby 3 build has no warnings that can reasonably be removed before a major upgrade.

### Phase C — short-lived Gatsby 4 compatibility checkpoint

- Create an upgrade branch and move all Gatsby-owned packages to their latest compatible v4 versions together; do not mix Gatsby 3 core with v4/v5 official plugins.
- Keep Node 16 and React 17 only for this short-lived compatibility checkpoint. Do not treat Gatsby 4 as the final deployment target: Gatsby 4 and Node 16 are no longer supported.
- Follow the official [Gatsby 3 to 4 migration guide](https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v3-to-v4/), paying particular attention to persisted node storage and parallel query execution.
- Update or replace community plugins whose peer ranges exclude Gatsby 4.
- Compare generated routes, redirects, sitemap URLs, feed files, Algolia records, and image output against the baseline.

Exit criterion: a Gatsby 4 preview behaves like production and does not regress indexing metadata or forms. Move directly to Phase D instead of leaving this combination in production longer than necessary.

### Phase D — Gatsby 5, React 18, and the Node upgrade

- Upgrade React and React DOM to 18 and update all Gatsby-owned packages to Gatsby 5.16 or newer on the same release line.
- Test the migration in CI on both Node 22 and Node 24. Node 24 is the preferred target because Gatsby 5.16 officially supports it; Node 22 is the temporary fallback if a community plugin or native dependency is not ready.
- As soon as Node 24 is green, update `.nvmrc`, the GitHub Actions matrix, and the `engines.node` declaration together. Regenerate `yarn.lock` using that runtime and keep Yarn as the package manager.
- Apply the official [Gatsby 4 to 5 migration guide](https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v4-to-v5/), including the GraphQL sort/aggregation codemod and React 18 hydration checks.
- Resolve server/client rendering differences revealed by stricter React 18 hydration.
- Verify Netlify forms, redirects, headers, Auth0 callbacks, Algolia indexing, feeds, sitemap generation, and the YouTube facade on a preview deployment.
- Upgrade CI only after the preview is green; keep the Gatsby 4 deployment available as a rollback point until production has been observed.

Exit criterion: Gatsby 5 passes CI and production smoke tests on Node 24. If Node 24 is blocked only by a community dependency, ship Gatsby 5 on Node 22, record the exact blocker, and keep Node 24 as the next isolated change.

### Phase E — use newer Gatsby capabilities selectively

- Consider Gatsby Slices for the shared menu/footer/layout only after measuring whether incremental builds are a real problem.
- Consider deferred static generation only for low-traffic archive pages, not for cornerstone articles or service pages that should always be present in the static build.
- Re-run bundle analysis and remove compatibility packages that are no longer required after React 18 and the image migration.

The major-by-major path is intentional: Gatsby's own guidance recommends reaching the latest v4 and clearing its deprecations before moving to v5. It also gives us a useful midpoint for identifying whether a break comes from Gatsby's data layer, React 18, Node, or an unmaintained community plugin.

## Verification workflow

Use the same runtime and package manager as CI:

```sh
yarn --frozen-lockfile
yarn generate-llms
yarn build
```

Run these commands with Node 16. The existing project is not expected to build reliably on Node 24. After a production deployment, technical checks must be repeated against the live URLs because CDN, redirects, headers, and bot protection cannot be fully validated from the Gatsby build alone.
