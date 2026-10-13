# Learning paths: mapping from the reading list

Status: 2026-10-13.

Each path in `content/paths/NN--slug/index.{en,pl}.md` is one section of [reading-list.md](reading-list.md): the section's own articles (event-driven.io and Architecture Weekly links that resolve to a post), in the section's order, without duplicates. Nothing else is added. `tests/learning-paths/content.int.test.ts` checks that every article resolves and that the EN and PL lists match.

Paths have no introduction yet. The old guides' descriptions in `data/category-guides.json` were not written from the reading list, so they were not carried over.

## Not carried over from `data/category-guides.json`

The old guides recommended these articles, which the matching reading-list sections don't contain. They are not in the paths.

| Path                          | Guide-only articles                                                                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01 Event Driven Architecture  | `event_driven_distributed_processes_by_example`, `checkpointing_message_processing`, `idempotent_command_handling`, `strict_ordering_in_event_handling`, `dealing_with_race_conditions_in_eda_using_read_models`, `rebuilding_event_driven_read_models` |
| 04 CQRS                       | `cqrs_is_simpler_than_you_think_with_net6`, `projections_and_read_models_in_event_driven_architecture`, `dealing_with_race_conditions_in_eda_using_read_models`                                                                                         |
| 13 Event Sourcing foundations | `introduction_to_event_sourcing`, `whats_the_difference_between_event_and_command`, `how_to_validate_business_logic`, `projections_and_read_models_in_event_driven_architecture`, `testing_event_sourcing`, `simple_events_versioning_patterns`         |
| 22 Architecture               | `intro_to_example_mapping`, `parse_dont_guess`, `on-mashing-up-modelling-techniques`, `vertical-slices-and-dependencies`, `addition-by-subtraction-in-software-design`                                                                                  |

## Own links without a post

Seven Architecture Weekly webinars aren't imported, so their sections lack them: webinar 1 (Migrating to Event Sourcing, which therefore has no path), 3, 9 and 15 (Modelling with events), 4 (CQRS), 7 (Read models and Projections) and 16 (Event versioning). Details are in [link-check.md](link-check.md).

## Open questions for Oskar

- Polish titles are first-draft translations and need review.
- Introductions for the paths, if any.
- Whether to import the seven webinars.
