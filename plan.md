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
- Individual category pages use compact responsive image cards, visible reading-order steps, and separate the recommended sequence from the remaining articles.
- Recommended reading order is deliberately editorial rather than algorithmic. It is controlled by each topic's ordered `recommended` slug list in `data/category-guides.json`; changing that list changes the displayed sequence without changing article dates or URLs.
- Posts surface automatically selected related articles in the same language and topic.
- The homepage shows a focused recent selection and links to a dedicated complete article archive instead of rendering every post up front; the topic index remains a separate curated path.
- The homepage uses one concise “Latest articles” section heading, while a quiet “Read latest articles” label beside the original down-arrow control names its destination without competing with the service calls to action.
- The complete article archive stays intentionally simple: one heading followed by the chronological article list, without a count badge, explanatory filler, or stacked layout spacing.
- Ten English cornerstone articles now have hand-written search descriptions and visible summaries covering Event Sourcing fundamentals, projections, validation, testing, versioning, suitability, messaging guarantees, distributed processes, idempotency, and ordering.
- Algolia records use stable canonical records, include multiple categories, and search results show content type, categories, and date.

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

- Review the latest homepage, complete archive, category, and talks layouts locally with `gatsby develop` at desktop and mobile widths.
- Commit and deploy the approved presentation refinements, then inspect representative English and Polish pages, category paths, consulting pages, the talks gallery, `robots.txt`, `llms.txt`, and the sitemap index.
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
- Allow hand-picked related-article overrides for cornerstone content; keep automatic related links as the fallback.
- Review image alternative text in article bodies. Decorative images should have empty alt text; diagrams and screenshots should explain the useful information.
- Add Breadcrumb structured data to categories, articles, training, and consulting pages.
- Add FAQ structured data only where the visible FAQ and its answers meet Google's current eligibility rules; do not create FAQ markup only for rankings.
- Review Algolia analytics and tune searchable attributes/ranking based on real queries after the new index has collected data.

### P3 — larger engineering work

- Upgrade Gatsby in controlled stages using the migration plan below. The current CI intentionally uses Node 16 and Yarn; runtime and framework changes should not be mixed into the SEO release.
- Revisit the global CSS and JavaScript payload after measuring production coverage. Ant Design remains necessary for the contact form but should not leak into unrelated routes.
- Consider archive pagination if the topic and article indexes grow enough to create large HTML pages.
- Expand the automated SEO assertions when new page types or indexing rules are introduced.

## Node-first Gatsby upgrade plan

The primary goal is to move the build and deployment runtime to Node 24 LTS. The investigation therefore starts by running the current site on Node 24 and works backward from real failures. Yarn 1 remains the package manager throughout; changing it does not help the runtime upgrade.

Research snapshot (2026-09-22):

| Checkpoint | Node | Gatsby | React | Purpose |
| --- | --- | --- | --- | --- |
| Known-good baseline | 16.20.2 | 3.12.0 | 17.0.2 | Current rollback point |
| Compatibility checkpoint | 16.20.2 | 4.25.9 | 17.0.2 | Isolate Gatsby data-layer/plugin changes |
| Supported target | latest 24.x LTS | 5.16.1 | 18.3.1 | Deployable result |

Node 22 is not a planned intermediate deployment. Use it only as a diagnostic if Gatsby 5 succeeds there but fails on Node 24. React 19, a new package manager, Gatsby Slices, deferred static generation, and unrelated lint cleanup are separate work and are not required to reach Node 24.

### What the reverse investigation found

- A clean build of the unchanged site was attempted with Node 24.12.0 and Yarn 1.22.22. It reaches Gatsby, then fails in Gatsby 3's webpack hashing with `ERR_OSSL_EVP_UNSUPPORTED`.
- Node documents `--openssl-legacy-provider` as a temporary workaround for this OpenSSL 3 failure. We will not add that flag: it would conceal the obsolete build toolchain instead of producing a supported Node 24 build.
- Gatsby 5.16 is the first Gatsby release line with explicit Node 24 support. The current `gatsby@5.16.1` engine range is Node `>=18 <26`; Node 26 is therefore not a valid target yet.
- Gatsby's official v5 migration guide recommends first reaching the latest Gatsby 4 release. Gatsby 4 is no longer a deployment target, so it will be only a local/CI checkpoint on Node 16 and React 17.
- Gatsby 5 requires React 18 or 19. React 18.3.1 is the smaller required change and avoids mixing a React 19 migration into the Node upgrade.
- The current Gatsby 3 install already contains three incompatible plugin versions: `gatsby-transformer-json@4.0.0`, `gatsby-remark-responsive-iframe@5.23.0`, and `gatsby-remark-autolink-headers@5.20.0` declare Gatsby 4 peer ranges. Moving core to Gatsby 4 resolves that mismatch; downgrading them first would be churn.
- React 18 requires attention to direct dependencies. The installed `@reach/router`, `disqus-react`, `react-share`, and `theme-ui` versions have old React peer ranges. `@reach/router` is used by the account page; `disqus-react` and `react-share` have maintained React 18-compatible releases; `theme-ui` is not used by source code.
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
- The Gatsby 5 preview exposed a real React 18 hydration/visual regression that static checks missed. Add one Playwright-driven Vitest browser test at a time, first proving each test fails on the broken preview and passes on the corrected local build. Two desktop tests compare against committed, reviewed PNGs at 1440×900 with a 3% pixel-difference budget, plus structural and real-image assertions; a third checks client-side navigation. The category PNG is the production reference; the archive PNG was deliberately updated from the corrected local build after making its previously hidden H1 visible. CI runs the tests against its own built site and uploads current/diff screenshots; it does not query production. Refresh baselines explicitly after reviewing intentional design/content changes, never automatically to make a failure green.

The Node 16 contract currently records 562 routes, 89 redirects, 330 sitemap URLs, and both feed URL sets. One known SEO ambiguity is tracked explicitly: `/pl/anti-patterns/` is in the sitemap but declares the English URL as canonical because `content/pages/anti-patterns` and `content/posts/2024-04-07--anti-patterns` compete for the same localized routes. Resolving it requires an editorial routing choice; until then the verifier permits only this exact mismatch rather than disabling sitemap-wide canonical checks.

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

Exit criterion: a frozen Yarn install, clean Gatsby build, and SEO integration test all pass on Node 24 without compatibility flags. This passed locally on 2026-09-23 with `ALGOLIA_SKIP_INDEXING=true`; the build generated 562 routes and passed the exact route and SEO contracts. CI and a Netlify preview remain the next release checks.

After the Node 24/Gatsby 5 checkpoint is verified, migrate from Yarn 1 to npm as a separate change. Generate a single `package-lock.json`, replace the Yarn commands in package scripts, CI, Netlify, and contributor instructions with npm equivalents, remove `yarn.lock`, and verify `npm ci`, the build, and the same regression tests. Do not maintain two competing lockfiles.

The styling work should also remain incremental and portable to a possible Astro migration. First record browser screenshots and behavior for representative pages. Then move the 35 `styled-jsx` components to ordinary CSS Modules and shared CSS custom properties in small, visually checked groups; Gatsby and Astro both support this model. Consider Tailwind only after the design tokens and component boundaries are clear, not as a prerequisite for the runtime fix. Remove the styled-jsx plugins only when no component needs them, then retry npm without peer-dependency overrides. Keep Yarn as the working deployment path until that point.

The early npm probe exposed peer conflicts that Yarn 1 permits: `eslint-plugin-graphql@4` requires GraphQL <=15 although Gatsby 5 uses GraphQL 16, and `gatsby-plugin-styled-jsx@6.16.0` declares `styled-jsx@^3` although the site uses styled-jsx 4. The GraphQL lint plugin has no configured rules and can be removed. The styled-jsx integration renders much of the site's CSS, so do not suppress its peer conflict or replace/downgrade it without a site-owner decision and a visual regression check. Keep the npm switch pending until this compatibility choice is resolved.

### Step 4 — preview before production

- Deploy a Netlify preview using Node 24 and the same lockfile as CI.
- Verify redirects and headers, Netlify forms, Auth0 account/callback routes, Algolia indexing, RSS, the `/sitemap/sitemap-index.xml` location, `robots.txt`, `llms.txt`, article images, embedded videos, and language switching.
- Compare the generated page count and canonical URLs with the baseline. A changed count is not accepted until every addition/removal is explained.
- Keep the last Gatsby 3 production commit as the rollback point until the Node 24 preview and production smoke tests pass.

Exit criterion: production runs Gatsby 5.16.x on Node 24 and passes the same checks as the preview.

### After the runtime migration

- Investigate why contact form submissions do not deliver email. Check Netlify form capture, spam handling, notifications, and the current client-side submission flow; then discuss a reliable alternative with the site owner before restoring a form. Until then, the contact page offers the Calendly introductory call.
- Keep the WebFinger response in `static/.well-known/webfinger` so Gatsby copies it into generated `public/` on every build. Generated output must not be the only tracked source of a static file.
- Add a fast smoke check for configuration and GraphQL parsing, then keep the full clean production build and output contract as the release gate. A development server can give quicker visual feedback, but it does not prove static HTML, feeds, redirects, or sitemap output.
- Migrate source files to TypeScript incrementally after the Node 24/Gatsby 5 checkpoint. Start with shared data types and new code, then convert components in small batches while preserving routes and HTML behavior.
- Establish an ESLint baseline that runs cleanly on touched files and TypeScript without reformatting the whole legacy project. Expand enforcement as modules are migrated; do not hide the existing 528 errors by treating a failing full-project lint command as green.

### Changes deliberately deferred unless a build proves they are necessary

- Migrating the one `gatsby-image` consumer and three `fluid` queries to `gatsby-plugin-image` is worthwhile, but the API remains available as deprecated compatibility code. Do it during this migration only if Gatsby 5 cannot build or render it correctly.
- Replacing `<StaticQuery>` with `useStaticQuery` is a Gatsby 6 concern, not a Gatsby 5 requirement.
- Explicit GraphQL schema types are useful hardening for sparse frontmatter, but they are not currently required for the Node upgrade.
- Removing all unused packages, modernising Ant Design, React 19, Vitest, global formatting/lint cleanup, Slices, and deferred static generation are separate follow-ups.

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

The local skip flag prevents a build from changing the production search index. CI's main-branch build still uses its Algolia credentials and must verify indexing separately; preview builds must not write to the production index. After deployment, repeat technical checks against live URLs because CDN, redirects, headers, forms, authentication callbacks, and bot protection cannot be fully validated from Gatsby's generated files.
