---
title: Projecting Marten events to Elasticsearch
category: "Event Sourcing"
cover: 2023-03-18-cover.png
author: oskar dudycz
---

![cover](2023-03-18-cover.png)

**[I told you already](/en/projections_and_read_models_in_event_driven_architecture/) that Projections are an Event Sourcing killer feature, and today I'd like to repeat that.** 

In [Marten](https://martendb.io/), we embraced that and [provide various ways of handling projections](/en/projections_in_marten_explained/). We hugely benefit from Postgres shapeshifter capabilities. It's a highly versatile database. Even though relational usage is its primary use case, it can quickly become an [event store](https://martendb.io/events/), [document](https://martendb.io/documents/), [graph](https://age.apache.org/), or [time series](https://www.timescale.com/) database. 

**Projecting straight into Postgres gives you enough power for most common cases. Yet, sometimes you need to do more.** Nowadays, we can get razor-focused solutions for our scenarios with emerging types of various [key/value databases](/en/key-value-stores/). Marten also allows you to get benefits and integrate with them.

I explained already [how to integrate Marten with another tooling](/en/integrating_Marten/). **Today, I'll show you how to build in practice external projection, using Elasticsearch as an example.**

Here are our assumptions:
- even though [Postgres has full-text search capabilities](https://martendb.io/documents/full-text.html), we'd like to use Elasticsearch as it's a database natively built for such needs.
- as Elasticsearch has eventual consistency, plus we don't want to fall into  [Two Phase Commit](https://martinfowler.com/articles/patterns-of-distributed-systems/two-phase-commit.html) issue, we'll use asynchronous processing.
- we'd like not to introduce additional messaging tooling to need to apply events stored in Marten.
- we won't expect massive traffic, so assume that [Marten's built-in asynchronous projections handling](https://martendb.io/events/projections/async-daemon.html) will be able to keep the pace.
- Marten will guarantee sequential order of event processing and that all events will be delivered.

**OK, enough talking. Talk is cheap. Let me show you some code!** To build Marten's custom projection, we must implement _IProjection_. We'll define a base class to reuse later in defining the specific projection.

```csharp
public abstract class ElasticsearchProjection: IProjection
{
    public void Apply(IDocumentOperations operations, IReadOnlyList<StreamAction> streams) =>
        throw new NotImplementedException("We don't want to do 2PC, aye?");

    public async Task ApplyAsync(
        IDocumentOperations operations,
        IReadOnlyList<StreamAction> streamActions,
        CancellationToken cancellation
    )
    {
        // TODO: We'll get to that!
    }

    public ElasticsearchClient ElasticsearchClient { private get; init; } = default!;

    protected abstract string IndexName { get; }

   protected virtual Task SetupMapping(ElasticsearchClient client) =>
        client.Indices.CreateAsync(IndexName);

    private readonly HashSet<Type> handledEventTypes = new();

    protected void Projects<TEvent>() =>
        handledEventTypes.Add(typeof(TEvent));
}
```

**Implementing the _IProjection_ interface forces us to implement two Apply methods, one for .NET asynchronous processing and the other for synchronous.** We don't expect our projection to be run inline (in the same transaction as the event append), so we can skip synchronous variant implementation.

We can also express that in registration helper:

```csharp
public static class ElasticsearchProjectionConfig
{
    public static void Add<TElasticsearchProjection>(
        this ProjectionOptions projectionOptions,
        ElasticsearchClient client
    ) where TElasticsearchProjection : ElasticsearchProjection, new() =>
        projectionOptions.Add(
            new TElasticsearchProjection { ElasticsearchClient = client },
            ProjectionLifecycle.Async
        );
}
```

As you see, we're also injecting _ElasticsearchClient_. We're not doing that via the constructor; thanks to that, we won't need to implement the constructor each time for derived projection.

We also added the possibility to define the basic ElasticSearch settings, like the index name and mapping configuration to which we'll project our events.

```csharp
protected abstract string IndexName { get; }

protected virtual Task SetupMapping(ElasticsearchClient client) =>
    client.Indices.CreateAsync(IndexName);
```

We also defined the possibility of specifying event types that we'd like to use in our projection logic:

```csharp
private readonly HashSet<Type> handledEventTypes = new();

protected void Projects<TEvent>() =>
    handledEventTypes.Add(typeof(TEvent));
```

**Let's use those options and define our general events apply logic.**

```csharp
public async Task ApplyAsync(
    IDocumentOperations operations,
    IReadOnlyList<StreamAction> streamActions,
    CancellationToken cancellation
)
{
    var existsResponse = await ElasticsearchClient.Indices.ExistsAsync(IndexName, cancellation);
    if (!existsResponse.Exists)
        await SetupMapping(ElasticsearchClient);

    var events = streamActions.SelectMany(streamAction => streamAction.Events)
        .Where(@event => handledEventTypes.Contains(@event.EventType))
        .ToArray();

    await ApplyAsync(ElasticsearchClient, events);
}


protected virtual Task ApplyAsync(ElasticsearchClient client, IEvent[] events) =>
    ApplyAsync(
        client,
        events.Select(@event => @event.Data).ToArray()
    );

protected virtual Task ApplyAsync(ElasticsearchClient client, object[] events) =>
    Task.CompletedTask;
```

**Marten internally does a lot of performance optimisations in asynchronous processing.** Each projection is processed in parallel, and events are batched to enable reduced network traffics with batch loads and updates. That's perfect, as it's also best practice while working with Elasticsearch to process changes in batches!

The first step is to ensure that the Elasticsearch index exists and has mappings defined. Elasticsearch can create automapping, but it's recommended to set it up explicitly for production usage.

```csharp
var existsResponse = await ElasticsearchClient.Indices.ExistsAsync(IndexName, cancellation);

if (!existsResponse.Exists)
    await SetupMapping(ElasticsearchClient);
```

Then we select only the events from the batch that we'd like to process.

```csharp
var events = streamActions.SelectMany(streamAction => streamAction.Events)
    .Where(@event => handledEventTypes.Contains(@event.EventType))
    .ToArray();

await ApplyAsync(ElasticsearchClient, events);
```

Then we call the overload method. It is the method we intend to overload for our projection. It reduces the need for a boilerplate and gives us enough data to proceed with handling.

**Let's say that we have the following events representing the Order flow:**

```csharp
public record OrderInitiated(
    string OrderId,
    string OrderNumber,
    UserInfo User
);

public record OrderShipmentAddressAssigned(
    string OrderId,
    string ShipmentAddress
);

public record OrderCompleted(
    string OrderId,
    string OrderNumber,
    string UserName
);

public record UserInfo(
    string Id,
    string UserName
);
```

We want to project it to the following document:

```csharp
public record Order(
    string Id,
    string OrderNumber,
    UserInfo User,
    string Status,
    string? ShipmentAddress
);
```

We could define projection as follows:

```csharp
public class OrderProjection: ElasticsearchProjection
{
    protected override string IndexName => "Document";

    public OrderProjection()
    {
        Projects<OrderInitiated>();
        Projects<OrderShipmentAddressAssigned>();
        Projects<OrderCompleted>();
    }

    protected override Task ApplyAsync(ElasticsearchClient client, object[] events)
    {
        // (...) TODO
    }
}
```

We'd need to fill the _ApplyAsync_ logic. It gives us the best option for customisation and performance optimisation. But it's still tedious if we'd always like to load and update documents.

**Wouldn't it be better if it looked like that?**

```csharp
public class OrderProjection: ElasticsearchProjection<Order>
{
    public OrderProjection()
    {
        DocumentId(o => o.Id);

        Projects<OrderInitiated>(e => e.OrderId, Apply);
        Projects<OrderShipmentAddressAssigned>(e => e.OrderId, Apply);
        Projects<OrderCompleted>(e => e.OrderId, Apply);
    }

    private Order Apply(Order order, OrderInitiated @event) =>
        order with
        {
            Id = @event.OrderId,
            OrderNumber = @event.OrderNumber,
            User = @event.User
        };

    private Order Apply(Order order, OrderShipmentAddressAssigned @event) =>
        order with
        {
            ShipmentAddress = @event.ShipmentAddress
        };

    private Order Apply(Order order, OrderCompleted @event) =>
        order with
        {
            Status = "Completed"
        };
}
```

**How to achieve it?** We need to add another base class. Let's start with basic registration for the event handlers and document information.

```csharp
public abstract class ElasticsearchProjection<TDocument>:
    ElasticsearchProjection where TDocument : class
{
    private record ProjectEvent(
        Func<object, string> GetId,
        Func<TDocument, object, TDocument> Apply
    );

    protected override string IndexName => IndexNameMapper.ToIndexName<TDocument>();

    private readonly Dictionary<Type, ProjectEvent> projectors = new();
    private Func<TDocument, string> getDocumentId = default!;

    protected void Projects<TEvent>(
        Func<TEvent, string> getId,
        Func<TDocument, TEvent, TDocument> apply
    )
    {
        projectors.Add(
            typeof(TEvent),
            new ProjectEvent(
                @event => getId((TEvent)@event),
                (document, @event) => apply(document, (TEvent)@event)
            )
        );
        Projects<TEvent>();
    }

    protected void DocumentId(Func<TDocument, string> documentId) =>
        getDocumentId = documentId;

    protected override Task SetupMapping(ElasticsearchClient client) =>
        client.Indices.CreateAsync<TDocument>(opt => opt .Index(IndexName));

    private string GetDocumentId(object @event) =>
        projectors[@event.GetType()].GetId(@event);
```

For each event, we need to provide two lambdas:
- one for getting the document id from event data. We'll use it to load documents to update.
- second, for providing the logic of updating document data based on event data.

I'm also using [convention-based index mapping](https://github.com/oskardudycz/EventSourcing.NetCore/blob/main/Core.ElasticSearch/Indices/IndexNameMapper.cs) based on the Document type.

**Now, the _Grand Finale_! Let's define the Apply logic.**

```csharp
protected override async Task ApplyAsync(ElasticsearchClient client, object[] events)
{
    var ids = events.Select(GetDocumentId).ToList();

    var searchResponse = await client.SearchAsync<TDocument>(s => s
        .Index(IndexName)
        .Query(q => q.Ids(new IdsQuery { Values = new Ids(ids) }))
    );

    var existingDocuments = searchResponse.Documents.ToDictionary(ks => getDocumentId(ks), vs => vs);

    var updatedDocuments = events.Select((@event, i) =>
        Apply(existingDocuments.GetValueOrDefault(ids[i], GetDefault(@event)), @event)
    ).ToList();

    var bulkAll = client.BulkAll(updatedDocuments, SetBulkOptions);

    bulkAll.Wait(TimeSpan.FromSeconds(5), _ => Console.WriteLine("Data indexed"));
}


protected virtual TDocument GetDefault(object @event) =>
    ObjectFactory<TDocument>.GetDefaultOrUninitialized();

private TDocument Apply(TDocument document, object @event) =>
    projectors[@event.GetType()].Apply(document, @event);

protected virtual void SetBulkOptions(BulkAllRequestDescriptor<TDocument> options) =>
    options.Index(IndexName); 
```

The first step is to get all the document ids from events and query Elasticsearch to get all existing documents having them.

```csharp
var ids = events.Select(GetDocumentId).ToList();

var searchResponse = await client.SearchAsync<TDocument>(s => s
    .Index(IndexName)
    .Query(q => q.Ids(new IdsQuery { Values = new Ids(ids) }))
);

var existingDocuments = searchResponse.Documents
    .ToDictionary(ks => getDocumentId(ks), vs => vs);
```

Having that, we can run the apply logic by providing the existing document (or the new default one) and the event as inputs.

```csharp
var updatedDocuments = events.Select((@event, i) =>
    Apply(existingDocuments.GetValueOrDefault(ids[i], GetDefault(@event)), @event)
).ToList()
```

We're calling the Apply method that takes the registered lambdas based on the event type:

```csharp
private TDocument Apply(TDocument document, object @event) =>
    projectors[@event.GetType()].Apply(document, @event);
```

As a result, we're getting new versions of the documents. We're storing all of them using [Elasticsearch bulk capabilities](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html) to make them efficient and reliable (that's also why we provide the option to customise bulk option).

```csharp
var bulkAll = client.BulkAll(updatedDocuments, SetBulkOptions);

bulkAll.Wait(TimeSpan.FromSeconds(5), _ => Console.WriteLine("Data indexed"));
```

Thanks to that, we're getting reliable and efficient processing of the documents. Of course, best if we don't have to do the load and save roundtrips but just run updates. Still, not always that's achievable. This combination of base classes should give you enough flexibility to define your own optimised projection handling.

**You can define projection to your other favourite storage type using the presented pattern (e.g. MongoDB, Neo4J, etc.)** The most important is not to end up with the lowest common denominator and use the best practices related to the particular storage. Marten's batching capabilities and ordering and delivery guarantees should give you enough power and flexibility to do it efficiently.

See detailed implementation in [my sample repo](https://github.com/oskardudycz/EventSourcing.NetCore/pull/212). Try it on your own and have fun!

Cheers!

Oskar

p.s. If you liked this article, also check [a simple trick for idempotency handling in the Elastic Search read model](/en/simple_trick_for_idempotency_handling_in_elastic_search_readm_model/).

p.s.2. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).