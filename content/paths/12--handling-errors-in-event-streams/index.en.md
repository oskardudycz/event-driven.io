---
title: Handling errors in event streams
icon: 🩹
description: "Wrong events will end up in your system, and you can't just delete them. You'll learn how to fix mistakes and bugs without losing history or trust in your data."
cover: 2021-01-27-cover.png
articles:
  - what_texting_ex_has_to_do_with_event_driven_design
  - no_it_can_never_happen
  - fixing-bugs-in-event-sourcing-is-hard
  - how_to_update_past_data_in_event_sourcing
  - deduplication-in-distributed-systems
---

Sooner or later a wrong event gets recorded: a bug calculated the wrong price, a user did something nobody expected, or a message arrived twice. In a system that keeps history, you don't erase the mistake. You record what corrects it, the way a bank posts a correcting entry instead of editing last month's statement. You'll learn how to do that so the data ends up right and you can still see what happened.

The first two articles are short and explain the mindset: you can't unsend a message, and the "impossible" case will happen. The next two show how to fix bugs and change past data in practice, using hotel examples. The last explains why duplicate messages appear and where you can filter them out.

Read them in order.
