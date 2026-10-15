---
title: Event versioning
icon: 🏷️
description: "Your events will change, but the old ones stay stored. You'll learn how to evolve them without breaking existing data or the systems that read it."
cover: 2020-12-23-cover.png
articles:
  - how_to_do_event_versioning
  - simple_events_versioning_patterns
  - announcing-strictland-contract-testing
  - how_to_map_event_type_by_convention
  - explicit_events_serialisation_in_event_sourcing
  - event_versioning_with_marten
---

Events stay stored for years, while the code that reads them keeps changing. Add a required field or rename a property, and the old events still have to load correctly. Changing events is less scary than its reputation, but you have to plan for it.

The first article shows the cheapest option: design so you rarely need it. If [streams are short](/en/guides/short-living-streams/), old event formats disappear on their own. The next ones go through simple, repeatable ways to handle a change, from adding a field to converting old events into the new shape as you read them. You'll also see how to catch a breaking change in a unit test before it reaches production, and how to control the way events are saved and loaded.

Start with the first article. It may save you most of the work the others describe.
