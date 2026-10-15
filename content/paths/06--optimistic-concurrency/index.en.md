---
title: Optimistic concurrency
icon: 🔒
description: "Two people edit the same data and one silently overwrites the other. You'll see how optimistic concurrency catches that, and how to support it in a web API."
cover: 2020-12-16-cover.png
articles:
  - optimistic_concurrency_for_pessimistic_times
  - how_to_use_etag_header_for_optimistic_concurrency
---

When two people edit the same record, the second save silently overwrites the first. Locking the record prevents that, but blocks everyone else while one person has it open. You'll learn a lighter approach that assumes conflicts are rare: you read the record with its version, send that version back with your change, and the update is rejected if someone changed the record in the meantime. That way decisions are always made on current data.

The first article explains the idea, compares it with locking and shows why it matters in distributed databases and Event Sourcing. The second shows how to support it in a web API with standard HTTP headers. The server sends the version in the ETag header, the client sends it back in If-Match, and stale updates get 412 Precondition Failed. The examples are in TypeScript.

Read them in order; the second assumes you know the first.
