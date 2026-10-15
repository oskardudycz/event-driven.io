# Learning paths: mapping from the reading list

Status: 2026-10-15.

Each path in `content/paths/NN--slug/index.{en,pl}.md` is one section of [reading-list.md](reading-list.md): the section's own articles (event-driven.io and Architecture Weekly links that resolve to a post), in the section's order, without duplicates. The only other articles are the three Oskar approved, listed under [Additions beyond the reading list](#additions-beyond-the-reading-list). `tests/learning-paths/content.int.test.ts` checks that every article resolves, that the EN and PL lists match, and that every path has an icon, a description and a cover file of its own.

Paths are published as guides at `/{en,pl}/guides/` and `/{en,pl}/guides/{slug}/`. Each path's `cover` is a copy of its first article's cover. The old guides' descriptions in `data/category-guides.json` were not written from the reading list, so they were not carried over.

## Additions beyond the reading list

These articles are not in the matching reading-list sections. Oskar approved adding them.

| Path                          | Article                                          | Position                                                                                                                                                        |
| ----------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 13 Event Sourcing foundations | `introduction_to_event_sourcing`                 | What Event Sourcing is, how to get the current state from events, when to use it and when not, how to pick a first feature, and how to migrate relational data. | Czym jest Event Sourcing, jak odtworzyć stan ze zdarzeń, kiedy go nie używać, jak wybrać pierwszą funkcjonalność i jak przenieść dane relacyjne na zdarzenia. |
| 13 Event Sourcing foundations | `whats_the_difference_between_event_and_command` | What Event Sourcing is, how to get the current state from events, when to use it and when not, how to pick a first feature, and how to migrate relational data. | Czym jest Event Sourcing, jak odtworzyć stan ze zdarzeń, kiedy go nie używać, jak wybrać pierwszą funkcjonalność i jak przenieść dane relacyjne na zdarzenia. |
| 04 CQRS                       | `cqrs_is_simpler_than_you_think_with_net6`       | What CQRS means in practice, which common beliefs about it are wrong, whether a command can return a value, and how it fits with vertical slices.               | Czym jest CQRS w praktyce, które popularne przekonania na jego temat są błędne, czy komenda może zwracać wartość i jak CQRS łączy się z vertical slices.      |

## Not carried over from `data/category-guides.json`

The old guides recommended these articles, which the matching reading-list sections don't contain. They are not in the paths.

| Path                          | Guide-only articles                                                                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01 Event Driven Architecture  | `event_driven_distributed_processes_by_example`, `checkpointing_message_processing`, `idempotent_command_handling`, `strict_ordering_in_event_handling`, `dealing_with_race_conditions_in_eda_using_read_models`, `rebuilding_event_driven_read_models` | What Event-Driven Architecture is compared to messaging, how events support team autonomy, and how predictable identifiers help with eventual consistency.      | Event-Driven Architecture a messaging, jak zdarzenia wspierają autonomię zespołów i jak przewidywalne identyfikatory pomagają w spójności ostatecznej.        |
| 04 CQRS                       | `projections_and_read_models_in_event_driven_architecture`, `dealing_with_race_conditions_in_eda_using_read_models`                                                                                                                                     | What CQRS means in practice, which common beliefs about it are wrong, whether a command can return a value, and how it fits with vertical slices.               | Czym jest CQRS w praktyce, które popularne przekonania na jego temat są błędne, czy komenda może zwracać wartość i jak CQRS łączy się z vertical slices.      |
| 13 Event Sourcing foundations | `how_to_validate_business_logic`, `projections_and_read_models_in_event_driven_architecture`, `testing_event_sourcing`, `simple_events_versioning_patterns`                                                                                             | What Event Sourcing is, how to get the current state from events, when to use it and when not, how to pick a first feature, and how to migrate relational data. | Czym jest Event Sourcing, jak odtworzyć stan ze zdarzeń, kiedy go nie używać, jak wybrać pierwszą funkcjonalność i jak przenieść dane relacyjne na zdarzenia. |
| 22 Architecture               | `intro_to_example_mapping`, `parse_dont_guess`, `on-mashing-up-modelling-techniques`, `vertical-slices-and-dependencies`, `addition-by-subtraction-in-software-design`                                                                                  | The architect's role, asking the business for problems instead of solutions, the downsides of layered Clean Architecture, and keeping documentation up to date. | Rola architekta, proszenie biznesu o problemy zamiast rozwiązań, wady warstwowej Clean Architecture i utrzymywanie aktualnej dokumentacji.                    |

## Own links without a post

Seven Architecture Weekly webinars aren't imported, so their sections lack them: webinar 1 (Migrating to Event Sourcing, which therefore has no path), 3, 9 and 15 (Modelling with events), 4 (CQRS), 7 (Read models and Projections) and 16 (Event versioning). Details are in [link-check.md](link-check.md).

The Business rules section had one article that resolves to a post, `killer-metrics-or-why-you-should`. Oskar moved it to 22 Architecture, after `bring_me_problems_not_solutions`, so that section has no path and folder 20 is unused.

## Descriptions and introductions

Each path file holds both texts, in English and Polish:

- `description` in the frontmatter: at most 160 characters, used for the guide tile, the meta and OG description, search and llms.txt. Two short sentences: the problem in terms the reader already knows, then what they will understand or be able to do.
- The Markdown body: the introduction shown above the article list. 90–150 words in two or three paragraphs (60–100 for a single-article path): the problem, what the reader will understand, how the articles are ordered and where to start. Pattern names appear only after the problem they solve.

Tag pages follow the same rules from `content/tags/{slug}/index.{en,pl}.md` (description plus a 30–80 word body). `tests/learning-paths/content.int.test.ts` and `tests/articles/tags.int.test.ts` check that both texts exist, that descriptions fit 160 characters and, for guides, that Polish descriptions are not the English ones.

## Open questions for Oskar

- Polish titles are first-draft translations and need review.
- Review of all guide and tag descriptions and introductions, in both languages.
- Whether to import the seven webinars.
