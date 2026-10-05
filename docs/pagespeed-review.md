# PageSpeed and schema review — 2026-10-05

This is a research review and decision record. The owner authorizes obvious improvements that preserve appearance and behavior. Changes to interactions, branding, comment providers, publication-time assumptions or restrictive security policies need review first. Click-to-load subscription/comment buttons were rejected and removed. The experimental global colors, font behavior, image configuration, navigation wording and replacement avatar were also reverted.

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
| Eager subscription iframe | The offscreen newsletter starts its own large application and fonts. | Native `loading="lazy"` applied locally; it still appears automatically. Browser proximity thresholds vary, so verify actual requests. Replacing it with a lightweight form/link is a product choice, not an automatic optimization. |
| Eager Disqus, third-party cookies and advertising | Current article footer immediately mounts DiscussionEmbed, loading Disqus and ad networks. | Discuss Giscus replacement below. Alternative: automatically load Disqus as its section approaches the viewport, without a button, and reserve space. Not implemented. |
| Image dimensions | Header/author avatar has CSS dimensions but no intrinsic width/height. | Added real 60×60 attributes and `height: auto`, retaining the current image and displayed size. |
| Low-resolution avatar | Source is only 60×60, shown up to 60 CSS pixels on high-DPI screens. | Higher-resolution version of the same portrait is available from the public GitHub profile. Proposed responsive StaticImage/asset replacement; not applied. |
| Article cover format and LCP discovery | Introduction cover is an approximately 187KiB PNG, marked lazy, and is the LCP element. | Enable WebP in gatsby-remark-images; use eager/high-priority loading for the known above-fold image only. Keep later images lazy and verify screenshots/diagram legibility. Not applied. |
| Oversized homepage covers | FULL_WIDTH image data declares `sizes="100vw"` although cards sit in a narrower container. | Match image sizes/breakpoints to actual card widths; compare downloaded variants at mobile/desktop DPR. Use Gatsby Image, not a manual image rewrite. Not applied. |
| Font stylesheet / layout shifts | Article shifts correlate with font loading; layout changes font family and weights again after FontFaceObserver resolves. | Prototype selected font preloads and metric-compatible fallback fonts. Keep the final appearance and test menu measurements. Font `size-adjust` is preferable to hiding text until a font loads. No lifecycle/font behavior changes applied. |
| Forced layout | Menu repeatedly changes classes and measures item widths; Lighthouse reports React/app layout work. | Batch writes, then reads, then final writes in overflow calculation; prove navigation still works at all breakpoints. Profile before claiming improvement. Not applied. |
| Contrast | Green links (#709425 on white) measure about 3.52:1; small footer text about 3.02:1. | Darker text/link colors can meet 4.5:1. Choose scoped accessible text colors rather than globally changing branding. Color changes require review; reverted prototype. |
| Non-descriptive link | Lighthouse flags the menu's “Start” link. | Consider localized “Home” / “Strona główna”, or an explicit descriptive accessible name with current visible wording retained. Discuss wording/layout; not applied. |
| Cache lifetimes | Reproduced article cache warnings mostly concern Disqus/Substack resources. First-party homepage caching did not fail the audit. | We cannot change vendor headers. Reduce when vendor resources load; inspect our hashed assets separately. Never give mutable page-data/HTML immutable caching merely to improve a score. |
| Unused JS/CSS, old JS, minification and long tasks | Much of the article payload comes from external applications, ads and fonts. Homepage unused-JS findings point to Google Tag Manager/Analytics. | Measure first-party and vendor contributions separately. Gatsby Script can schedule controlled scripts, but does not rewrite scripts inside cross-origin iframes. Preserve analytics until its loading/measurement trade-off is discussed. |
| DOM size | Long articles and vendor embeds add nodes. | Keep article text visible and indexable. Reducing vendor DOM is preferable to hiding or virtualizing the article. |
| Deprecated APIs, console/Issues warnings | Vendor/browser-dependent findings vary between runs. Local reproduction did not reproduce the supplied deprecation count. It did report requests for /404/. | Inspect source locations and normal browser network traces before changing application code. Expected diagnostic 404 requests are not evidence of a broken article link by themselves. |
| CSP, HSTS, COOP, Trusted Types | These are security recommendations, not automatic proof of poor performance. Production already serves one-year HSTS. | Review CSP hashes/allowlists against Gatsby bootstrap, inline styles, article HTML, analytics and embeds. COOP can affect OAuth popups; enforcing Trusted Types can break current HTML sinks. Propose/test a report-only policy first; no blind enforcement or HSTS preload/subdomain expansion. |

These are implementation candidates, not claims that every audit is fixed. Third-party cookie/cache behavior remains controlled by providers once their embeds load.

Primary implementation references: [Gatsby performance](https://www.gatsbyjs.com/docs/how-to/performance/improving-site-performance/), [Gatsby Image](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/), [Gatsby Script](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-script/), [native iframe lazy loading](https://web.dev/articles/iframe-lazy-loading), [font layout-shift mitigation](https://web.dev/articles/optimize-cls), [Google Article timestamps](https://developers.google.com/search/docs/appearance/structured-data/article), [Schema.org datePublished](https://schema.org/datePublished), [Service](https://schema.org/Service), [Netlify headers](https://docs.netlify.com/manage/routing/headers/), and [CSP](https://developer.chrome.com/docs/privacy-security/csp).

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

Install Chromium once:

```sh
yarn playwright install chromium
```

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

Compare **median** LCP, blocking time, CLS and transfer bytes across three runs, plus concrete failed audit IDs and affected URLs/elements. Summary includes browser/Lighthouse versions. Reports retain request origins and details, so distinguish first-party regressions from vendor changes. Scores are diagnostics, not a deterministic CI gate. Native iframe lazy loading should be tested at initial load and on scroll, with the form remaining accessible without a click.

Keep deterministic `yarn smoke`, `yarn lint:modern`, `yarn test` and `yarn test:visual` gates. The existing CI gate now checks headings across all 694 generated standalone pages; the small Service/iframe fixes have output checks. Continue external Rich Results/Schema.org validation after deployment. PageSpeed field data covers a rolling period and cannot immediately prove a new deployment's effect; the supplied reports do not provide INP.

A useful later CI extension is a saved Lighthouse artifact on a controlled runner, with request/payload budgets agreed from a repeated baseline. Do not make a single live Lighthouse score fail deployment.

## Local verification

The small fixes passed the production build (129.28s), full tests (11.36s), all 16 browser checks (29.52s), smoke, scoped lint and diff checks. Existing screenshots/tolerances and exact routes/redirects/sitemap/feed contracts were preserved. The audit runner's help, scoped lint and a one-run production smoke succeeded with Lighthouse 13.5.0 and Chromium 153.0.8010.12. It produced reports under /tmp and left no Lighthouse profile folders in the repository. CI and deployed validation remain separate; no production deployment was performed.
