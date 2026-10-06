# SEO, discoverability, and services plan

## Current CSS stage — 2026-10-05

The owner approved starting with quick wins and cleanup, then progressing incrementally. Keep styling portable to a future Astro migration: use plain generated CSS and native CSS Modules, separating style definitions from Gatsby queries/providers. The first batch exposes existing YAML theme values as semantic CSS custom properties and moves article summary and site footer styles to Gatsby's built-in CSS Modules. Keep YAML as the single source of values; retain current colors, fonts, spacing, breakpoints and public selectors. This establishes a small migration example without introducing a reset or changing the layout. Existing styled-jsx consumers remain supported until migrated.

Modern-practice defaults for new work: native ESM and TypeScript; semantic CSS variables; scoped CSS with logical properties; accessible keyboard/focus states and contrast; reduced-motion support whenever animation is introduced; minimal client JavaScript; and explicit, measured validation. Keep design tokens and styling independent of framework data/routing APIs. Avoid a whole-project conversion, new dependencies or behavioral changes solely for novelty. Each component batch should remove its superseded styling and retain supported integrations until their consumers are migrated.

The rebased CSS foundation and localization pass the full suite and 27 existing browser checks. Related and NextPrev then pass a separate production build and all 28 browser checks; shared List reading cards also pass their final production build, full suite and all 28 browser checks. Generated tokens and default CSS Module imports keep styles portable to Astro/Vite. Existing colors, fonts, spacing, public selectors and 600px/1024px breakpoints remain; reduced-motion preferences disable the existing card/arrow movements. Do not refresh screenshots for this implementation-only migration.

CSS Modules now cover Summary, Footer, Related, NextPrev and List. There are still 29 styled-jsx source files, so the styling plugin remains required. Continue in verified batches:

1. Article typography and metadata: Article, Headline, Bodytext, Meta and Author.
2. Archive components: Blog and Item, then category template/index styles.
3. Shared navigation: Header, Menu/Expand/Item, LanguagePicker and Hero.
4. Remaining integrations and shells: Post/Share/Substack/Comments, Search/Hit, Talks/Video/VideoGallery, Contact, page wrappers and layout/global styles.
5. Remove styled-jsx and its PostCSS/lint integrations only when no consumers remain; then revisit the package-manager migration.

Tailwind integration, dark-mode palette/behavior and layout redesign remain later stages requiring concrete review before visible changes. Keep theme values and styles independent of Gatsby queries/routing. Gatsby CSS Modules documentation: <https://www.gatsbyjs.com/docs/how-to/styling/css-modules/>; Astro styling: <https://docs.astro.build/en/guides/styling/>. If Tailwind is introduced into the existing layout, evaluate disabling Preflight to avoid a global reset: <https://tailwindcss.com/docs/preflight#disabling-preflight>.

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
- Retired sign-in, callback, and billing routes are removed; remaining utility routes such as search and 404 are kept out of the search index.
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
- Individual category pages use compact responsive image cards, visible reading-order steps, and separate the recommended sequence from the remaining articles.
- Recommended reading order is deliberately editorial rather than algorithmic. It is controlled by each topic's ordered `recommended` slug list in `data/category-guides.json`; changing that list changes the displayed sequence without changing article dates or URLs.
- Posts show related articles only when explicitly curated in that post's `related` frontmatter list. Broad category matching produced misleading recommendations; an absent list now means no related block. Slugs must resolve to published canonical articles or the build fails. Related cards prefer a genuine article in the current language, then fall back to the canonical English or other available language; placeholder translations are not used as card destinations.
- Related reading uses the same responsive image-card design as category pages and follows the newsletter signup, before sharing and author information. Chronological earlier/later links remain separate and visibly labelled so they are not mistaken for recommendations.
- The homepage shows a focused recent selection and links to a dedicated complete article archive instead of rendering every post up front; the topic index remains a separate curated path.
- The homepage uses one concise “Latest articles” section heading, while a quiet “Read latest articles” label beside the original down-arrow control names its destination without competing with the service calls to action.
- The complete article archive stays intentionally simple: one heading followed by the chronological article list, without a count badge, explanatory filler, or stacked layout spacing.
- Ten English cornerstone articles now have hand-written search descriptions and visible summaries covering Event Sourcing fundamentals, projections, validation, testing, versioning, suitability, messaging guarantees, distributed processes, idempotency, and ordering.
- Local MiniSearch indexes use canonical records with translation preference/fallback links; search results show content type, categories, date and safe highlighted snippets.

### Talks and video

- Added the 23 videos from the supplied YouTube playlist as a separate, ordered video gallery.
- Fixed playlist URL parsing: only the 11-character YouTube video ID is passed to the player.
- Replaced eager YouTube embeds with thumbnail facades. The privacy-enhanced `youtube-nocookie.com` player is created only after a visitor clicks play.
- The talks page focuses on the useful video gallery; the redundant chronological conference-appearance list was removed.

### Accessibility, language, and performance

- Fixed language switching so it uses the target language and works for static routes.
- Added useful alternative text to article and category cover images.
- Localised contact form labels and errors and fixed its network-error callback.
- Converted homepage hero image variants to compressed WebP and limited the initial article list.
- Removed the contradictory fixed height from the full-height hero.
- Removed unused Ant Design styles from the talks page.
- Gated the webpack bundle analyzer behind `ANALYZE=true` and disabled automatic browser opening so normal CI builds do not run an interactive analysis step.
- Added dependency-free post-build SEO assertions and an integration test for representative canonicals, language alternates, structured data, no-index routes, sitemap inclusion/exclusion, `robots.txt`, and `llms.txt`; CI runs the test before deployment. The shared verifier can move behind Vitest after the Node/Gatsby migration without rewriting the checks.

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

- Keep reviewing intentional layout changes at desktop/mobile widths; the existing screenshot tolerances and 25 browser checks are passing locally. See the latest deployment verification below for hosted results.
- The baseline presentation/runtime changes are deployed since 99519a3c and representative production pages/assets pass public checks. Deploy and verify the later category parity and routing/lint changes separately.
- Submit the sitemap index in Google Search Console and Bing Webmaster Tools; request indexing for the consulting pages and a few cornerstone articles.
- Use URL Inspection to compare the declared and Google-selected canonical URLs.
- Test Article and Service structured data with Google's Rich Results Test and Schema.org Validator.
- Check CDN/WAF logs or rules to make sure Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, and other desired agents are not blocked upstream of `robots.txt`.
- Measure Core Web Vitals on the homepage, an article, a category page, a workshop page, and the talks page after deployment.

### P1 — high-value content work

- Replace `content/pages/szkolenie-event-sourcing/index.en.md` with an accurate English offer. A literal translation is unsafe because the source currently advertises February/March 2025 dates, a 3000 PLN price, and an old registration form; confirm the current format, schedule, price, and call to action first.
- Continue adding hand-written descriptions and summaries beyond the first ten cornerstone articles, prioritising pages with search impressions and articles linked from consulting or training.
- Curate Polish recommended reading paths once enough Polish translations are available.
- Add concise case studies to consulting: starting situation, constraints, intervention, and measurable outcome. Use anonymised examples if necessary.
- Add specific testimonials or client evidence to the consulting page where permission allows.
- Translate the most commercially and topically important English-only articles, starting with the articles linked from training and consulting.

### P2 — stronger content relationships and freshness

- Add an `updated` frontmatter field and emit `dateModified` in structured data and `lastmod` in the sitemap.
- Curate `related` frontmatter for additional cornerstone posts where a genuinely useful reading sequence is clear; do not restore automatic category-based fallback.
- Review image alternative text in article bodies. Decorative images should have empty alt text; diagrams and screenshots should explain the useful information.
- Add Breadcrumb structured data to categories, articles, training, and consulting pages.
- Add FAQ structured data only where the visible FAQ and its answers meet Google's current eligibility rules; do not create FAQ markup only for rankings.
- Review local search quality with curated bilingual queries and tune title/category boosts and prefix/fuzzy matching when evidence supports a change.

### P3 — larger engineering work

- Continue Gatsby 5 modernization from the completed runtime migration. The current baseline is Gatsby 5.16.1, React 18.3.1, Node 24 and Yarn 1. Earlier migration checkpoints below are historical.
- Revisit the global CSS and JavaScript payload after measuring production coverage. Ant Design remains necessary for the contact form but should not leak into unrelated routes.
- Consider archive pagination if the topic and article indexes grow enough to create large HTML pages.
- Expand the automated SEO assertions when new page types or indexing rules are introduced.

## Historical Node-first Gatsby upgrade investigation (completed)

The primary goal is to move the build and deployment runtime to Node 24 LTS. The investigation therefore starts by running the current site on Node 24 and works backward from real failures. Yarn 1 remains the package manager throughout; changing it does not help the runtime upgrade.

Research snapshot (2026-09-22):

| Checkpoint               | Node            | Gatsby | React  | Purpose                                  |
| ------------------------ | --------------- | ------ | ------ | ---------------------------------------- |
| Known-good baseline      | 16.20.2         | 3.12.0 | 17.0.2 | Current rollback point                   |
| Compatibility checkpoint | 16.20.2         | 4.25.9 | 17.0.2 | Isolate Gatsby data-layer/plugin changes |
| Supported target         | latest 24.x LTS | 5.16.1 | 18.3.1 | Deployable result                        |

Node 24 is the verified runtime. React 19, a new package manager, Gatsby Slices, deferred static generation, and unrelated lint cleanup are separate work and are not required to reach Node 24.

### What the reverse investigation found

- A clean build of the unchanged site was attempted with Node 24.12.0 and Yarn 1.22.22. It reaches Gatsby, then fails in Gatsby 3's webpack hashing with `ERR_OSSL_EVP_UNSUPPORTED`.
- Node documents `--openssl-legacy-provider` as a temporary workaround for this OpenSSL 3 failure. We will not add that flag: it would conceal the obsolete build toolchain instead of producing a supported Node 24 build.
- Gatsby 5.16 is the first Gatsby release line with explicit Node 24 support. The current `gatsby@5.16.1` engine range is Node `>=18 <26`; Node 26 is therefore not a valid target yet.
- Gatsby's official v5 migration guide recommends first reaching the latest Gatsby 4 release. Gatsby 4 is no longer a deployment target, so it will be only a local/CI checkpoint on Node 16 and React 17.
- Gatsby 5 requires React 18 or 19. React 18.3.1 is the smaller required change and avoids mixing a React 19 migration into the Node upgrade.
- The current Gatsby 3 install already contains three incompatible plugin versions: `gatsby-transformer-json@4.0.0`, `gatsby-remark-responsive-iframe@5.23.0`, and `gatsby-remark-autolink-headers@5.20.0` declare Gatsby 4 peer ranges. Moving core to Gatsby 4 resolves that mismatch; downgrading them first would be churn.
- React 18 requires attention to direct dependencies. The installed `@reach/router`, `disqus-react`, `react-share`, and `theme-ui` versions had old React peer ranges. The retired account page was the only direct source consumer of the router; leave further dependency cleanup separate from the Auth0 removal. `disqus-react` and `react-share` have maintained React 18-compatible releases; `theme-ui` is not used by source code.
- `gatsby-plugin-algolia@0.22.0` only declares Gatsby 2/3 support; its maintained 1.x release supports Gatsby 5. `gatsby-plugin-react-svg@3.0.1` also needs its maintained Gatsby 5-compatible update.
- `gatsby-plugin-i18n@1.0.1` is old and has no Gatsby peer range. Its node/page hooks overlap with the site's own localization code. Keep it for the Gatsby 4 attempt; if it is the blocker, remove it and require an exact generated-route comparison rather than recreating its behavior speculatively.
- `gatsby-plugin-styled-jsx-postcss` and `gatsby-remark-embed-video` are old but implement behavior the site actively uses. Keep and test them. If either actually blocks Gatsby 5, stop and choose a replacement with the user because replacing it changes CSS or article rendering.
- The first fully clean Node 16 baseline took 1,482.1 seconds. Investigation showed that `onCreatePage` registered the entire legacy redirect list once per generated page. Moving that global work to `onPreBuild` reduced `createPagesStatefully` from 127.7 seconds to 0.22 seconds, `onPostBootstrap` from 241.4 seconds to 0.5 seconds, page queries from 846.6 seconds to 44.3 seconds, and the complete clean build to 220.9 seconds while preserving all 562 routes.

### Step 1 — preserve the working baseline

- Keep `.nvmrc` and CI at Node 16.20.2 until the complete Node 24 target build passes.
- Keep the successful 562-page production build and the post-build SEO test as the comparison baseline.
- Record the generated route list, redirects, RSS files, sitemap location and URLs, canonical/hreflang output, and representative image output before dependency changes.
- Do not make the 528 pre-existing lint errors a migration gate. Run targeted lint on changed files; the production build and existing integration checks are the relevant baseline.

Exit criterion: the current Node 16/Yarn build and `yarn test` pass from a frozen lockfile.

#### Automated regression guardrails

- `yarn build` remains the first gate because it exercises plugin loading, schema creation, GraphQL queries, image processing, JavaScript/CSS bundling, and static HTML rendering.
- `yarn test:seo` validates semantic output rather than byte-for-byte HTML. It checks representative schema types, metadata, no-index rules, crawler files, required Netlify headers, and every sitemap URL's generated HTML and canonical URL.
- `yarn test:build-contract` compares the build with the committed `tests/fixtures/build-contract.json`. The contract contains the exact public route set, redirects, sitemap URLs, and RSS entry URLs, but deliberately excludes bundle hashes and complete HTML snapshots that change harmlessly between Gatsby releases.
- `yarn test` runs both suites and is already the CI gate before deployment.
- When a content or routing change is intentional, run `yarn update:build-contract` only after a successful build and review the fixture diff. Migration code must not update the fixture merely to make CI green.
- The Gatsby 5 preview exposed real browser regressions that static checks missed. Add one Playwright-driven Vitest browser test at a time, first proving each test fails on the broken preview and passes on the corrected local build. Five desktop tests compare against committed, reviewed PNGs at 1440×900 with a 3% pixel-difference budget, plus structural and real-image assertions; a sixth checks client-side navigation. The category and English/Polish homepage PNGs are production references. The archive PNG was updated from the corrected local build after making its H1 visible. The article-footer PNG was captured from the corrected local build after the production and preview both showed an unrelated full article in the author slot; separate production captures document that old state. CI runs the tests against its own built site and uploads current/diff screenshots; it does not query production. Refresh baselines explicitly after reviewing intentional design/content changes, never automatically to make a failure green.

The original Node 16 contract recorded 562 routes, 89 redirects, 330 sitemap URLs, and both feed URL sets. After removing the disabled sign-in integration, the post-auth-removal Gatsby 5 checkpoint recorded 556 routes and 80 redirects; the six English/Polish account, billing, and callback routes and their nine redirects are the only removals. Sitemap URLs and feed URL sets are unchanged. One known SEO ambiguity is tracked explicitly: `/pl/anti-patterns/` is in the sitemap but declares the English URL as canonical because `content/pages/anti-patterns` and `content/posts/2024-04-07--anti-patterns` compete for the same localized routes. Resolving it requires an editorial routing choice; until then the verifier permits only this exact mismatch rather than disabling sitemap-wide canonical checks.

### Step 2 — Gatsby 4 diagnostic checkpoint

- On a dedicated migration change, update Gatsby core to `4.25.9` and move Gatsby-maintained plugins to their latest versions whose peer ranges support Gatsby 4. Do this as one dependency batch so core and official plugins are not left mismatched.
- Keep Node 16.20.2 and React 17.0.2 for this checkpoint. This isolates Gatsby's persisted node store and parallel query changes from React and Node changes.
- Follow the official [Gatsby 3 to 4 migration guide](https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v3-to-v4/).
- Run a clean build and the existing SEO integration test, then compare routes, redirects, feeds, sitemap output, Algolia record generation, and images with the Gatsby 3 baseline.
- After the Gatsby 4 build passes on Node 16, run the same frozen dependency tree on Node 24 as a diagnostic checkpoint. Gatsby 4 declares Node `>=14.15` but predates explicit Node 24 support, so passing is useful isolation evidence rather than a reason to retain Gatsby 4 in production. Do not target Node 18 or 20: both are end-of-life as of this plan.
- Fix only failures that are relevant to reaching Gatsby 5. Do not deploy Gatsby 4 and do not add new Gatsby features.

Exit criterion: Gatsby 4 builds on Node 16/React 17 with no route or SEO-output regression. If an old community plugin is the only blocker and replacing it would alter rendering, stop and ask before replacing it.

Checkpoint result (2026-09-23): Gatsby 4.25.9 builds successfully on Node 16/React 17 and preserves the 562-route, 89-redirect, 330-sitemap-URL, and feed contract. Required API updates were limited to feed titles, the sitemap's `SitePage.pageContext` JSON field, and Gatsby 4's `conditions: { language }` redirect shape. The verified build completed in 190.7 seconds with 12 workers. The Node 24 diagnostic reaches page creation but fails in Gatsby 4's legacy `url-loader`/`file-loader` MD4 hashing. No OpenSSL compatibility flag or webpack override will be added; proceed directly to Gatsby 5 for Node 24.

Gatsby 5 diagnostic: resolving `timeToRead` for every article in the global page-creation query invokes full Markdown-to-HTML rendering and stalls page creation for several minutes. The category cards do not need this estimate; removing that field reduced the same 562-page creation step to about 35 seconds. Cards retain their publication date.

Node 24 build finding: Gatsby 5 still uses `url-loader`/`file-loader` with an MD4-based filename hash for imported font files. The deprecated `typeface-open-sans` CSS import triggers this path. Keep the same self-hosted Open Sans CSS and font files under `static/fonts/open-sans/`, linked from the layout, instead of adding an OpenSSL flag or webpack override. Verify the generated stylesheet, font files, and rendered link after a clean build.

The current `gatsby-plugin-algolia` release no longer honors the site's old `skipIndexing` option. Include the plugin only for a credentialed main-branch build; use `ALGOLIA_SKIP_INDEXING=true` when running a production build locally with credentials in `.env`. This avoids unintended index writes and lets offline verification reach Gatsby's post-build steps. Production indexing still needs a live CI check.

### Step 3 — Node 24 target with Gatsby 5

- Update Gatsby core and every Gatsby-maintained plugin together to the 5.16 release line, using `gatsby@5.16.1` as the current target.
- Update React and React DOM to 18.3.1. Update only direct dependencies that block React 18 or Gatsby 5: use the maintained Algolia, React SVG, Disqus, and sharing packages, and replace the direct `@reach/router` import with Gatsby's React 18-compatible router fork.
- Move the ten legacy GraphQL sort queries to Gatsby 5's nested sort input syntax. Gatsby can transform the old syntax at runtime, but committing valid v5 queries removes that compatibility layer and keeps GraphiQL accurate.
- Set `trailingSlash: "always"` explicitly so Gatsby 5 does not silently change URL behavior. Preserve the explicitly configured `/sitemap` output path.
- Install with Yarn 1 and run a clean build directly on the latest Node 24 LTS. Do not use the OpenSSL legacy-provider flag or ignored peer-dependency flags.
- Only after that build passes, update `.nvmrc`, the GitHub Actions Node version, and a new `package.json` `engines.node` declaration together. Regenerate `yarn.lock` with Node 24.
- Follow the official [Gatsby 4 to 5 migration guide](https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v4-to-v5/) and check React 18 hydration output.

Exit criterion: a frozen Yarn install, clean Gatsby build, and SEO integration test all pass on Node 24 without compatibility flags. The local build after Auth0 removal completed with `ALGOLIA_SKIP_INDEXING=true`, generated 556 routes, and passed the reviewed route and SEO contracts. All five local browser tests pass against the built site, including both-language homepage references. CI and a fresh Netlify preview remain the next release checks.

After the Node 24/Gatsby 5 checkpoint is verified, migrate from Yarn 1 to npm as a separate change. Generate a single `package-lock.json`, replace the Yarn commands in package scripts, CI, Netlify, and contributor instructions with npm equivalents, remove `yarn.lock`, and verify `npm ci`, the build, and the same regression tests. Do not maintain two competing lockfiles.

The styling work should also remain incremental and portable to a possible Astro migration. First record browser screenshots and behavior for representative pages. The selected subsequent styling direction is Tailwind plus semantic CSS custom properties, with ordinary scoped CSS for complex rules and article content. Migrate styled-jsx consumers incrementally while preserving appearance; introduce full dark mode and layout redesign separately. This pass deliberately precedes CSS changes. Remove the styled-jsx plugins only when no component needs them, then retry npm without peer-dependency overrides. Keep Yarn as the working deployment path until that point.

The early npm probe exposed peer conflicts that Yarn 1 permits: `eslint-plugin-graphql@4` requires GraphQL <=15 although Gatsby 5 uses GraphQL 16, and `gatsby-plugin-styled-jsx@6.16.0` declares `styled-jsx@^3` although the site uses styled-jsx 4. The GraphQL lint plugin has no configured rules and can be removed. The styled-jsx integration renders much of the site's CSS, so do not suppress its peer conflict or replace/downgrade it without a site-owner decision and a visual regression check. Keep the npm switch pending until this compatibility choice is resolved.

### Step 4 — preview before production

- Deploy a Netlify preview using Node 24 and the same lockfile as CI.
- Verify redirects and headers, Netlify forms, Algolia indexing, RSS, the `/sitemap/sitemap-index.xml` location, `robots.txt`, `llms.txt`, article images, embedded videos, and language switching. The retired sign-in, callback, and billing routes are intentionally absent in both languages.
- Compare the generated page count and canonical URLs with the baseline. A changed count is not accepted until every addition/removal is explained.
- Keep the last Gatsby 3 production commit as the rollback point until the Node 24 preview and production smoke tests pass.

Exit criterion: production runs Gatsby 5.16.x on Node 24 and passes the same checks as the preview.

### After the runtime migration

- Investigate why contact form submissions do not deliver email. Check Netlify form capture, spam handling, notifications, and the current client-side submission flow; then discuss a reliable alternative with the site owner before restoring a form. Until then, the contact page offers the Calendly introductory call.
- Keep the WebFinger response in `static/.well-known/webfinger` so Gatsby copies it into generated `public/` on every build. Generated output must not be the only tracked source of a static file.
- Add a fast smoke check for configuration and GraphQL parsing, then keep the full clean production build and output contract as the release gate. A development server can give quicker visual feedback, but it does not prove static HTML, feeds, redirects, or sitemap output.
- Migrate source files to TypeScript incrementally after the Node 24/Gatsby 5 checkpoint. Start with shared data types and new code, then convert components in small batches while preserving routes and HTML behavior.
- Establish an ESLint baseline that runs cleanly on touched files and TypeScript without reformatting the whole legacy project. Expand enforcement as modules are migrated; do not hide the existing 528 errors by treating a failing full-project lint command as green.

### Superseded modernization decisions from the runtime-only phase

- Image migration and Gatsby Head migration are complete and verified.
- Gatsby 5 deprecates `<StaticQuery>`; its replacement with `useStaticQuery` is included in the current modernization pass.
- Explicit GraphQL schema types and proven-unused dependency cleanup are included in the current pre-redesign pass.
- Ant Design modernization, React 19, global lint cleanup, Slices and deferred generation remain deferred. Vitest browser checks are already implemented.

This sequence is intentionally failure-driven. We will not rewrite working integrations pre-emptively; when an unmaintained plugin becomes an actual blocker and replacing it changes visible behavior, implementation pauses for a decision.

## Verification workflow

For the verified Gatsby 5 checkpoint, use Node 24.12.0 and Yarn 1:

```sh
yarn install --frozen-lockfile
yarn generate-llms
ALGOLIA_SKIP_INDEXING=true yarn build
yarn smoke
yarn test
```

Search indexes are now local Gatsby build outputs. CI and previews do not require Algolia credentials or write to an external index. After deployment, repeat technical checks against live URLs because CDN, redirects, headers, forms, and bot protection cannot be fully validated from Gatsby's generated files.

## Gatsby 5 modernization before CSS redesign — 2026-10-04

The build review in `docs/gatsby-5-review.md` is incorporated here. Verified locally: Gatsby Head replaces React Helmet; cards use gatsby-plugin-image; route creation queries only routing metadata; Prism aliases and Browserslist are updated; YouTube uses the maintained embed plugin with a timestamp/referrer adapter. All 96 requested articles have English and Polish files. The current verified output is 694 routes, 222 redirects, 399 sitemap URLs, and 25 browser checks as of the MiniSearch replacement. Historical counts above describe earlier checkpoints, not the current release. CI/deployment and live Algolia verification remain separate pending checks.

Completed local implementation sequence: replace layout StaticQuery with useStaticQuery; clean up listeners, timers and font callbacks; convert Node hooks to native ESM (.mjs) and remove runtime Babel registration; remove proven-unused dependencies and declare direct imports; define nullable frontmatter/routing GraphQL types; cache Yarn and compatible Gatsby outputs in CI; measure cold/warm queries and validate modified/deleted content with warm caches. Preserve appearance, URLs, feeds, metadata and screenshot tolerances. Record verification in todo.md.

Tailwind, semantic theme variables, dark mode, Slices, npm migration and visual redesign are deferred. Keep React 18, Yarn and static generation. Earlier restrictions on optional image/Head/testing modernization have been superseded by the completed work and this sequence. No deployment or third-party indexing is part of this pass.

CI actions are included in this pass: checkout/setup-node/upload-artifact v7, cache v6, CodeQL v4, using GitHub-hosted Ubuntu runners. Validate workflow syntax locally; remote execution remains pending.

Navigation includes existing Polish placeholder pages; SEO alternates remain limited to actual translations. Existing Polish category routes list placeholder articles with canonical English links, matching the article archive. Remove redundant category separators when no recommended section exists.

Imported code fences must retain source syntax metadata, infer clear language patterns when absent, and preserve code bytes/spacing. Kurrent examples use TypeScript rather than plain text. Rewrite known article links across the blog; normalize EventStore/Kurrent blog domain aliases and archived URLs, while retaining unmigrated source references.

### Pre-redesign pass result — 2026-10-04

All listed local modernization tasks are complete: useStaticQuery/lifecycle cleanup, native ESM Node hooks, dependency audit, explicit types, compatible CI caching and action updates. Local frozen install, production build, full tests and 12 browser checks pass. Existing output contracts and screenshot tolerances are preserved. Warm-build verification covers modified/deleted/restored content without publishing a test fixture. Cold/warm builds measured 124.73/28.16 seconds locally; final content build passed in 54.39 seconds. CI execution and deployment are still separate release checks.

The requested article-navigation/category fixes, social profile changes, README reading-order guidance and imported highlighting/cross-links are also verified. JavaScript/js snippet language tags use TypeScript throughout the blog and in future imports; snippet code is unchanged. Polish Event Sourcing shows its six translations plus 82 canonical-English placeholders. See todo.md for current verification evidence and pending external checks.

### Next pre-redesign pass — legacy routing and lint guardrails

Audit the overlapping gatsby-plugin-i18n hooks against the site's native localization hooks. Remove the plugin only if the exact route/redirect/feed/sitemap contract and English/Polish browser checks pass. Preserve the active react-i18next provider, search UI, and comments. Remove unused direct routing and InstantSearch umbrella dependencies after checking source/configuration/scripts; retain directly used react-instantsearch-dom and Algolia APIs.

Establish a separate correctness-focused ESLint baseline for the modern modules, using native ESM/JSX parsing and React hook checks. Include a TypeScript parser for incremental adoption, without converting the whole project or enforcing legacy formatting. Run the baseline in CI; retain the existing full-project lint command and its documented backlog. Expand the explicit baseline as files are modernized. CSS, Tailwind, dark mode, Slices, search API upgrades and deployment remain separate work.

### Category language parity and localization review

Category membership is shared across article translations: each existing localized category must expose the same unique article slugs, preferring an actual translation and linking untranslated material to a canonical available language. Category indexes and detail pages must use the same selection logic. Populate the Polish Event Sourcing guide with the existing eight-step reading path. Keep localized descriptions and allow independent editorial guide orders. Preserve established category routes; do not invent placeholder articles solely for listing parity.

Review current Gatsby localization integrations against the site's canonical-English placeholders, original-slug redirects, shared category membership and Head metadata. Record migration options before replacing the provider/hooks. Review VitePress-style local search as a possible replacement for Algolia; keep the running search unchanged until the replacement is implemented and validated.

### Search and localization review — 2026-10-05

See `docs/gatsby-search-and-localization-review.md` for the current package comparison and migration acceptance criteria. Recommend a lazy-loaded MiniSearch prototype (the engine used by VitePress local search) as the next search change; measure index size/mobile responsiveness and validate locale fallback before replacing Algolia. Recommend gatsby-plugin-react-i18next 3.0.1 as the localization migration candidate; its Gatsby 5/React 18 peer ranges fit, but i18next/react-i18next need compatible upgrades. Prototype static routes/provider/links first and retain explicit canonical/placeholder policy. Published gatsby-theme-i18n 3.0.0 still targets Gatsby 4/React 17/Helmet and is not the preferred option. No plugin/engine replacement is included in the category fix.

Production baseline: the owner reports deployment since 99519a3c. Its GitHub Build and Deploy run succeeded, and 2026-10-05 public checks confirm representative English/Polish metadata, contact CTAs, imported TypeScript highlighting, sitemap and original-slug redirect behavior. Later commits/local category changes have separate verification status in todo.md.

### Category parity result — 2026-10-05

Shared category selection and the Polish Event Sourcing guide are verified: both languages have 89 unique articles and eight ordered steps, with actual translations preferred and missing translations linked to a canonical available language. The production build, full tests, four category-selection regressions and all 15 browser checks pass; route/redirect/sitemap/feed contracts and existing screenshot tolerances remain unchanged. This simplifies one source of custom localization logic without replacing the provider or route generation. Production checks still showed the pre-fix Polish category; later commits require their own deployment/CI check.

## Next planned Gatsby 5 improvements — 2026-10-05

Implement these before the CSS redesign, in separate stages so search and localization regressions can be isolated. Keep Node 24, React 18, Yarn, existing styles and static generation.

### 1. Replace Algolia with local MiniSearch

Generate language-specific search indexes during the Gatsby build and lazy-load the index/engine when search is used. Prefer genuine translations, include canonical-language fallbacks for untranslated articles, and return one result per article. Preserve relative URLs, localized labels, categories/dates, pagination, keyboard accessibility and useful highlighted snippets, including code identifiers.

First measure compressed index size, initialization time and mobile responsiveness, then integrate the replacement into the existing search layout. Validate English/Polish queries, diacritics, fuzzy/prefix matches, loading/empty/error states and modified/deleted-content updates. After build, full tests and browser checks pass without Algolia requests, remove Algolia/InstantSearch packages, indexing hooks, workflow/configuration references and obsolete cache-key inputs. External account/index deletion is outside this work.

### 2. Simplify localization with gatsby-plugin-react-i18next

Adopt the Gatsby 5/React 18-compatible plugin through a staged migration, upgrading i18next/react-i18next to compatible versions. Start with static routes, the translation provider, localized links and the language picker, then remove the superseded custom logic as each replacement passes verification. Keep article-specific canonical/placeholder policy explicit where the plugin does not cover it.

Preserve `/en/` and `/pl/` URLs, import/original-slug redirects, actual translation availability, placeholder navigation, canonical/hreflang/sitemap/feed rules, category membership/reading order and Gatsby Head behavior during SSR, hydration and navigation. Avoid running overlapping locale route generators. Require the exact output contract and all browser checks to pass before removing old hooks/providers. Record local results separately from CI and deployed verification.

Both stages use the package comparison and acceptance criteria in `docs/gatsby-search-and-localization-review.md`. Tailwind, theme variables, dark mode, Slices, npm migration and layout redesign remain later stages.

### Deployment verification — 2026-10-05

The owner supplied https://6ac38f11d8f02a012d48ea89--event-driven-io.netlify.app. Its language search manifests and representative HTML are available: one H1 on the homepage, Polish training and Introduction article; Service schema omits the invalid inLanguage property; canonical and sitemap URLs point to event-driven.io. The immutable Netlify URL returns X-Robots-Tag: noindex, so indexing validation belongs on the main domain.

Build/test CI for 2feb984 passed. The CodeQL analysis job completed successfully and alerts 2/3/4 are fixed, but the separate security check fails on new alert 5 at import/import-substack.js:329. Review that finding before claiming security acceptance. The main domain currently returns 404 for /search-index/manifest.json, unlike the supplied deployment; promotion/main-domain asset verification remains pending.

The deployed browser rerun passes all 25 checks (75.25s command time). The first run passed 23/25: two related-article screenshots captured fallback fonts before the asynchronous layout font state updated. Their tests now wait for Open Sans and the existing heading weight, without changing screenshot baselines or tolerances. See todo.md for the repeatable command.

### Main-heading regression guard — 2026-10-05

Require exactly one H1 in every generated standalone HTML page, including translated placeholders, utility routes and 404 pages. Exclude Gatsby's internal HTML fragments. Enforce this through the existing SEO test and CI gate; keep representative hydration/navigation browser checks as a separate guard. The site-wide audit found and corrected duplicate article-body H1s in both GDPR language files and missing headings on the search/newsletter routes. Live training HTML and hydrated pages already have one H1; Bing's indexed report requires a fresh crawl before its warning can be reassessed.

### Production performance and validator follow-up

Use [docs/pagespeed-review.md](docs/pagespeed-review.md) as the research and decision record before further performance changes. Apply obvious fixes that preserve appearance/behavior; obtain agreement before changing interactions, branding, comment providers, publication-time assumptions or restrictive security policies. Compare repeated mobile audits, separating lab/field and first-party/vendor evidence. Keep CSS redesign deferred.

Subscription and comments must remain automatically available without an extra click. Do not introduce click-to-load buttons for these integrations; the owner explicitly rejected that interaction change.

Discuss Giscus as the preferred comment-provider migration candidate, including GitHub login/moderation requirements, stable bilingual thread mapping and an offline dry run of Disqus history migration. No provider switch or external comment writes are authorized by the research request. Keep this decision ahead of spending substantial effort on Disqus-specific work.

Use the repeatable `yarn audit:performance` command with pinned Lighthouse, lockfile Chromium, fresh profiles and three sequential mobile runs per page. Preserve before/after JSON artifacts and compare median metrics; keep live scores outside deterministic deployment gates.

### Authorized safe PageSpeed implementation — 2026-10-05

Implement responsive card sizes, WebP Markdown images with original-format fallback, priority for the known Introduction cover only, the same portrait at higher resolution, selected existing-font preloads and batched menu measurements. Preserve CSS, automatic subscription/comments, routing and content. Add deterministic generated-output and browser regressions; retain existing screenshots. Playwright and its matching official Chromium browser package are project development dependencies. Record review-only choices and their reasons explicitly in the performance review; do not implement provider, interaction, color, timestamp or security-policy changes here.

Local result: final build, full tests including 14 performance regressions, all 18 browser checks, frozen install, smoke and scoped lint pass. The measured 800px Introduction WebP saves about 80% versus PNG with the existing visual tolerance. Native iframe lazy loading defers distant embeds but does not defer Introduction's nearer embed in Chromium; stricter automatic viewport loading remains a review-only decision. Keep CI/deployed checks and any whole-page performance claims separate from these local results.

CI navigation regression follow-up: browser readiness uses DOM plus explicit font/hydration/iframe checks, never networkidle. The newsletter regression deliberately holds a request open to ensure analytics/comment network activity cannot reintroduce the reported navigation timeout. Preserve the native-lazy proximity caveat and real distant-article test.

### Polish font coverage correction — 2026-10-05

Existing Open Sans 1.10 files cover basic Latin only, forcing Polish letters into a system fallback. Add matching Latin Extended subsets for every existing weight/style, with explicit Unicode ranges and consistent self-hosted sources. Preserve font design, sizing and Latin assets. Verify actual rendered glyph fonts through Chromium's platform-font inspection, not just computed font-family; retain existing screenshot tolerances.

Polish coverage result: matching extended subsets are installed and all 19 browser checks (including actual glyph-font inspection), the full tests with 15 performance regressions, build, smoke and scoped lint pass. Existing screenshots/tolerances and output contracts remain. CI/deployment verification is pending.

## Approved PageSpeed follow-up and developer tooling — 2026-10-05

Implement approved choices 1A (automatic newsletter viewport loading, reserved space and subscription fallback), 3A (scoped accessible text colors) and 5A (optional real publication timestamps; preserve historical dates). Choices 2 and 4 remain pending. Adapt Pongo's flat ESLint, Prettier and VS Code conventions for Gatsby/React; add lint-staged and a pre-commit hook. Exclude generated output and imported article text from bulk formatting. Verify lint/format, installation, smoke, full production tests and browser behavior; record local results separately from pending CI/deployment.

Approved follow-up completed locally: choices 1A, 3A and 5A are implemented and verified; comments (2) and the home label (4) remain review decisions. The newsletter fallback fits its existing legend spacing. Current validation is 694 routes, 222 redirects, 399 sitemap URLs, 18 performance/metadata regressions and 24 browser checks; all existing contracts/screenshots pass. CI now checks the complete maintained ESLint/Prettier scope rather than a separate modernized-file list. Gatsby styling/runtime behavior remains; the Node 24-compatible deasync patch is pinned until the styling integration is replaced. Exact timings and CI/deployment follow-ups are in todo.md.

## MiniSearch implementation — 2026-10-05

Proceed with the approved next search stage. Build per-language local indexes from current canonical Markdown nodes, preferring real translations and linking fallback articles to their canonical language. Measure payload and initialization before adoption. Lazy-load MiniSearch and indexes only when a search is entered; keep the existing result layout, safe snippets, metadata and pagination. Add real bilingual browser searches, failure/retry checks and warm-build modification/deletion verification. Remove Algolia integration/dependencies/CI/cache inputs after the replacement passes. No external account/index deletion or localization-provider migration is included.

MiniSearch replacement is now implemented. The prototype passed a production build, full suite and 25 browser checks before removing the old integration. Algolia build/browser packages, configuration, workflow credentials and cache-key indexing mode are removed; no account/index was deleted. Genuine translations and canonical fallbacks produce 336 unique documents per language, with lazy engine/index downloads and safe snippets. The first-use gzip index cost is about 1.7MB per language. Final post-removal verification and warm-cache results are recorded in todo.md. Localization remains the next separate stage; the original Algolia analytics/indexing tasks are superseded rather than claimed externally verified.

MiniSearch final local acceptance is complete: all five search regressions, full tests, 25 browser checks, frozen install, lint/format, smoke, actionlint and real warm-build modification/deletion/restoration pass. Development indexes also refresh on modification/deletion using Gatsby's supported createPages lifecycle, with a repeatable development check. Routes, redirects, sitemap/feed entries, source content and existing screenshot tolerances remain unchanged. The measured first-use cost is about 1.7MB gzip per language; a standalone 4× CPU-throttled Chromium benchmark measured approximately 0.43–0.44s asynchronous initialization, at most about 22ms per tested query and 16.5MiB retained index memory (medians, excluding network). Engine/index downloads occur only after a query is entered. Keep real-device/network and production verification separate from these local measurements. Localization is the next implementation stage; hosted-search analytics/indexing tasks are retired.

## CodeQL corrections and search presentation — 2026-10-05

Follow-up alert 5 flags assigning a stored link mapping to a Cheerio href attribute. Move canonical link rewriting to Turndown's link conversion boundary instead of mutating HTML. Validate parsed URL protocols, reject ambiguous mapped paths/control characters, and encode Markdown destination delimiters. Preserve relative blog routes, query/fragment values, external links, link titles and local assets. Test unsafe source/mapped URLs and Markdown breakout attempts; hosted alert closure still requires the next scan.

Fix the three alerts from PR #50's CodeQL check without suppressions: replace the ambiguous SVG prefix regex with a forward scan; validate actual imported/mapped link destinations before assigning href, and additionally rebuild partial-word emphasis from allowed tags and encoded text; escape Markdown label backslashes and punctuation together. Add hostile-input regressions and distinguish local checks from the next hosted CodeQL run.

The owner also requested a complete search presentation improvement: reuse the site's accessible green/neutral theme, add optimized local article covers through Gatsby's image pipeline, improve responsive result cards and pagination/focus states, and verify real bilingual mobile/desktop searches. Keep lazy search loading, canonical fallback policy and safe snippets intact. This authorizes search presentation changes, not the deferred whole-site redesign.

Development validation also exposed Gatsby's internal legacy import-order checks. Correct the source with ESM side-effect imports (preserving stylesheet/polyfill order), move the theme import before declarations and replace unused side-effect map calls with forEach. Retain the project's flat ESLint configuration and active integrations. The home-label accessibility warnings remain the previously pending owner decision.

CodeQL/search presentation follow-up is complete locally: all three reported patterns are corrected with regressions, and search has optimized canonical covers, theme-aligned highlights, responsive cards and pagination/focus states. Frozen install, lint, smoke, full tests, all 25 browser checks and development/warm-build updates pass. Routing/SEO/feed contracts remain. The cold build passed but exposed expensive native Sharp work (3,365 jobs); warm restoration completes without the new slow-query warning. No placeholder/encoding policy change was justified by the warmed-query comparison. Hosted CodeQL/CI/deployment confirmation remains pending, with exact results in todo.md. Localization and the prior review-only decisions remain separate.

## Latest article and multilingual provider migration — 2026-10-05

Import the requested “Open Source, a relic, a charity or still the thing?” article into both language routes with local images, source provenance, canonical English fallback and original-slug redirect. Review the exact build-contract delta for the new article before updating its baseline.

The reviewed gatsby-plugin-react-i18next provider and localized navigation stage is implemented with its compatible translation-library peers; final acceptance is recorded below. Source translation JSON through Gatsby and query it on every page. Preserve the site's explicit Markdown/category canonical policy and server-side redirects; configure the plugin to recognize existing language-prefixed routes without generating a second set. Replace the global mutable translation singleton and obsolete provider, keeping the editorial page context for availability. Validate exact routes/redirects/sitemap/feed, full tests and bilingual browser navigation/screenshots. Record local results separately from hosted CI/deployment; do not infer CodeQL closure from local checks.

Current local result: latest article import/cross-links and localization-provider acceptance pass the production build, full suite and 27 browser checks. The CSS foundation now generates framework-independent variables from YAML and migrates summary/footer styles to native CSS Modules; the Node 24 hash fix is configured through the supported PostCSS plugin. Browser tests also check the CSS with JavaScript disabled. The archive baseline changes only for the new first article. Next migrate small Related/NextPrev components and reading cards before typography/navigation, with separate batch acceptance. Warm-cache modification/deletion/restoration passes. The final default-import build/lint checks pass, but its full-suite/browser rerun remains the next local gate. Hosted CI, CodeQL alert closure and deployment remain separate checks in todo.md. Dark mode and redesign have not been implemented.

## CI browser regression repair — 2026-10-05

The owner reverted to commit 4a7e4ee after CI reported an archive screenshot mismatch and a missing html language attribute during reciprocal navigation. Pause CSS work while repairing this checkout. Review the archive baseline against the intentionally imported Open Source article; retain the 3% tolerance. Wait for Gatsby Head to commit language metadata after client navigation, and distinguish the site footer from the article footer. Validate the production build, complete suite and browser checks before recording acceptance; hosted CI/deployment remain separate.

Future imports use an explicit archive-only snapshot command guarded by the expected newest article slug. Review the image/diff before regeneration and rerun the complete browser suite afterward; never enable automatic baseline updates in imports or CI.

CI repair local acceptance: production build, full suite, all 26 browser checks, lint/format and smoke pass. Only the archive PNG was refreshed; other baselines and the 3% tolerance remain unchanged. The wrong-slug update guard was tested and preserves the existing PNG. Hosted CI and deployment confirmation remain pending.

Rebase integration: the CSS foundation is restored on top of the verified CI repair. Preserve its 27th CSS regression alongside the repaired language readiness checks and guarded archive update. Earlier 26-test acceptance covers the pre-CSS checkout; rerun checks for the combined result before claiming CSS acceptance.

## Firefox diagnostics and corrected PageSpeed follow-up — 2026-10-06

Trace production browser messages with a clean Firefox profile and preserve privacy restrictions. Remove only application debug chatter; add repeatable diagnostics and local-file reference coverage. Research and measure the new PageSpeed report against the owner-corrected Introduction article, distinguishing field data from cold mobile lab data and first-party from vendor costs. Update docs/pagespeed-review.md with evidence before further performance changes. Comments/provider and interaction choices remain pending.

Scope correction for the next CSS stage: incremental means categories of work. Complete the remaining CSS Modules conversion as one appearance-preserving stage, isolating only concrete technical difficulties; then remove obsolete styling integrations and run full acceptance. The earlier component-by-component stopping points above are superseded. Tailwind, dark mode and redesign remain later separate categories.

Controlled PageSpeed attribution now prioritizes reviewing the comments stage: three normal production runs score median 62 versus 91 with Disqus blocked only in the audit browser; transferred traffic falls about 1.45MB and best practices 54→100. This authorizes neither a provider switch nor paid subscription. Research records supported Disqus settings, their limitations and Giscus migration preparation. The complete CSS category should investigate font switching/fallback metrics, the font stylesheet request and CSS-only warm-cache invalidation with traces and regressions. Keep final typography and screenshots as acceptance constraints.

Firefox follow-up acceptance: production build, complete tests/lint, all 29 browser checks and fresh Firefox preview verification pass locally. No screenshots or production settings changed. Investigate the preview server's missing root 404 fallback separately. Hosted CI/deployment and owner comments/home-label decisions remain pending.
