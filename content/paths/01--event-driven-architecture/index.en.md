---
title: Event Driven Architecture
icon: 📡
description: "What event-driven architecture really is once you skip the buzzwords, what it gives you, what it costs, and how it helps teams work more independently."
cover: 2023-02-26-cover.png
articles:
  - dont_let_event_driven_architecture_buzzwords_fool_you
  - how_using_events_help_in_teams_autonomy
  - predictable-identifiers-enabling
  - dealing-with-eventual-consistency
---

Event-driven architecture builds a system around things that happen. A module records a fact, like "order placed", and other modules react to it, instead of one module calling all the others. You'll understand what that gives you, what it asks of you, and how it lets teams work more independently.

The first article separates designing the flow from the plumbing that delivers messages and from the tools, and explains why you decide them in that order. The second shows how events make the dependencies between modules visible. The third shows a payment module that serves many parts of the system without knowing about any of them. The fourth shows how users can keep working while their files upload, accepting that the data is briefly out of sync. That trade-off is called eventual consistency.

Read them in order. The first two are short; the last two are longer and include code.
