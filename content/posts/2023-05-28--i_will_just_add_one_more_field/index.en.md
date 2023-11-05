---
title: Anti-patterns in event modelling - I'll just add one more field
category: "Event Sourcing"
cover: 2023-05-28-cover.png
author: oskar dudycz
---

![cover](2023-05-28-cover.png)

Programming origins are in mathematics. Scientists like [John Von Neumann](https://en.wikipedia.org/wiki/Von_Neumann_architecture) and [Alan Turing](https://en.wikipedia.org/wiki/Turing_machine) built the foundations for today's computers. 

That may be a reason why we tend to believe that 1 plus 1 will always equal 2.

**This fact is visible in our data modelling; we try to put as much data as possible. Just in case we need it.** There may be a valid reason for that. I'm also to blame, as I often repeat that [storage is cheap, but the information is priceless](/pl/never_lose_data_with_event_sourcing/). Still, the more is not always the merrier.

Let's look at the following events:

```csharp
public record CustomerCreated(
    Guid CustomerId,
    string Name,
    string Email
);

public record IncidentLogged(
    Guid IncidentId,
    Guid CustomerId,
    Contact Contact,
    string Description,
    Guid LoggedBy,
    DateTimeOffset LoggedAt
);

public record IncidentResolved(
    Guid IncidentId,
    ResolutionType Resolution,
    Guid ResolvedBy,
    DateTimeOffset ResolvedAt
);

public record ResolutionAcknowledgedByCustomer(
    Guid IncidentId,
    Guid AcknowledgedBy,
    DateTimeOffset AcknowledgedAt
);

public record IncidentClosed(
    Guid IncidentId,
    Guid ClosedBy,
    DateTimeOffset ClosedAt
);
```

They're part of the IT Helpdesk domain I described in [Event-driven projections in Marten explained](/pl/projections_in_marten_explained/) article.

Now, we'd like to build a read model that contains the summary of the incidents broken down by status:

```csharp
public class CustomerIncidentsSummary
{
    public Guid Id { get; set; }
    public int Pending { get; set; }
    public int Resolved { get; set; }
    public int Acknowledged { get; set; }
    public int Closed { get; set; }
}
```

We could build such projection by applying events in the following way:

```csharp
public class CustomerIncidentsSummaryProjection
{
    public void Apply(IncidentLogged logged, CustomerIncidentsSummary current)
    {
        current.Pending++;
    }

    public void Apply(IncidentResolved resolved, CustomerIncidentsSummary current)
    {
        current.Pending--;
        current.Resolved++;
    }

    public void Apply(ResolutionAcknowledgedByCustomer acknowledged, CustomerIncidentsSummary current)
    {
        current.Resolved--;
        current.Acknowledged++;
    }

    public void Apply(IncidentClosed closed, CustomerIncidentsSummary current)
    {
        current.Acknowledged--;
        current.Closed++;
    }
}
```

Based on the events, we're progressing from one state to another and increasing or decreasing the number of incidents in the specific state. 

**It seems fine, but we must correlate the events with the read model id. As it's the customer summary, we could use the customer id as the key.** Yet, the careful reader will notice that we have customer id only in the _IncidentLogged_ event. Why? Because we assume that the customer id won't change during the incident's lifetime. Repeating this information would be redundant.

Still, that makes our projections processing harder, as we cannot easily correlate data.

**The first idea might be: _"Easy peasy. Let's add the customer id to all the events!"_**

That may sound tempting, as it's just one more property. 

**Plus, we'll have more data on the events, which means we'll also have more information.** That sounds like an obvious move, then? Nope. 

We need to remember that one of the most powerful features of events is that they capture precise business context. This is powerful, as we can understand the workflow by looking at them. They're a form of documentation and a bridge between us and business people.

If we add customer id to, e.g. _ResolutionAcknowledgedByCustomer_ event

```csharp
public record ResolutionAcknowledgedByCustomer(
    Guid IncidentId,
    Guid CustomerId,
    Guid AcknowledgedBy,
    DateTimeOffset AcknowledgedAt
);
```

Then what would that mean? If we're the person that added the customer id to the event, we may remember the tradeoff. But if we're the new person in the project, a colleague from the other team or future ourselves, we may wonder why this customer id is there.

We may need to double-check if this redundancy was a tradeoff, or the incident may be shared between customers, or we can transfer the incident and resolve it on the other customer. 

You may say that I'm exaggerating, but usually, after the first redundant property comes another one and another one. Each illegal dump starts with the first person throwing junk in the open space.

Then cognitive load skyrockets.

**If we add too much information to our events, they will lose precision.** It may look counterintuitive that by adding more information, we're losing it, as it's getting harder and harder to interpret the meaning. So 1 plus 1 may equal 0.

Of course, a tradeoff is a tradeoff. We're trading complexity for [the risk](/pl/the_risk_of_ignoring_risks/). That's all fine if we're keeping it on a leash. How is the spaghetti code made? Day by day.

Read more about it in [Events should be as small as possible, right?](/pl/events_should_be_as_small_as_possible/).

**So what other alternatives do we have?**

**One of the options is to find the customer id for the specific incident and use it to correlate data.** Yet, how to do it? I explained in [How to create projections of events for nested object structures?](/pl/how_to_create_projections_of_events_for_nested_object_structures/) that it's more challenging than it seems.

**If we had an Incident read model, we could do the lookup or join if we keep the data in a relational database.** It could be a solution and a tradeoff, as then we'd couple the read models together. That would make [projections rebuild](https://event-driven.io/pl/projections_and_read_models_in_event_driven_architecture/#projections-rebuild) much harder. We'd always need to rebuild those projections and create a _rebuild train_ to rebuild them in a specific order. That's, of course, a potential trap that we'll fall into later. 

**Alternative is to load additional data from other events.** If we assume that _IncidentLogged_ always comes as the first one, we could query it based on the Incident stream id. In Marten we could use a custom grouper feature:

```csharp
public class CustomerIncidentsSummaryProjection: MultiStreamProjection<CustomerIncidentsSummary, Guid>
{
    public CustomerIncidentsSummaryProjection()
    {       
        Identity<CustomerCreated>(e => e.CustomerId);
        Identity<IncidentLogged>(e => e.CustomerId);
        CustomGrouping(new CustomerIncidentsSummaryGrouper());
    }
}

public class CustomerIncidentsSummaryGrouper: IAggregateGrouper<Guid>
{
    private readonly Type[] eventTypes =
    {
        typeof(IncidentResolved), typeof(ResolutionAcknowledgedByCustomer),
        typeof(IncidentClosed)
    };

    public async Task Group(IQuerySession session, IEnumerable<IEvent> events, ITenantSliceGroup<Guid> grouping)
    {
        var filteredEvents = events
            .Where(ev => eventTypes.Contains(ev.EventType))
            .ToList();

        if (!filteredEvents.Any())
            return;

        var incidentIds = filteredEvents.Select(e => e.StreamId).ToList();

        var result = await session.Events.QueryRawEventDataOnly<IncidentLogged>()
            .Where(e => incidentIds.Contains(e.IncidentId))
            .Select(x => new { x.IncidentId, x.CustomerId })
            .ToListAsync();

        foreach (var group in result.Select(g =>
                     new { g.CustomerId, Events = filteredEvents.Where(ev => ev.StreamId == g.IncidentId) }))
        {
            grouping.AddEvents(group.CustomerId, group.Events);
        }
    }
}
```

Yet, it's undeniable that this code is already complicated, and we're also getting an N+1 problem, as each time we get one of the defined events, we need to do an additional query. Of course, we could use some cache, batch processing etc. But that already sounds hairy.

What else could we do?

**We could use event metadata.** Each event is built from the payload and additional information. That additional information is built from
- common properties like stream id, event type name, position in the stream, timestamp, etc.
- user-defined properties.

Most event stores provide the possibility to provide custom event metadata (see docs for [Marten](https://martendb.io/events/metadata.html), [EventStoreDB](https://developers.eventstore.com/server/v22.10/streams.html#event-metadata), [Axon](https://docs.axoniq.io/reference-guide/axon-framework/messaging-concepts/anatomy-message)). We can put some common properties that are not part of the business process but help us make technical processing easier. 

Of course, we need to be careful not to use it too much to cheat and make it our open dump for everything. 

**Still, providing a customer id as metadata sounds like a decent move for our case.** That looks like something that could potentially be a reusable concept, also for diagnostics and tracing. We could use it to correlate our event with the read model.

We need to remember that metadata is usually kept as a separate field in event stores. Getting data from it require deserialisation which may have an impact on performance.

**So we should also not put too much into metadata just in case.**

Any other alternatives? Sure!

**We can accumulate incident information in the read model.** It may also be closer to real life. Our assumption that we always have a forward transition is quite naive. We may soon realise that we need to expand our solution. For instance like that:

```csharp
public class IncidentInfo
{
    public Guid Id { get; set; }
    public IncidentStatus Status { get; set; }
    public int Incident Number { get; set; }
}

public class CustomerIncidentsSummary
{
    public Guid Id { get; set; }
    public int Pending { get; set; }
    public int Resolved { get; set; }
    public int Acknowledged { get; set; }
    public int Closed { get; set; }
    public List<IncidentInfo> Incidents { get; set; }
}
```

Keeping information like that may seem redundant, but thanks to that, we can query the proper _CustomerIncidentsSummary_ based on the linked incident. This should work both for document and relational databases.

Of course, there's a risk here. If we have many incidents per customer, the list may grow too big and impact performance. We can optimise that by, e.g. removing from the list closed incidents. But, of course, that's something to consider.

If we're using a relational database, and plan to keep the incidents list in a dedicated table, then we need to remember not to reuse it between projections to not end up in the coupling and _rebuilt train_ mentioned before.

We should keep this list as an internal thing and technical implementation detail of this projection. We should also not return this data to the external world through the query.

**Summing up.** Decisions about adding a redundant property to the event should always be carefully made. The new property may not add more information but degrade it. We may lose a precious business context.

That may be a valid tradeoff; we should at least [note it ](/pl/how_to_successfully_do_documentation_without_maintenance_burden/). Still, there are other options; I hope this article will be a good tutorial on techniques you may apply.

As always, pick your poison!

**Read also other article in Anti-patterns in event modelling series:**
- [Property Sourcing](/en/property-sourcing/).
- [State Obsession](/en/state-obsession/).
- [Clickbait event](/en/clickbait_event/).

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
