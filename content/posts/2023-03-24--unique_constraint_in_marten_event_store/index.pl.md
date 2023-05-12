---
title: Ensuring uniqueness in Marten event store
category: "Event Sourcing"
cover: 2023-03-24-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2023-03-24-cover.png)

**Unique constraint validation is one of those things that looks simple but is not always easy**. [I explained already that, in Event Sourcing, it may be challenging](/en/uniqueness-in-event-sourcing/).

In [Marten](https://martendb.io/), we're trying to show the pragmatic face of Event Sourcing and embrace that whether something is best practice or anti-pattern depends on the context. We also understand that things can often get rougher, and you may get into a situation where you need to take a tradeoff and work on the proper design as the next step. **The trick I will present in this article is precisely in this category.**

**Let's say that we'd like to enforce the uniqueness of the user email.** In theory, you could query a read model keeping all users' data and check if the user with the selected email already exists. Easy peasy? It sounds like it, but it's not. Such an approach will give you a false guarantee. In the meantime, between you got the result, ran your business logic and stored new user information, someone could have added a user with the same email. Querying is never reliable, [we should tell, not ask](/pl/tell_dont_ask_how_to_keep_an_eye_on_boiling_milk/). So, in this case, claim the user email end either succeed or fail.

**If we had a relational database, we could set a unique constraint and call it a day.** And hey, in Marten, that's what we have under the cover: rock-solid Postgres.

Marten stores all events on the same table. Each event is a separate row, and data is placed in the JSONB column. [Postgres allows indexing of JSON data](https://www.postgresql.org/docs/current/datatype-json.html#JSON-INDEXING). Such indexes are performant but insufficient to index the whole events table. Yet, there's another way!

**Marten allows running inline projections. They run in the same transaction as appending events.** [Marten has a built-in unit of work](https://martendb.io/documents/sessions.html#unit-of-work-mechanics). Pending changes are wrapped in database transactions and stored together when we call _SaveChanges_. When we append a new event, Marten looks for all registered inline transactions that can handle this event type. For each of them, it runs the apply logic. Projection results are stored in a separate table for the specific document type as [Marten document](https://martendb.io/documents/). (Read more in [Event-driven projections in Marten explained](/pl/projections_in_marten_explained/)).

**We can use the read model and define a unique constraint on it.** If the read model is updated in the same transaction as the event append, the event won't be appended when the unique constraint fails.

Let's say that we have the following events:

```csharp
public record UserCreated(
    Guid UserId,
    string Email
);

public record UserEmailUpdated(
    Guid UserId,
    string Email
);

public record UserDeleted(
    Guid UserId
);
```

Of course, typically, we'll have more event types; I provided only those related to setting, updating or removing user email.

**We could define the following read model with projection:**

```csharp
public record UserNameGuard(
    Guid Id,
    string Email
);

public class UserNameGuardProjection: 
    SingleStreamProjection<UserNameGuard>
{
    public UserNameGuardProjection() =>
        DeleteEvent<UserDeleted>();

    public UserNameGuard Create(UserCreated @event) =>
        new (@event.UserId, @event.Email);

    public UserNameGuard Apply(UserEmailUpdated @event, UserNameGuard guard) =>
        guard with { Email = @event.Email };
}
```

Now, if we register this projection we can also define the unique constraint in _DocumentStore_ registration:

```csharp
var store = DocumentStore.For(options =>
{
    // (...)
    options.Projections.Add<UserNameGuardProjection>(ProjectionLifecycle.Inline);

    options.Schema.For<UserNameGuard>().UniqueIndex(guard => guard.Email);
});
```

[Unique Index provides more customisation](https://martendb.io/documents/indexing/unique.html). Let's take an example of cinema ticket reservations. We could define a condition to ensure we have only a single **active** reservation for the specific seat.

```csharp
var store = DocumentStore.For(options =>
{
    // (...)
    options.Schema.For<Reservation>().Index(x => x.SeatId, x =>
    {
        x.IsUnique = true;

        // Partial index by supplying a condition
        x.Predicate = "(data ->> 'Status') != 'Cancelled'";
    });
}
```

**That's neat, isn't it?** Check also [full sample](https://github.com/oskardudycz/EventSourcing.NetCore/blob/main/Marten.Integration.Tests/EventStore/UniqueConstraint/UniqueContstraintTests.cs).

**Of course, with great power comes great responsibility.** From my experience, a unique constraint requirement is usually a sign that our [business people bring us a solution instead of the problem](/pl/bring_me_problems_not_solutions/). We should ensure that what we're trying to provide here is a real requirement and [ask enough whys](https://en.wikipedia.org/wiki/Five_whys) before we commit to it. 

Still, sometimes we need to select the hill we'd like today for, or just need to do our stuff. This recipe should be treated as a tradeoff, but it should take you pretty far if used cautiously. 

Cheers!

Oskar

p.s. If you liked this article, also check [a simple trick for idempotency handling in the Elastic Search read model](/pl/simple_trick_for_idempotency_handling_in_elastic_search_readm_model/).

p.s.2. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).