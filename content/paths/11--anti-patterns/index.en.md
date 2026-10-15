---
title: Anti-patterns
icon: 🚫
description: "Event designs that look fine at first and cause trouble later. You'll learn to spot the common mistakes, why they hurt, and what to do instead."
cover: 2024-04-07-kafka.png
articles:
  - anti-patterns
  - clickbait_event
  - property-sourcing
  - state-obsession
  - i_will_just_add_one_more_field
  - one_or_more_event_that_is_the_question
  - on_putting_stream_id_in_event_data
  - passive_aggressive_events
  - yoda_principle_in_command_design
---

Some event designs look reasonable when you write them and cause trouble months later: consumers have to call back for details, events only say that a field changed, or every sprint adds another field. You'll learn to recognise these mistakes in your own design, why they hurt, and what to record instead.

The first article is a talk that gives the overview. Five articles each take one mistake and work through an example, under the name it's known by, such as Clickbait Event or Property Sourcing. Two discuss choices that aren't clear-cut: recording one event or several, and what to keep in event data. The last one is about naming commands so their intent is clear.

Start with the talk, then read the ones that sound like your system.
