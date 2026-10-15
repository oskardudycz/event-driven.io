---
title: Testing
icon: 🧪
description: "How to test event-driven code, from business logic to projections and asynchronous processes, so your tests read like business requirements."
cover: 2022-10-07-cover.jpg
articles:
  - testing_event_sourcing
  - testing_event_driven_projections
  - testing_asynchronous_processes_with_a_little_help_from_dotnet_channels
  - testing_event_sourcing_emmett_edition
  - custom_test_container_on_esdb_example
  - behaviour_driven_design_is_not_about_tests
---

You may have heard that Event Sourcing is hard to test. Its business logic is actually a good fit for tests: given past events, when you run a command, then you expect new events or an error. The same Given/When/Then shape works for projections, only the result is a read model.

The first article builds such tests in C# for deciders and aggregates; the pattern works in any language. Next come integration tests for MongoDB projections in TypeScript, and a short .NET piece on waiting for asynchronous handlers without polling. The Emmett article covers Node.js from unit to end-to-end tests, and the next one sets up a custom Testcontainers container for EventStoreDB.

The last article explains why Behaviour-Driven Design means keeping the system's behaviour in focus everywhere, not only in tests.
