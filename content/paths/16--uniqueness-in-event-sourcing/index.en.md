---
title: Uniqueness in Event Sourcing
icon: 🆔
description: "\"Usernames must be unique\" is harder than it sounds with Event Sourcing. You'll learn how to find the real requirement behind it, and how to enforce it."
cover: 2022-03-09-cover.png
articles:
  - uniqueness-in-event-sourcing
  - unique_constraint_in_marten_event_store
---

In a regular database, you add a unique index and you're done. Most event stores give you only one such guarantee: no two streams can have the same id. So when you hear "emails must be unique" or "invoice numbers can't repeat", you need another way. Checking first whether the value is taken doesn't work, because someone can take it between your check and your write.

The first article starts with the question to ask before writing code: why is uniqueness needed? Often the business brings a solution, and the real problem is elsewhere. If the rule stays, you'll see a few ways to enforce it, including reserving the value before you save, and what to do when that fails halfway.

The second article shows a pragmatic shortcut for Marten users that relies on a unique index in PostgreSQL.
