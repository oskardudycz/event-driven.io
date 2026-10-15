---
title: Observability, Auditability and tracing
icon: 🔭
description: "Logs and metrics tell you something broke, not why. You'll learn how observability and tracing help you understand what a running system is actually doing."
cover: 2024-09-16-cover.jpg
articles:
  - when-logs-and-metrics-arent-enough
  - applying-observability-from-strategy
  - making-your-system-observability
  - why-to-measure-and-make-our-system
  - set_up_opentelemetry_wtih_event_sourcing_and_marten
---

It's 2 a.m., requests are timing out, and the logs are full of errors but don't show which request caused them or where the time went. Logs and metrics tell you that something is wrong. Observability lets you ask the running system new questions and follow a single request across services. You'll understand what traces and spans are, how to add them to your code, and how to check that they keep working.

The first article explains why logs and metrics fall short, using a connection pool running out as an example. The second is a conversation with Hazel Weakly on turning an observability strategy into practice. The third shows how to instrument code and test that instrumentation. The fourth explains what's worth measuring and what it costs. The last sets up OpenTelemetry in an event-sourced .NET application.

Read them in order.
