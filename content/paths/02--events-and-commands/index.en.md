---
title: Events and commands
icon: ✉️
description: "A command asks for something to happen; an event says it already did. Understanding the difference helps you design messages that are clear and easy to handle."
cover: 2021-02-17-cover.png
articles:
  - whats_the_difference_between_event_and_command
---

A command asks a specific recipient to do something, and the recipient may refuse. An event states a fact that already happened and goes to anyone who listens. The definitions are short; telling the two apart in a real system is harder. After reading, you'll be able to decide which one a given message should be.

There's one article here. It explains why "commands are synchronous, events are asynchronous" is a habit, not a rule, and gives a practical test: if the recipient has the right to refuse, send a command; if it should just accept, publish an event. It also covers a common trap: an event with exactly one recipient that must always handle it. Often that's a command sent under an event's name.

Read it before you design the messages between your modules. The [Events on the inside, events on the outside](/en/guides/events-on-the-inside-events-on-the-outside/) guide continues from there.
