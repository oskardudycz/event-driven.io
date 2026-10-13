# Impact map: renaming category to tags and learning paths

Read-only survey, 2026-10-13. Line numbers are from that date.

## Code

- site/node.ts:
  - imports: :10, :15, :23
  - page query: :146-147
  - category pages: :232-268, path at :258
  - GraphQL schema: :754-755
  - redirects: :286-303 (createRedirect, 301), :484-536 (locale redirects)
- src/utils/tag-posts.ts and src/utils/tag-slug.ts
- src/pages/category.tsx (+ .module.css); src/templates/CategoryTemplate.tsx (+ .module.css)
- Components:
  - Post/Meta.tsx :13-37
  - Post.tsx :36, :57-58
  - Blog/Item.tsx :11-27
  - Blog/ArchiveCard.tsx :10, :26, :50
  - Search/SearchResult.tsx :41-48
  - Seo/Seo.tsx :181-190 and :231-232 (`article:section` uses `category` only)
- Queries:
  - src/pages/articles.tsx :48-49
  - index.tsx :62-63
  - newsletter-pl.tsx :48
  - src/templates/PostTemplate.tsx :100-101
- Types: src/types/content.ts :24-25, :64
- Search:
  - src/search/documents.ts :75-80
  - options.ts :8, :14, :22
  - types.ts :9, :14-16
- i18n:
  - src/i18n/locales/{en,pl}/translation.json :11 (menu)
  - the `categories.*` blocks at :38-53
- Menu: src/components/Menu/Menu.tsx:65
- Scripts:
  - generate-llms-txt.ts :85
  - seo-build-verifier.ts :57-58, :175 (hardcoded `/en/category/event-sourcing/`)
  - gatsby-cache-key.ts :41-42
- Importers:
  - import/import-substack.ts :568, :632-661 (`--category`)
  - import/types.ts :4
  - manifests: substack-posts.json, eventstore-posts.json, architecture-weekly-missing.json
- Content links: content/pages/0--consulting/index.{en,pl}.md:84
- Docs: README.md :122, :179-180, :194, :210, :331-349

## Redirects

- netlify.toml :13-193:
  - legacy `?category=` query rules targeting `/{lang}/category/{slug}/`
  - explicit PL → EN category 301s
- gatsby-plugin-netlify writes `createRedirect` output to public/_redirects.

## Tests

- src/utils/tag-posts.unit.test.ts
- tests/articles/rendering.generated.test.ts :5-6, :114-305
- tests/seo/indexing.generated.test.ts :111-134
- src/search/indexing.unit.test.ts :24
- tests/gallery/editorial.story.tsx :46, :86
- Playwright:
  - tests/articles/archives.e2e.spec.ts :31-36, :99, :109
  - src/components/Menu/navigation.e2e.spec.ts :474
  - tests/theme/styles.e2e.spec.ts :369
  - src/components/ThemePicker/theme.e2e.spec.ts :288
- tests/fixtures/build-contract.json:
  - 29 EN + 10 PL category routes
  - redirects
  - sitemap URLs
  - regenerate with `npm run update:build-contract`
- No committed screenshot references cover category pages.
