---
title: Read models and Projections
icon: 📊
description: "Events are great for recording changes but awkward to query. You'll learn how to turn them into read models for your screens and reports, and keep them correct."
cover: 2023-01-20-cover.jpg
articles:
  - projections_and_read_models_in_event_driven_architecture
  - rebuilding_event_driven_read_models
  - rebuilding_read_models_skipping_events
  - how_to_scale_projections_in_the_event_driven_systems
  - how_to_create_projections_of_events_for_nested_object_structures
  - emmett_projections_testing
  - projections_and_event_metadata
  - event_transformations_and_loosely_coupling
  - persistent_vs_catch_up_eventstoredb_subscriptions_in_action
  - projections_in_marten_explained
  - projecting_from_marten_to_elasticsearch
  - publishing_read_model_changes_from_marten
---

Events tell you what happened, but a screen needs the current state in a shape that's quick to read: a list of open orders, a customer's balance. A projection builds that view, called a read model, by applying events one by one. You'll understand how to design projections, how to rebuild a read model when its logic changes, and how to keep it correct when events arrive twice or late.

The first article covers the basics. The next two show how to rebuild read models safely while the system keeps running, and what to do with cases you can't fix on the spot. Then come shorter pieces on scaling, nested data, testing, event metadata and transforming events. The last four use specific tools, EventStoreDB and Marten, including sending data to Elasticsearch.

Read the first three in order. Pick the rest by the problem you have.
