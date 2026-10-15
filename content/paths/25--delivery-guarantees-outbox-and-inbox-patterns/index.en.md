---
title: Delivery guarantees, outbox and inbox patterns
icon: 📦
description: "Messages get lost or duplicated between your database and your broker. You'll learn what delivery guarantees really mean and how the outbox pattern helps."
cover: 2020-12-30-cover.png
articles:
  - outbox_inbox_patterns_and_delivery_guarantees_explained
  - ordering_in_postgres_outbox
  - push_based_outbox_pattern_with_postgres_logical_replication
  - how_to_get_all_messages_through_postgres_logical_replication
  - the-order-of-things-why-you-cant
---

Your code saves an order to the database and then publishes an "order placed" message. If the process crashes between those two steps, the order exists but nobody hears about it. Retry, and someone may hear about it twice. You'll understand what at-most-once, at-least-once and exactly-once delivery really promise, and how the outbox pattern closes that gap by saving the message in the same transaction as the data.

The first article explains the guarantees and the outbox and inbox patterns. The next three are about building an outbox on PostgreSQL: a subtle ordering problem with sequences, and how to send messages as soon as they're saved instead of polling for them. The last shows why you can't have both strict ordering and high throughput, comparing PostgreSQL, MongoDB and Kafka.

Start with the first one; the PostgreSQL articles assume you know it.
