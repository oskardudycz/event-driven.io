---
title: Event transformations, a tool to keep our processes loosely coupled
category: "Event Sourcing"
cover: 2023-08-31-cover.png
author: oskar dudycz
---

![cover](2023-08-31-cover.png)

**One of the biggest pains in traditional software design is accidental complexity.** We want to understand and reflect on the business process in the code, but our perspective becomes immediately blurred. We add a new field, change the business flow a bit and w realise that _"dammit, foreign keys won't work now"_ or _"now views will be broken"_. Blood pressure increases, and instead of continuing to focus on the business logic, we're starting to do it all at once. 

That's never a pleasant experience.

**Event Sourcing can help with that, as it does things differently.** First, we're focusing on the business process. We distil the critical points as events, e.g. Order Confirmed, Invoice Issued, etc. They should be recorded as the results of business operations. That creates a simple pattern that allows us to [prototype and quickly verify our understanding](/en/prototype_underestimated_design_skill/). 

**It's easier to keep backward compatibility when adding or updating events.** With [simple versioning patterns](/en/simple_events_versioning_patterns/), we could even deploy changes to business logic and then consider how to reflect that in read models. That means we're getting a decent separation of concerns between our business logic and read models.

That sounds too good to be true, and indeed, we need to do a tradeoff analysis. I explained that in:
- [Events should be as small as possible, right?](/en/events_should_be_as_small_as_possible/)
- [Stream ids, event types prefixes and other event data you might not want to slice off](/en/on_putting_stream_id_in_event_data/)
- [Using event metadata in event-driven projections](/en/projections_and_event_metadata/)
- [How to create projections of events for nested object structures?](/en/how_to_create_projections_of_events_for_nested_object_structures/)
- [Anti-patterns in event modelling - I'll just add one more field](/en/i_will_just_add_one_more_field/).
- [Guide to Projections and Read Models in Event-Driven Architecture](/en/projections_and_read_models_in_event_driven_architecture/)

Event Sourcing won't remove the need for a proper design exercise, but it can help streamline this effort, reducing the cognitive load.

**We'll discuss today another scenario: how to keep events granular and not coupled to read model needs.**

Let's say we're building a feature for managing the work schedule. We should enable defining the employee allocation for the set of days in the selected period. The event reflecting that could look as follows:

```csharp
public record Allocation(
    DateTime Day,
    double Hours
);

public record EmployeeAllocated(
    Guid EmployeeId,
    List<Allocation> Allocations
);
```

Of course, each employee can have multiple allocations so that the employee allocation stream will contain a sequence of those events. Data from further events can also override allocation.

**A lot of us work on monthly schedules, but not all.** Some of us can have weekly, 10 days, or other type of schedules. Our software should be flexible and allow defining all of them.

**Still, we can have different perspectives on the same data.** Accounting is usually working in the monthly schedules. We might want to  view allocation in such a way:

```csharp
public class MonthlyAllocation
{
    public string Id { get; init; }
    public Guid EmployeeId { get; init; }
    public DateOnly Month { get; init; }
    public double Hours { get; init; }
}
```

Yet, if we're using a weekly schedule, the week can start in one month and finish in the other. So, one _EmployeeAllocated_ event can update multiple read models.

Monthly allocation id could be a string in the format: _{EmployeeId}|{Month:yyyy-MM-dd}_, as the employee id and the first day of the month shapes the unique value. 

**We could update _MonthlyAllocation_ read model based on the _EmployeeAllocated_ event as follows:**
1. Take the employee id and all allocated dates.
2. Take the first date of the month from each date with the employee id and select the _MonthlyAllocation_ read model.
3. Update selected _MonthlyAllocation_ with data from the event.

Sounds simple, right? But it's not if we want to make it performant.

Let's look at the following payload of the _EmployeeAllocated_ event.

```json
{
    "EmployeId": "90033055-c5a3-4e98-aaf8-1ca14554c346",
    "Allocations": [
        { "Day": "2023-08-30", "Hours": "3" },
        { "Day": "2023-08-31", "Hours": "2" },
        { "Day": "2023-09-01", "Hours": "8" },
        { "Day": "2023-09-02", "Hours": "6" },
        { "Day": "2023-09-03", "Hours": "4" },
    ]
}
```

We have here an allocation that's touching two months: August and September. Each of them will have multiple days. For the naive implementation, we could iterate through allocations and update read models as described above. That could work on a smaller scale, but not in the long term. For our example, instead of doing two updates (one for August, the other for September), we'd do five for each allocation. Consider having more events like that and monthly allocations for hundreds of employees. Yeah... We need to do better than that.

**We could come up with the idea that it'd be better to have an event reflecting employee's monthly allocation definition.** 

```csharp
public record EmployeeAllocatedInMonth(
    Guid EmployeeId,
    DateOnly Month,
    List<Allocation> Allocations
);
```

That sounds like a decent move, but it's not, as this is different from how the business works. It works as described before, so defining flexible allocations. If we try to replace the _EmployeeAllocated_ event with that one, we'd be cheating. We'd bend the business process to how we'd like to view our data. 

**That's a no-go.**

Yet, what if we transformed our _EmployeeAllocated_ into _EmployeeAllocatedInMonth_, keeping the original flow and events intact? That's a much better idea.

**One way of doing it is to transform them and store results durable in another stream.** Then, we update our read model based on the events from transformed data. That's how [EventStoreDB projections works](https://developers.eventstore.com/server/v23.6/projections.html#introduction). 

That's a valid solution. The downside is that it increases the size of the database, which may not be ideal if we just want to update the read model and won't need those events for other cases.

**The other option is to perform transformations in the memory before running the projection update.**

Let's say that we prefer this option and use Marten. We might want to have our projection look as follows (read more in [introduction to Marten projections](/en/projections_in_marten_explained/)):

```csharp
public class MonthlyAllocationProjection: MultiStreamProjection<MonthlyAllocation, string>
{
    public void Apply(MonthlyAllocation allocation, EmployeeAllocatedInMonth @event)
    {
        allocation.EmployeeId = @event.EmployeeId;
        allocation.Month = @event.Month;

        var hours = @event
            .Allocations
            .Sum(x => x.Hours);

        allocation.Hours += hours;
    }
}
```

That looks simple, as it should. Now, how to do the transformation? Marten provides a feature called _[IAggregateGrouper](https://martendb.io/events/projections/multi-stream-projections.html#view-projection-with-custom-grouper)_. The name may sound enigmatic, but it enables custom transformation and grouping of events before we apply projection logic. So, all the slicing and dicing we need.

Let's define the custom grouper, then. I'll show you the whole code and then explain what we're doing step by step.

```csharp
public class MonthlyAllocationGrouper: IAggregateGrouper<string>
{
    public Task Group(
        IQuerySession session,
        IEnumerable<IEvent> events,
        ITenantSliceGroup<string> grouping
    )
    {
        var allocations = events
            .OfType<IEvent<EmployeeAllocated>>();

        var monthlyAllocations = allocations
            .SelectMany(@event =>
                @event.Data.Allocations.Select(
                    allocation => new
                    {
                        @event.Data.EmployeeId,
                        Allocation = allocation,
                        Month = allocation.Day.ToStartOfMonth(),
                        Source = @event
                    }
                )
            )
            .GroupBy(allocation =>
                new { allocation.EmployeeId, allocation.Month, allocation.Source }
            )
            .Select(monthlyAllocation =>
                new
                {
                    Key = $"{monthlyAllocation.Key.EmployeeId}|{monthlyAllocation.Key.Month:yyyy-MM-dd}",
                    Event = monthlyAllocation.Key.Source.WithData(
                        new EmployeeAllocatedInMonth(
                            monthlyAllocation.Key.EmployeeId,
                            monthlyAllocation.Key.Month,
                            monthlyAllocation.Select(a => a.Allocation).ToList())
                    )
                }
            );

        foreach (var monthlyAllocation in monthlyAllocations)
        {
            grouping.AddEvents(
                monthlyAllocation.Key,
                new[] { monthlyAllocation.Event }
            );
        }

        return Task.CompletedTask;
    }
}
```

We recommend running such projections as asynchronous ones. Marten has a background process called [AsyncDaemon](https://martendb.io/events/projections/async-daemon.html) that's doing many optimisations like grouping and parallelisation. It tries to group events by projection type, tenants, etc. Such grouping we call slice. Each slice will try to load read models and apply changes to all of them at once. Also, if the piece has multiple updates to the same read model instance, it'll only be updated once. Read more on [Scaling async projections](/en/scaling_out_marten/#scaling-async-projections).

Getting back to our grouper. The first thing we do is to select the events we'd like to handle in our projection. We're selecting the original _EmployeeAllocated_ events.

```csharp
var allocations = events
     .OfType<IEvent<EmployeeAllocated>>();
```

Then, we need to transform them into _EmployeeAllocatedInMonth_. We're starting by flattening the allocations list to get each as a separate row. We're also transforming the date into the first day of the month:

```csharp
allocations
     .SelectMany(@event =>
          @event.Data.Allocations.Select(
               allocation => new
               {
                    @event.Data.EmployeeId,
                    Allocation = allocation,
                    Month = new DateOnly(allocation.Day.Year, allocation.Day.Month, 1),
                    Source = @event
               }
          )
     )
```

Then we're grouping them by employee id and month:

```csharp
var monthlyAllocations = allocations
     .SelectMany(@event => /* (...) flattening allocations */ )
     .GroupBy(allocation =>
          new { allocation.EmployeeId, allocation.Month, allocation.Source }
     )
```

And getting new events based on the data from grouping:

```csharp
var monthlyAllocations = allocations
     .SelectMany(@event => /* (...) flattening allocations */ )
     .GroupBy(allocation => /* (...) grouping by employee id and month */ )
     .Select(monthlyAllocation =>
          new
          {
               Key = $"{monthlyAllocation.Key.EmployeeId}|{monthlyAllocation.Key.Month:yyyy-MM-dd}",
               Event = monthlyAllocation.Key.Source.WithData(
                    new EmployeeAllocatedInMonth(
                         monthlyAllocation.Key.EmployeeId,
                         monthlyAllocation.Key.Month,
                         monthlyAllocation.Select(a => a.Allocation).ToList())
                    )
          }
     );
```

We're generating:
- Key - it'll be used to select read model instances.
- Event - this event will be handled by projection. We need to create the event with metadata. By using the _WithData_ method, new events will have the same metadata as the original event but different data. 

We must also tell Marten to use those transformed data in the custom grouping.

```csharp
foreach (var monthlyAllocation in monthlyAllocations)
{
     grouping.AddEvents(
          monthlyAllocation.Key,
          new[] { monthlyAllocation.Event }
     );
}
```

As the final step, we also need to tell Projection that we're transforming _EmployeeAllocated_ events using custom grouper. We do that by registering them in a projection constructor:


```csharp
public class MonthlyAllocationProjection: MultiStreamProjection<MonthlyAllocation, string>
{
    public MonthlyAllocationProjection()
    {
        CustomGrouping(new MonthlyAllocationGrouper());
        TransformsEvent<EmployeeAllocated>();
    }

    public void Apply(MonthlyAllocation allocation, EmployeeAllocatedInMonth @event)
    {
        allocation.EmployeeId = @event.EmployeeId;
        allocation.Month = @event.Month;

        var hours = @event
            .Allocations
            .Sum(x => x.Hours);

        allocation.Hours += hours;
    }
}
```

And that's it. See the  [full sample](https://github.com/JasperFx/marten/blob/4dafe48f4209a90b5c66ee8a9a2a60e15d7ca991/src/EventSourcingTests/Projections/MultiStreamProjections/CustomGroupers/custom_grouper_with_events_transformation.cs).

I understand that it may sound a bit complex. Still, it's a powerful and flexible mechanism that allows us to achieve our main goal: keep our business workflow loosely coupled with read models.

**No matter which event store implementation you're using, it's worth focusing on keeping our business workflow reflecting the real world.** We can make tradeoffs, but we should also consider other options to avoid rotten compromises. Event transformations can help achieve that.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
