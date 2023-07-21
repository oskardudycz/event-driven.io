---
title: How to scale projections in the event-driven systems?
category: "Event Sourcing"
cover: 2020-05-26-cover.png
author: oskar dudycz
---

![cover](2020-05-26-cover.png)

People want to scale up everything. In the past, the recipe for everything was to buy a larger server. Today, the answer is to add another instance. Does it always make sense?

**"Will it scale?"** is not a question, it is a mantra. We often ask about it even if we don't know if our solution needs to scale. We're preparing for that, just in case. Then we're angry hearing "It depends". There is no single scaling axis: those decisions need to be based on hard numbers and performance requirements. Based on that information, we can select the right strategy.

**This is not different from the idea of scaling projections in event-driven architectures.**

[A projection is an interpretation of a set of events.](/en/projections_and_read_models_in_event_driven_architecture/) It is often used to create a read model. We take the current state, apply the event data on it and store the mutated state. The projection result can be stored as a row in the relational database or other prefered type of storage (you can read more about that in my other article, ["How to create projections of events for nested object structures?"](/en/how_to_create_projections_of_events_for_nested_object_structures/)).

We can come to the conclusion that it might be worth running the projection logic in parallel. That looks like a quick boost to our events processing. As we know, premature optimisation may be the root of all evil. Let's discuss that in more detail. It might not be as trivial and obvious as it may look at first glance.

What are we to optimise?
- **database writes** - upserts in databases are typically fast. Also, if we're doing our writes sequentially, we're not risking getting deadlocks by concurrent writes on the same record. If we're facing a bottleneck on the write side, we either have a high load or an issue in our database structure.
- **processing** - we can have a plethora of issues here. We should verify if our networking configuration and multi-region setup is valid. We can also check if scaling vertically won't be enough and would cost less. Higher latency might not be caused by our application code but by how it's configured.

**If we benchmarked the current solution, compared to the expected and concluded that we need to scale, I'd recommend considering the partitioning/sharding strategy.** The most obvious approach is ensuring that the single projection type will be handled by the specific subscriber (this can be done by, e.g. listening for the events handled by this projection type or per stream type). Having that, we can distribute the load and not end up with the competing consumers' problem (e.g. RabbitMQ uses this approach).

If consumers compete for the shared resource (e.g. the read model we're writing to), then it's hard to guarantee processing order. In theory, we could write a stream version of the projection and verify if it's higher than the version from processing events. However, we might end up in this scenario that:
- the first handler gets events 1 and 2
- the second handler gets event 3.

If the first handler lags, the second will write the projection and set the version to 3. If we perform a check based on the version, then events 1 and 2 will be ignored.

**Also, with competing consumers, events get out of order (e.g. because of retries).** We may end up with version number gaps and not easily verify if it's okay to write or not.

It can work if your events are typical transport events or inform about "upserts". The sequence of events is not always critical. Sometimes they are transport events that keep arriving (for replication). Such events usually do upserts without any logic at the end. We can then be optimistic that if the situations are sporadic, "someday it will level out". However, losing an event may be critical for typical business events.

**The other scenario is when you don't care about ordering and can live with data for some time in the potentially wrong state** (e.g. at first, apply what's possible from the "update event", then fill with the data from "create event"). However, that usually requires additional effort in projecting business logic and ensuring that out-of-order cases are adequately handled. The downside is that we have to accept that our data may be incomplete. It is not always a problem. By definition, we should not make business decisions based on the read model. Well, if the situations are repeated often, it can be a pain for the user. Plus, the programmer has to code all these correlations.

**Processing events in parallel is challenging for projections from a single stream.** It gets even more tricky for projections from multiple streams  (e.g., different topics or partitions in Kafka). Usually, in this case, we have no guarantee that the data from different partitions will have the appropriate time correlation. You might need to maintain different versions for the other streams in the same read model, which is not manageable in the long term.

**I recommend starting with a single writer.** If you see performance issues, define your partitioning/sharding strategy and ensure you don't have competing subscribers for the same target read model. It's also essential to make your projections idempotent (so if you get the same event twice, it will have a single effect).

## Here are a few tips to consider:
1. **Consider batching writes.** If the storage engine is the bottleneck, then it's worth grouping the updates by the read model result. It may appear that we won't need to put multiple writers and make our solution more complex by doing that. For example, it will be too slow if you try to apply events individually to the ElasticSearch index (around 10 updates per second). If you batch it, it easily exceeds 1000 per second. The important thing to note is that even if we're batching the changes, we should make sure that operations within the batch are performed in the proper order. Running operations in parallel may add non-deterministic behaviour. It's worth double-checking the storage operation capabilities before running batches. Read more in [Projecting Marten events to Elasticsearch](/en/projecting_from_marten_to_elasticsearch/)
2. **Make your projections idempotent**. Most messaging system gives you an [at-least-once delivery guarantee](/en/outbox_inbox_patterns_and_delivery_guarantees_explained/). That may happen when the failure occurs, and we need to retry processing. If that happens, our projection logging will be triggered more than once. We must include it in our projection logic to ensure we won't have side effects. There are multiple techniques on how to deal with that. Read more in [A simple trick for idempotency handling in the Elastic Search read model](/en/simple_trick_for_idempotency_handling_in_elastic_search_readm_model/), [Dealing with Eventual Consistency and Idempotency in MongoDB projections](/en/dealing_with_eventual_consistency_and_idempotency_in_mongodb_projections/).
3. **Use one worker instance to build a read model.** Projections usually should not have extensive logic and should do a simple record change. It should be fast by design. When it does not have to compete for resources, a single instance will be faster to act and write than complex multithreaded code. That's how Node.jS was created. The authors found that multithreading is overrated. It might be better to queue tasks than to share them. It also makes sense in our daily activities; will you do something faster when you try to do multiple things at once or do them individually? Single writer instance can take you pretty far if you put the business logic in the write model and then just process events and do simple state updates in projections.
4. **Invest in data partitioning and sharding.** A clone war for resources will not be necessary if we partition services by, e.g. read model type, tenant, event stream, and end storage target (document/table). By doing that, we will have a set of independent instances focused on handling a specific set of events and not fighting for the order they need to be processed. Processing will still be simple, and we'll have a single writer per shard.

**And here we come back to the mythical question. Will it scale?** It does not have to scale. If it has to, adding new instances does not always make sense. We should do it wisely. Load balancing, sharding and partitioning are the basics that also work in today's world of microservices. Using messaging tools and databases properly is based on choosing the correct partitioning key. 

**We will not achieve well-scaled systems without thinking about how our data relates to each other and partitioning it.** Caring about basics, it's not as sexy as launching a new Kubernetes deployment, but it's necessary.

Cheers!

Oskar

p.s. Read also [Guide to Projections and Read Models in Event-Driven Architecture](/en/projections_and_read_models_in_event_driven_architecture/) to learn more about other concepts to keep in mind.