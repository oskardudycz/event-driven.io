---
title: CQRS
icon: 🔀
description: "CQRS is simpler than its reputation. You'll see what it actually means, which popular beliefs are myths, and how it helps you organise code around features."
cover: 2021-03-03-cover.png
articles:
  - cqrs_facts_and_myths_explained
  - my-thoughts-on-vertical-slices-cqrs
  - vertical-slices-and-dependencies
  - fractal-architecture-cognitive-load
  - can_command_return_a_value
  - generic_does_not_mean_simple
  - how_to_slice_the_codebase_effectively
  - vertical_slices_in_practice
  - cqrs_is_simpler_than_you_think_with_net6
---

CQRS has a reputation for being complicated: separate databases, Event Sourcing, message buses. None of that is required. At its core, it means handling changes and queries as separate operations, each shaped for its own job.

The first article separates facts from myths. The next three show how CQRS leads to vertical slices, which means organising code by business feature instead of by technical layer, and what that changes in ownership and dependencies. Then come practical questions, like whether a command can return a value and why generic code isn't automatically simple. Two articles show how to lay out a codebase by feature, the second on a hotel reservation example. The last one shows it all in .NET code.

If you're new to CQRS, start with the first article. If you already use it, the articles on vertical slices are the most likely to change how you structure code.
