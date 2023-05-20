---
title: Is the audit log a proper architecture driver for Event Sourcing?
category: "Event Sourcing"
cover: 2023-05-20-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2023-05-20-cover.png)

**Usually, one of the main drivers for Event Sourcing is the audit log capability.** Indeed [event stores are append-only logs](/en/relational_databases_are_event_stores/), theoretically, we're getting that for free. Yet, I'm usually not putting it as the front reason, and there are a few reasons for that.

## Building a proper audit log is not so simple. Just recording the result of operations may not be enough.

We also need to understand the context in which we recorded the fact. To get the full picture, we must also log the intention, so command. Thanks to that, we can verify if the correct event was logged. We also need to store the metadata like user id, permissions etc., to understand if the user had the rights to perform this action. Depending on our business case, we may need to store more information.

All of that is contextual and need to be well thought out. We must design a proper compliance process if we're in a regulated industry. It may also mean that we must prove that the data wasn't changed after it was appended. In the more restrictive environment, that may even mean using [write-once-read-many (WORM) media](https://en.wikipedia.org/wiki/Write_once_read_many), as they only guarantee that what was written wasn't ever updated. 

## We can do that also without using Event Sourcing.

We could just store events with state change and use them for audit needs and integrations using [outbox pattern](/en/outbox_inbox_patterns_and_delivery_guarantees_explained/). That can even give us more advanced filtering, querying options etc.

## Filtering capabilities of the event log may not be enough.

[If you're using Marten, you can query events](https://martendb.io/events/querying.html). That gives you the possibility to do data drilling and analytics. Yet, querying raw events may also not be performant enough.

Most event stores are optimised for business logic needs, so accessing events by the stream identifier. That means the two types of operations: append to stream and read all events from the stream. Each event type may have a distinct set of properties, so event data has [high cardinality](https://docs.honeycomb.io/concepts/high-cardinality/). 

That means you need to try taming two different styles of usages. Rarely do event stores have such capabilities. You may need to publish events and store the results in a database that supports such filtering.

## Event log is not human-readable on its own.

Sometimes audit need means that we need to display historical information to users. That also means we need to transform events into other structures. At least if we do not believe JSON is human-readable. 

I showed in [Event-driven projections in Marten explained](/en/projections_in_marten_explained/) how to build projection to make projections to prepare data to be human-readable. You can use [event projection](https://martendb.io/events/projections/event-projections.html) for that. It allows to transform events freely, e.g., creating a new read model record for each event.

```csharp
public record IncidentHistory(
    Guid Id,
    Guid IncidentId,
    string Description
);

public class IncidentHistoryTransformation: EventProjection
{
    public IncidentHistory Transform(IEvent<IncidentLogged> input)
    {
        var (incidentId, customerId, contact, description, loggedBy, loggedAt) = input.Data;

        return new IncidentHistory(
            CombGuidIdGeneration.NewGuid(),
            incidentId,
            $"['{loggedAt}'] Logged Incident with id: '{incidentId}' for customer '{customerId}' and description `{description}' through {contact} by '{loggedBy}'"
        );
    }

    public IncidentHistory Transform(IEvent<AgentAssignedToIncident> input)
    {
        var (incidentId, agentId, assignedAt) = input.Data;

        return new IncidentHistory(
            CombGuidIdGeneration.NewGuid(),
            incidentId,
            $"[{assignedAt}] Assigned agent `{agentId} to incident with id: '{incidentId}'"
        );
    }

    public IncidentHistory Transform(IEvent<IncidentResolved> input)
    {
        var (incidentId, resolution, resolvedBy, resolvedAt) = input.Data;

        return new IncidentHistory(
            CombGuidIdGeneration.NewGuid(),
            incidentId,
            $"[{resolvedAt}] Resolved Incident with id: '{incidentId}' with resolution `{resolution} by '{resolvedBy}'"
        );
    }

    // (...) other events transformations
}
```

## Summing up

All of that is something that you need to predict, plan and implement. That's why I claim that Event Sourcing and event stores don't provide full audit log capabilities out of the box. They make auditing easier, but if that's the only driver for us, we should reevaluate our assumptions.

The tricky part of advocating for Event Sourcing is that it doesn't have a single killer feature. 

**What makes it unique is the multiple things that you're getting out of the box, like:**
- [easier modelling of business process](/en/how_to_effectively_compose_your_business_logic/),
- [not losing business data](/en/never_lose_data_with_event_sourcing/), 
- [extended diagnostics both technical and business](/en/set_up_opentelemetry_wtih_event_sourcing_and_marten/),
- [projections to interpret the same facts in multiple ways](/en/projections_and_read_models_in_event_driven_architecture/).

**Having the needs for those scenarios can be a driver to use Event Sourcing. Just audit needs may not be enough.**

What are other drivers to not use Event Sourcing? Check my [dedicated article for that](/en/when_not_to_use_event_sourcing/).

Event Sourcing is a useful and practical pattern. Yet, it's not a silver bullet. If you want to use it, use it by making a proper architectural decision and understanding all the pros and cons.

I prefer people jump on the Event Sourcing bandwagon because it's helpful for them rather than [being blind by the hype and then failing](/en/event_streaming_is_not_event_sourcing/).

I hope that this article helped you to clear some of them. You can also check my [training page](/en/training/) if you'd like me to help you evaluate or deliver your business case.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
