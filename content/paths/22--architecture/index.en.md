---
title: Architecture
icon: 🏛️
description: "What an architect's job really is: understanding problems before proposing solutions, questioning popular architecture styles, and keeping documentation alive."
cover: 2020-11-29-cover.png
articles:
  - architect_manifesto
  - bring_me_problems_not_solutions
  - killer-metrics-or-why-you-should
  - onion_clean_code
  - how_to_successfully_do_documentation_without_maintenance_burden
---

Architects have a reputation for sitting in an ivory tower, detached from the code. The first article, the Architect Manifesto, lists what an architecture team should do instead: give clear guidance, review designs early, work on business features and change the architecture when requirements change.

The next three are about where problems start. When the business brings you a ready solution, ask for the problem behind it; the example is an HR system that might not have needed a new web app at all. Before building a feature, agree with the business on the measures that decide whether it stays or goes. Layered "onion" architecture splits a simple business operation across many technical layers, so it's hard to follow and risky to change.

The last article gives advice on keeping documentation current: keep it in the repository, review it with the code, and record decisions as immutable Architecture Decision Records.
