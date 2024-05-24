---
title: Why you should batch message processing and how to do it with .NET AsyncEnumerable
category: ".NET"
cover: 2024-05-24-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![](2024-05-24-cover.png)

**[AsyncEnumerable](https://learn.microsoft.com/en-us/archive/msdn-magazine/2019/november/csharp-iterating-with-async-enumerables-in-csharp-8) is a sneaky abstraction.** It allows simplified and performant usage for iterating on pull-based and push-based sources. 

_"Pull-based and push-based sources"_ sound smart, but what are they?

**Pull-based** approach is when we're querying a specific data source, such as, running a select statement on a relational database. We pull the data from it.

**Push-based** is when we're getting notifications from an external source. It can be a messaging system, [event store subscription](/en/persistent_vs_catch_up_eventstoredb_subscriptions_in_action/), or also [change notifications from the database](/en/push_based_outbox_pattern_with_postgres_logical_replication/). We don't need to query for information; we'll be notified.

How does _AsyncEnumerable_ help in both approaches? For push-based, it's pretty obvious. We can use a familiar _foreach_ statement, and the _AsyncEnumerable_ implementation will internally forward the notification and wait until the new one appears. For instance, if you use [API for Postgres Logical Replication](/en/push_based_outbox_pattern_with_postgres_logical_replication/), you can do it as:

```csharp
var (connectionString, slotName, publicationName) = options;
await using var conn = new LogicalReplicationConnection(connectionString);
await conn.Open(ct);

var slot = new PgOutputReplicationSlot(slotName);

await foreach (var message in conn.StartReplication(slot, new PgOutputReplicationOptions(publicationName, 1), ct))
{
    if (message is InsertMessage insertMessage)
    {
      yield return await InsertMessageHandler.Handle(insertMessage, ct);
   }

   conn.SetReplicationStatus(message.WalEnd);
   await conn.SendStatusUpdate(ct);
}
```

**For a push-based approach, _AsyncEnumerable_ (even if it's not asynchronous) is also useful.** Let's say you're using the EventStoreDB API to read events from the stream. Most of the time, [streams will be short](/en/closing_the_books_in_practice/), as they should represent the history of a particular entity/process. Most of the entities in our system don't have many operations happening. Still, sometimes we can have more events. Loading all of them in one batch (think: reading them with _ToListAsync_) won't be efficient. It'll increase the memory pressure if we load all of them at once. If we're [building the state from events](/en/how_to_get_the_current_entity_state_in_event_sourcing/), we don't need to load all of them. It's enough just to have a single one, apply it to the state, and get the next event. 

That's also a reason why EventStoreDB Api for reading streams is returning AsyncEnumerable to give you the option to load into memory just a subset of events, reducing memory pressure. Thanks to that, you can write the efficient state aggregation as:

```csharp
public static async Task<T?> AggregateStream<T>(
    this EventStoreClient eventStore,
    Guid id,
    CancellationToken cancellationToken,
    ulong? fromVersion = null
) where T : class, IProjection
{
    var readResult = eventStore.ReadStreamAsync(
        Direction.Forwards,
        StreamNameMapper.ToStreamId<T>(id),
        fromVersion ?? StreamPosition.Start,
        cancellationToken: cancellationToken
    );

    if (await readResult.ReadState.ConfigureAwait(false) == ReadState.StreamNotFound)
        return null;

    var aggregate = (T)Activator.CreateInstance(typeof(T), true)!;

    await foreach (var @event in readResult)
    {
        var eventData = @event.Deserialize();

        aggregate.Apply(eventData!);
    }

    return aggregate;
}
```

**That's great, but having the API that always returns you a single event has also limitations. One of them is performance.**

Let's say we're handling upcoming events from a messaging system or event store subscription and updating read models based on them. Trying to update them after each event will create a lot of network traffic between our system and the database. I explained in [the other article how essential it is for a database like Elasticsearch](/en/projecting_from_marten_to_elasticsearch/). 

**The potential solution is to do batching**. We could gather upcoming events into a collection and run updates in batches. But that's also tricky, as events won't come in the unified batch sizes. It may happen that you got 5 events, then 2 events one minute later, and 100 events 5 minutes later. The notification cadence will depend highly on the traffic that creates those events. If we set our batch to have 10 events, we'd need to wait 7 minutes to process them (until the batch is fully filled). That's not great and, in most cases, not acceptable. It could only work if our traffic is extremely stable and continuous. We need to do better than that.

**To make batching efficient, we should also define the deadline for the batches.** We should say: _"Either try to gather batch of size X or wait Y milliseconds to process it. Whetever happens first."_.

Unfortunately, AsyncEnumerable doesn't provide us with the API for that. Let's discuss how to fix it!

In .NET we have _competing_ API for handling asynchronous processing: [System.Threading.Channels](https://learn.microsoft.com/en-us/dotnet/core/extensions/channels). They're great but a bit harder for some people to reason for. We're no longer operative on a straightforward imperative programming model but making things reactive. (Read more on the usefulness of .NET channels in [my other article](/en/testing_asynchronous_processes_with_a_little_help_from_dotnet_channels/)). If we were using .NET channels, we could use the nice contrib package [Open.ChannelExtensions](https://github.com/Open-NET-Libraries/Open.ChannelExtensions) and do things like:

```csharp
var channel = Channel.CreateUnbounded<T>();

var batchingReader = channel.Reader
    .Batch(batchSize)
    .WithTimeout(deadline);
```

We're creating a channel and reader that'd precisely do what we'd like to achieve with AsyncEnumerable, so batching by size or deadline. We could produce new data by writing to the channel as:

```csharp
await channel.Writer.WriteAsync(@event, ct);
```

Cool! But we want to do this with AsyncEnumerable. Maybe we could wrap this code somehow? Yes, we can! 

```csharp
    public static IAsyncEnumerable<List<T>> Batch<T>(
        this IAsyncEnumerable<T> enumerable,
        int batchSize,
        TimeSpan deadline,
        CancellationToken ct
    ) =>
        enumerable
            .ToChannel(cancellationToken: ct)
            .Batch(batchSize)
            .WithTimeout(deadline)
            .AsAsyncEnumerable(cancellationToken: ct);
```

Yup, simple as that! [Open.ChannelExtensions](https://github.com/Open-NET-Libraries/Open.ChannelExtensions) provides an API to forward AsyncEnumerable to the .NET channel and vice versa. Thanks to that, we've built a reusable method for use in any AsyncEnumerable. We could use it in the presented above logical replication, or for instance [event store subscription](/en/persistent_vs_catch_up_eventstoredb_subscriptions_in_action/):

```csharp
var subscription = eventStoreClient
    .SubscribeToAll(FromAll.Start, cancellationToken: ct)
    .Batch(100, TimeSpan.FromMilliseconds(150), ct);

await foreach (var events in subscription)
{
    await HandleBatch(events, ct);
}
```

Of course, setting a proper batch size and deadline is not easy and is highly contextual to your use case. That's something that should be fine-tuned or even made adaptive. 

As you can see, it's not that scary, and the code is simple. But all is simple if you're aware of the issue and already know how to solve it. I hope that this code will help you to make your async code more efficient and performant. 

**If you need more help [contact me!](mailto:oskar@event-driven.io), I'm open for consultancy. Check also my [workshops page](/en/training/) for more end-to-end learning opportunity.**

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
