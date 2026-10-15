---
title: How to store events in Event Sourcing
icon: 🗄️
description: "How event stores work, and why they're simpler than they sound. Enough to choose one wisely, or build a basic one on a database you already use."
cover: 2023-04-07-es1.png
articles:
  - event_stores_are_key_value_stores
  - lets_build_event_store_in_one_hour
  - relational_databases_are_event_stores
  - lets_talk_about_positions_in_event_stores
  - checkpointing_message_processing
  - the-write-ahead-log-a-foundation
  - key-value-stores
  - using-s3-but-not-the-way-you-expected
  - temporal_tables_and_event_sourcing
---

An event store sounds exotic, but it's a database like any other. It keeps events grouped by the record they belong to, always adds new ones at the end, and gives you the guarantees you expect from a database. Once you see that, questions about performance, consistency and choosing a tool get much easier to answer.

The first articles explain that model and build a simple event store on PostgreSQL in an hour. They also show that relational databases already work this way inside. The next ones cover how other parts of the system keep track of the events they've already processed. The later articles look at the building blocks underneath, and at whether S3 or temporal tables can do the same job.

You don't need all of this to use an existing event store. It helps you understand what it guarantees, and why.
