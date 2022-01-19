---
title: Using strongly-typed identifiers with Marten
category: "Event Sourcing"
cover: 2022-01-19-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2022-01-19-cover.png)

Let's say that you have the following class definition:

```csharp
public class Reservation
{
    public string AggregateId { get; private set; };

    public string SeatId { get; private set; };
        
    public string CustomerId { get; private set; };

    private Reservation(
        string aggregateId,
        string seatId,
        string customerId
    )
    {
        AggregateId = aggregateId;
        SeatId = seatId;
        CustomerId = customerId;
    }
}
```

Now you can create instance using:

```csharp
var reservationId = "RES/01";
var seatId = "SEAT/22";
var customerId = "CUS/291";

var reservation = new ReservationId (
    reservationId,
    seatId,
    customerId 
);
```

So far, so good. What if we accidentally mixed the order of the parameters to, e.g.

```csharp
var reservation = new ReservationId (
    seatId,
    customerId,
    reservationId
);
```

Then either we have good unit tests or just created a bug. A nasty one. The compiler won't catch the difference because all types are the same. That would be different if we had different types for each id type, right? For instance:

```csharp
public class Reservation
{
    public ReservationId AggregateId { get; private set; };

    public SeatId SeatId { get; private set; };
        
    public CustomerId CustomerId { get; private set; };

    private Reservation(
        ReservationId aggregateId,
        SeatId seatId,
        CustomerId customerId
    )
    {
        AggregateId = aggregateId;
        SeatId = seatId;
        CustomerId = customerId;
    }
}
```

Then we could use it like that:

```csharp
var reservationId = new ReservationId ("RES/01");
var seatId = new SeatId ("SEAT/22");
var customerId = new CustomerId ("CUS/291");

var reservation = new ReservationId (
    reservationId,
    seatId,
    customerId 
);
```

Then compiler would help us to provide wrong values accidentally by switching the order of parameters, etc. This approach is especially popular in the Domain-Driven Design community with a connection to the Aggregate pattern. 

Shortly Aggregate is a "business transaction". It guarantees that all its data will be stored atomically, respecting the business rules and invariants. It's also grouping other tactical patterns, like exposing publicly only what's needed and setting data only through public methods. Yup, strongly typed values also matches that.

We could define a base class for strongly typed values, as:

```csharp
public class StronglyTypedValue<T>: IEquatable<StronglyTypedValue<T>> where T: IComparable<T>
{
    public T Value { get; }

    public StronglyTypedValue(T value)
    {
        Value = value;
    }

    public bool Equals(StronglyTypedValue<T>? other)
    {
        if (ReferenceEquals(null, other)) return false;
        if (ReferenceEquals(this, other)) return true;
        return EqualityComparer<T>.Default.Equals(Value, other.Value);
    }

    public override bool Equals(object? obj)
    {
        if (ReferenceEquals(null, obj)) return false;
        if (ReferenceEquals(this, obj)) return true;
        if (obj.GetType() != this.GetType()) return false;
        return Equals((StronglyTypedValue<T>)obj);
    }

    public override int GetHashCode()
    {
        return EqualityComparer<T>.Default.GetHashCode(Value);
    }

    public static bool operator ==(StronglyTypedValue<T>? left, StronglyTypedValue<T>? right)
    {
        return Equals(left, right);
    }

    public static bool operator !=(StronglyTypedValue<T>? left, StronglyTypedValue<T>? right)
    {
        return !Equals(left, right);
    }
}
```

It's a simple wrapper for the primitive type, with additional overloads for checking equality. We can define base classes for our needs as:

```csharp
public class ReservationId: StronglyTypedValue<Guid>
{
    public ReservationId(Guid value) : base(value)
    {
    }
}

public class CustomerId: StronglyTypedValue<Guid>
{
    public CustomerId(Guid value) : base(value)
    {
    }
}

public class SeatId: StronglyTypedValue<Guid>
{
    public SeatId(Guid value) : base(value)
    {
    }
}
```

This gives us the option to add additional validation. We could e.g. expand the check for the proper format, getting even more trust in our objects:

```csharp
public class ReservationNumber: StronglyTypedValue<string>
{
    public ReservationNumber(string value) : base(value)
    {
        if (string.IsNullOrEmpty(value) || value.StartsWith("RES/") || value.Length <= 4)
            throw new ArgumentOutOfRangeException(nameof(value));
    }
}
```

That's a useful pattern, and recently I've been asked multiple times how to use strongly typed ids with [Marten](https://martendb.io/). It appears that's non-trivial. Marten requires a few things to work correctly:
- Id has to be _string_ or _Guid_ (or _int_, _long_ if you're just using document part),
- public Id with getter and setter,
- default constructor (not necessarily public).

Let's start with defining the base class for our attribute:

```csharp{2,7,10}
public abstract class Aggregate<TKey, T>
    // 1
    where TKey: StronglyTypedValue<T>
    where T : IComparable<T>
{
    public TKey Id { get; set; } = default!;

    // 2
    [Identity]
    public T AggregateId
    {
        get => Id.Value;
        // 3
        set {} 
    }

    public int Version { get; protected set; }

    // 4
    [JsonIgnore] private readonly Queue<object> uncommittedEvents = new(); 

    public object[] DequeueUncommittedEvents()
    {
        var dequeuedEvents = uncommittedEvents.ToArray();

        uncommittedEvents.Clear();

        return dequeuedEvents;
    }

    protected void Enqueue(object @event)
    {
        uncommittedEvents.Enqueue(@event);
    }
}
```

I used a few tricks here:
1. Generic type params (especially _where TKey: StronglyTypedValue<T>_) will allow me to know that my Id is a composite key and access internal _Value_.
2. Thanks to [Identity attribute](https://martendb.io/documents/identity.html#document-identity), I could change the default name for the Marten identifier. It still has to be public, but at least it's hidden. If you prefer, you could use _DoNotTouchItPlease_ instead.
3. We still need to have a public setter, but at least it's not doing any redundant stuff. We'll be using the composite key for (de)serialisation. Ignoring this setter also has the benefit that it cuts some magic. If we had to define it, we'd also need a factory method to generate composite ids or overload in each class. This comes from the fact that C# only allows defining _new ()_ type constraint. Our strongly typed values are immutable and don't have a default constructor.
4. You can safely ignore _uncommitedEvents_, _DequeueUncommittedEvents_, and _Enqueue_ if you're not doing Event-Driven Architecture/Event Sourcing. This is a pattern to cache an event generated by the business logic and then append it to the event store and/or publish it to the queue.

The result Aggregate (with Event Sourcing flavour) would look like that:

```csharp
public class Reservation : Aggregate<ReservationId, Guid>
{
    public CustomerId CustomerId { get; private set; } = default!;

    public SeatId SeatId { get; private set; } = default!;

    public ReservationNumber Number { get; private set; } = default!;

    public ReservationStatus Status { get; private set; }

    public static Reservation CreateTentative(
        SeatId seatId,
        CustomerId customerId)
    {
        return new Reservation(
            new ReservationId(Guid.NewGuid()),
            seatId,
            customerId,
            new ReservationNumber(Guid.NewGuid().ToString())
        );
    }

    private Reservation(){} // to make Marten happy

    private Reservation(
        ReservationId id,
        SeatId seatId,
        CustomerId customerId,
        ReservationNumber reservationNumber
    )
    {
        var @event = new TentativeReservationCreated(
            id,
            seatId,
            customerId,
            reservationNumber
        );

        Enqueue(@event);
        Apply(@event);
    }


    public void ChangeSeat(SeatId newSeatId)
    {
        if(Status != ReservationStatus.Tentative)
            throw new InvalidOperationException($"Changing seat for the reservation in '{Status}' status is not allowed.");

        var @event = new ReservationSeatChanged(Id, newSeatId);

        Enqueue(@event);
        Apply(@event);
    }

    public void Confirm()
    {
        if(Status != ReservationStatus.Tentative)
            throw new InvalidOperationException($"Only tentative reservation can be confirmed (current status: {Status}.");

        var @event = new ReservationConfirmed(Id);

        Enqueue(@event);
        Apply(@event);
    }

    public void Cancel()
    {
        if(Status != ReservationStatus.Tentative)
            throw new InvalidOperationException($"Only tentative reservation can be cancelled (current status: {Status}).");

        var @event = new ReservationCancelled(Id);

        Enqueue(@event);
        Apply(@event);
    }

    public void Apply(TentativeReservationCreated @event)
    {
        Id = @event.ReservationId;
        SeatId = @event.SeatId;
        CustomerId = @event.CustomerId;
        Number = @event.Number;
        Status = ReservationStatus.Tentative;
        Version++;
    }

    public void Apply(ReservationSeatChanged @event)
    {
        SeatId = @event.SeatId;
        Version++;
    }

    public void Apply(ReservationConfirmed @event)
    {
        Status = ReservationStatus.Confirmed;
        Version++;
    }

    public void Apply(ReservationCancelled @event)
    {
        Status = ReservationStatus.Cancelled;
        Version++;
    }
}
```

That's almost all. We just need to tell Marten that we'd like to use non-public setters and non-public non-default constructors. We do it by [setting the serialisation options](https://martendb.io/configuration/json.html#non-public-members-storage):

```csharp
options.UseDefaultSerialization(nonPublicMembersStorage: NonPublicMembersStorage.All);
```

_Et voilà!_ This should be enough to make both event store and document part working (so [stream aggregation](https://martendb.io/events/projections/live-aggregates.html) and [inline projections](https://martendb.io/events/projections/inline.html)). The last caveat is that if you're querying by the composite value, you need to explicitly use it, as then Marten won't generate a proper query, and Postgres won't understand the custom type. See:

```csharp
var reservation = Session.Query<Reservation>()
    .SingleOrDefault(r => r.ReservationNumber.Value == "RES/293");
```

I'll let you decide if that's the approach you'd like to go. It's mostly a matter of your preferences. A few tricks/hacks are needed, but an improved type check at compilation time can give you enough benefits to accept this trade-off.

Cheers!

Oskar

p.s. see the full sample in my repo: https://github.com/oskardudycz/EventSourcing.NetCore/pull/94.