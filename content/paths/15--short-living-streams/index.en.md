---
title: Short living streams
icon: ⏱️
description: "Event streams that live forever become hard to manage. You'll learn how to model lifecycles so streams stay short, and what to do when there's no natural end."
cover: 2024-02-17-cover.png
articles:
  - closing_the_books_in_practice
  - should_you_always_keep_streams_short
---

In Event Sourcing, each record keeps its events in one stream. If a stream lives forever, it keeps growing: loading it gets slower, changing it gets harder, and you keep data nobody needs. Most streams don't have to live that long, because most business processes have a natural cycle, like a cashier's shift or an accounting month.

The first article shows how to model that cycle in C#. Each cashier shift gets its own stream. When the shift closes, the last event carries what the next one needs, such as the cash left in the drawer, so no stream holds the whole history of a cash register. Accountants call this closing the books.

The second article covers data without a natural end, like company details or addresses. You'll see when keeping it as plain state is the better choice, and how to trim old events if you keep them.
