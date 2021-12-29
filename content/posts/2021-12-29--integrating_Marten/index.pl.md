---
title: Integrating Marten with other systems
category: "Event Sourcing"
cover: 2021-12-29-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2021-12-29-cover.png)

In Event Sourcing, events are the source of truth. We save them in the event store to have a permanent history of facts about business operations. Storing events and using them as an application state opens many possibilities but is not a killer feature in itself.

Greg Young said that if you're using Event Sourcing and you only use one database, then you are not using the potential of Event Sourcing. In my opinion, this is a bit exaggerated statement, but there is truth in it. If you're using [Marten](https://martendb.io/), you can use only Postgres. Events and read models data are stored as JSON thanks to brilliant JSON support in Postgres. Using events enables further event-driven integrations and storage tuned to your needs—for example, most in the relational database and text filtering in Elastic Search.

Of course, there are many challenges here. For example, to avoid leaking business logic, we should divide our events into internal (module-scoped_ external (system-scoped). We follow the straight highway to the distributed monolith if we do not do this. It is a dark place. I've been there, and I do not recommend it (to say mildly). I wrote about these considerations in the article ["Events should be as small as possible, right?"](/pl/events_should_be_as_small_as_possible/).

Another issue is delivery guarantees. Contrary to common impression, it is not easy to guarantee messages from one place to another. The Outbox pattern can help on that; I wrote about it longer in ["Outbox, Inbox patterns and delivery guarantees explained"](/pl/outbox_inbox_patterns_and_delivery_guarantees_explained/). In short, we're storing events together with the state change (in the same transaction/atomic operation). Then the event is posted asynchronously. If message sending fails, it will be retried. Retries can cause sending messages multiple times. Therefore, we gain the at-least-once delivery guarantee. Our recipient must ensure the idempotent handling logic so that no unforeseen effects, such as duplicates, will be caused by processing the same event multiple times.

We had a long undocumented (but used by our brave users) feature called "Async Daemon" in Marten. Its main task is to apply events using projections to read models asynchronously. In the recently released version 4, this mechanism has undergone a complete overhaul. It boosted performance and stability. It turns out that we can use it not only for projection logic but also for publishing events, e.g. on the event bus (Kafka, RabbitMQ, etc.) or for applying projections to databases other than Postgres.

How can this be done? By defining your projection and connecting it to the Async Daemon mechanism.

```csharp
public class MartenSubscription: IProjection
{
    private readonly IMartenEventsConsumer consumer;

    public MartenSubscription(IMartenEventsConsumer consumer)
    {
        this.consumer = consumer;
    }

    public void Apply(
        IDocumentOperations operations,
        IReadOnlyList<StreamAction> streams
    )
    {
        throw new NotSupportedException("Subscription should be only run asynchronously");
    }

    public Task ApplyAsync(
        IDocumentOperations operations,
        IReadOnlyList<StreamAction> streams,
        CancellationToken ct
    )
    {
        return consumer.ConsumeAsync(streams);
    }
}
```

This interface requires the implementation of two event application operations. One is synchronous; the other is asynchronous. We'll implement only the asynchronous version, as we don't want those operations to run in the same database transaction as appending event. The key here is the _IReadOnlyList <StreamAction> streams_. It represents events grouped by streams that are currently being processed.

What is _IMartenEventsConsumer_? It can be a client or our wrapper for tools we integrate.

```csharp
public interface IMartenEventsConsumer
{
    Task ConsumeAsync(IReadOnlyList<StreamAction> streamActions);
}
```

The dumbest implementation to throw event data on the screen would look like this:

```csharp
public class MartenEventsConsumer: IMartenEventsConsumer
{
    public static List<object> Events { get; } = new();

    public Task ConsumeAsync(IReadOnlyList<StreamAction> streamActions)
    {
        foreach (var @event in streamActions.SelectMany(streamAction => streamAction.Events))
        {
            Events.Add(@event);
            Console.WriteLine($"{@event.Sequence} - {@event.EventTypeName}");
        }

        return Task.CompletedTask;
    }
}
```

To use it, you just need to register such a projection.

```csharp
services.AddMarten(x =>
{
    x.Projections.Add(
        new MartenSubscription(new MartenEventsConsumer()),
        ProjectionLifecycle.Async,
        "customConsumer"
    )
)
```

More real-world examples? Like Kafka producer? Here you have it:

```csharp
public class KafkaProducer: IMartenEventsConsumer
{
    private readonly KafkaProducerConfig config;

    public KafkaProducer(KafkaProducerConfig config)
    {
        this.config = config;
    }

    public async Task ConsumeAsync(IReadOnlyList<StreamAction> streamActions)
    {
        using var kafkaProducer =
            new ProducerBuilder<string, string>(config.ProducerConfig).Build();

        foreach (var @event in streamActions.SelectMany(streamAction => streamAction.Events))
        {
            await kafkaProducer.ProduceAsync(config.Topic,
                new Message<string, string>
                {
                    // store event type name in message Key
                    Key = @event.GetType().Name,
                    // serialize event to message Value
                    Value = JsonConvert.SerializeObject(@event)
                });
        }
    }
}

public class KafkaProducerConfig
{
    public ProducerConfig? ProducerConfig { get; set; }
    public string? Topic { get; set; }
}
```

Async Daemon guarantees at-least delivery. It's pull-based, so Marten internally queries the database continuously for new events. Because of that, it may use more resources than push-based solutions, but as it's internally doing batching, it should be a good entry point solution for Marten-based systems.

Cheers!

Oskar