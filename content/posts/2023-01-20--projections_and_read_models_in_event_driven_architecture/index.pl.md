---
title: Projections and Read Models in Event Driven Architecture
category: "Event Sourcing"
cover: 2023-01-15-cover.jpg
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2023-01-15-cover.jpg)

**If I had to choose the killer feature of Event Sourcing, I'd select projections.**

Events are facts; they represent something that has happened in the past. Projections are a different interpretation of the set of facts. Sounds enigmatic? Let's have a look at this picture.

It shows the result of a boxing fight. Even if you're not a boxing fan, you can see that the triumphing guy is Muhammad Ali. Below him lies Sonny Liston. 

Why am I telling you about it? 

**Because it shows pretty well what's an event.** The fight result is a fact. It cannot be retracted. It happened on 25th May 1965, so at a certain point in time. It has specific information about what has happened, like information of:
- who fought, 
- that it only lasted 1 minute 44 seconds, 
- the venue was Central Maine Youth Center in Lewiston, Maine,
- etc.

**It also shows well what's projection.** The same result of the fight may be interpreted differently: Muhammad is triumphing, Sonny not so much. What's more, to this day, boxing fans are arguing if this was a real fight or a rigged one. The punch knocked down Sonny Liston is known as [phantom punch](https://en.wikipedia.org/wiki/Muhammad_Ali_vs._Sonny_Liston#The_phantom/anchor_punch) as no one saw it reaching Sonny Liston's face.

**In projections, we're taking a set of events representing various facts (about the same object, multiple), correlating them and building interpretation.** Most of the time, we store the result as a materialised read model. 

**The most popular approach to handling them is to perform the so-called _left-fold_ approach.** We're taking the current state of the read model, applying the upcoming event and getting the new state as a result.

**Of course, nothing stops you from batch processing by taking all the events, merging them and storing the result.** For instance, if you're doing set-based aggregations like the total of sold products, money accrual, and average grades in school, it could be more efficient if done _en masse_.

## Projections can be synchronous and asynchronous

Although most tooling shows that they need eventual consistency, that's incorrect. Their state doesn't have to be updated with a delay. It's a technical _"detail"_ of the exact implementation. If you're storing events and read models in the same relational database (like, e.g. [Marten]() in Postgres), then you can wrap all in a transaction. Then either events are appended and projections updated, or no change is made.

**Of course, we should not be afraid of eventual consistency.** How soon is now? There's no now! Everything in the real world happens with some delay. Also, if we want to make a reliable and fault-tolerant processing pipeline doing stuff as a background process may be a go-to way. Read more in [Outbox, Inbox patterns and delivery guarantees explained](/en/outbox_inbox_patterns_and_delivery_guarantees_explained/).

**Projections are a concept that's part of Event-Driven Architecture. They're not tight to Event Sourcing.** Yet, event stores can help you in making them efficient. Most of the time, they allow you to subscribe to the appended events notifications, for instance, [Marten's Async Daemon](/en/integrating_Marten/) or [EventStoreDB subscriptions](/en/persistent_vs_catch_up_eventstoredb_subscriptions_in_action/). They are an [outbox pattern](/en/push_based_outbox_pattern_with_postgres_logical_replication/) provided as a commodity by the database. That gives both durabilities for the events and strong guarantees around processing them.

## Projections rebuild

**The significant benefit of the projections is that they're predictable.**  That means that the same logic will generate the same result for the same events.

**As events are our source of truth, then we can think of read models as secondary data.** If we treat events as the source of truth and base projection processing only on data we get from them, we can also rebuild our read models. 

We could break it into two phases:
- **catching up**, where we're far from the current state. 
- **live**, where we're processing new, upcoming events.

**How to decide if the gap is _"far enough"_?** We might never be fully caught up if events are appended continuously. Because of that, we need to define some threshold, e.g. in our context, live means that we have a maximum of ten events to process from the latest registered event. Of course, this can be done case by case and differ for various projections. Read also more in [Let's talk about positions in event stores](/en/lets_talk_about_positions_in_event_stores/).

We can use different projection handling techniques depending on the phase we're in, e.g., batch processing when we're catching up and left-fold when we're live. 

Projections are usually made asynchronously, while the left-fold approach can work well in sync and async ways.

**The simplest rebuild we can do is truncate the current state of the read model and then reapply all events through projection logic.** We can do that if we can afford the downtime. There will be a time when there's no data, or we're far from being up to date. 

**If we cannot afford downtime, we can do a _blue-green_ rebuild.** In that, we're setting up a read model in the other storage (e.g. different database, schema, table, etc.). Then we're reapplying events to this secondary read model. Once we're caught up, we can switch queries to target the new read model and archive the old one.

TODO: ISOLATION

## Idempotency

Some event-driven tooling promises to bring you the Holy Grail: exactly-once delivery. I explained in detail in [another article](/en/outbox_inbox_patterns_and_delivery_guarantees_explained/) that this is impossible. 

**The safe assumption is that we might get the same event more than once and run projection logic multiple times for the same event.** Because of that, our projection handling needs to be idempotent. It's a fancy word to say that no matter how many times we apply the same event, we'll get the same result as we'd applied it only once.

How to handle idempotency correctly?

**The simplest case is [Event-Carried State Transfer](https://martinfowler.com/articles/201701-event-driven.html).** It's a fancy term for just pushing the latest state through events. Generally, it's not the best practice, as it creates a coupling between event producer and consumer. Also, if we just send the state, we're losing the context of the operation that caused the state change. However, it can be more than enough for cases like read model updates. Especially if our read model is just another representation of write model data.

**Yet, it's better to avoid having [state obsession](/en/state-obsession/) and work on the event model design.** For instance, if we have read model with the bank account balance _Payment Registered_ event. If we put the transaction amount to the event payload, applying it more than once will result in the wrong balance calculation. If we additionally include the account balance after payment was registered, then updating the balance would become upsert, idempotent by default.

**Of course, it's a tradeoff, as we should keep events granular. [They should be as small as possible, but not smaller](/en/events_should_be_as_small_as_possible/).** We should treat events as API. We should apply the same design practices as the others, so think if it should be API first or more tuned to consumer needs.

If you're still unsure of my reasoning, let's look at that from a different angle. Which component should be responsible for doing balance calculation? In reality, it's much more complex than just incrementing the value. We need to account for taxes, policies, previous balance etc. Do you really want to repeat this logic in read models or all the other consumers? The business logic should rather do such a calculation and propagate it further to subscribers. As always, pick your poison.

**The next option is a more generic solution based on the event's position in the log.** We could pass the entity version in event metadata and store it in the read model during the update. If we assume that we're getting events in the proper order, then we could compare the value during the update and ignore the change if it's smaller than the value in the read model. I wrote about it longer in:
- [Dealing with Eventual Consistency and Idempotency in MongoDB projections](/en/simple_trick_for_idempotency_handling_in_elastic_search_readm_model/)
- [A simple trick for idempotency handling in the Elastic Search read model](/en/dealing_with_eventual_consistency_and_idempotency_in_mongodb_projections/)

## Eventual Consistency

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
