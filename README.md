# Event-Driven.io

Event-Driven.io - Resources about Event-Driven Architectures, Event Sourcing and pragmatic development

## Importing articles

Install dependencies with Yarn, then import one or more public post URLs:

```sh
npm run import-substack -- https://www.architecture-weekly.com/p/post-slug
npm run import-substack -- https://www.architecture-weekly.com/p/post-slug --category "Event Sourcing"
npm run import-substack -- --manifest import/substack-posts.json
npm run import-articles -- --manifest import/eventstore-posts.json
npm run import-articles -- https://kurrentdb.kurrent.io/blog/post-slug/ --category "Event Sourcing"
npm run test:substack
```

The manifest is an array of `{ "url": "...", "category": "...", "slug": "optional-custom-slug" }` entries. The default category is `Software Architecture`. Dates come from the original publication metadata, and the URL slug determines the blog URL. Imports create `content/posts/YYYY-MM-DD--slug/index.en.md` and `index.pl.md` with identical article text. Polish copies use `useDefaultLangCanonical: true` until translated.

The English article also gets `redirectFrom: /slug/` in its frontmatter. Gatsby uses this to generate an unconditional permanent (301) redirect from `/slug/` to `/en/slug/`, before the catch-all rule. Custom slugs also receive `redirectAliases` for the original source slug at `/source-slug/` and `/en/source-slug/`, pointing to the chosen English URL. No separate redirect file or manual step is needed after importing; redirects take effect when the site is built and deployed. Run `npm run test:redirects` to verify Gatsby's redirect registration and Netlify output.

The Architecture Weekly migration manifest is in [architecture-weekly-missing.json](import/architecture-weekly-missing.json). It records 63 previously missing posts, including webinars, from the newest archive post through **#189, Mastering Database Connection Pooling (2024-08-05), inclusive**. All 63 were imported on 2026-10-04. The [audit](import/architecture-weekly-audit.json) accounts for all 93 archive posts in that range: 63 imported in this batch and 30 already present. Existing posts keep their current canonical blog slugs and have redirects for their original Substack slugs. The manifest is retained as a migration record; running it again refuses to overwrite these articles. Verify the migration with:

```sh
npm run test:archive
```

The audit records the archive IDs, publication dates, existing directories, match evidence, and video mappings. The supplied YouTube playlist contains two of the recordings in this date range; six more were found on the same channel, and two articles already embed their recording. All ten recording posts have `youtubeVideo` IDs in the manifest. `test:archive` checks the reviewed snapshot, manifest coverage, cutoff, recording mappings and existing redirects. The audit's existing/missing statuses reflect the repository when the manifest was prepared; the check also accepts subsequent imports with matching source metadata. If a batch fails, use a separate retry manifest containing only its remaining entries.

For future webinar imports, add `"youtubeVideo": "VIDEO_ID"` to the manifest entry. The importer inserts a YouTube player at the start of the article when that video is absent, including when Substack's native player sits outside the article body. To replace a linked recording card or thumbnail within the text, add `"recordingEmbeds": { "https://publication.substack.com/p/recording-slug": "VIDEO_ID" }`. Mapped cards are replaced before downloading their thumbnails; other article images and contextual embeds remain. IDs must be 11-character YouTube video IDs. Both languages get the same embeds, and source metadata records the mappings.

`import-articles` supports Substack, Kurrent/EventStore blog pages and dated Wayback capture URLs. `import-substack` remains a compatible alias. Archived articles use the original publication date and URL slug, fetch the raw capture without the Wayback toolbar, and download assets from the same capture date. Article links are restored to their original URLs. Kurrent's actual article hero is used as the cover instead of the site's default social logo. SVG diagrams stay as local SVG files; SVG covers also get a PNG thumbnail generated with Sharp. Code languages are preserved from both conventional classes and Kurrent's syntax-highlighted HTML.

The importer extracts the article body, excluding Substack navigation, subscription controls, obsolete paid/trial prompts and comments. It preserves headings, emphasis, lists, quotes, code, tables, links and image captions. Images and the social cover are downloaded into the article directory, deduplicated and referenced locally. Original Substack images are preferred; if a legacy original is unavailable, its publicly available Substack CDN copy is downloaded instead. YouTube players become the Gatsby plugin's Markdown embed syntax; other video/audio players and iframes are retained, with media streams hosted by the provider. Social blockquotes retain their text and links, but provider scripts are omitted, so review these embeds after import. Review unfamiliar interactive embeds manually as well.

Links to available blog articles are rewritten to relative `/en/slug/` URLs, including links to posts later in the same import batch. The importer resolves original source URLs from source metadata, redirect aliases and [verified title/slug aliases](import/architecture-weekly-link-aliases.json). Blog links retain their query parameters and fragments while newsletter tracking parameters are removed. Older posts without a blog version, webinar index pages and source comment threads keep their source links. The [link report](import/architecture-weekly-link-report.json) lists those remaining external references.

For a saved full page, use `npm run import-articles -- POST_URL --html saved-page.html`; images still need network access. Incomplete metadata, detected paywalls and failed/unsupported image downloads fail the import. An empty legacy paywall marker is accepted only when Substack marks the post public and its full source body matches the rendered content. Existing article slugs are never overwritten. Each article is staged before being added; if a batch fails, earlier successful imports remain. Remove successful entries from the manifest before retrying the rest. `article-source.txt` (or `substack-source.txt` for Substack; JSON formatted) records the source URL and downloaded asset URLs for review.

Conversion uses [Turndown](https://github.com/mixmark-io/turndown) and [its GFM plugin](https://github.com/mixmark-io/turndown-plugin-gfm), with Cheerio for Substack extraction and asset rewriting. [Substack2Markdown](https://github.com/timf34/Substack2Markdown) also supports post exports and image downloads, but is a separate Python workflow. [rehype-remark](https://github.com/rehypejs/rehype-remark) is an alternative HTML-to-Markdown pipeline; Turndown's custom rules fit the existing CommonJS import scripts and raw Gatsby embeds.

## YouTube embeds

Markdown articles use the syntax `` `youtube: [Video title](https://www.youtube.com/watch?v=VIDEO_ID&start=30)` ``. Gatsby recommends [gatsby-remark-embed-video](https://www.gatsbyjs.com/docs/how-to/images-and-media/working-with-video/), now updated to 3.2.1 to fix bare video IDs. The local [integration](plugins/gatsby-remark-video/index.js) delegates rendering to that plugin, preserves URL parameters its ID extraction otherwise drops, and configures lazy loading, privacy-enhanced YouTube URLs, player permissions and the referrer policy. Imported article Markdown contains no handwritten YouTube iframe markup.

YouTube embeds require a cross-origin referrer. The Netlify plugin configuration overrides its default `same-origin` referrer policy with `strict-origin-when-cross-origin`; removing this override can cause YouTube player configuration error 153. The click-to-play component and imported YouTube iframes also set this policy explicitly. Run `npm run test:video` to check the generated Netlify headers. See [YouTube's client identity requirements](https://developers.google.com/youtube/terms/required-minimum-functionality#api-client-identity-and-credentials).

## License

This blog is licensed under [License Creative Commons BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).


## Included configuration

1. Tracking with Google Analytics through Google Tag manager:
- [Setting up the Google Analytics 4 Property with Google Tag Manager](https://www.youtube.com/watch?v=-J4feudVguc)
- [Gatsby Google Tag Manager Config](https://www.gatsbyjs.com/plugins/gatsby-plugin-google-tagmanager/)
