---
title: How to get the current entity state from events?
category: "Event Sourcing"
cover: 2021-06-30-cover.png
author: oskar dudycz
---

![cover](2021-06-30-cover.png)

Today I'd like to go back a bit to the basics of Event Sourcing. I recently realised that I often cover more advanced topics. So sometimes, it's handy to take a step back and polish the basics.

In Event Sourcing, the application state is stored in events. They are the results of the business operations. When we add an event, it is placed at the end of an immutable structure called append-only log (read more in my post ["What if I told you that Relational Databases are in fact Event Stores?"](/pl/relational_databases_are_event_stores/)). Events are the source of truth. Hence the name. This has many advantages, such as:
* history of changes in our system,
* easier diagnostics,
* closeness to business, as our code structures correspond to business facts.

Many people believe that Snapshots are the must-have in the Event-Sourced system. Instead of retrieving all stream events to rebuild the state, we could retrieve one record and use it for our business logic. It sounds promising and can be useful as the technical optimisation technique but should not be used as a ground basis. Isn't loading more than one event a performance issue? Frankly, it's not. Downloading even a dozen, or several dozens of small events is not a significant overhead. Events are concise, containing only the information needed. Event Stores are optimised for such operations, and the reads scale well (read more in my article ["Snapshots in Event Sourcing"](https://www.eventstore.com/blog/snapshots-in-event-sourcing)).

Using Event Sourcing does not have to cause an automatic revolution in our code. We can still use aggregates/entities. In Event Sourcing, events are logically grouped linked into streams. Streams are ordered sequences of events. One stream includes all events for a given business object, e.g. _InvoiceInitiated_, _InvoiceIssued_, _InvoiceSent_.

Thus recommended approach is to build the current state from events. To do so, we need to perform the following steps:
1. Get all events for a given stream. We choose them based on the stream identifier (derived from the business object/record id). An event store retains the events for a given stream in the order they were appended; retrieval should preserve the order.
2. Create a default, empty entity (e.g. using the default constructor).
3. Apply each event sequentially to the entity.

The first two points are obvious, but what does it mean to _apply an event_? There are two ways:
* Use the _When_ function. We're passing a generic event object as an input parameter. Inside the method, we can use _"pattern matching" _ to determine what logic applies to the specific event type. It is a framework-independent solution. You have to write a bit more yourself, but there is less magic. 
* Some frameworks provide convention-based solutions that simplify handling and make it a bit more magical. For example, in [Marten](https://martendb.io/), the aggregate class should have an _Apply_ method for every event it can handle. This is because the built-in [AggregateStream](https://martendb.io/documentation/events/projections/) method is reading events and applying them internally. 

The process of rebuilding the state from events is also called _Stream Aggregation_.

Let's focus for now on the general approach to understand the flow properly. In C#, it might look like that:

```csharp
public record Person(
    string Name,
    string Address
);

public record InvoiceInitiated(
    double Amount,
    string Number,
    Person IssuedTo,
    DateTime InitiatedAt
);

public record InvoiceIssued(
    string IssuedBy,
    DateTime IssuedAt
);

public enum InvoiceSendMethod
{
    Email,
    Post
}

public record InvoiceSent(
    InvoiceSendMethod SentVia,
    DateTime SentAt
);

public enum InvoiceStatus
{
    Initiated = 1,
    Issued = 2,
    Sent = 3
}

public class Invoice
{
    public string Id { get;set; }
    public double Amount { get; private set; }
    public string Number { get; private set; }

    public InvoiceStatus Status { get; private set; }

    public Person IssuedTo { get; private set; }
    public DateTime InitiatedAt { get; private set; }

    public string IssuedBy { get; private set; }
    public DateTime IssuedAt { get; private set; }

    public InvoiceSendMethod SentVia { get; private set; }
    public DateTime SentAt { get; private set; }

    public void When(object @event)
    {
        switch (@event)
        {
            case InvoiceInitiated invoiceInitiated:
                Apply(invoiceInitiated);
                break;
            case InvoiceIssued invoiceIssued:
                Apply(invoiceIssued);
                break;
            case InvoiceSent invoiceSent:
                Apply(invoiceSent);
                break;
        }
    }

    private void Apply(InvoiceInitiated @event)
    {
        Id = @event.Number;
        Amount = @event.Amount;
        Number = @event.Number;
        IssuedTo = @event.IssuedTo;
        InitiatedAt = @event.InitiatedAt;
        Status = InvoiceStatus.Initiated;
    }

    private void Apply(InvoiceIssued @event)
    {
        IssuedBy = @event.IssuedBy;
        IssuedAt = @event.IssuedAt;
        Status = InvoiceStatus.Issued;
    }

    private void Apply(InvoiceSent @event)
    {
        SentVia = @event.SentVia;
        SentAt = @event.SentAt;
        Status = InvoiceStatus.Sent;
    }
}
```

The usage as follows:

```csharp
var invoiceInitiated = new InvoiceInitiated(
    34.12,
    "INV/2021/11/01",
    new Person("Oscar the Grouch", "123 Sesame Street"),
    DateTime.UtcNow
);
var invoiceIssued = new InvoiceIssued(
    "Cookie Monster",
    DateTime.UtcNow
);
var invoiceSent = new InvoiceSent(
    InvoiceSendMethod.Email,
    DateTime.UtcNow
);

// 1,2. Get all events and sort them in the order of appearance
var events = new object[] {invoiceInitiated, invoiceIssued, invoiceSent};

// 3. Construct empty Invoice object
var invoice = new Invoice();

// 4. Apply each event on the entity.
foreach (var @event in events)
{
    invoice.When(@event);
}
```

If you prefer, you can add the base class with an abstract _When_ method to write the more generalised logic.

```csharp
public abstract class Aggregate<T>
{
    public T Id { get; protected set; }
        
    public abstract void When(object @event);
}
```

Having that, we could write such a method for [EventStoreDB](https://developers.eventstore.com/) to retrieve the aggregate state from events:

```csharp
public async Task<TAggregate?> Find<TAggregate>(Guid id, CancellationToken cancellationToken)
    where TAggregate: Aggregate, new ()
{
    var readResult = eventStore.ReadStreamAsync(
        Direction.Forwards,
        $"{typeof(T).Name}-{id}",
        StreamPosition.Start,
        cancellationToken: cancellationToken
    );

    var aggregate = new TAggregate();

    await foreach (var @event in readResult)
    {
        var eventData = Deserialize(@event);

        aggregate.When(eventData!);
    }

    return aggregate;
}
```

In [Marten](https://martendb.io/) this will look as:

```csharp
public Task<TAggregate?> Find<TAggregate>(Guid id, CancellationToken cancellationToken)
    where TAggregate: Aggregate, new ()
{
    return _session.Events.AggregateStreamAsync<TAggregate>(end.TripId);
}
```

Of course, this is a highly imperative approach. However, if we prefer a functional approach, we could use a pattern I described in my article [Why Partial<Type> is an extremely useful TypeScript feature?](/pl/partial_typescript/).

In functional programming, we don't need base classes. We don't need aggregates. Instead, we're splitting the behaviour (functions) from the state (entity).

In TypeScript, having event and entity defined as: 

```typescript
export type Event<
  EventType extends string = string,
  EventData extends Record<string, unknown> = Record<string, unknown>,
  EventMetadata extends Record<string, unknown> = Record<string, unknown>
> = Readonly<{
  type: Readonly<EventType>;
  data: Readonly<EventData>;
  metadata?: Readonly<EventMetadata>;
}>;

type Person = Readonly<{
  name: string;
  address: string;
}>

type InvoiceInitiated = Event<
  'invoice-initiated',
  {
    number: string;
    amount: number;
    issuedTo: Person;
    initiatedAt: Date;
  }
>;

type InvoiceIssued = Event<
  'invoice-issued',
  {
    number: string;
    issuedBy: string;
    issuedAt: Date;
  }
>;

type InvoiceSent = Event<
  'invoice-sent',
  {
    number: string;
    sentVia: InvoiceSendMethod;
    sentAt: Date;
  }
>;

type InvoiceEvent =
  | InvoiceInitiated 
  | InvoiceIssued 
  | InvoiceSent;

type Invoice = Readonly<{
  number: string;
  amount: number;
  status: InvoiceStatus;

  issuedTo: Person;
  initiatedAt: Date;

  issued?: Readonly<{
    by?: string;
    at?: Date;
  }>;

  sent?: Readonly<{
    via?: InvoiceSendMethod;
    at?: Date;
  }>;
}>;
```

We can define the _When_ method as:

```typescript
function when(
  currentState: Partial<CashRegister>,
  event: CashRegisterEvent
): Partial<CashRegister> {
  switch (event.type) {
    case 'invoice-initiated':
      return {
        number: event.data.number,
        amount: event.data.amount,
        status: InvoiceStatus.INITIATED,
        issuedTo: event.data.issuedTo,
        initiatedAt: event.data.initiatedAt,
      };
    case 'invoice-issued': {
      return {
        ...currentState,
        status: InvoiceStatus.ISSUED,
        issued: {
          by: event.data.issuedBy,
          at: event.data.issuedAt,
        },
      };
    }
    case 'invoice-sent': {
      return {
        ...currentState,
        status: InvoiceStatus.SENT,
        sent: {
          via: event.data.sentVia,
          at: event.data.sentAt,
        },
      };
    }
    default:
      return {
        ...currentState,
      }
  }
}
```

Using the _reduce_ method and _Partial type_ described in the previous article, we can define the generic stream aggregation method as:

```typescript
export function aggregateStream<Aggregate, StreamEvents extends Event>(
  events: StreamEvents[],
  when: (
    currentState: Partial<Aggregate>,
    event: StreamEvents
  ) => Partial<Aggregate>,
  check?: (state: Partial<Aggregate>) => state is Aggregate
): Aggregate {
  const state = events.reduce<Partial<Aggregate>>(when, {});

  if (!check) {
    console.warn('No type check method was provided in the aggregate method');
    return <Aggregate>state;
  }

  if (!check(state)) throw 'Aggregate state is not valid';

  return state;
}
```

Then we could use it as follows to read events and rebuild the current state:

```typescript
const resolvedEvents = await eventStore.readStream(`invoice-${invoiceId}`);

const events = resolvedEvents
  .map((resolvedEvent) => {
    return <InvoiceEvent>{
      type: resolvedEvent.event!.type,
      data: resolvedEvent.event!.data,
      metadata: resolvedEvent.event?.metadata,
    };
  })

const invoice = aggregateStream<Invoice, InvoiceEvent>(
    events,
    when,
    isInvoice
  );
```

Both approaches have pros and cons. Object-oriented way brings more ceremony. However, it has an advantage against the functional approach, keeping object state and behaviour grouped together.

Stream Aggregation is a simple but powerful pattern. It allows easy debugging, writing unit tests and better control over what is happening. It's also the basis for doing the essence of Event Sourcing, so treating events as the source of truth.

Check detailed samples in my repositories:
- https://github.com/oskardudycz/EventSourcing.NetCore
- https://github.com/oskardudycz/EventSourcing.NodeJS

Cheers!

Oskar