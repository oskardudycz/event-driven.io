# Astro implementation

Astro is the production publisher. The application follows AstroPaper’s standard project structure where it fits the existing bilingual site. [The native review](astro-native-review.md) records the template comparison, changes and deliberate differences.

```sh
npm ci
npm run dev                         # http://localhost:4321/en/
npm run build                       # generates dist/
npm run serve -- --port 9000        # Netlify redirects and HTTP 404 behavior
npm run verify:publication          # local validation, no deployment
```

Use Astro’s native `npm run build -- --outDir .cache/comparison` for an isolated output directory on the project filesystem (Astro moves build assets with filesystem renames). Compare builds with `npm run compare:builds -- --baseline /path/to/baseline --candidate dist`. Comparison checks routes, ordered redirects, sitemap/feed identities and parsed metadata. Current-source generated tests also check content, assets, languages and security boundaries. Image filenames may change when the native optimizer changes; linked assets must exist and contain bytes.

## Structure

- `src/pages/`: Astro routes and native static publication endpoints.
- `src/layouts/Document.astro`: document metadata, theme/font initialization and native client navigation.
- `src/components/`, `src/page-views/`: existing presentation and component-owned CSS. Static views render without a client directive. The Astro layout owns the static main content and footer; only the interactive header hydrates. Native HTML slots carry interactive widgets inside server-rendered views; article/archive records are not client props. Hero, search, contact, newsletter, sharing and comments hydrate independently where needed.
- `src/content.config.ts`: validated collections using native `glob({ deferRender: true })`. Astro owns source watching; source changes invalidate derived development rendering.
- `src/lib/`: route/content preparation, pure SEO metadata, native image requests and publication data. `src/config.ts` owns site configuration.
- `content/`: authored Markdown, adjacent artwork and importer destinations. Native glob supports this location; importing/editorial workflows remain unchanged.
- `public/`: unchanged fonts, icons, headers, robots, WebFinger and service-worker retirement response. `dist/`: ignored build output. `npm run clean` removes output/cache and preserves public source.
- `tests/`: whole-site/generated checks, browser infrastructure and cross-feature examples. Tests for individual modules/components remain colocated. `scripts/` contains maintenance and verification commands.

## Supported APIs and retained behavior

`astro:assets/getImage()` owns optimization, filenames, caching, development image responses and static emission. Imported image metadata supplies the existing portable picture markup. A Sharp metadata read detects transparency so a blurred layer never appears behind transparent artwork; it performs no transformation or cache writes. Vite URL imports publish unchanged SVG/GIF/downloads.

Native endpoints publish feeds (official `@astrojs/rss`), sitemap, localized recovery aliases, search data, redirects and manifest. No publication files are written by route discovery or patched after the build. Netlify preview is needed to validate hosting redirects and HTTP error statuses.

Supported remark plugins preserve authored inline footnotes, heading links, code directives, typography, video embeds and excerpts. Bounded provider lookups and source-aware excerpt caching serve those editorial requirements. MiniSearch retains localized results and covers without a provider change.

The existing CSS Modules, local fonts and appearance remain. Public environment names `GATSBY_DISQUS_NAME`, `GOOGLE_TAG_ID`, `FB_APP_ID`, and the `gatsby-route-change` GTM event preserve existing account configuration. Source license notices and authored decorative-image markers remain intentionally. None requires a Gatsby runtime.

## Verification

Vitest owns pure logic, integration, generated publication and controlled components. Playwright Test owns full-site SSR/hydration, EN/PL navigation, responsive behavior, widget boundaries and visual references. See [testing guidance](testing-guidance.md). Readiness for geometry includes linked stylesheets and fonts, including JavaScript-disabled pages; DOMContentLoaded alone does not guarantee CSS readiness.

Current results and unresolved checks are recorded at the top of [todo.md](../todo.md). Earlier migration measurements below those records describe their historical implementation, not the current islands revision. Hosted CI, deployed behavior and live configured providers require separate verification. No deployment, IndexNow submission or visual-reference regeneration is included in this review.

With development running, `DEV_SEARCH_BASE_URL=http://127.0.0.1:4321 npm run verify:search:dev` creates an unreferenced temporary source article, checks its addition/edit/deletion/restoration in HTML and search, and removes it in `finally`. It preserves authored articles and strict guide-reference validation.
