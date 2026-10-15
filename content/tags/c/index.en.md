---
description: "C# records and nullable reference types promise safer code. One article on where those promises break and what to watch out for."
---

One article from 2021, written after months of using records and nullable reference types. It shows where they fall short: the with expression can copy a record into a state its factory would reject, a non-nullable type can still end up holding null, and reordering record fields can silently break deconstruction. More C# code is under the [.NET](/en/articles/tag/net/) and [Event Sourcing](/en/articles/tag/event-sourcing/) tags.
