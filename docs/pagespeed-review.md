# PageSpeed and schema review — 2026-10-05

This is a research review, implementation record and decision list. On 2026-10-05 the owner authorized all safe, non-invasive improvements below. The owner authorizes obvious improvements that preserve appearance and behavior. Changes to interactions, branding, comment providers, publication-time assumptions or restrictive security policies need review first. Click-to-load subscription/comment buttons were rejected and removed. Earlier experimental changes were reverted; the separately authorized image-delivery, same-portrait and font-preload improvements are now being validated without CSS or interaction changes.

## What the reports actually show

The supplied mobile reports cover `/en/` (performance/accessibility/best practices/SEO: 80/96/96/100) and `/en/introduction_to_event_sourcing/` (37/92/50/92). Both report passing real-user Core Web Vitals, LCP 2.1s and CLS 0, with no available INP. Their lab results differ substantially: the article has LCP 24.1s, 660ms blocking time and about 4.65MiB transferred.

Independent Lighthouse 13.5.0 production runs reproduced the types of failures, not identical scores. The first homepage/article runs scored 56/46 for performance and transferred about 0.67/4.08MiB. They were run concurrently and are diagnostic evidence, not controlled comparison baselines. A subsequent sequential test of the new audit runner scored 98 on the same unchanged live homepage. Network/provider variation and resource contention matter; one score is not proof of improvement.

The article audit attributed approximately 1.63MiB to substackcdn.com, 0.41MiB to substack.com and 0.10MiB to the embedded newsletter document. Disqus/ad-related domains contributed roughly another MiB. First-party requests contributed approximately 0.46MiB. The primary problem is eager third-party work, not evidence that Gatsby's own bundle alone needs a rewrite. Removing Disqus will not eliminate the larger Substack payload.

## Findings and proposed responses

| Finding | Evidence and Gatsby 5 approach | State / decision |
| --- | --- | --- |
| `Service.inLanguage` invalid | `inLanguage` is emitted on every root schema object; Service is not a CreativeWork. Omit it from Service while retaining HTML language and valid language metadata elsewhere. | Small fix applied locally; generated-output test added. |
| Date/time warning | `datePublished` and Open Graph publication time use the filename's date-only prefix. Schema.org accepts Date or DateTime; Google's Article validator recommends a full timestamp and timezone. Sources do not record the original time. | Proposal: support an optional real `publishedAt` value. For legacy dates, decide whether to keep date-only warnings or explicitly adopt a documented midnight convention. Do not fabricate an exact historical time silently. No date conversion applied. |
| Missing iframe title | The subscription iframe has no accessible title. | Title and React `frameBorder` spelling corrected locally. |
| Eager subscription iframe | The offscreen newsletter starts its own large application and fonts. | Native `loading="lazy"` applied locally; it still appears automatically. The request test passes on the longer GDPR article, with no initial request and automatic loading on scroll. Introduction is inside Chromium’s preload distance on desktop and mobile, so its iframe still loads early. This is a limited quick win, not a fix for that article’s Substack payload. Replacing it with a lightweight form/link is a product choice, not an automatic optimization. |
| Eager Disqus, third-party cookies and advertising | Current article footer immediately mounts DiscussionEmbed, loading Disqus and ad networks. | Discuss Giscus replacement below. Alternative: automatically load Disqus as its section approaches the viewport, without a button, and reserve space. Not implemented. |
| Image dimensions | Header/author avatar has CSS dimensions but no intrinsic width/height. | Intrinsic dimensions and `height: auto` preserve displayed sizing. The authorized higher-resolution same-portrait asset now declares its actual 180×180 dimensions. |
| Low-resolution avatar | Source is only 60×60, shown up to 60 CSS pixels on high-DPI screens. | The same [public GitHub portrait](https://github.com/oskardudycz.png?size=180) is now a cacheable local 180×180 WebP with intrinsic dimensions; existing 44/48/60px CSS display sizes remain. Browser screenshots and dimension tests verify it. |
| Article cover format and LCP discovery | Introduction cover is an approximately 187KiB PNG, marked lazy, and is the LCP element. | WebP enabled at quality 80 with original-format fallback. A native ESM Remark plugin prioritizes only the measured Introduction cover in EN/PL; later images stay lazy. Generated-output tests enforce both formats and exactly one priority image. |
| Oversized homepage covers | FULL_WIDTH image data declares `sizes="100vw"` although cards sit in a narrower container. | Gatsby Image sizes now match measured card widths, with additional responsive breakpoints. Browser tests compare declared/actual slots at 390/600/768/1024/1440px at DPR 1 and 2 and require WebP delivery. |
| Font stylesheet / layout shifts | Article shifts correlate with font loading; layout changes font family and weights again after FontFaceObserver resolves. | Preload the existing Latin 400/600 WOFF2 fonts, with crossorigin. Tests verify two valid local font resources. Existing family/weight transitions and font-display remain. Metric-compatible fallback/size-adjust changes are deferred because font metrics can change wrapping/menu layout. |
| Forced layout | Menu repeatedly changes classes and measures item widths; Lighthouse reports React/app layout work. | Menu now restores all classes, reads all widths, then applies overflow classes and updates state once. Existing sticky/mobile-menu/navigation browser regressions remain mandatory. This removes interleaved writes/reads; no quantified Lighthouse speedup is claimed. |
| Contrast | Green links (#709425 on white) measure about 3.52:1; small footer text about 3.02:1. | Darker text/link colors can meet 4.5:1. Choose scoped accessible text colors rather than globally changing branding. Color changes require review; reverted prototype. |
| Non-descriptive link | Lighthouse flags the menu's “Start” link. | Consider localized “Home” / “Strona główna”, or an explicit descriptive accessible name with current visible wording retained. Discuss wording/layout; not applied. |
| Cache lifetimes | Reproduced article cache warnings mostly concern Disqus/Substack resources. First-party homepage caching did not fail the audit. | We cannot change vendor headers. Reduce when vendor resources load; inspect our hashed assets separately. Never give mutable page-data/HTML immutable caching merely to improve a score. |
| Unused JS/CSS, old JS, minification and long tasks | Much of the article payload comes from external applications, ads and fonts. Homepage unused-JS findings point to Google Tag Manager/Analytics. | Measure first-party and vendor contributions separately. Gatsby Script can schedule controlled scripts, but does not rewrite scripts inside cross-origin iframes. Preserve analytics until its loading/measurement trade-off is discussed. |
| DOM size | Long articles and vendor embeds add nodes. | Keep article text visible and indexable. Reducing vendor DOM is preferable to hiding or virtualizing the article. |
| Deprecated APIs, console/Issues warnings | Vendor/browser-dependent findings vary between runs. Local reproduction did not reproduce the supplied deprecation count. It did report requests for /404/. | Inspect source locations and normal browser network traces before changing application code. Expected diagnostic 404 requests are not evidence of a broken article link by themselves. |
| CSP, HSTS, COOP, Trusted Types | These are security recommendations, not automatic proof of poor performance. Production already serves one-year HSTS. | Review CSP hashes/allowlists against Gatsby bootstrap, inline styles, article HTML, analytics and embeds. COOP can affect OAuth popups; enforcing Trusted Types can break current HTML sinks. Propose/test a report-only policy first; no blind enforcement or HSTS preload/subdomain expansion. |

The generated 800px Introduction cover is 38,034 bytes as WebP versus 191,674 bytes as PNG (about 80% smaller for this asset). Its dimensions and pixel comparison pass the existing 3% screenshot tolerance. This is an asset comparison, not a measured whole-page LCP/score improvement.

Implemented items have regression coverage; pending decisions are listed explicitly below. This is not a claim that every audit is fixed. Third-party cookie/cache behavior remains controlled by providers once their embeds load.

Primary implementation references: [Gatsby performance](https://www.gatsbyjs.com/docs/how-to/performance/improving-site-performance/), [Gatsby Image](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/), [Gatsby Script](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-script/), [native iframe lazy loading](https://web.dev/articles/iframe-lazy-loading), [font layout-shift mitigation](https://web.dev/articles/optimize-cls), [Google Article timestamps](https://developers.google.com/search/docs/appearance/structured-data/article), [Schema.org datePublished](https://schema.org/datePublished), [Service](https://schema.org/Service), [Netlify headers](https://docs.netlify.com/manage/routing/headers/), and [CSP](https://developer.chrome.com/docs/privacy-security/csp).

## For your review — decisions intentionally not applied

| Decision | Why your review is needed | What to decide |
| --- | --- | --- |
| Disqus → Giscus, or automatic viewport loading | Changes login/moderation/history or when comments initialize. Vendor cookies/ads cannot be fixed by Gatsby configuration. | Choose provider and bilingual thread/history policy; see migration discussion below. |
| Replace the Substack application with a lightweight form | Native lazy loading reduces initial work, but the vendor payload remains when reached. A replacement changes the subscription flow and may need backend integration. | Keep the lazy automatic embed, approve stricter automatic viewport loading (no extra click), or approve a lightweight form prototype. |
| Link/footer contrast | Passing contrast needs different visible colors and therefore a branding choice. | Approve scoped accessible colors before the CSS redesign. |
| “Start” navigation label | Changing visible wording is a content choice; an accessible name can retain the visible label. | Choose EN/PL wording or approve descriptive accessible names. |
| Article publication timestamps | Historical sources record dates, not exact publication times. Guessing midnight silently invents precision. | Keep date-only warnings, or approve documented legacy convention plus optional real publishedAt metadata. |
| Font fallback metrics | Preloads are implemented; changing font fallback metrics may alter wrapping before fonts load. | Approve a separately measured size-adjust prototype if shifts persist. |
| Analytics scheduling/removal | Changes measurement timing and can lose events; unused vendor code is not controlled by Gatsby. | Agree acceptable measurement trade-offs before modifying GTM. |
| CSP/COOP/Trusted Types/HSTS expansion | Enforcement can break Gatsby bootstrap, inline styles, embeds and authentication popups. Existing one-year HSTS remains. | Review a report-only policy and compatibility evidence before enforcement. |
| Lighthouse CI thresholds | Live external services and network conditions make individual scores variable. | Agree repeated-baseline payload/metric budgets; retain deterministic checks meanwhile. |

No approval is needed to run the local regression tests. CI and production verification are still separate, pending steps: deploy through the normal workflow, rerun Rich Results/Schema.org and repeated production audits, and request a Bing recrawl if its stale heading warning remains.

## Disqus versus Giscus — discussion before migration

[Giscus](https://giscus.app/) uses GitHub Discussions and advertises no ads or tracking. It supports English/Polish UI, themes and a React integration. Readers need a GitHub account and app authorization to comment. The discussion repository must be public, have Discussions enabled and have the Giscus app installed. This is a good candidate for a developer audience, but we should measure its actual initial payload instead of promising a score.

| Option | Benefit | Trade-off |
| --- | --- | --- |
| Keep Disqus, automatic viewport loading | Keeps current login and comment history; reduces early work without an extra click | Ad networks, cookies and vendor cache policies remain when loaded |
| Replace with Giscus | Removes Disqus advertising integration; fits GitHub-oriented readers; supports future themes | GitHub login requirement, repository/app setup, provider and moderation changes |

[Andrew Lock's migration article](https://andrewlock.net/migrating-comments-from-dsqus-to-giscus/) shows why importing historical comments is a separate project: XML export, filtering, author attribution, flattening deep replies, URL repair, rate limits and restartable checkpoints. Imported comments do not automatically become posts authored by the original GitHub users. Avoid unsolicited mentions/notifications.

Proposed migration sequence, subject to agreement:

1. Choose a dedicated public discussion repository or the site's existing repository; choose category and moderation policy.
2. Decide whether English/Polish versions share a discussion. Prefer a stable explicit article identity rather than titles that can change; preserve existing Disqus identifiers and URL mappings in the migration manifest.
3. Export Disqus and produce an offline dry-run inventory: thread/comment counts, exclusions, attribution, flattened reply structure and destination mappings. Retain the original export and review it before any GitHub writes.
4. Prototype Giscus in a preview with automatic availability, EN/PL labels and no extra “Show comments” button. Test authentication, navigation, dark/light theme compatibility and error states.
5. Import reviewed historical data with idempotent checkpoints, validate totals and sample threads, then switch provider. External account/app installation and comment publication require a concrete reviewed migration.

No Giscus installation, repository mutation, comment export/import or provider switch has been performed.

## Repeatable testing

The repository now has `yarn audit:performance`. It pins Lighthouse 13.5.0, uses the lockfile's Playwright Chromium, audits pages sequentially with fresh browser profiles, and saves JSON plus a summary. Browser profiles are temporary and cleaned up, avoiding chrome-launcher's WSL profile folders in the repo. The default reports directory `report/performance/` is ignored by Git.

Playwright and the matching official `@playwright/browser-chromium` package are pinned project development dependencies (1.63.0). Yarn installs Chromium automatically. If its browser cache is missing, recover it with:

```sh
yarn browsers:install
```

On Linux CI use `yarn browsers:install:ci` to install browser OS dependencies too; the workflow uses this command.

Take a production baseline before changes:

```sh
yarn audit:performance --base-url https://event-driven.io --label production-before
```

The default is three mobile runs each for the homepage and Introduction to Event Sourcing. Lighthouse's pinned npm package is fetched on first use; it is not added as an application dependency. Add a representative route explicitly:

```sh
yarn audit:performance --base-url https://event-driven.io --page /pl/training/ --label training-before
```

For local comparisons, build with the same environment/indexing/analytics/comment settings for both revisions, then serve in one terminal:

```sh
ALGOLIA_SKIP_INDEXING=true yarn build
yarn test
yarn serve -H 127.0.0.1 -p 9000
```

In another terminal:

```sh
yarn audit:performance --base-url http://127.0.0.1:9000 --label local-before
```

Repeat with `--label local-after` after a candidate change. Keep the lockfile, browser, Lighthouse version, build environment and machine fixed. Run audits sequentially without builds or other heavy tasks in parallel. Fresh profiles provide cold browser caches; CDN caches and vendor responses are not controlled. Do not compare a credential-free local build to production with analytics/Disqus enabled and call that a performance improvement.

Compare **median** LCP, blocking time, CLS and transfer bytes across three runs, plus concrete failed audit IDs and affected URLs/elements. Summary includes browser/Lighthouse versions. Reports retain request origins and details, so distinguish first-party regressions from vendor changes. Scores are diagnostics, not a deterministic CI gate. The browser test checks native iframe lazy loading initially and on scroll on the longer GDPR article, with the form available without a click. Chromium can preload nearer embeds; Introduction loaded its embed initially at both desktop and mobile sizes. Do not claim that its vendor payload is deferred by this attribute.

Keep deterministic `yarn smoke`, `yarn lint:modern`, `yarn test` and `yarn test:visual` gates. The existing CI gate now checks headings across all 694 generated standalone pages; the small Service/iframe fixes have output checks. Continue external Rich Results/Schema.org validation after deployment. PageSpeed field data covers a rolling period and cannot immediately prove a new deployment's effect; the supplied reports do not provide INP.

A useful later CI extension is a saved Lighthouse artifact on a controlled runner, with request/payload budgets agreed from a repeated baseline. Do not make a single live Lighthouse score fail deployment.

## Local verification

Current authorized changes: frozen Yarn installation passed (0.68s); smoke passed with 72 source files and 17 GraphQL queries; scoped lint and diff checks passed; final production build passed (28.84s); full tests passed (18.11s), including all 14 new performance regressions; all 18 browser checks passed (44.06s command time). Existing screenshots and tolerances were retained. Exact routes, redirects, sitemap URLs and feeds remain unchanged; the existing SEO gate still checks all 694 standalone pages.

`yarn test:performance`, included in `yarn test` and therefore CI, checks EN/PL cover priority, WebP with original fallback, lazy loading across generated Markdown images, real local font preloads, portrait dimensions, image-priority exclusions, grouped menu DOM reads/writes and cover visual detail/byte savings. `yarn test:visual` verifies image slot widths/WebP delivery at five breakpoints and DPR 1/2, plus distant-newsletter request deferral and automatic loading on scroll. Existing hydration, font, sticky menu, language switching, metadata and screenshots remain regression gates. The CI browser installation now uses `yarn browsers:install:ci`.

The first WebP-generation build took substantially longer and encountered a workspace-only permission error while saving Gatsby's user configuration after generating pages. The permitted retry passed (144.77s); final warm validation passed in 28.84s. Intermediate cold-query warnings over 15s still occurred; the final warm build had no Gatsby warnings. These timings are different cache states, not a controlled speedup claim. Yarn still reports its existing url.parse deprecation on installation. No lockfile/package-manager/runtime migration is included.

The audit runner's earlier help, scoped lint and one-run production smoke passed with Lighthouse 13.5.0 and Chromium 153.0.8010.12, leaving reports in /tmp and no profile folders in the repository. No new full-page before/after Lighthouse improvement is claimed for this implementation. The measured asset saving is separate from vendor payload and native-lazy proximity limits described above.

CI execution and deployed Rich Results/Schema.org/PageSpeed verification remain pending. No production deployment, provider migration, external indexing request or account mutation was performed.

### CI navigation timeout follow-up

The reported older CI test timed out waiting for networkidle on Introduction. The current distant-article version retained that unreliable wait, so both newsletter and training checks now use DOM readiness plus explicit font/hydration/iframe conditions. A mocked request deliberately remains open through navigation and newsletter scroll, proving the check does not need network inactivity. The test still verifies zero initial newsletter requests on the distant article and automatic loading on scroll; no production behavior or screenshot tolerance is changed. See [Playwright's readiness guidance](https://playwright.dev/docs/api/class-page#page-goto-option-wait-until).

Final local validation: all 18 browser checks passed in 40.51s command time, with existing screenshots/tolerances retained; diff checks passed. The next CI run remains pending.
