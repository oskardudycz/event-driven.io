---
title: Let's build event store in one hour!
category: "Event Sourcing"
cover: 2023-01-08-cover.jpg
author: oskar dudycz
---

**Last year, I completed two items from my speaker bucket list [NDC Oslo](https://ndcoslo.com/speakers/oskar-dudycz) and [Domain-Driven Design Europe](https://2022.dddeurope.com/program/keep-your-streams-short!-or-how-to-model-event-sourced-systems-efficiently).** I'm proud and happy, as those conferences were a huge inspirations for me.

**At NDC Oslo, I showed one of my favourite talks: "Let's build event store in one hour!".** Why do I like it so much? It's a fun mixture of live coding and theory explanation. At least for me.

It's technically hard talk to deliver as I need to coordinate speaking, live coding and not boring people with technical details. It's kinda speed run for me. But when precisely delivered, I think that's fun talk to watch. Check it on your own!

`youtube: https://www.youtube.com/watch?v=gaoZdtQSOTo`

**This talk does not intend to persuade you to write your own event store. There are already mature solutions like [Marten](https://martendb.io/), [EventStoreDB](https://www.eventstore.com/), [Axon](https://www.axoniq.io/).**

The intention is to [dive a bit deeper](/pl/dive_a_bit_deeper_look_a_bit_wider/), showing that Event Sourcing and event stores can be treated as boring technology in the good sense. It's about showing that it's not a hyped buzzword but a tool that can bring real benefits and give you the guarantees you need.

I like to see how people's eyes get bigger when they see the SQL stored procedure. I also like when they're surprised that I'm not using any messaging tooling or regular database transactions. Most people also don't expect that read models can also be updated synchronously without having eventual consistency.

**So it's more about myths busting and [explaining Event Sourcing pattern in a nutshell](/pl/the_magic_is_that_there_is_no_magic/).**

What are the requirements, then? In my opinion, at least:
- appending event at the end of the stream,
- reading all events from the stream,
- a guarantee of the ordering within the stream,
- being able to read your writes,
- strong-consistent, atomic writes and optimistic concurrency.

The 2nd tier of event stores features (so great to have but not must-haves):
- being able to subscribe to notifications about newly appended events (best if it's push-based)
- global ordering,
- built-in projections,
- streams archiving.

Check more on those considerations in the:
- [What if I told you that Relational Databases are in fact Event Stores?](/pl/relational_databases_are_event_stores/)
- [Greg Young - Building an Event Storage](https://cqrs.wordpress.com/documents/building-event-storage/)
- [Yves Lorphelin - Requirements for the storage of events](https://www.eventstore.com/blog/requirements-for-the-storage-of-events),
- [Anton Stöckl - Essential features of an Event Store for Event Sourcing](https://medium.com/itnext/essential-features-of-an-event-store-for-event-sourcing-13e61ca4d066)
- [Greg Young - How an EventStore actually works](https://www.youtube.com/watch?v=YUjO1wM0PZM)
- [Adam Warski - Implementing event sourcing using a relational database](https://softwaremill.com/implementing-event-sourcing-using-a-relational-database/)

**I also have something special for you, a self-paced kit on building event store on top of Relational Database using Postgres as an example.** It starts with the tables set up and goes through appending events, aggregations, handling business logic, time travelling, projections, and snapshots. 

I think that's a fun way to learn Event Sourcing, check versions for:
- [C#](https://github.com/oskardudycz/EventSourcing.NetCore/tree/main/Workshops/BuildYourOwnEventStore),
- [Java](https://github.com/oskardudycz/EventSourcing.JVM/pull/36).


Once you're done, please don't use it on production; rather, use some mature solutions. Maintaining it won't be sustainable if it's not your core business.

**Event stores are databases. Just like you won't say _"hey, let's build the relational database for our project"_, you should not do that with an event store.**

Still, it's a lot of fun, nothing too time-consuming to build a simple one and an excellent exercise in understanding how Event Sourcing works.

Not convinced? Read then why [you can think about event stores as key-value stores, and why that matters](/en/event_stores_are_key_value_stores).

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
