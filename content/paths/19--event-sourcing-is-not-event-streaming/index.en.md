---
title: Event Sourcing is not Event Streaming
icon: 🌊
description: "Event Sourcing and event streaming are often confused. Why they're different patterns, and why many \"Event Sourcing is hard\" stories are really about Kafka."
cover: 2021-12-01-cover.png
articles:
  - event_streaming_is_not_event_sourcing
---

Event Sourcing and event streaming both work with events, so they're easy to confuse. In Event Sourcing, events are the state: you read the entity's stream, rebuild its state, run business logic and append new events with an optimistic concurrency check. Streaming tools like Kafka move events between places and don't give you those guarantees.

The article answers the popular post "Don't Let the Internet Dupe You, Event Sourcing is Hard". Most problems described there, like deciding on stale data, come from using a streaming tool as an event store.

For the basics, start with [Event Sourcing foundations](/en/guides/event-sourcing-foundations/).
