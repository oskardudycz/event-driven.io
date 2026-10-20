# Astro migration trial

This is an isolated consulting-page trial, not the production website. Gatsby still builds `public/`; Netlify's existing build and publication workflow is unchanged. See [the migration review](../docs/gatsby-starter-comparison.md#13-execution-review-and-astro-trial-2026-10-20) for the full sequence and cutover gate.

```sh
npm run build:astro
npm run serve:astro -- --host 127.0.0.1 --port 4321
```

In restricted environments, set `ASTRO_TELEMETRY_DISABLED=1` if Astro cannot write its user configuration directory. This is a local execution setting, not a dependency-warning suppression.

Open `/en/consulting/` and `/pl/consulting/`. The trial uses current consulting Markdown, a typed Astro collection, the existing Article/Page/Bodytext components, shared tokens/reset/fonts and the same SEO data function as Gatsby. The existing appearance control hydrates as a localized React island. Output goes to `visual-artifacts/astro/`; the content cache goes to `.cache/astro/`. Run Gatsby and Astro builds sequentially because Gatsby can clear `.cache`.

The small language/appearance navigation is a trial harness. Header/Menu/Footer, articles, guides, images, search, redirects, feeds, sitemap and other publication integrations are not ported. This output must not be deployed as the site. The two-page build time is not comparable with a full Gatsby build.

The extra `cookie` bundling rule targets Astro's Vite prerender environment while Gatsby and Astro coexist. It prevents generated output from resolving Gatsby's hoisted older cookie API. Re-evaluate it when removing Gatsby; do not override Gatsby's cookie dependency.

To compare **complete builds of identical content** once the replacement is ready:

```sh
npm run compare:builds -- --baseline /path/to/gatsby-output --candidate /path/to/astro-output
```

This fails on added/missing routes, changed redirect rules/order, sitemap URLs or feed GUIDs and per-URL SEO differences. It requires both feeds and discovery files, so the current two-page trial cannot pass it. Keep the normal current-source generated checks and full-site E2E alongside this temporary migration comparison. Visual references and tolerances are unchanged.
