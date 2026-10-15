---
title: Eventual Consistency
icon: ⏳
description: "In event-driven systems, data isn't updated everywhere at once. You'll learn how to live with that delay, keep read models correct and keep users informed."
cover: 2021-11-10-cover.png
articles:
  - dealing_with_eventual_consistency_and_idempotency_in_mongodb_projections
  - long_polling_and_eventual_consistency
---

A user saves a change, refreshes the page and still sees the old data. In event-driven systems, the read side is updated a moment after the write, so for a short time different parts of the system disagree. That's eventual consistency. You can't remove the delay, but you can make sure the data ends up correct and that users aren't confused while they wait.

The first article builds read models in MongoDB and shows how to keep them correct when events are delayed or delivered twice. The second shows long-polling: the API waits briefly until the change is visible, so the client can treat an asynchronous operation as if it were synchronous.

Read them in order; the second builds on the first.
