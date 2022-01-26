---
title: A simple trick for idempotency handling in the Elastic Search read model
category: "Event Sourcing"
cover: 2022-01-26-cover.png
author: oskar dudycz
---

![cover](2022-01-26-cover.png)

Idempotency is a word worth watching out for. It's easy to miss a few letters and bang, and we have a problem. It is also a general problem in programming (or, as some people prefer, _"a challenge"_). We should be aware of it. In short, performing the same operation several times should not cause side effects, e.g. the duplicates resulting from running addition more than once or charging fees multiple times for a single transaction.

The problem is general because even in the REST API, we assume that all operations except POST should be idempotent by definition. In distributed systems and event-based architectures, this problem is even more emerging. We're using retries policies or [outbox pattern](https://event-driven.io/en/outbox_inbox_patterns_and_delivery_guarantees_explained/) to increase the fault tolerance (e.g. unavailability of a database or service). Queues like Kafka and Rabbit use these approaches internally to ensure message delivery. To deliver it at least once, they have to repeat the processing in case of failure. That may cause delivering the given message several times. If we don't want to have bugs related to it, we have to deal with it somehow, but how?

Suppose we have two services. One is the source of the truth and publishes the events after the business process is completed. The second one subscribes to these events and updates the Elastic Search read model. Let's be optimistic and assume that we guarantee that the events will be delivered in the order in which they were published. We do not guarantee that it will only be delivered exactly once. 

If we want to be sure that a given event will not be processed many times, we must distinguish it somehow. Support for optimistic concurrency can help. We could use it to make sure that we're making changes based on the current state. If we're also using an auto-incremented number that's updated after each change, then we can also use it to handle idempotency (read more in my article: [How to use ETag header for optimistic concurrency](https://event-driven.io/pl/how_to_use_etag_header_for_optimistic_concurrency/)). We can send the version number together with a published event. We get a unique change indication by combining the record ID and its version. 

ElasticSearch provides several index versioning options. The one that interests us the most is called _external_. It assumes that ElasticSearch is not the source of truth and that the version number is ascending number. It does not assume whether the values ​​can have gaps or not. The only thing that verifies is that the version sent during the update is:
- smaller,
- equal or greater than the current document version.
An update is only possible for the second option. Thanks to that, it won't allow us to apply the event more than once. If we try to process the event twice, the second attempt will fail because the version we provide will be equal. In this case, we can just ignore this error and proceed with the next event. 

In C#, this code would look like this:

```csharp
public async Task Handle(StreamEvent @event, CancellationToken ct)
{
    var id = getId(@event.Data);
    var indexName = IndexNameMapper.ToIndexName();

    var entity = (await elasticClient.GetAsync(id, i => i.Index(indexName), ct))?.Source ?? new TView();
  
    entity.Apply(@event.Data);

    await elasticClient.IndexAsync(
        entity,
        i => i.Index(indexName).Id(id).VersionType(VersionType.External).Version((long)@event.Metadata.StreamRevision),
        ct
    );
}
```

It is a simple trick, but it will help avoid the headache around duplicates. We're getting a slight performance penalty compared to the regular versioning, but we can often neglect that as increased reliability is much more critical.

Read more:
- https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html#index-versioning
- https://www.elastic.co/blog/elasticsearch-versioning-supporthttps://www.elastic.co/blog/elasticsearch-versioning-support

Cheers!

Oskar