---
title: How to do snapshots in Marten?
category: "Event Sourcing"
cover: 2021-12-22-cover.png
author: oskar dudycz
---

![cover](2021-12-22-cover.png)

Getting the state from events is a basic but controversial topic in Event Sourcing. I wrote on it longer in [other article](/en/how_to_get_the_current_entity_state_in_event_sourcing/). To recap,
Classically, in Event Sourcing, we create a default object and apply events from the stream in the order of appearance. In this way, our events are actually the source of truth. That's [contrary to the Event Streaming approach](/en/event_streaming_is_not_event_sourcing/) where we're getting the current state from the materialised view. 

[Marten](https://martendb.io/events/), of course, allows this default behaviour. We have a built-in method _AggregateStream_ that does all the needed steps. We can apply events both to the default and to a non-empty object. It can be helpful, for example, when taking snapshots. In short, a snapshot is the state of a stream at a specific point in time. They are used to optimise performance. They should not be the first choice, but they are an option for performance-critical functionality.

Read more in my other articles on why you may not need Snapshots and/or what are the general strategies of dealing with them:
- [Snapshots in Event Sourcing](https://www.eventstore.com/blog/snapshots-in-event-sourcing),
- [Snapshotting Strategies](https://www.eventstore.com/blog/snapshotting-strategies),
- [Keep your streams short! Temporal modeling for fast reads and optimal data retention](https://www.eventstore.com/blog/keep-your-streams-short-temporal-modelling-for-fast-reads-and-optimal-data-retention).

However, if you decide to use snapshots as a performance optimisation, be careful to not make things worse. If you want to do a snapshot after each event append,  you can speed up the readings but significantly slow down the write side. As a middle ground, you could do a snapshot once per a set of events, e.g. after a specific event type, periodically, or a number of events.

Let's take a financial account as an example:

```csharp
public record AccountingMonthOpened(
    Guid FinancialAccountId,
    int Month,
    int Year,
    decimal StartingBalance
);

public record InflowRecorded(
    Guid FinancialAccountId,
    decimal TransactionAmount
);

public record CashWithdrawnFromATM(
    Guid FinancialAccountId,
    decimal CashAmount
);

public record AccountingMonthClosed(
    Guid FinancialAccountId,
    int Month,
    int Year,
    decimal FinalBalance
);

public class FinancialAccount
{
    public Guid Id { get; private set; }
    public int CurrentMonth { get; private set; }
    public int CurrentYear { get; private set; }
    public bool IsOpened { get; private set; }
    public decimal Balance { get; private set; }
    public int Version { get; private set; }

    public void Apply(AccountingMonthOpened @event)
    {
        Id = @event.FinancialAccountId;
        CurrentMonth = @event.Month;
        CurrentYear = @event.Year;
        Balance = @event.StartingBalance;
        IsOpened = true;
        Version++;
    }

    public void Apply(InflowRecorded @event)
    {
        Balance += @event.TransactionAmount;

        Version++;
    }

    public void Apply(CashWithdrawnFromATM @event)
    {
        Balance -= @event.CashAmount;
        Version++;
    }

    public void Apply(AccountingMonthClosed @event)
    {
        IsOpened = false;
        Version++;
    }
}
```

Marten enables snapshotting after each event with such one liner in the configuration:

```csharp
var store = DocumentStore.For(opts =>
{
    opts.Connection("some connection string");

    // Run the Trip as an inline projection
    opts.Projections.Snapshot<FinancialAccount>(SnapshotLifecycle.Inline);

    // Or run it as an asynchronous projection
    opts.Projections.Snapshot<FinancialAccount>(SnapshotLifecycle.Async);
});
```

The inline mode will create a snapshot in the same transaction as appending event, async in the background process.

However, doing that at each event might not be the most effective way. Let's see how you could do that once per a few events.

You don't need to know your entire account history for the day-to-day transaction processing. It is enough to have information about the current billing period, e.g. a month. It may be worth taking a snapshot after opening a new billing period for such a scenario. We could use it as the initial object state to apply subsequent transaction events. We could do this by defining a wrapper class like this:

```csharp
public class FinancialAccountRepository
{
    private IDocumentSession session;

    public FinancialAccountRepository(IDocumentSession session)
    {
        this.session = session;
    }

    public Task Store(
        FinancialAccount financialAccount,
        object @event,
        CancellationToken ct = default
    )
    {
        if (@event is AccountingMonthOpened)
        {
            session.Store(financialAccount);
        }

        session.Events.Append(financialAccount.Id, @event);

        return session.SaveChangesAsync(ct);
    }

    public async Task<FinancialAccount?> Get(
        Guid cashRegisterId,
        CancellationToken ct = default
    )
    {
        var cashRegister =
            await session.LoadAsync<FinancialAccount>(cashRegisterId, ct);

        var fromVersion = cashRegister != null
            ?
            // incrementing version to not apply the same event twice
            cashRegister.Version + 1
            : 0;

        return await session.Events.AggregateStreamAsync(
            cashRegisterId,
            state: cashRegister,
            fromVersion: fromVersion,
            token: ct
        );
    }
}
```

Then add an event and save the snapshot at the opening of the billing month:

```csharp
(FinancialAccount, AccountingMonthOpened) OpenAccountingMonth(FinancialAccount cashRegister)
{
    var @event = new AccountingMonthOpened(cashRegister.Id, 11, 2021, 300);

    cashRegister.Apply(@event);
    return (cashRegister, @event);
}

var closedCashierShift =
    await theSession.Events.AggregateStreamAsync<FinancialAccount>(
        financialAccountId
    );

var (openedCashierShift, cashierShiftOpened) =
    OpenAccountingMonth(closedCashierShift!);

var repository = new CashRegisterRepository(_session);

await repository.Store(openedCashierShift, cashierShiftOpened);
```

and load a snapshot and events that were recorded after it was created by calling it

```csharp
var currentState = await repository.Get(financialAccountId);
```

Of course, be warned that this should not be our first-choice option. Event stores usually cope with downloading several dozen or even more events. If we want to optimise something, let's make sure that we really have to do it and the exact requirements that we have to meet.

Cheers!

Oskar