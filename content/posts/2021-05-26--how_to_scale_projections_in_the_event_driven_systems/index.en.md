---
title: How to scale projections in the event-driven systems?
category: "Event Sourcing"
cover: 2020-05-26-cover.png
author: oskar dudycz
---

![cover](2020-05-26-cover.png)

People want to scale up everything. In the past, the recipe for everything was to buy a larger server. Today, the answer is to add another instance. Does it always make sense?

**"Will it scale?"** is not a question, it is a mantra. We're often asking about it even if we don't know if our solution needs to scale. We're preparing for that just in case. Then we're angry hearing "It depends". There is no single scaling axis: those decisions need to be based on hard numbers and performance requirements. Based on that information, we can select the right strategy.

**This is not different from the idea of scaling projections in event-driven architectures.**

A projection is an interpretation of a set of events. It is often used to create a read model. We take the current state, apply the event data on it and store the mutated state. The projection result can be stored as a row in the relational database or other prefered type of storage (you can read more about that in my other article, ["How to create projections of events for nested object structures?"](https://event-driven.io/en/how_to_create_projections_of_events_for_nested_object_structures/)).

We can come to the conclusion that it might be worth running the projection logic in parallel. That looks like a quick boost to our events processing. As we know, premature optimisation may be the root of all evil. Let's discuss that in more detail. It might not be so trivial and obvious as it may look at first glance.

What are we to optimise?
- **database writes** - upserts in databases are typically fast. Also, if we're doing our writes sequentially, we're not risking getting deadlocks by concurrent writes on the same record. If we're facing the bottleneck on the write side, then either we have a high load, or we have some issue in our database structure.
- **processing** - we can have a plethora of issues here. We should verify if our networking configuration, multi-region setup is valid. We can also check if scaling vertically won't be enough and would cost less. Higher latency might not be caused by our application code but by how it's configured.

**If we benchmarked the current solution, compared to expected and concluded that we need to scale, I'd recommend thinking about the partitioning/sharding strategy.** The most obvious approach is ensuring that the single projection type will be handled by the specific subscriber (this can be done by, e.g. listening for the events handled by this projection type or per stream type). Having that, we can distribute the load and not end up with the competing consumers' problem (e.g. RabbitMQ uses this approach).

If consumers compete for the shared resource (e.g. the read model we're writing to) then it's hard to guarantee processing order. We could write a stream version to the projection in theory and then verify if it's higher than the version from processing events. However, we might end up in the scenario that:
- the first handler gets event 1 and 2
- the second handler gets event 3.

If the first handler is lagging, then the second will write the projection, set the version to 3. If we perform a check based on the version, then events 1 and 2 will be ignored.

Also, with competing consumers, events get out of order (e.g. because of retries). We may end up with version number gaps and not easily verify if it's okay to write or not.

This can work if your events are typical transport events, or "upserts". The sequence of events is not always critical. Sometimes they are transport events that keep arriving (for replication). Such events usually do upserts without any logic at the end. We can then be optimistic if the situations are sporadic that "someday it will level out". However, if we have business events, then losing an event may be critical.

The other scenario is when you don't care about ordering and can live with data for some time in the potentially wrong state (e.g. at first apply what's possible from the "update event", then fill with the data from "create event"). However, that usually requires additional effort on the projection business logic and ensuring that out-of-order cases are adequately handled. The downside is that then we have to accept that our data may be incomplete. This is not always a problem. By definition, we should not make business decisions based on the read model. Well, but if the situations are repeated often, it can be a pain for the user. Plus, the programmer has to program all these correlations.

Processing events in parallel is challenging for projections from a single stream. It gets even more tricky for projections from multiple streams  (e.g., different topics or partitions in Kafka). Usually, in this case, we have no guarantee that the data from different partitions will have the appropriate time correlation. You might need to maintain different versions for the other streams in the same read model, which is not manageable in the long term.

I recommend starting with a single writer. If you see performance issues, define your partitioning/sharding strategy and ensure that you don't have competing subscribers for the same target read model. It's also essential to make your projections idempotent (so if you get the same event twice, it will have a single effect).

A few tips to consider:
1. **Consider batching writes.** If the storage engine is the bottleneck, then it's worth grouping the updates by the read model result. It may appear that we won't need to put multiple writers and make our solution more complex by doing that. For example, if you try to apply events one by one to the ElasticSearch index, it will be too slow (around 10 updates per second). If you batch it, it easily exceeds 1000 per second. The important thing to note is that even if we're batching the changes, we should make sure that operations within the batch are performed in the proper order. Running operations in parallel may add non-deterministic behaviour. It's worth double-checking the storage operation capabilities before running batches.
2. **Make your projections idempotent**.  If you get the same event twice, it will have a single effect. Most of the messaging system gives you at-least-once delivery guarantee. That means that message (event) will be delivered but might be delivered twice or more. Read more in ["Outbox, Inbox patterns and delivery guarantees explained"](https://event-driven.io/en/outbox_inbox_patterns_and_delivery_guarantees_explained/).
3. **Use one worker instance to build a read model.** Projections usually should not have extensive logic and should do a simple record change. It should be fast by design. When it does not have to compete for resources, you may find that a single instance will be faster to act and write than complex multithreaded code. That's how NodeJS was created. The authors found that multithreading is overrated. It might be better to queue tasks than to share them. It also makes sense in our daily activities; will you do something faster when you try to do multiple things at once or when you do them one by one?
4. **Good data partitioning and sharding.** A clone war for resources will not be necessary if we partition services by, e.g. storage target, event stream or type. By doing that, we will have a set of independent instances focused on handling a specific set of events and not fighting for the order they need to be processed.

And here we come back to the mythical question. Will it scale? It does not have to scale. If it has to, then it does not always make sense to add new instances. We should do it wisely. Load balancing, sharding and partitioning are the basics that also work in today's world of microservices. Proper use of messaging tools and databases is based on choosing the correct partitioning key. 

Without thinking about how our data relates to each other and partitioning it, we will not achieve well-scaled systems. Caring about basics, it's not as sexy as launching a new Kubernetes deployment, but it's necessary.

Cheers!

Oskar