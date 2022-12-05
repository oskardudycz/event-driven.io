---
title: Persistent vs catch-up, EventStoreDB subscriptions in action
category: "Event Sourcing"
cover: 2022-05-04-cover.png
author: oskar dudycz
---

![cover](2022-05-04-cover.png)

Events can be a great facilitator and glue for business workflows. Subscriptions are an essential block of the event-driven system. They notify us about each of the recorded events. We can trigger the following steps and ensure they're always processed based on the recorded events. I wrote already about that [aspect in Marten](/pl/integrating_Marten/), today I'd like to focus on [EventStoreDB](https://developers.eventstore.com).

**EventStoreDB has two types of subscriptions:**
- [Catch-up](https://developers.eventstore.com/clients/grpc/subscriptions.html),
- [Persistent](https://developers.eventstore.com/server/v21.10/persistent-subscriptions.html).

**They may look similar, but their use cases are much different.** Persistent subscriptions look tempting. They have a more straightforward API, as it seems that they handle all internally: scaling consumers, handling retries and knowing which event was processed the last time. All of that looks fabulous, right? Holy grail? Well, almost. 

**Persistent subscriptions implement the [Competing Consumers Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/competing-consumers).** Persistent subscriptions work on a consumer group basis. Do you know how Kafka consumer groups work? Yes? Then EventStoreDB consumer groups are much different. Kafka guarantees that only a single consumer will get an event from a specific partition for the consumer group. You have an ordering guarantee for the events inside a partition, thanks to that. 

**That, of course, has a downside;** Kafka cannot distribute the load for the specific partition. Like, e.g. RabbitMQ is doing. If you have multiple consumers of the particular queue, then RabbitMQ will try immediately distributing messages between them. Together with retries, that may lead to race conditions and out of order processing. For instance, when one consumer is slower than the other, message processing fails with a transient error and has to be processed again. The same applies to EventStoreDB. It will do its best to distribute events to respect events order; however, it will always be _just_ the best effort. Different [consuming strategies](https://developers.eventstore.com/server/v21.10/persistent-subscriptions.html#consumer-strategies) can help, but they will change the scale of the issue. **Thus, persistent subscriptions work great if you need _broadcast_. So you're notifying multiple consumers that something has happened, but the order is not critical.**

**Where processing order matters, you should use catch-up subscriptions.** They respect the order but are _raw_ compared to persistent subscriptions. They don't have built-in retries, spreading the load etc. At first glance, that may look bad, but that gives more flexibility and options to fine-tune your use case. 

You also need to maintain the last processed event position. That means loading and storing checkpoints. The typical flow for catch-up subscriptions looks as follows:

1. Load the last processed event position.
2. If it exists, subscribe to the next event. If it does not, subscribe from the first event in the stream.
3. Get a notification about the event and process it.
4. Store position of that event.

Thanks to that, when service is down or something goes wrong, you don't have to start from the beginning, but you know the position. You can also reset the position to reprocess events. Read more about positions in my article [Let's talk about positions in event stores](/pl/lets_talk_about_positions_in_event_stores/).

If you're storing events in the transactional database, you can store position together with database changes and get exactly-once processing semantics. Fore instance code in [TypeScript and NodeJS](https://github.com/oskardudycz/EventSourcing.NodeJS/pull/19) could look like:

```typescript
export const getCheckpoints = () => subscriptionCheckpoints(getPostgres());

export const loadCheckPointFromPostgres = async (subscriptionId: string) => {
  const checkpoints = getCheckpoints();

  const checkpoint = await checkpoints.findOne({
    id: subscriptionId,
  });

  return checkpoint != null ? BigInt(checkpoint.position) : undefined;
};

export type PostgresEventHandler = (
  db: Transaction,
  event: SubscriptionResolvedEvent
) => Promise<void>;

const storeCheckpointInPostgres = async (event: SubscriptionResolvedEvent) => {
  const checkpoints = getCheckpoints();

  await checkpoints.insertOrUpdate(['id'], {
    id: event.subscriptionId,
    position: Number(event.commitPosition),
  });
};

export const handleEventInPostgresTransactionScope =
  (handlers: PostgresEventHandler[]) =>
  async (event: SubscriptionResolvedEvent) => {
    await getPostgres().tx(async (transaction) => {
      await transaction.task(async (db) => {
        for (const handle of handlers) {
          await handle(db, event);
        }

        storeCheckpointInPostgres(event);
      });
    });
  };
```

Yet, sometimes you want to keep things simple. For example, you're using subscriptions for workflow processing ([saga, process manager, etc.](/pl/saga_process_manager_distributed_transactions/)). Or you're using a database like MongoDB that doesn't allow multi-document types transactions. Then you may just want to store events inside EventStoreDB, not to add more moving pieces. How to do that?

See the example below [in C#](https://github.com/oskardudycz/EventSourcing.NetCore/blob/main/Core.EventStoreDB/Subscriptions/EventStoreDBSubscriptionCheckpointRepository.cs):

```csharp
public interface ISubscriptionCheckpointRepository
{
    ValueTask<ulong?> Load(string subscriptionId, CancellationToken ct);

    ValueTask Store(string subscriptionId, ulong position, CancellationToken ct);
}

public record CheckpointStored(string SubscriptionId, ulong? Position, DateTime CheckpointedAt);

public class EventStoreDBSubscriptionCheckpointRepository: ISubscriptionCheckpointRepository
{
    private readonly EventStoreClient eventStoreClient;

    public EventStoreDBSubscriptionCheckpointRepository(
        EventStoreClient eventStoreClient)
    {
        this.eventStoreClient = eventStoreClient ?? throw new ArgumentNullException(nameof(eventStoreClient));
    }

    public async ValueTask<ulong?> Load(string subscriptionId, CancellationToken ct)
    {
        var streamName = GetCheckpointStreamName(subscriptionId);

        var result = eventStoreClient.ReadStreamAsync(Direction.Backwards, streamName, StreamPosition.End, 1,
            cancellationToken: ct);

        if (await result.ReadState == ReadState.StreamNotFound)
        {
            return null;
        }

        ResolvedEvent? @event = await result.FirstOrDefaultAsync(ct);

        return @event?.Deserialize<CheckpointStored>()?.Position;
    }

    public async ValueTask Store(string subscriptionId, ulong position, CancellationToken ct)
    {
        var @event = new CheckpointStored(subscriptionId, position, DateTime.UtcNow);
        var eventToAppend = new[] {@event.ToJsonEventData()};
        var streamName = GetCheckpointStreamName(subscriptionId);

        try
        {
            // store new checkpoint expecting stream to exist
            await eventStoreClient.AppendToStreamAsync(
                streamName,
                StreamState.StreamExists,
                eventToAppend,
                cancellationToken: ct
            );
        }
        catch (WrongExpectedVersionException)
        {
            // WrongExpectedVersionException means that stream did not exist
            // Set the checkpoint stream to have at most 1 event
            // using stream metadata $maxCount property
            await eventStoreClient.SetStreamMetadataAsync(
                streamName,
                StreamState.NoStream,
                new StreamMetadata(1),
                cancellationToken: ct
            );

            // append event again expecting stream to not exist
            await eventStoreClient.AppendToStreamAsync(
                streamName,
                StreamState.NoStream,
                eventToAppend,
                cancellationToken: ct
            );
        }
    }

    private static string GetCheckpointStreamName(string subscriptionId) => $"checkpoint_{subscriptionId}";
}
```

Are you doing Java? No worries, here's how it could look like: [EventStoreDBSubscriptionCheckpointRepository.java](https://github.com/oskardudycz/EventSourcing.JVM/blob/main/samples/event-sourcing-esdb-simple/src/main/java/io/eventdriven/ecommerce/core/subscriptions/EventStoreDBSubscriptionCheckpointRepository.java).

This code allows to load and store position in an event stream. Each subscription will get its stream. We need just the last processed position, and there's no need to keep more than one event. We're setting _$maxCount_ event data on the stream creation to achieve that. EventStoreDB will ensure that only the latest one event will be kept, and the rest will be [truncated](https://developers.eventstore.com/server/v21.10/streams.html#deleting-streams-and-events) (_Note: they will be physically removed when the [scavenging process](https://developers.eventstore.com/server/v21.10/operations.html#scavenging-events) is run_).

How to do retries? You can wrap the handling code with a retry policy or implement it case by case. You can use library like [Polly](https://github.com/App-vNext/Polly), or write it as I explained in [my other article](/pl/long_polling_and_eventual_consistency/).

Scaling? That's a topic on its own. Luckily, I have an article for you [How to scale projections in the event-driven systems?](/pl/how_to_scale_projections_in_the_event_driven_systems/).

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
