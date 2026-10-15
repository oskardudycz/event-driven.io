---
title: Events on the inside, events on the outside
icon: 🚪
description: "Events used inside a module and events shared with others serve different purposes. You'll learn to design both, so you can change internals safely."
cover: 2023-10-15-cover.png
articles:
  - internal_external_events
  - events_should_be_as_small_as_possible
---

When another team needs your data, the quickest answer is to let them subscribe to the events your module uses internally. It works until you change something. They have to rebuild your process from small, detailed events, and every change you make can break them. You'll learn to keep the two kinds of events apart, so you can change your module's internals without breaking anyone.

The first article shows the problem through a familiar story: a payment team listens to shopping cart events, misses one, and charges customers too much. The fix is to treat the events you share as an API. Detailed events stay inside the module; other teams get fewer, complete events with the data they need, on a separate channel. The second, older article asks how big an event should be. Its answer: as small as possible, but not smaller. Sometimes that means several events shaped for different consumers instead of one big one.

Start with the first. Read the second when several consumers need different data from you.
