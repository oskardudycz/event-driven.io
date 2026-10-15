---
title: Events Ordering
icon: 🔢
description: "Events don't always arrive in the order they happened. You'll learn why, how to handle it without corrupting data, and what message brokers can guarantee."
cover: 2025-10-20-cover.png
articles:
  - dealing_with_race_conditions_in_eda_using_read_models
  - strict_ordering_in_event_handling
  - requeuing_roulette_in_messaging
  - ordering-grouping-and-consistency
---

A shipment can be reported as delivered before your system has heard that it was sent. Events come from different services, through different queues, with retries in between, so the order they arrive in isn't the order they happened in. You'll learn how to handle that without corrupting data, how to notice that an event is missing, and where ordering can actually be guaranteed.

The first article shows how a read model can hold partial information until the missing events arrive. The second explains how to detect that something is missing when you don't know what to expect. The third looks at putting a message back on the queue and hoping it works next time: when that helps and when it makes things worse. The last explains how message brokers group and order messages, and what that costs.

Read them in order.
