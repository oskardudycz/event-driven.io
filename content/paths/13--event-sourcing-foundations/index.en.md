---
title: Event Sourcing foundations
icon: 🧱
description: "What Event Sourcing is, what you gain by storing events instead of the current state, when it's not worth it, and how to start with it in a real project."
cover: 2022-03-16-cover.png
articles:
  - introduction_to_event_sourcing
  - how_to_get_the_current_entity_state_in_event_sourcing
  - should_you_throw_exception_when_rebuilding_state_from_events
  - emmett_postgresql_event_store
  - bank_account_event_sourcing
  - never_lose_data_with_event_sourcing
  - start-small-grow-big-how-to-pick
  - when_not_to_use_event_sourcing
  - audit_log_event_sourcing
  - the_end_is_near_for_crud_data
  - one_or_more_event_that_is_the_question
  - on_putting_stream_id_in_event_data
  - whats_the_difference_between_event_and_command
---

Most systems store only the current state and overwrite it on every change. Event Sourcing stores each business change as an event and rebuilds the state from those events. You keep the full history of what happened, and your code follows the business process more closely. The idea is simple. The hard part is knowing where it pays off and how to start without getting burned.

The first articles show how it works, with exercises you can do on your own. The next ones help you decide: what you gain by not losing data, when Event Sourcing isn't worth it, and how to pick a first feature that teaches you something without risking much. The last ones answer modelling questions you'll hit early, such as moving existing relational data to events.

If you're new, read them in order. How events are stored is covered in [a separate guide](/en/guides/how-to-store-events-in-event-sourcing/).
