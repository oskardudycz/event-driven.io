---
title: Handling business logic
icon: 🧠
description: "How to write business logic that's easy to read, test and change, using simple functions and types instead of large classes. In C#, F#, Java and TypeScript."
cover: 2022-08-31-cover.jpg
articles:
  - slim_your_entities_with_event_sourcing
  - how_to_effectively_compose_your_business_logic
  - idempotent_command_handling
  - simple_transactional_command_orchestration
  - this_is_not_your_uncle_java
  - how_events_can_help_on_making_state_based_approach_efficient
  - prototype_underestimated_design_skill
  - throw-result-or-neither
  - my_journey_from_aggregates
  - union_types_in_csharp
  - writing_and_testing_business_logic_in_fsharp
  - how_to_validate_business_logic
---

Business logic often ends up spread across large classes, mixed with state handling and database code. Then it's hard to see what the code decides, and harder to test it. You'll learn another way: describe the possible states and requests as explicit types, and write each decision as a small function that takes a request and the current state and returns what happened.

Many examples use the same shopping cart, so you can compare styles. Start with the first article: it takes a classic aggregate, a class holding data and rules together, and slims it down step by step. Others cover handling the same request arriving twice, saving two related changes in one transaction, validating input, and reporting failures: throw, return an error value, or record the failure as a fact. One shows the approach also works with a regular database.

Code is in C#, F#, Java and TypeScript. Pick your language; the ideas carry over.
