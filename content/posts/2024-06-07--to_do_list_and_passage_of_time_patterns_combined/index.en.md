---
title: Combining the To-Do List and the Passage Of Time patterns for resilient business workflows
category: "Event Sourcing"
cover: 2024-06-07-cover.png
author: oskar dudycz
---

![](2024-06-07-cover.png)

**Managing processes is non-trivial. I have written about it in multiple posts and told you the horror story of the [case that should have never happened](/en/no_it_can_never_happen/).** Business processes are usually the most critical part of the core functionality, so we need to ensure that we can diagnose them correctly. We also need to ensure that they won't be stuck in the middle without being able to resume them. At war, love, and managing processes, all tricks are allowed.

Today, I'd like to show you how combining two useful patterns can help you in that:
- [Passage of Time](https://verraes.net/2019/05/patterns-for-decoupling-distsys-passage-of-time-event/) described by Mathias Verraes
- [To-do List](https://blog.bittacklr.be/the-to-do-list-pattern.html) described by Yves Reynhout.

**Let's say we're managing the Ordering process described in [my other article](https://event-driven.io/en/saga_process_manager_distributed_transactions/).** We must ensure that once the client confirms the shopping cart, it'll be paid for and shipped. Even if we design a compensation flow to cancel the payment if the product is unavailable, etc., we might not predict all potential scenarios. There may be transient errors, bugs in the code, and other cases where our flow can get stuck. 

In most similar flows, there's always a deadline for how long the process can be ongoing. For instance, users may have 15 minutes to make a payment, or we may need to complete information about availability. We can also use this deadline for other cases, such as unpredictable ones. Thanks to that, if the order is not completed, it will be cancelled automatically. That's not perfect, but if it happens rarely, then it's usually good enough. The user can try to start the ordering process again, or we can take other compensating operations.

There are many ways to do it. Today, we'll focus on combining the mentioned patterns, as it provides a straightforward way to handle our timeout strategy.

Our ordering process could be reflected by the following set of events:

```csharp
public abstract record OrderEvent
{
    public record OrderInitiated(
        Guid OrderId,
        Guid ClientId,
        IReadOnlyList<PricedProductItem> ProductItems,
        decimal TotalPrice,
        DateTimeOffset InitiatedAt,
        DateTimeOffset TimeoutAfter
    ): OrderEvent;

    public record OrderPaymentRecorded(
        Guid OrderId,
        Guid PaymentId,
        IReadOnlyList<PricedProductItem> ProductItems,
        decimal Amount,
        DateTimeOffset PaymentRecordedAt
    ): OrderEvent;

    public record OrderCompleted(
        Guid OrderId,
        DateTimeOffset CompletedAt
    );

    public record OrderCancelled(
        Guid OrderId,
        Guid? PaymentId,
        OrderCancellationReason OrderCancellationReason,
        DateTimeOffset CancelledAt
    ): OrderEvent;

    private OrderEvent() { }
}
```

Based on them, we could define the read model informing us about pending orders:

```csharp
public class PendingOrder(
    Guid Id,
    DateTimeOffset TimeoutAfter
);
```

And build it from events:

```csharp
public class PendingOrdersProjection: SingleStreamProjection<PendingOrder>
{
    public PendingOrdersProjection()
    {
        DeleteEvent<OrderCompleted>();
        DeleteEvent<OrderCancelled>();
    }

    public static PendingOrder Create(OrderInitiated @event, PendingOrder details) =>
        new PendingOrder(@event.OrderId, @event.TimeoutAfter);
}
```

I'm using [Marten projections](/en/projections_in_marten_explained/) here, but the syntax doesn't matter much. More importantly, I'm adding new raw when Order is initiated and removing it upon order completion or cancellation. I'm also storing the information on the desired time-out. This time will be decided in the business logic that creates the _OrderInitiated_ event.

**The pending order read model is on a To-Do List.** It keeps the information about the orders that must be completed or cancelled. I'm keeping a minimum set of information there. As completion will be handled by a different flow (positive scenario), I only need information about the potential cancellation.

Cool, but how do you handle the cancellation? The common approach is to use scheduled commands. If our tooling lets us do it (as many messaging frameworks do), we can say: _"Schedule me a TimeoutOrder command in 15 minutes"_. That's a viable and fine approach, but it's not perfect. Logically, we're scheduling an action, that in most cases should not happen, as it's an edge case. But we're scheduling it always, for good reasons, but just in case. That's also pretty vulnerable to any mishaps handling them, as e.g. if it's muted or not handled correctly then error can be swallowed and not retried. Handling the scheduled command is like  plot twist in movies, when killed villian appeared to be alive and striking back. It works, but definitely there are more elegant solutions. 

The alternative is Passage of Time pattern. Mathias Verraes wrote about it as:

> The mind switch is to think of the passage of time as just another _Domain Event_, exactly like all the other events. After all, if we define a _Domain Event_ as a granular point in time where something happened that is relevant to the business, then certainly the next business day, month, or quarter, is extremely relevant.
>
> In the new design, a cron or scheduler emits generic Passage of Time Events at regular intervals, such as a _DayHasPassed {date}_ event at midnight, or a _QuarterHasPassed {year, quarter}_. All interested services listen for this event. They can react to it, by performing an action, by increasing a counter, or by querying some database and filter by date, to find items that have some work to be done.

That's precisely what we could do in our case. If we had an event as:

```csharp
public record MinuteHasPassed(
    DateTimeOffset Now,
    DateTimeOffset? PreviousTime
);
```

Then we could write the following handler:

```csharp
public class HandleCancelOrder(
    IDocumentSession documentSession,
    TimeProvider timeProvider
):
    IEventHandler<TimeHasPassed>
{
    public async Task Handle(MinuteHasPassed @event, CancellationToken ct)
    {
        var orderIds = await documentSession.Query<PendingOrder>()
            .Where(o => o.TimeoutAfter <= @event.Now)
            .Select(o => o.Id)
            .ToListAsync(token: ct);

        var now = timeProvider.GetUtcNow();

        foreach (var orderId in orderIds)
        {
            await documentSession.GetAndUpdate(
                orderId,
                order => order.Cancel(OrderCancellationReason.TimedOut, now),
                ct: ct
            );
        }
    }
}
```

We first filter pending orders that should be timed out and get their IDs. Then, we try to cancel each one with the timeout reason (note: it could also be a dedicated method if handling is different from manual cancellation).

```csharp
public class Order
{
    // (...)
    public OrderCancelled? Cancel(OrderCancellationReason cancellationReason, DateTimeOffset now)
    {
        if (OrderStatus.Closed.HasFlag(Status))
            return null;

        return new OrderCancelled(
            Id, 
            PaymentId,
            cancellationReason,
            now
        );
    }
}
```

As a result, we'll store the _OrderCancelled_ event that will trigger removing the pending order from our To-Do List item.

**What if the _MinuteHasPassed_ event handling will be delayed?** Typically, that's not a big deal, as timing out doesn't need to happen at the precise second. It's typically good enough to happen as soon as possible after a certain time.

**What if one of _MinuteHasPassed_ will be lost?** Then, the next one will be published in another minute. As mentioned above, it's not a big deal.

**What if cancelling one of the pending orders fails?** Not a big deal, as it will be caught again by the next passage of time cadence.

**What if a race condition exists between our pending order list and our order write model?** Of course, it may happen that someone managed to complete an order at the very last moment. We should silently fail to cancel it, and that's what we're doing in business logic by returning a null instead of the event. We should always use [Optimistic Concurrency](/en/optimistic_concurrency_for_pessimistic_times/) to ensure consistency. That's also why we're doing operations on the aggregate instead of just storing the _OrderCancelled_ event. This should also help us if multiple instances handle the same To-Do List and compete for resources. In the worst case, the first succeeds, while the other fails silently.

Also, we can connect multiple To-Do Lists to the same passage of time events. As we'll be continuously triggering those events, we can do it even with simple in-memory tooling. 

**All of that creates a simple but powerful and resilient combination.**

The example using the [Quartz.NET](https://www.quartz-scheduler.net) library can look like this: We need to register our jobs with specific schedules (in our case, minute, hour, day).

```csharp
public static class QuartzExtensions
{
    public static IServiceCollection AddQuartzDefaults(
        this IServiceCollection services,
        TimeSpan? passageOfTimeInterval = null
    ) =>
        services
            .AddQuartz(q => q
                .AddPassageOfTime(TimeUnit.Minute)
                .AddPassageOfTime(TimeUnit.Hour)
                .AddPassageOfTime(TimeUnit.Day)
            )
            .AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

    public static IServiceCollectionQuartzConfigurator AddPassageOfTime(
        this IServiceCollectionQuartzConfigurator q,
        TimeUnit timeUnit
    )
    {
        var jobKey = new JobKey($"PassageOfTimeJob_{timeUnit}");
        q.AddJob<PassageOfTimeJob>(opts => opts.WithIdentity(jobKey));

        q.AddTrigger(opts => opts
            .ForJob(jobKey)
            .WithIdentity($"{jobKey}-trigger")
            .UsingJobData("timeUnit", timeUnit.ToString())
            .WithSimpleSchedule(x => x.WithInterval(timeUnit.ToTimeSpan()))
        );

        return q;
    }
}
```

Having that, we can we can define our job as:

```csharp
public class PassageOfTimeJob(IEventBus eventBus, TimeProvider timeProvider): IJob
{
    public Task Execute(IJobExecutionContext context)
    {
        var timeUnit = context.MergedJobDataMap.GetString("timeUnit")!.ToTimeUnit();

        return eventBus.Publish(
            timeUnit.ToEvent(timeProvider.GetUtcNow(), context.PreviousFireTimeUtc),
            CancellationToken.None
        );
    }
}
```

EventBus is a simple in-memory messaging implementation that will trigger all registered handlers for our event.

As different jobs will need different cadences, we'd like to be able to subscribe to different time passages explicitly. Because of that, we'll define a dedicated event types:

```csharp
public abstract record TimeHasPassed(DateTimeOffset Now, DateTimeOffset? PreviousTime)
{
    public record MinuteHasPassed(DateTimeOffset Now, DateTimeOffset? PreviousTime): TimeHasPassed(Now, PreviousTime);

    public record HourHasPassed(DateTimeOffset Now, DateTimeOffset? PreviousTime): TimeHasPassed(Now, PreviousTime);

    public record DayHasPassed(DateTimeOffset Now, DateTimeOffset? PreviousTime): TimeHasPassed(Now, PreviousTime);
}
```

You could go wild and customise that more, but I'm sure you're getting the point.

The final thing is to define our TimeUnit and the helper conversion methods:

```csharp
public enum TimeUnit
{
    Minute,
    Hour,
    Day
}

public static class TimeUnitExtensions
{
    public static TimeUnit ToTimeUnit(this string timeUnitString) =>
        Enum.Parse<TimeUnit>(timeUnitString);

    public static TimeSpan ToTimeSpan(this TimeUnit timeUnit) =>
        timeUnit switch
        {
            TimeUnit.Minute => TimeSpan.FromMinutes(1),
            TimeUnit.Hour => TimeSpan.FromHours(1),
            TimeUnit.Day => TimeSpan.FromDays(1),
            _ => throw new ArgumentOutOfRangeException(nameof(timeUnit), $"Not expected time unit value: {timeUnit}")
        };

    public static TimeHasPassed ToEvent(this TimeUnit timeUnit, DateTimeOffset now, DateTimeOffset? previous) =>
        timeUnit switch
        {
            TimeUnit.Minute => new MinuteHasPassed(now, previous),
            TimeUnit.Hour => new HourHasPassed(now, previous),
            TimeUnit.Day => new DayHasPassed(now, previous),
            _ => throw new ArgumentOutOfRangeException(nameof(timeUnit), $"Not expected time unit value: {timeUnit}")
        };
}
```

Is it always a good solution? Only Siths deal in absolutes. This can swamp your database if you have many To-Do Lists with many records. Especially if you add the passage of time in seconds or milliseconds. That's why I made the To-Do List data so minimal and ensured that items would be cleared right after the order was completed or cancelled. If you want to create a detailed view, don't reuse it with the To-Do List; create a dedicated read model.

If you have many tasks that need to be scheduled quickly and tight performance requirements, scheduled messages may be a better option. But as always, don't assume. Ask for metrics, measure, compare, and then make the final decision.

**The combination of the To-Do List and the Passage of Time patterns is simple but powerful.** In most systems, processes/checks need to happen every day, every hour, or every minute. This combination allows us to build a loosely coupled, scalable and resilient processing. Of course, we should not replace the classical process handling, but it should be a good fit for features like time-based deadlines or triggers.

**If you liked this article and would like to expand that, I do also paid one-to-one mentoring sessions, consulting and [group workshops](/en/training/). Don't hesitate to [contact me!](mailto:oskar@event-driven.io) if you're interested!**

Read also more in:
- [Saga and Process Manager - distributed processes in practice](/en/saga_process_manager_distributed_transactions/),
- [Event-driven distributed processes by example](/en/event_driven_distributed_processes_by_example/),
- [How TypeScript can help in modelling business workflows](/en/how_to_have_fun_with_typescript_and_workflow/),
- [Oops I did it again, or how to update past data in Event Sourcing](/en/how_to_update_past_data_in_event_sourcing/),
- [Event transformations, a tool to keep our processes loosely coupled](/en/event_transformations_and_loosely_coupling/), 
- [Testing asynchronous processes with a little help from .NET Channels](/en/testing_asynchronous_processes_with_a_little_help_from_dotnet_channels/),
- [Set up OpenTelemetry with Event Sourcing and Marten](/en/set_up_opentelemetry_wtih_event_sourcing_and_marten/),
- [Set of recommended materials about distributed processes](https://github.com/oskardudycz/EventSourcing.NetCore#105-distributed-processes).

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
