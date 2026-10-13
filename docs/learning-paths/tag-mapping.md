# Tag mapping (approved by Oskar, 2026-10-13)

Phase 1 of [spec.md](spec.md). Today's `category`/`categories` values become `tags`. Merged values point to one canonical tag. A merged tag's old category URL redirects to the canonical tag page.

## Merges of existing values

| Canonical tag   | Merged from                               | Why                                                                                                                          |
| --------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Testing         | Tests                                     | Same topic                                                                                                                   |
| PostgreSQL      | PostgreSql, Postgres                      | Same topic. Today PostgreSql and PostgreSQL already share the slug `postgre-sql`                                             |
| JavaScript      | Java Script (PL)                          | Same topic, same slug `java-script` today                                                                                    |
| Coding Life     | Coding life (PL)                          | Case only                                                                                                                    |
| Design Patterns | Wzorce projektowe, Wzorce Projektowe (PL) | Polish names for the same tag. Every other PL post uses the English values                                                   |
| Architecture    | Software Architecture                     | Oskar's decision. The `software-architecture` guide becomes `architecture`, and the importer default changes to Architecture |

Kept as they are (PL-only, one or two posts each): Windows, Office, MSSQL, Community. Merging MSSQL into Databases is an option.

## Localised labels

Frontmatter stores one language-neutral tag value, the English name, in both language versions. The slug comes from that value, so URLs stay the same across languages, for example `/pl/tags/design-patterns/`. Pages show a localised label from `src/i18n/locales/{lang}/translation.json`. A tag with no translation falls back to its English name.

## EN/PL disagreements

These posts have different values per language. The PL tags follow the EN ones. Design Patterns gets a Polish label instead of a Polish value.

| Post                                         | EN              | PL                    |
| -------------------------------------------- | --------------- | --------------------- |
| 2020-12-16 optimistic_concurrency            | Design Patterns | Wzorce projektowe     |
| 2021-02-10 saga_process_manager              | Design Patterns | Wzorce Projektowe     |
| 2023-04-07 event_stores_are_key_value_stores | Event Sourcing  | Coding Life           |
| 2026-04-13 passive_aggressive_events         | Event Sourcing  | Software Architecture |

## Reading-list sections to tags

Pending: this needs the full reading list in `reading-list.md`.

## Migration rules

- Parse frontmatter with a YAML parser, not by line. `2025-11-03--strict_ordering_in_event_handling/index.en.md` has `redirectAliases` list items right after `categories`.
- `tags[0]` is today's `category`, followed by `categories` without duplicates. Display, the `article:section` meta tag and llms.txt read only the primary tag.
- Values are normalised through the table above before writing.
