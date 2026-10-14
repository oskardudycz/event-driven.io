# Learning paths: mapping from the reading list

Status: 2026-10-13.

Each path in `content/paths/NN--slug/index.{en,pl}.md` is one section of [reading-list.md](reading-list.md): the section's own articles (event-driven.io and Architecture Weekly links that resolve to a post), in the section's order, without duplicates. The only other articles are the three Oskar approved, listed under [Additions beyond the reading list](#additions-beyond-the-reading-list). `tests/learning-paths/content.int.test.ts` checks that every article resolves, that the EN and PL lists match, and that every path has an icon, a description and a cover file of its own.

Paths are published as guides at `/{en,pl}/guides/` and `/{en,pl}/guides/{slug}/`. Each path's `cover` is a copy of its first article's cover. Paths have no introduction yet. The old guides' descriptions in `data/category-guides.json` were not written from the reading list, so they were not carried over; the new descriptions are drafted below.

## Additions beyond the reading list

These articles are not in the matching reading-list sections. Oskar approved adding them.

| Path                          | Article                                          | Position                     |
| ----------------------------- | ------------------------------------------------ | ---------------------------- |
| 13 Event Sourcing foundations | `introduction_to_event_sourcing`                 | step 1                       |
| 13 Event Sourcing foundations | `whats_the_difference_between_event_and_command` | after the section's articles |
| 04 CQRS                       | `cqrs_is_simpler_than_you_think_with_net6`       | after the section's articles |

## Not carried over from `data/category-guides.json`

The old guides recommended these articles, which the matching reading-list sections don't contain. They are not in the paths.

| Path                          | Guide-only articles                                                                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01 Event Driven Architecture  | `event_driven_distributed_processes_by_example`, `checkpointing_message_processing`, `idempotent_command_handling`, `strict_ordering_in_event_handling`, `dealing_with_race_conditions_in_eda_using_read_models`, `rebuilding_event_driven_read_models` |
| 04 CQRS                       | `projections_and_read_models_in_event_driven_architecture`, `dealing_with_race_conditions_in_eda_using_read_models`                                                                                                                                     |
| 13 Event Sourcing foundations | `how_to_validate_business_logic`, `projections_and_read_models_in_event_driven_architecture`, `testing_event_sourcing`, `simple_events_versioning_patterns`                                                                                             |
| 22 Architecture               | `intro_to_example_mapping`, `parse_dont_guess`, `on-mashing-up-modelling-techniques`, `vertical-slices-and-dependencies`, `addition-by-subtraction-in-software-design`                                                                                  |

## Own links without a post

Seven Architecture Weekly webinars aren't imported, so their sections lack them: webinar 1 (Migrating to Event Sourcing, which therefore has no path), 3, 9 and 15 (Modelling with events), 4 (CQRS), 7 (Read models and Projections) and 16 (Event versioning). Details are in [link-check.md](link-check.md).

## Drafted descriptions — need Oskar's review

Drafted from each path's articles. The Polish files carry the same English text until it is translated.

| Path                                              | Icon | Description                                                                                                                                                                                                              |
| ------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 01 Event Driven Architecture                      | 📡   | What event-driven architecture is once you strip away the buzzwords. How events give teams and modules autonomy, and how predictable identifiers help with eventual and causal consistency.                              |
| 02 Events and commands                            | ✉️   | The difference between a command and an event, and why it matters when you design messages.                                                                                                                              |
| 03 Events on the inside, events on the outside    | 🚪   | How internal and external events differ, how to design an event-driven API, and how much data an event should carry.                                                                                                     |
| 04 CQRS                                           | 🔀   | What CQRS is and what it isn't, and how it relates to vertical slices. Covers whether commands can return values, generic versus simple code, slicing the codebase, and a practical .NET example.                        |
| 05 Handling business logic                        | 🧠   | Ways to structure and compose business logic: slim aggregates, functional composition, idempotent command handling, validation and error handling. Examples in C#, F# and Java.                                          |
| 06 Optimistic concurrency                         | 🔒   | How optimistic concurrency protects your data from conflicting updates, and how to expose it in an HTTP API with the ETag header.                                                                                        |
| 07 Distributed processes                          | 🧩   | How to coordinate business processes across modules and services with sagas, process managers, consumers and checkpointing. Covers multi-tenancy, race conditions, events arriving out of order and modelling workflows. |
| 08 Read models and Projections                    | 📊   | How projections turn events into read models, and how to scale, test and rebuild them safely. Includes examples with Emmett, Marten, Elasticsearch and EventStoreDB subscriptions.                                       |
| 09 Modelling with events                          | 🗺️   | Techniques for discovering and modelling business processes with events, from EventStorming hot spots to mixing modelling methods, plus the common traps to avoid.                                                       |
| 10 Documenting EDA                                | 📝   | How to document an event-driven architecture so others can find and understand your events, using EventCatalog as an example.                                                                                            |
| 11 Anti-patterns                                  | 🚫   | Common mistakes in event modelling, such as clickbait events, property sourcing, state obsession and passive-aggressive events, and what to do instead.                                                                  |
| 12 Handling errors in event streams               | 🩹   | What to do when wrong or unexpected events land in your streams: compensating, correcting past data, fixing bugs and deduplicating messages.                                                                             |
| 13 Event Sourcing foundations                     | 🧱   | The basics of Event Sourcing: how to rebuild state from events, when it pays off and when it doesn't, and how to start with it in an existing system.                                                                    |
| 14 How to store events in Event Sourcing          | 🗄️   | How event stores work under the hood and how to build one on top of a relational database, a key-value store or S3. Covers stream positions, checkpoints and the write-ahead log.                                        |
| 15 Short living streams                           | ⏱️   | Why streams should usually stay short, and how the Closing the Books pattern keeps them that way.                                                                                                                        |
| 16 Uniqueness in Event Sourcing                   | 🆔   | How to enforce unique values, like a user's email, when you use Event Sourcing, with a Marten example.                                                                                                                   |
| 17 Event versioning                               | 🏷️   | How to evolve event schemas without breaking consumers: versioning patterns, mapping event types, explicit serialisation and contract testing.                                                                           |
| 18 GDPR                                           | 🛡️   | How to handle personal data and GDPR requirements in event-driven and event-sourced systems.                                                                                                                             |
| 19 Event Sourcing is not Event Streaming          | 🌊   | Why Event Sourcing and event streaming are different tools, and what goes wrong when you mix them up.                                                                                                                    |
| 20 Business rules                                 | 📏   | Why business rules need measurable outcomes, and why you should know upfront when to remove a new feature.                                                                                                               |
| 21 Testing                                        | 🧪   | How to test business logic, projections and asynchronous processes in event-driven systems, with examples in .NET, Emmett and Testcontainers.                                                                            |
| 22 Architecture                                   | 🏛️   | How to approach the architect's role: start from problems instead of solutions, keep the code structure simple, and keep documentation useful without a maintenance burden.                                              |
| 23 Monolith vs Microservices                      | 🏘️   | What to consider before breaking down a monolith or starting with microservices, and how team structure affects where you draw the boundaries.                                                                           |
| 24 Messaging foundations                          | 📬   | Core messaging patterns for managing concurrency: queuing, backpressure and the single writer.                                                                                                                           |
| 25 Delivery guarantees, outbox and inbox patterns | 📦   | What delivery guarantees mean in practice, and how the Outbox and Inbox patterns make messaging reliable. Includes Postgres-based outbox implementations and the trade-off between speed and ordering.                   |
| 26 Eventual Consistency                           | ⏳   | How to deal with eventual consistency in projections and APIs, including idempotent updates and long-polling.                                                                                                            |
| 27 Events Ordering                                | 🔢   | How to handle events that arrive out of order, race conditions and requeuing, and how ordering, grouping and consistency relate in messaging systems.                                                                    |
| 28 Idempotency                                    | ♻️   | How to make command and message handling idempotent, and what deduplication can and can't guarantee.                                                                                                                     |
| 29 Observability, Auditability and tracing        | 🔭   | Why logs and metrics aren't enough, and how to make your system observable and auditable, with an OpenTelemetry example for Event Sourcing.                                                                              |
| 30 Kafka                                          | 🪵   | How a Kafka producer works internally.                                                                                                                                                                                   |

## Open questions for Oskar

- Polish titles are first-draft translations and need review.
- The guide descriptions above, and their Polish translations.
- Introductions for the paths, if any.
- Whether to import the seven webinars.
