---
title: Publishing read model changes from Marten
category: "Event Sourcing"
cover: 2023-04-23-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2023-04-23-cover.png)

**Integrations have different names, shades and colours, but only one adjective: _challenging_.** Trying to glue systems together requires matching two visions into one. That's never easy, as different tools have different purposes, and authors cannot predict all the permutations that users can come up with. But no one said that all has to be easy, right? And no one said that we could not try to make it easy.

**We're trying to achieve that in [Marten](https://martendb.io/), making the event-driven world accessible.** I wrote already about that in the past:
- [Integrating Marten with other systems](/pl/integrating_Marten/)
- [Projecting Marten events to Elasticsearch](/pl/projecting_from_marten_to_elasticsearch/).

**Today, I want to tell you the easiest way to forward changes to Marten read models into other services.**

[Marten has a built-in way to build read models from stored events](/pl/projections_in_marten_explained/). There are various ways, but building a read model out of events stored in a single stream is simplest.

```csharp
public record ProjectCreated(
    Guid ProjectId,
    string Name
);

public record ProjectStarted(
    Guid ProjectId,
    DateTimeOffset StartedAt
);

public record ManagerAssignedToProject(
    Guid ProjectId,
    Guid ManagerId
);

public record ProjectInfo(
    Guid Id,
    string Name,
    DateTimeOffset? StartedAt = null,
    Guid? ManagerId = null
);

public class ProjectInfoProjection: SingleStreamProjection<ProjectInfo>
{
    public static ProjectInfo Create(ProjectCreated created) =>
        new(created.ProjectId, created.Name);

    public ProjectInfo Apply(ProjectStarted started, ProjectInfo current) =>
        current with { StartedAt = started.StartedAt };

    public ProjectInfo Apply(ManagerAssignedToProject managerAssigned, ProjectInfo current) =>
        current with { ManagerId = managerAssigned.ManagerId };
}
```

Marten can update projections in the same transaction as we're appending events and in an async way. We selected the asynchronous way, as we don't want to slow our writing. Then we can register it via:

```csharp
services.AddMarten(options =>
{
    options.Projections.Add<ProjectInfoProjection>(ProjectionLifecycle.Async);
});
```

**Now, let's say that we're living in the [Microservices world](/pl/how_to_cut_microservices/), and we'd like to build local read models based on our project info in other modules.** We are motivated to have the local copy to make our read models and lookups resilient, not needing to query the projects module. There are many ways to achieve that, but the most popular is [Event-Carried State Transfer](https://martinfowler.com/articles/201701-event-driven.html). I'm not a huge fan of this approach because we should focus more on behaviour rather than the state in an event-driven way to not fall into [state obsession](/pl/state-obsession/). Still, for our motivation, it can be an acceptable choice.

How to do it?

Marten allows [listening to changes](https://martendb.io/diagnostics.html#listening-for-document-store-events). We can use it both for document changes, events and inline and async changes. We can use _IDocumentSessionListener_, _IChangeListener_ or their abstract implementation _DocumentSessionListenerBase_. How can it help in our case?

**Document session listener has _AfterCommitAsync_ method that's triggered after all changes in the asynchronous processing were made, but BEFORE the transaction was committed.** I'll explain why it's important later on. Now, let's say that we're using some messaging system (Kafka, RabbitMQ, etc.); replace this dummy interface with your favourite one:

```csharp
public interface IMessagingSystem
{
    Task Publish(object[] messages, CancellationToken ct);
}
```

Having it, we can define the following document listener to forward the changes to your messaging system. I'll use _IChangeListener_ as I'm only interested in the asynchronous processing.

```csharp
public class AsyncDocumentChangesForwarder: IChangeListener
{
    private readonly IMessagingSystem messagingSystem;

    public AsyncDocumentChangesForwarder(IMessagingSystem messagingSystem) =>
        this.messagingSystem = messagingSystem;

    public Task AfterCommitAsync(IDocumentSession session, IChangeSet commit, CancellationToken token)
    {
        var changes = commit.Inserted.Select(doc => new DocumentChanged(ChangeType.Insert, doc))
            .Union(commit.Updated.Select(doc => new DocumentChanged(ChangeType.Update, doc)))
            .Union(commit.Deleted.Select(doc => new DocumentChanged(ChangeType.Delete, doc)))
            .ToArray();

        return messagingSystem.Publish(changes.Cast<object>().ToArray(), token);
    }
}

public record DocumentChanged(ChangeType ChangeType, object Data);

public enum ChangeType
{
    Insert,
    Update,
    Delete
}

```

It takes the dependency on your service messaging system and translates Marten's change information into the unified event with information about the change. Of course, it's a simplified version, you should align it with your requirements and the tool you use, but the pattern will stay the same.

We can register it by extending our Marten configuration.

```csharp
services.AddMarten(options =>
{
    options.Projections.Add<ProjectInfoProjection>(ProjectionLifecycle.Async);

    // register listener
    options.Projections.AsyncListeners.Add(
        new AsyncDocumentChangesForwarder(messagingSystemStub)
     );

    // define retry policy
    options.Projections.OnException<Exception>()
        .RetryLater(50.Milliseconds(), 250.Milliseconds(), 500.Milliseconds())
        .Then.Pause(10.Seconds());
});
```

We can register multiple async listeners. 

Besides the listener, I also defined a custom exception policy to show that Marten supports more advanced error handling, failover scenarios like dead letter queue etc. (read more in [docs](https://martendb.io/events/projections/async-daemon.html#error-handling)). 

**That's essential for our scenario. If storing documents fails, but changes forwarding to messaging system will fail, then none of the changes will be stored, and processing will be retried.**

Thanks to that, we have a proper implementation of [outbox pattern](/pl/outbox_inbox_patterns_and_delivery_guarantees_explained/) and at least one delivery guarantee. We also have decoupled processing between updating read models and publishing messages.

And that's pretty cool, isn't it?

Cheers! 

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
