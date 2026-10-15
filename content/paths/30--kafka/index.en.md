---
title: Kafka
icon: 🪵
description: "What happens inside Kafka when you send a message, and why it matters for your delivery guarantees and performance."
cover: 2025-01-13-cover.png
articles:
  - how-a-kafka-like-producer-writes
---

Sending a message to Kafka looks like one line of code, and most of us treat what happens next as a black box. That's fine until you need to know when a message is really safe, or why sending in batches is faster. This article follows a message from the producer to the files on the broker's disk: batching, an append-only log split into segments, and how the broker detects half-written data after a crash. It's long and detailed, with code.
