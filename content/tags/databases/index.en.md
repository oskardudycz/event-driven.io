---
description: "Key-value databases look simple, but the way you design keys decides how fast you find data and how well it spreads across servers."
---

One article from 2022. It explains why key design matters: random identifiers index poorly, while keys built from nested parts let you find and partition data quickly. It then shows that document databases, wide-column databases and event stores are all key-value stores underneath, with different rules for the value.
