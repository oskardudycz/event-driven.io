# Tags and learning paths from the course reading list

Status: draft, 2026-10-13. Decisions and their reasoning are in [qa.md](qa.md).

## Goal

Oskar's MTU reading list ("2026-09 - MTU - Event Sourcing and Event Driven Architecture") groups links by topic in a deliberate reading order. Bring that structure into the blog by enhancing what already exists:

- Articles can carry several **tags**. Today an article has one `category`, plus an optional `categories` list.
- Each topic with Oskar's articles becomes a **learning path**: a tag page whose numbered recommended order follows the list. Today these are category pages with an order taken from `data/category-guides.json`.
- `related` links between articles are valid and mutual.

This is also the first step towards a private MCP/Skills/RAG repository that will read the blog's content and metadata. That repository is out of scope here. This step only makes the blog's metadata complete and consistent.

## Inputs

- `docs/learning-paths/reading-list.md` holds the full reading list, as provided by Oskar. The copy pasted in chat was cut off in the Kafka section.
- Current repo state:
  - Posts are in `content/posts/YYYY-MM-DD--slug/index.{en,pl}.md`.
  - `category` appears in all posts, `categories` in 5, `related` in 16.
  - `data/category-guides.json` is used by `site/node.ts`, `src/templates/CategoryTemplate.tsx` and `src/pages/category.tsx`.
  - Architecture Weekly posts are already imported as ordinary posts, with the same slug as on Substack.

## Requirements

### R1. Link check

- Check every URL in the reading list. Record the HTTP status, the final URL after redirects, and the section(s) it appears in.
- Map every event-driven.io and architecture-weekly.com link to a post slug in `content/posts`.
- Report:
  - dead or redirected links
  - own links that don't resolve to a post
  - duplicates within a section
  - list formatting defects
- Write the report to `docs/learning-paths/link-check.md`.
- The report is input to R2–R4. Fixing third-party links belongs to the private repo.

### R2. Tags

- Rename the frontmatter fields `category`/`categories` to one `tags` list. The first tag is the primary one, which keeps today's primary display.
- Each existing tag value is kept. Near-duplicates are merged through a mapping table approved by Oskar, for example Testing/Tests and PostgreSql/PostgreSQL/Postgres.
- Every reading-list section that contains at least one of Oskar's articles becomes a tag:
  - Where a section matches an existing tag, it reuses that tag rather than adding a new one.
  - Each article listed in a section gets that section's tag.
- Update the importers (`import-articles --category`, newsletter and Architecture Weekly) to write `tags`.
- The README authoring docs describe `tags`.

### R3. Learning paths

- Enhance `data/category-guides.json`: rename it to fit the new naming (for example `data/learning-paths.json`) and keep its shape (`language`, `slug`, `description`, `recommended`).
- Each tag from R2 that comes from a reading-list section gets a learning path. Its `recommended` lists Oskar's articles in the order they appear in that section.
- Existing guides keep their entries. Where a guide's order conflicts with the list order, Oskar decides.
- Polish paths list only articles with a Polish route, in the same order.
- Each path page shows the numbered recommended order first, then the remaining tagged articles by date. This is today's behaviour.

### R4. Navigation and routes

- Rename the "Categories" menu item to "Learning paths" (EN) and "Ścieżki nauki" (PL).
- Proposed routes, each with a permanent redirect from the old URL:
  - `/{lang}/category/` → `/{lang}/learning/`
  - `/{lang}/category/{slug}/` → `/{lang}/tags/{slug}/`
- Sitemap, canonical/hreflang, search, llms.txt and IndexNow pick up the new routes. No old route returns 404.

### R5. Related

- Every `related` entry resolves to an existing post. This is already enforced by `relatedFor` in `site/node.ts`.
- Relations are mutual: if A lists B, B lists A, in each language where both routes exist.
- New relations are not generated from shared tags. A learning path already expresses that grouping.

### R6. Cleanup

- Remove `data/talks.json`. It isn't rendered or read anywhere.

## Non-goals

- Third-party links in the blog.
- A registry for GitHub samples or talks.
- Any MCP, RAG or Skills code.
- Visual redesign of the tag or learning pages beyond the renamed labels.

## Testing

Follow TDD and the repo's [testing guidance](../testing-guidance.md). Keep screenshot tolerances, and review any intended reference changes.

- **Unit:**
  - tag normalisation and the merge mapping
  - building a learning path from a list section
  - related symmetry
  - frontmatter migration on fixture posts
- **Integration** (Gatsby node creation and generated output):
  - tag pages are created
  - learning path order
  - old routes redirect
  - sitemap and canonical include the new routes
  - EN/PL route parity
- **End-to-end** (Playwright):
  - the menu label in EN and PL
  - the `/learning/` index
  - numbered order on a learning path page in EN and PL
  - old `/category/` URLs land on the new pages
  - mobile and desktop navigation
- The existing suites pass: `npm test`, `npm run lint`, a fresh `npm run build`, and the browser gates.

## Phases

The work runs in phases. Each phase ends in a working state: build, lint and tests are green before the next one starts.

| Phase | Work                                                                               | Order                                      |
| ----- | ---------------------------------------------------------------------------------- | ------------------------------------------ |
| 0     | R1 link check; impact map of every `category` usage (code, tests, importers, docs) | parallel                                   |
| 1     | Tag mapping table and section → tag mapping                                        | sequential, **stop for Oskar's approval**  |
| 2     | R2 frontmatter migration plus code rename; R6 talks.json removal                   | R2 sequential; R6 in parallel              |
| 3     | R3 learning paths data                                                             | after phase 2                              |
| 4     | R4 routes, redirects, menu labels                                                  | after phase 3, **stop for route approval** |
| 5     | R5 related symmetry                                                                | parallel with phase 3 or 4                 |
| 6     | plan.md/todo.md/README updates; full local gate                                    | last                                       |

## Stop points

- Approval of the tag merge mapping and the section → tag mapping (phase 1).
- Conflicts between existing guide orders and the reading-list order.
- Route renames and redirects (phase 4). They affect SEO and indexed URLs.
- Any failing check that turns out to be unrelated to this change.
