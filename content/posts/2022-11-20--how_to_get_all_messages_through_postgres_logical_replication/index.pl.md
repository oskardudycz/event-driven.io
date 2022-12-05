---
title: How to get all messages through Postgres logical replication
category: "Architecture"
cover: 2022-11-20-cover.jpg
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2022-11-20-cover.jpg)

In an earlier article, I described [Push-based Outbox Pattern with Postgres Logical Replication](/pl/push_based_outbox_pattern_with_postgres_logical_replication/). The idea is to store the outgoing message (e.g. event) in the same database transaction together with the state change. Thanks to that, we're ensuring that message won't be lost, and our business workflow will proceed and become consistent. 

**Postgres can help and inform us when a new message is appended.** We can use the native mechanism of [Write-Ahead Log (WAL)](/pl/relational_databases_are_event_stores/) together with logical replication. 

**The Write-Ahead Log is a centrepiece of Postgres.** Each insert, update, and delete is logged in the order of appearance and then applied to tables on the transaction commit. Logical replication takes the traditional approach to the next level. Instead of sending the raw binary stream of backed-up database files, we're sending a stream of changes that were recorded in the Write-Ahead Log.

**Write-Ahead Log is an ephemeral structure.** Unless we tell the database to keep it longer, records may be pruned after a successful transaction commit. It is also done to optimise disk storage. When we create logical replication publication, we tell Postgres to keep WAL entries, as we'd like to get them through notifications.

```csharp
async Task CreatePublication(
    EventsSubscriptionOptions options,
    CancellationToken ct
)
{
    var (connectionString, _, publicationName, tableName) = options;
    await using var dataSource = NpgsqlDataSource.Create(connectionString);
    await dataSource.Execute(
      $"CREATE PUBLICATION {publicationName} FOR TABLE {tableName};", ct
    );
}
``` 

Yet if we create a subscription:

```csharp
async Task<CreateReplicationSlotResult> CreateSubscription(
    LogicalReplicationConnection connection,
    EventsSubscriptionOptions options,
    CancellationToken ct
)
{
    var result = await connection.CreatePgOutputReplicationSlot(
        options.SlotName,
        slotSnapshotInitMode: LogicalSlotSnapshotInitMode.Export,
        cancellationToken: ct
    );

    return new Created(options.TableName, result.SnapshotName!);
}
```

And subscribe for the notifications:

```csharp
public async IAsyncEnumerable<object> Subscribe(
    EventsSubscriptionOptions options,
    [EnumeratorCancellation] CancellationToken ct
)
{
    var (connectionString, slotName, publicationName, _) = options;
    await using var conn = new LogicalReplicationConnection(connectionString);
    await conn.Open(ct);

    var slot = new PgOutputReplicationSlot(slotName);

    await foreach (var message in conn.StartReplication(slot,
      new PgOutputReplicationOptions(publicationName, 1), ct)
    )
    {
        if (message is InsertMessage insertMessage)
        {
            yield return await InsertMessageHandler.Handle(insertMessage, ct);
        }

        conn.SetReplicationStatus(message.WalEnd);
        await conn.SendStatusUpdate(ct);
    }
}
```

**We may realise that we only got the newly appended records after the publication was created.** That's because Postgres didn't know before that we'd like to keep WAL entries and pruned them. That's not a big deal if we're starting with a new deployment or the best greenfield project. Yet, if we already had [a pull-based outbox implementation](/pl/outbox_inbox_patterns_and_delivery_guarantees_explained/), we might also want to get the _old_ messages. How to do that?

Let's get back to the subscription setup:

```csharp
var result = await connection.CreatePgOutputReplicationSlot(options.SlotName,
    slotSnapshotInitMode: LogicalSlotSnapshotInitMode.Export, cancellationToken: ct);

return new Created(options.TableName, result.SnapshotName!);
```

It calls internally [CREATE_REPLICATION_SLOT](https://www.postgresql.org/docs/15/protocol-replication.html#PROTOCOL-REPLICATION-CREATE-REPLICATION-SLOT) function:

```csharp
CREATE_REPLICATION_SLOT 
    events_slot 
LOGICAL pgoutput(SNAPSHOT 'export')
```

We're passing the bit enigmatic parameter _SNAPSHOT 'export'_. Before I explain it, **let's stop for a moment and briefly discuss how the Postgres transaction works.**

The transaction may contain multiple statements. With the cadence that depends on the transaction level, Postgres creates snapshots. Snapshot is a frozen state of the database is at a certain point in time:
- for _READ COMMITED_ snapshot is created after each committed statement,
- _REPEATABLE READ_ and _SERLIALIZABLE_ create a snapshot at the beginning and keep it consistent throughout the transaction, even if other sessions commit transactions.

**Snapshot is usually kept until the transaction exists and then removed.** Yet, we're taking a Postgres here. There needs to be more in that, right? If you're a regular reader of my blog [you already know _pg_current_snapshot_ function](/pl/relational_databases_are_event_stores/). It returns information about the current snapshot. Postgres have more functions like that; for instance, [pg_export_snapshot](https://pgpedia.info/p/pg_export_snapshot.html) allows to keep snapshot longer than the transaction lifetime. Why would we need it? For example, to do a database backup, [pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html) uses it internally to become fault tolerant. We wouldn't want the backed-up data changed during the process, right?

**Export snapshot feature is also used while creating the replication slot.** If we specify the _SNAPSHOT 'export'_ parameter when creating the replication slot, it will create the snapshot automatically and return its id. We can use it snapshot to get the existing data at the moment we created replication slot. All newer ones will be sent through logical replication.

To read existing records, we need to create a transaction with at least a _REPEATABLE READ_ transaction level and set the transaction snapshot to the id we get from the previous step. That will make our reads access only data at the snapshotted point in time.

In C#, the code can look like that:

```csharp
await using var transaction = await connection.BeginTransactionAsync(
  IsolationLevel.RepeatableRead, ct
);

await using var command = new NpgsqlCommand(
  $"SET TRANSACTION SNAPSHOT '{snapshotName}';", connection, transaction
);
await command.ExecuteScalarAsync(ct);
```

Then we can poll the records using a regular _SELECT_ statement on the outbox table. The method will look as follows.

```csharp
public static async IAsyncEnumerable<object> QueryTransactionSnapshot(
    this NpgsqlConnection connection,
    string snapshotName,
    string tableName,
    Func<NpgsqlDataReader, CancellationToken, Task<object>> map,
    [EnumeratorCancellation] CancellationToken ct)
{
    await using var transaction = await connection.BeginTransactionAsync(
      IsolationLevel.RepeatableRead, ct
    );

    await using var command = new NpgsqlCommand(
      $"SET TRANSACTION SNAPSHOT '{snapshotName}';", connection, transaction
    );
    await command.ExecuteScalarAsync(ct);

    await using var cmd = new NpgsqlCommand(
      $"SELECT * FROM {tableName}", connection, transaction
    );
    await using var reader =  await cmd.ExecuteReaderAsync(ct);

    while (await reader.ReadAsync(ct))
    {
        yield return await map(reader, ct);
    }
}
```

The final code for our subscription that can do a full setup and read snapshotted data will look like that:

```csharp
public interface IEventsSubscription
{
    IAsyncEnumerable<object> Subscribe(
      EventsSubscriptionOptions options, CancellationToken ct
    );
}

public class EventsSubscription: IEventsSubscription
{
    private async Task<CreateReplicationSlotResult> CreateSubscription(
        LogicalReplicationConnection connection,
        EventsSubscriptionOptions options,
        CancellationToken ct
    )
    {
        if (!await PublicationExists(options, ct))
            await CreatePublication(options, ct);

        if (await ReplicationSlotExists(options, ct))
            return new AlreadyExists();

        var result = await connection.CreatePgOutputReplicationSlot(options.SlotName,
            slotSnapshotInitMode: LogicalSlotSnapshotInitMode.Export, cancellationToken: ct);

        return new Created(options.TableName, result.SnapshotName!);
    }

    public async IAsyncEnumerable<object> Subscribe(
        EventsSubscriptionOptions options,
        [EnumeratorCancellation] CancellationToken ct
    )
    {
        var (connectionString, slotName, publicationName, _) = options;
        await using var conn = new LogicalReplicationConnection(connectionString);
        await conn.Open(ct);

        var result = await CreateSubscription(conn, options, ct);

        if (result is Created created)
        {
            await foreach (var @event in ReadExistingEventsFromSnapshot(
              created.SnapshotName, options, ct)
            )
            {
                yield return @event;
            }
        }

        var slot = new PgOutputReplicationSlot(slotName);

        await foreach (var message in conn.StartReplication(
          slot, new PgOutputReplicationOptions(publicationName, 1), ct)
        )
        {
            if (message is InsertMessage insertMessage)
            {
                yield return await InsertMessageHandler.Handle(insertMessage, ct);
            }

            conn.SetReplicationStatus(message.WalEnd);
            await conn.SendStatusUpdate(ct);
        }
    }

    private async Task<bool> ReplicationSlotExists(
        EventsSubscriptionOptions options,
        CancellationToken ct
    )
    {
        var (connectionString, slotName, _, _) = options;
        await using var dataSource = NpgsqlDataSource.Create(connectionString);
        return await dataSource.Exists(
          "pg_replication_slots", "slot_name = $1", new object[] { slotName }, ct
        );
    }

    private async Task CreatePublication(
        EventsSubscriptionOptions options,
        CancellationToken ct
    )
    {
        var (connectionString, _, publicationName, tableName) = options;
        await using var dataSource = NpgsqlDataSource.Create(connectionString);
        await dataSource.Execute(
          $"CREATE PUBLICATION {publicationName} FOR TABLE {tableName};", ct
        );
    }

    private async Task<bool> PublicationExists(
        EventsSubscriptionOptions options,
        CancellationToken ct
    )
    {
        var (connectionString, slotName, _, _) = options;
        await using var dataSource = NpgsqlDataSource.Create(connectionString);
        return await dataSource.Exists(
          "pg_publication", "pubname = $1", new object[] { slotName }, ct
        );
    }

    private async IAsyncEnumerable<object> ReadExistingEventsFromSnapshot(
        string snapshotName,
        EventsSubscriptionOptions options,
        [EnumeratorCancellation] CancellationToken ct
    )
    {
        await using var connection = new NpgsqlConnection(options.ConnectionString);
        await connection.OpenAsync(ct);

        await foreach (var @event in connection.GetEventsFromSnapshot(
          snapshotName, options.TableName, ct)
        )
        {
            yield return @event;
        }
    }

    internal abstract record CreateReplicationSlotResult
    {
        public record AlreadyExists: CreateReplicationSlotResult;

        public record Created(string TableName, string SnapshotName): CreateReplicationSlotResult;
    }
}
```

It is still a naive implementation as it doesn't have full fault tolerance for reading snapshotted data. The logical replication will ensure checkpointing on its own, we don't need to take care of that, yet for snapshotted data, that's another story. But that's a story for another dedicated article!

See also more technical details around implementation in [Pull Request](https://github.com/oskardudycz/PostgresOutboxPatternWithCDC.NET/pull/2).

Cheers!

Oskar

p.s. Big thanks go to [Brar Piening](https://github.com/Brar) for implementing that part natively in [Npgsql](https://www.npgsql.org/) and pointing me in the right direction with patient explanations.

p.s.2. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
