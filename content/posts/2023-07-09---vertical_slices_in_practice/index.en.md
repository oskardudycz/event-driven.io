---
title: Vertical Slices in practice
category: "Architecture"
cover: 2023-07-09-cover.png
author: oskar dudycz
---

![cover](2023-07-09-cover.png)

**I'm a preacher for the [CQRS](/en/cqrs_facts_and_myths_explained/), Vertical Slices, and Feature Folders.** I won't hide that, and I won't even try. I believe that structuring code based on the business feature helps deliver business value, thanks to an increased focus on the domain and reduced cognitive load.

I explained already in my articles why [Generic does not mean Simple](/en/generic_does_not_mean_simple/) and [how to slice the codebase effectively](/en/how_to_slice_the_codebase_effectively/). I showed that in my talk:

`youtube: https://www.youtube.com/watch?v=iY7LO289qnQ`

**Today, I'll take a step further and give more practical guidance on simple but closer to the real-world case**. The focus will be on the structural part, but I'll add a sprinkle of Event Sourcing and use [Marten](https://martendb.io/) to make it more real.

**Let's say we'd like to implement a Room Reservation module in the Hotel Management system.** Reservation can be initiated either from the user through our UI and API call or from an external system like Booking.com. Our flow, for now, looks almost the same, and we don't want to overcomplicate things.

We could define the following events representing a business flow of the Reservation:

```csharp
public record RoomReserved
(
    string ReservationId,
    string? ExternalReservationId,
    RoomType RoomType,
    DateOnly From,
    DateOnly To,
    string GuestId,
    int NumberOfPeople,
    ReservationSource Source,
    DateTimeOffset MadeAt
);

public record RoomReservationConfirmed
(
    string ReservationId,
    DateTimeOffset ConfirmedAt
);

public record RoomReservationCancelled
(
    string ReservationId,
    DateTimeOffset CancelledAt
);

public enum RoomType
{
    Single = 1,
    Twin = 2,
    King = 3
}

public enum ReservationSource
{
    Api,
    External
}

public enum ReservationStatus
{
    Pending,
    Confirmed,
    Cancelled
}
```

**As you see, when reserving a room in the hotel, you're not booking the specific room but the room type.** That has intriguing consequences that we'll discuss later on.

To make our decisions, we need a Room Reservation entity representing the current state of our reservation process. It could look like that.

```csharp
public record RoomReservation
(
    string Id,
    RoomType RoomType,
    DateOnly From,
    DateOnly To,
    string GuestId,
    int NumberOfPeople,
    ReservationSource Source,
    ReservationStatus Status,
    DateTimeOffset MadeAt,
    DateTimeOffset? ConfirmedAt,
    DateTimeOffset? CancelledAt
)
{
    public static RoomReservation Create(RoomReserved reserved) =>
        new(
            reserved.ReservationId,
            reserved.RoomType,
            reserved.From,
            reserved.To,
            reserved.GuestId,
            reserved.NumberOfPeople,
            reserved.Source,
            reserved.Source == ReservationSource.External ? ReservationStatus.Confirmed : ReservationStatus.Pending,
            reserved.MadeAt,
            reserved.Source == ReservationSource.External ? reserved.MadeAt : null,
            null
        );

    public RoomReservation Apply(RoomReservationConfirmed confirmed) =>
        this with
        {
            Status = ReservationStatus.Confirmed,
            ConfirmedAt = confirmed.ConfirmedAt
        };

    public RoomReservation Apply(RoomReservationCancelled confirmed) =>
        this with
        {
            Status = ReservationStatus.Cancelled,
            ConfirmedAt = confirmed.CancelledAt
        };

}
```

In the _RoomReserved_ event apply method, we already see that external reservation has a different flow than the API one. We assume that it's already confirmed and paid once we get it. That's different from our regular reservation. It'll need to go through an additional flow and be explicitly confirmed after making payment etc.

We could define [union types](/en/union_types_in_csharp/) and different events for internal and external reservations, but let's focus today on the structure rather than the [modelling](/en/how_to_effectively_compose_your_business_logic/). 

**As we have more stuff around the room reservation process, let's create a dedicated folder _RoomReservations_.** Inside it, we can define the _RoomReservation.cs_ file and put the code we described above. It shapes our domain model. We'll be working around it when defining our process. When we add a new event, we must update the entity, etc. It also forms documentation of our flow.

**Let's now implement the business logic for our room reservation**. Let's create a nested folder called _ReservingRoom_. It'll encapsulate the reservation initiation process. We'll also need a command and its handler. Let's define the _ReserveRoom.cs_ file inside the newly created folder.

We'll keep there both command definition and business logic for the operation. In most cases, when we're changing command, we need to change logic. And when we change logic, we'd like to see the command definition. It's about [ergonomy and developer experience](/en/stacking_the_bricks/).

It could look like that:

```csharp
public record ReserveRoom
(
    string ReservationId,
    RoomType RoomType,
    DateOnly From,
    DateOnly To,
    string GuestId,
    int NumberOfPeople,
    DateTimeOffset Now,
    ReservationSource ReservationSource,
    IReadOnlyList<DailyRoomTypeAvailability> DailyAvailability,
    string? ExternalId
)
{
    public static RoomReserved Handle(ReserveRoom command)
    {
        var reservationSource = command.ReservationSource;

        var dailyAvailability = command.DailyAvailability;

        if (reservationSource == ReservationSource.Api && dailyAvailability.Any(a => a.AvailableRooms < 1))
            throw new InvalidOperationException("Not enough available rooms!");

        return new RoomReserved(
            command.ReservationId,
            command.ExternalId,
            command.RoomType,
            command.From,
            command.To,
            command.GuestId,
            command.NumberOfPeople,
            command.ReservationSource,
            command.Now
        );
    }

    public static ReserveRoom FromApi(
        string id,
        RoomType roomType,
        DateOnly from,
        DateOnly to,
        string guestId,
        int numberOfPeople,
        DateTimeOffset now,
        IReadOnlyList<DailyRoomTypeAvailability> dailyAvailability
    ) =>
        new(
            id.AssertNotEmpty(),
            roomType.AssertNotEmpty(),
            from.AssertNotEmpty(),
            to.AssertNotEmpty().AssertGreaterOrEqualThan(from),
            guestId.AssertNotEmpty(),
            numberOfPeople.AssertNotEmpty(),
            now.AssertNotEmpty(),
            ReservationSource.Api,
            dailyAvailability,
            null
        );

    public static ReserveRoom FromExternal(
        string id,
        string externalId,
        RoomType roomType,
        DateOnly from,
        DateOnly to,
        string guestId,
        int numberOfPeople,
        DateTimeOffset now
    ) =>
        new(
            id.AssertNotEmpty(),
            roomType.AssertNotEmpty(),
            from.AssertNotEmpty(),
            to.AssertNotEmpty().AssertGreaterOrEqualThan(from),
            guestId.AssertNotEmpty(),
            numberOfPeople.AssertNotEmpty(),
            now.AssertNotEmpty(),
            ReservationSource.External,
            Array.Empty<DailyRoomTypeAvailability>(),
            externalId.AssertNotEmpty()
        );
}
```

It's a pretty straightforward code. A command is an [immutable record](/en/notes_about_csharp_records_and_nullable_reference_types/) we're handling in a function. The command is created and [explicitly validated](/en/explicit_validation_in_csharp_just_got_simpler/) as I'd like to trust my objects.

Handler has a basic logic checking for reserving a room based on the room type daily availability data. I could pass it as a handler param, but I prefer to put it into the command, which makes logic predictable. That makes it seamless to test, as I can validate if I'm getting an expected result for the specific input data: event or exception. I could use the [Result](/en/union_types_in_csharp/) type instead of throwing an exception, but that's a matter of personal preference.

I'm not doing availability validation, as it's already a fact that someone reserved a room in an external system. Throwing an exception won't change that fact. We need to embrace that and compensate for the overbooking (read more in [What texting your Ex has to do with Event-Driven Design?](/en/what_texting_ex_has_to_do_with_event_driven_design/)).

**Ok, but how to model different inputs of our process?** Where to put the application code for them? Best in the same folder as the business logic but in separate files. Let's add two of them to _RoomReservations.ReservingRoom_ folder: 
- _ReserveRoomEndpoint.cs_ - containing the API endpoint definition,
- _BookingComRoomReservationMadeHandler.cs_ - with the event handler for the Booking.com event.

**Both will trigger the same workflow but with different inputs and application logic.**

Let's start with the API endpoint. Using .NET Minimal API it could look as follows:

```csharp
internal static class ReserveRoomEndpoint
{
    internal static IEndpointRouteBuilder UseReserveRoomEndpoint(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("api/reservations/", async (
            [FromServices] IDocumentSession session,
            ReserveRoomRequest request,
            CancellationToken ct
        ) =>
        {
            var (roomType, from, to, guestId, numberOfPeople) = request;
            var reservationId = CombGuidIdGeneration.NewGuid().ToString();

            var dailyAvailability = await session.GetRoomTypeAvailabilityForPeriod(Of(roomType, from, to), ct);

            var command = ReserveRoom.FromApi(
                reservationId, roomType, from, to, guestId, numberOfPeople,
                DateTimeOffset.Now, dailyAvailability
            );

            session.Events.StartStream<RoomReservation>(reservationId, ReserveRoom.Handle(command));

            return Created($"/api/reservations/{reservationId}", reservationId);
        });

        return endpoints;
    }
}

public record ReserveRoomRequest(
    RoomType RoomType,
    DateOnly From,
    DateOnly To,
    string GuestId,
    int NumberOfPeople
);
```

It:
- does mapping from the API request into a command using _ReserveRoom.FromApi_, 
- generates reservation id, 
- retrieves availability information 
- calls business logic and stores the result room reserved event in the Marten event store if it succeeds. If not, it returns an error status.

**How event handler will look like?** There, you have it:

```csharp
public record BookingComRoomReservationMade
(
    string ReservationId,
    string RoomType,
    DateOnly Start,
    DateOnly End,
    string GuestProfileId,
    int GuestsCounts,
    DateTimeOffset MadeAt
);

public class BookingComRoomReservationMadeHandler: IEventHandler<BookingComRoomReservationMade>
{
    private readonly IDocumentSession session;

    public BookingComRoomReservationMadeHandler(IDocumentSession session) =>
        this.session = session;

    public async Task Handle(BookingComRoomReservationMade @event, CancellationToken ct)
    {
        var (bookingComReservationId, roomTypeText, from, to, bookingComGuestId, numberOfPeople, madeAt) = @event;
        var reservationId = CombGuidIdGeneration.NewGuid().ToString();

        var guestId = await Query(new GetGuestIdByExternalId(FromPrefix("BCOM", bookingComGuestId)), ct);
        var roomType = Enum.Parse<RoomType>(roomTypeText);

        var command = ReserveRoom.FromExternal(
            reservationId, bookingComReservationId, roomType, from, to, guestId.Value, numberOfPeople, madeAt
        );

        session.Events.StartStream<RoomReservation>(reservationId, ReserveRoom.Handle(command));

        await session.SaveChangesAsync(ct);
    }
}
```

**It's similar to the previous one but differs in the application logic.** We're not loading availability information, as we won't validate it for external reservations. We're also calling mapping to get (and potentially create) guest id based on the Booking.com identifier. We're also doing other mappings to show that we may use those handlers as [Anti-Corruption Layer](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer).

**That creates a basic structure for our process:**

```
📁 ReservationModule
    📁 RoomReservations
        📁 ReservingRoom
            📄 BookingComRoomReservationMadeHandler.cs
            📄 ReserveRoom.cs
            📄 ReserveRoomEndpoint.cs
        📄 Reservation.cs
```

**What to do with dependencies for handling room type availability, overbooking and guest id mapping?** To get an answer for your case, you should ask your business and investigate the relations between processes. Still, for this example, we need to assume something. Here's what I propose.

Room type availability and overbooking will be only used during the reservation process and calculated based on the information from it, so let's keep it as part of it.

Guest id mapping will obviously need to be a different module, as it will have other flows around it.

**As I mentioned, we'd like to keep things simple and don't overengineer. Yet, we'd like to have the option to evolve and, e.g. in future, elevate our subprocesses into autonomous modules.**

**Let's start by defining _GettingRoomTypeAvailability_ as a subfolder of _RoomReservations.ReservingRoom_ and adding there _DailyRoomTypeAvailability.cs_.** It'll contain information about room type availability. It'll be a read model built from the reservation events. Using [Marten projections](/en/projections_in_marten_explained/) it could look as follows:

```csharp
public record DailyRoomTypeAvailability
(
    string Id,
    DateOnly Date,
    RoomType RoomType,
    int ReservedRooms,
    int Capacity,
    int AllowedOverbooking
)
{
    public int CapacityWithOverbooking => Capacity + AllowedOverbooking;

    public int AvailableRooms => CapacityWithOverbooking - ReservedRooms;

    public int Overbooked => ReservedRooms - Capacity;
    
    public int OverbookedOverTheLimit => ReservedRooms - CapacityWithOverbooking;
}

public class DailyRoomTypeAvailabilityProjection: MultiStreamProjection<DailyRoomTypeAvailability, string>
{
    public DailyRoomTypeAvailabilityProjection() =>
        Identities<RoomReserved>(e =>
            Enumerable.Range(0, e.To.DayNumber - e.From.DayNumber)
                .Select(offset => $"{e.RoomType}_{e.To.AddDays(offset)}")
                .ToList()
        );

    public DailyRoomTypeAvailability Apply(DailyRoomTypeAvailability availability, RoomReserved reserved) =>
        availability with { ReservedRooms = availability.ReservedRooms + 1 };
}
```

The only complex part is taking the room type and date range from the _RoomReserved_ event and matching that with the read model rows. We can do that by defining the id format as _$"{RoomType}\_{Date}"_.

**Now, let's define the query for room type availability within the particular period:**

```csharp
public record GetRoomTypeAvailabilityForPeriod(
    RoomType RoomType,
    DateOnly From,
    DateOnly To
)
{
    public static GetRoomTypeAvailabilityForPeriod Of(
        RoomType roomType,
        DateOnly from,
        DateOnly to
    ) =>
        new(
            roomType.AssertNotEmpty(),
            from.AssertNotEmpty(),
            to.AssertNotEmpty().AssertGreaterOrEqualThan(from)
        );
}

public static class GetRoomTypeAvailabilityForPeriodHandler
{
    public static Task<IReadOnlyList<DailyRoomTypeAvailability>> GetRoomTypeAvailabilityForPeriod(
        this IQuerySession session,
        GetRoomTypeAvailabilityForPeriod query,
        CancellationToken ct
    ) =>
        session.Query<DailyRoomTypeAvailability>()
            .Where(day => day.RoomType == query.RoomType && day.Date >= query.From && day.Date <= query.To)
            .ToListAsync(token: ct);
}
```

Nothing special here besides the fact that we don't use any query bus, marker interfaces etc. It's inside the module, so it is unnecessary to overcomplicate it.

[Marten gives the option to listen for changes in the read model](/en/publishing_read_model_changes_from_marten/). We can use it to detect if we have overbooking. That's, again, a shortcut to avoid reinventing the wheel if we're inside the same module.

Such usage also gives the possibility for on-point performance improvements. [Jeremy did a follow-up explaining how Marten's compiled queries could help in that](https://jeremydmiller.com/2023/07/12/compiled-queries-with-marten/).
**Let's create _OverbookingDetection_ subfolder inside _RoomReservations.ReservingRoom_ and put there a _DailyOverbookingDetector.cs_ file and put there logic for detecting overbooking:**

```csharp
public record DailyOverbookingDetected
(
    RoomType RoomType,
    DateOnly Date,
    int OverBookedCount,
    int OverBookedOverTheLimitCount
);

public class DailyOverbookingDetector: IChangeListener
{
    private readonly IEventBus eventBus;

    public DailyOverbookingDetector(IEventBus eventBus) =>
        this.eventBus = eventBus;

    public async Task AfterCommitAsync(IDocumentSession session, IChangeSet commit, CancellationToken token)
    {
        var events = commit.Inserted.OfType<DailyRoomTypeAvailability>()
            .Union(commit.Updated.OfType<DailyRoomTypeAvailability>())
            .Where(availability => availability.Overbooked > 0)
            .Select(availability =>
                new DailyOverbookingDetected(
                    availability.RoomType,
                    availability.Date,
                    availability.Overbooked,
                    availability.OverbookedOverTheLimit
                )
            );

        foreach (var @event in events)
        {
            await eventBus.Publish(EventEnvelope.From(@event), token);
        }
    }
}
```

We're filtering the pending changes containing updated read models and getting overbooked ones. Based on them, we create and publish events to the event bus. 

**What to do with them it's, of course, a matter of our business requirements and tech stack.** We could trigger compensating business logic based on them, store them as events, or republish them to some messaging system and trigger workflows elsewhere.

**Last but not least, let's discuss the external module integration.** We could create a _Guests_ subfolder inside the root of our module and put there _Guest.cs_ with a basic interpretation of the data from an external system. For us, it'll be enough to keep it simple as:

```csharp
public record GuestExternalId(string Value)
{
    public static GuestExternalId FromPrefix(string prefix, string externalId) =>
        new($"{prefix.AssertNotEmpty()}/{externalId.AssertNotEmpty()}");
}

public record GuestId(string Value);
```

Then let's define the _GettingGuestByExternalId_ subfolder and put there the _GetGuestByExternalId.cs_ file.

```csharp
public record GetGuestIdByExternalId
(
    GuestExternalId ExternalId
)
{
    public static ValueTask<GuestId> Query(GetGuestIdByExternalId query, CancellationToken ct)
    {
        // Here, you'd probably call some external module
        // Or even orchestrate creation if it doesn't exist already
        // But I'm just doing dummy mapping
        return new ValueTask<GuestId>(new GuestId(query.ExternalId.Value));
    }
}
```

Of course, it's a dummy implementation, but again, it lets you keep things explicit and self-explanatory. We could either call it explicitly as we did in the Event Handler. 

```csharp
using static Reservations.Guests.GettingGuestByExternalId.GetGuestIdByExternalId;

public class BookingComRoomReservationMadeHandler: IEventHandler<BookingComRoomReservationMade>
{
    // (...)

    public async Task Handle(BookingComRoomReservationMade @event, CancellationToken ct)
    {
        var (bookingComReservationId, roomTypeText, from, to, bookingComGuestId, numberOfPeople, madeAt) = @event;

        var guestId = await Query(new GetGuestIdByExternalId(FromPrefix("BCOM", bookingComGuestId)), ct);
       
       // (...)
    }
}
```

That makes usage straightforward but also coupled. As we're running a potential code from another module, it may be worth adding abstraction. If we'd like to keep the boundaries explicit, to have e.g. better test isolation, we could inject query as a function:

```csharp
public delegate ValueTask<GuestId> GetGuestId(GetGuestIdByExternalId query, CancellationToken ct);

public class BookingComRoomReservationMadeHandler: IEventHandler<BookingComRoomReservationMade>
{
    private readonly IDocumentSession session;
    private readonly GetGuestId getGuestId;

    public BookingComRoomReservationMadeHandler(
        IDocumentSession session,
        GetGuestId getGuestId)
    {
        this.session = session;
        this.getGuestId = getGuestId;
    }

    public async Task Handle(BookingComRoomReservationMade @event, CancellationToken ct)
    {
        var (bookingComReservationId, roomTypeText, from, to, bookingComGuestId, numberOfPeople, madeAt) = @event;
        var reservationId = CombGuidIdGeneration.NewGuid().ToString();

        var guestId = await getGuestId(new GetGuestIdByExternalId(FromPrefix("BCOM", bookingComGuestId)), ct);
        // (...)
    }
}
```

We could also use the interface like:

```csharp
public interface IQuery<TQuery, out TResponse> where T: notnull
{
    ValueTask<TResponse> Query(TQuery query, CancellationToken ct);
}
```

And inject it, but I think it just adds more ceremony. Still, it's your call. The most important is to define our boundaries and draw them explicitly where needed to not end up with a big ball of mud.

The final code structure looks as follows:

```
📁 ReservationModule
    📁 Guests
        📁 GettingGuestByExternalId
            📄 GettingGuestByExternalId.cs
        📄 Guest.cs
    📁 RoomReservations
        📁 GettingRoomTypeAvailability
            📄 DailyRoomTypeAvailability.cs
            📄 GetRoomTypeAvailabilityForPeriod.cs
        📁 OverbookingDetection
            📄 DailyOverbookingDetector.cs
        📁 ReservingRoom
            📄 BookingComRoomReservationMadeHandler.cs
            📄 ReserveRoom.cs
            📄 ReserveRoomEndpoint.cs
        📄 Reservation.cs
```

See the full code in [my sample repo](https://github.com/oskardudycz/EventSourcing.NetCore/pull/217).

**Is it the best naming and folder structure you could achieve?** Maybe, but probably not. And that's fine. We should embrace that our initial design will be wrong. Knowing that we can focus on making our code easier to reshuffle, target [Removability over maintainability](/en/removability_over_maintainability/).

Having code sliced by business domain, straightforward and composed instead of generalised, allows us to reshuffle and correct our past decision. We can evolve and introduce more abstractions if we need them and when we need them.

I hope this article will bring you vertical slices closer to home. Still, I encourage you to play with it and see what you come up with. You can take this example as the starting point and try to improve it.

**In the end, it's all about having more options in our Designed Toolbox!**

Cheers!

Oskar

p.s. Read also more on how [A few words on communication](/en/a_few_words_on_communication/) and the [Bring me problems, not solutions!](/en/bring_me_problems_not_solutions/).

p.s.2. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
