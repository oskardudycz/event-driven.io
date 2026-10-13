# Q&A: MTU 2026-09 reading list (Event Sourcing and Event-Driven Architecture)

## Q1. What should "check those links" mean for this spec?

Options offered: link health (dead links, redirects, moved pages), curation (duplicates, misplaced links, gaps), a repeatable tool for future course editions, or a combination.

**Answer:** Checking the links should also be the first step of a RAG setup.

**Notes:**

- The pasted list was cut off partway through the Kafka section, so the full source list still has to be supplied.
- Known issues in the paste: stray text after the last GDPR link, three link lines without a "- " prefix, links repeated within a section, and an events-versioning sample listed under "Uniqueness in Event Sourcing".

## Q2. Who will query the RAG, and what for?

Options offered: MTU students (course assistant), Oskar (research aid), an assistant answering in Oskar's voice, or a mix.

**Answer:** The RAG is extra context, not the point of this task. Oskar plans to experiment with MCP servers and Skills built on his content, including the GitHub samples, so that Claude and other LLMs can use it well and pick up his lessons learned: event modelling, event sourcing, good and bad messaging practices, architecture reviews and coding patterns.

**Implications:**

- The main task is still checking the links. Its output should be easy for a later ingestion step (MCP/Skills) to consume.
- The consumers are LLM agents, not students or the public.
- The later knowledge base centres on Oskar's own content. Third-party links matter as references Oskar endorses, not as the core corpus.

## Q3. What should the link check produce?

Options offered:

1. A cleaned Markdown list only.
2. A cleaned Markdown list plus a structured manifest (JSON/YAML) with one entry per link: original and final URL, HTTP status, source kind, own vs third-party, topics, fetchability, last-checked date.
3. The manifest only, with the course Markdown generated from it (recommended).

**Answer:** Option 2 is acceptable as well, so the choice between 2 and 3 is still open.

**Open point:** which file is the source of truth (Markdown or manifest). Q4 settles it.

## Q4. Which file is the source of truth?

Options offered: Markdown (manifest derived), manifest (Markdown generated), or both kept in sync.

**Answer:** The consequence wasn't clear. Oskar's model:

- Metadata that belongs to a single article lives in that article's Markdown frontmatter.
- Everything else lives outside, in a proper YAML or JSON file:
  - correlation between items, so recommendations can be mutual
  - category metadata, such as recommended reading

**What the event-driven.io repo already has** (checked):

- Posts: `content/posts/YYYY-MM-DD--slug/index.{en,pl}.md`. 332 folders, 627 files.
- Frontmatter: `title`, `category`, `cover` and `author` everywhere. Also `categories` (5 files), `related` (16), `description`/`summary` (10), `redirectFrom` (97), and a few others.
- `related:` is a one-way list of slugs within one language. `site/node.ts` (`relatedFor`) validates it and fails the build on an unknown slug.
- `data/category-guides.json`: curated `recommended` slugs per category and language (8 entries). This is already the "category metadata outside" pattern.
- `data/talks.json` and `data/videos.json` exist and aren't connected to articles.
- Slug: folder name minus the date prefix, lowercased. Route: `/{lang}/{slug}/`.

**Consequences agreed for the spec:**

- Per-article facts stay in frontmatter. Relations and collections live in data files.
- Mutual relations defined once outside the articles replace the one-way frontmatter `related:` (migration needed).
- Architecture Weekly posts, GitHub samples, talks and third-party links have no Markdown file in this repo, so they need a registry entry with a stable id.
- The MTU list becomes a collection over ids (blog slugs and registry ids). The course Markdown is generated from it.

## Q5. Where should the registry and the relation/collection files live?

Options offered: this repo's `data/` (recommended), a separate knowledge-base repo, or both (data here, MCP/Skills consuming the output).

**Answer:**

- The registry of non-blog resources, each with a stable id, must be added. Those resources have no frontmatter.
- Basic correlations that the blog displays belong in this repo.
- The MCP/RAG work happens entirely in a dedicated private repo.

**Implications:**

- This repo owns the data the blog renders: frontmatter, the registry, basic relations and collections. Build-time validation stays here.
- The private repo consumes this repo's data and adds its own layers: fetching, extraction, indexing, and richer correlations.
- The interface between the two repos (what this repo exports, and how) is still to be defined.

## Q6. Will the blog publish the MTU reading list or curated third-party links?

Options offered: yes as a page, only Oskar's own content, or not yet but put everything in the registry now.

**Answer:** Category pages already cover this. For now the blog shows only Oskar's own content.

**What exists** (checked):

- `data/category-guides.json` feeds `/{lang}/category/{slug}/` (`src/templates/CategoryTemplate.tsx`) with a "recommended reading order" list. It also orders the cards on `/{lang}/category/` (`src/pages/category.tsx`).
- Guides: en event-sourcing (8), event-driven-architecture (6), cqrs (5), software-architecture (5). The pl entries are empty except event-sourcing (8).
- `recommended` currently holds blog slugs only.
- `data/videos.json` (23 items) is rendered on `/{lang}/talks/`. `data/talks.json` (25 items) isn't rendered anywhere.
- Category values contain near-duplicates (Testing/Tests, PostgreSql/PostgreSQL/Postgres, Architecture/Software Architecture). One `categories` list holds a stray slug-like item.

**Implications:**

- No new resources page. Category guides are where curated reading is shown.
- The registry in this repo covers only Oskar's own off-blog content: Architecture Weekly, GitHub samples, talks and videos.
- Third-party links and the full MTU collection live only in the private repo.
- Category guides' `recommended` may need to reference registry ids as well as blog slugs.

## Q7. How should the new registry relate to `videos.json` and `talks.json`?

Options offered: alongside them, absorb them, or alongside now and merge later (recommended).

**Answer:** There has to be one unified way to handle these, or at least a consistent one. Anything unused gets dropped.

**Implications:**

- Off-blog content follows one consistent model, not a new file next to differently shaped legacy files.
- `talks.json` isn't rendered, so it gets dropped as a file. Its 25 entries (date, venue, description, link, video) are Oskar's own talks. Moving them into the registry before dropping the file keeps that data. To be confirmed.
- `videos.json` is used by `/{lang}/talks/`, so it is either migrated into the unified model or reshaped to match it. The page's visible behaviour must not change.

## Q8. How should every piece of content be identified?

Options offered: prefixed ids everywhere (`blog:`, `aw:`, `gh:`, `video:`), the URL as id, or bare blog slugs plus prefixed registry ids.

**Answer:** Too complicated. Architecture Weekly posts are just articles now: they live in `content/posts` with the same slug as on Substack, for example `2025-06-30--predictable-identifiers-enabling`. Category and related already exist, and how other sites handle them is the reference. Oskar wants the first step done on the assumptions he already gave, nothing more.

**Scope reset for the first step:**

- No new id scheme. Articles are identified by their existing slug.
- Use the existing mechanisms: frontmatter `category`/`categories`/`related`, and `data/category-guides.json` for recommended reading.
- No invented abstractions beyond what the first step needs.

## Q9. Should the first step only check and report, or also write the result into the repo?

Options offered: check and report only (recommended), or check and update the metadata (`related`, `category-guides.json`).

**Answer:** Update the metadata. Specifically:

- Articles get multiple categories. The `categories` frontmatter already exists in 5 posts.
- The sections of the posted list become the newly set-up categories.
- `related` must match, so it is consistent (and mutual) between articles that belong together.
- Each new category gets a proper recommended order, following the order in the posted list, stored in `data/category-guides.json`.

**Still open:**

- How the new categories coexist with the existing ones (Event Sourcing, Software Architecture, Coding Life, ...).
- What to do with sections that contain no Oskar articles (e.g. Snapshots, Bi-Temporal modelling).

## Q10. How do the new categories fit with the existing ones?

Options offered: add them (existing primary category plus list sections), merge overlapping ones (recommended), or replace the existing taxonomy for the covered topics.

**Answer:**

- Stop asking and do the work. Stop only when something unexpected or a blocker comes up.
- Enhance what exists rather than replace it.
- Rename the article-level "category" to "tags". An article can have several tags.
- Rename the "Categories" menu to "Learning" or a better name. The working name is "Learning paths".
- Each learning path is a tag page with the recommended order from the posted list.

**Settled:**

- The data model stays as it is, only enhanced: frontmatter for article facts, and the existing guides data file for recommended order.
- No new id scheme, no off-blog registry, and no third-party content in this repo for this step.
- `data/talks.json` is unused, so it gets dropped.

## Q11. Tags whose EN and PL values differ

**Oskar:** EN and PL could keep the same category value, with the label localised on the page.

**Agreed:**

- One language-neutral tag value (the English name) in both language versions, so the slug and URL are shared across languages.
- Labels are localised through i18n, falling back to the English name.
- This removes the Polish-named variants. The two posts tagged with different topics per language still need one tag each; proposal: the EN value wins.

## Q12. Architecture vs Software Architecture

**Answer:** Use Architecture. Software Architecture merges into it, and its old category URL redirects to the Architecture page.
