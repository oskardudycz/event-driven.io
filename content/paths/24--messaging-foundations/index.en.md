---
title: Messaging foundations
icon: 📬
description: "When too much happens at once, systems slow down or break. You'll see how queuing and backpressure keep concurrent work under control."
cover: 2024-08-12-cover.png
articles:
  - architecture-weekly-190-queuing-backpressure
---

A database accepts only so many connections, and requests keep coming. This Architecture Weekly edition works through that problem by building a connection pool in TypeScript. Failing fast or retrying in a loop doesn't scale, so requests wait in a queue. An unbounded queue brings its own trouble, so the pool adds backpressure and rejects excess requests. Moving queue handling into one broker gives you the single-writer pattern.

The last part shows the same patterns at system scale: SQS with Lambda, Cloudflare's CDN and Kafka consumer groups.
