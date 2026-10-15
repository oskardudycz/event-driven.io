---
title: Idempotency
icon: ♻️
description: "In distributed systems, the same message will arrive more than once. You'll learn how to handle duplicates without corrupting your data."
cover: 2024-11-15-cover.png
articles:
  - idempotent_command_handling
  - deduplication-in-distributed-systems
  - dealing_with_eventual_consistency_and_idempotency_in_mongodb_projections
---

A payment request times out, the app retries, and the customer pays twice. Messages get repeated for many reasons: retries, broker restarts, switching to a backup server. You can't stop that, so your code has to make a repeated message harmless. That property is called idempotency. You'll learn when your logic already has it, and when you need to detect duplicates on purpose.

The first article covers handling commands: which operations are safe to repeat, and how to reject a duplicate with the same version check that protects against concurrent edits. The second explains where duplicates come from and where in a system you can filter them out. The third applies the same ideas to updating read models.

Start with the first one.
