---
title: Monolith vs Microservices
icon: 🏘️
description: "Microservices solve some problems and create others. When splitting a system is worth it, how teams shape the boundaries, and how to do it gradually."
cover: 2025-03-03-cover.jpg
articles:
  - so-you-want-to-break-down-monolith
  - monolith-first-are-you-sure
  - how_to_cut_microservices
  - sociological_aspects_of_microservices
---

Splitting a system into services is often driven by fashion. First everyone wanted microservices, now the advice is "modular monolith first". Neither choice saves you from the hard parts: module boundaries, shared data and how teams are organised.

The first article is for teams breaking down an existing monolith. Expect part of it to stay, tie each extraction to measurable business value, and move gradually with feature flags and the Strangler Fig pattern. The second questions the "monolith first" advice: a modular monolith has its own costs, from eroding module boundaries to a shared database.

The last two are older and shorter. One lists the technical reasons for separate deployment units: different workloads, scaling, multi-tenancy and multiple regions. The other looks at non-technical motives, like CV-driven development and teams wanting independence, and at Conway's Law.
