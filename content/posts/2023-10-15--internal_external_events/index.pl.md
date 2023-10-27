---
title: Internal and external events, or how to design event-driven API
category: "Architecture"
cover: 2023-10-15-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2023-10-15-cover.png)

One of the things that we're learning too late in the Event-Driven approach is that we should have been splitting events into internal and external. 

**While starting our journey, we focus on modelling our business case.** That's fine, as that's our team's bread and butter. Quite often, we're so laser-focused that we forget the bigger picture. That blissful ignorance can last long, but at some point, one of our colleagues will tap our back and ask:

> _"Hey, we need data from you. Could you expose it?"_.

Then, the first thought is:

> _"Easy peasy, we'll just republish our events."_

And then we answer:

> _"No worries, I'll expose you that event."_ 

Let's say that we're building a shopping cart module (read more on it in [How to effectively compose your business logic](how_to_effectively_compose_your_business_logic/)). The colleague who tapped our back is working on the payment module. They need to start the payment process on shopping cart confirmation.

**If we're already using messaging tooling (e.g. Kafka, RabbitMQ, etc.), the easiest option is to say:**

> _"Just subscribe to this topic and listen to ShoppingCartConfirmed event."_

Thanks to that, no additional work is needed. Other modules will get all the data from us, trigger their processes, or build read models.

That can work for some time, especially if we're good colleagues. But sooner or later, we'll get the feedback:

> _"That's great that you exposed me to the event, but it only contains information on when the shopping cart was confirmed. I need to know the client and the total amount of all products. Could you add that information to the event?"_

After hearing that, we may agree and extend event data or say that we already publish information about the client and products in the earlier events. We may say:

> _"Just collect data from other events. Take the client id from ShopingCartOpened event, and sum amounts from ProductItemAdded events."_

If our colleagues are not assertive or have a tight schedule, they may agree, which can work for some time. But then they will come back and say.

> _"Hey, that worked fine for some time, but we're getting discrepancies, and client complain that from time to time we're charging them too much. Could you investigate it?"_

We put on our detective hats, investigate what happened and end with the conclusion:

> _"What a moron!"_

Then we contact our colleague and say:

> _"Hey, you should also have handled ProductItemRemoved. Users can not only add but also remove items from the shopping cart."_ 

**If we reach that point, we should stop and do a sanity check.** We may conclude that we were right in shouting _"What a moron!"_, but the target was wrong. Our colleague doesn't need to know about the details of our implementation. What's more, they should not know the details of our process. If they have to, then we have leaking abstractions.

I wrote about that issue in detail in [Events should be as small as possible, right?](/pl/events_should_be_as_small_as_possible/). If we expose our internal events, we must communicate and consult each change we make with other teams. We have to assume that the event is being used by someone else and that they may need to use the new one.

**So, the easiness of just exposing everything will bite us hard.**

Should we extend our events and make them bigger then? Yes and no.  

**We should provide the [Summary Event](https://verraes.net/2019/05/patterns-for-decoupling-distsys-summary-event/) that will provide the [complete information](https://verraes.net/2019/05/patterns-for-decoupling-distsys-completeness-guarantee/) needed for other modules.** If they also need information about other steps of the process, we can have more than one summary event. 

Summary Event can be easily mistaken with [Event Carried State Transfer](https://codeopinion.com/event-carried-state-transfer-keep-a-local-cache/) or [Snapshot](https://www.eventstore.com/blog/snapshots-in-event-sourcing), yet they're not the same. Summary Event still gathers business information about the business fact that has happened. We can not only replicate the state (as with Event Carried State Transfer) but also trigger the workflow's next steps.

**Why am I not using _domain event_ and _integration event_ terms?** Because they're highly misleading. All of them should be domain events. They are just used in different contexts. Internal (or private) is understandable in the module context, and external (or public) is understandable in the whole system context. If you're doing EventStorming sessions, external are those we find during big-picture discussions and internal at the design and process level analysis.

Let's get back to our colleague's request:

> _"Hey, we need data from you. Could you expose it?"_.

We already know that's not as _easy peasy_ as we thought. Instead of downplaying the case, we should start by asking:

> _"I'm open to that, but before we agree on how to technically solve it. Could you explain me your need and business scenario?"_

So we should ask our colleague to [bring us the problem instead of the solution](/pl/bring_me_problems_not_solutions/) and understand their use case. 

**We can then define our API.** Yes, API. Events should be treated as such. We need to understand:
- how many other modules will have a similar need,
- is data needed to get a local copy of our data or to trigger the workflow,
- how much data we'll need to expose,
- is data personally identifiable information,
- etc.

All of that should give us enough context on how to proceed. 

**We can also use tools like [Context Maps](https://www.youtube.com/watch?v=k5i4sP9q2Lk);** they should help us define the dependency between our modules if our module is downstream or upstream. In other words, should we think of our data as generic and supporting to others or the core of our business? It is essential to understand how we will distribute and enrich our data.

**Let's say our information is generic enough, and many modules will need a similar data set.** Then, in our messaging system, we can define two distribution channels (e.g. topic in Kafka or SNS, fan out in RabbitMQ, etc.):
- _shopping\_carts-internal_ - for modules that are part of our context or managed by our team. They can get our internal, granular events, as we already need to know the internal details.
- _shopping\_cart-external_ - for all other external modules. That will contain bigger, _enriched_ summary events.

If our internal event looks as follows:

```csharp
record ShoppingCartConfirmed(
    Guid CartId,
    DateTime ConfirmedAt
)
```
Then our enriched could look:

```csharp
namespace ShoppingCarts.External;

record ShoppingCartConfirmed(
    Guid CartId,
    Guid ClientId,
    IReadOnlyList<PricedProductItem> ProductItems,
    decimal TotalAmount,
    DateTime FinalizedAt
);
```

We added all information about the selected product, total amount, etc. TotalAmount looks redundant. We could, in theory, tell one to calculate it from product item information. Yet, remember that we don't want to expose the business logic and need to repeat computations for all consumers. Price calculation can be complex if we consider discounts, loyalty plans, taxes, etc. We should keep it cohesive and do it in the module that's the source of truth for that business process. It is a decent example that a healthy amount of copy and paste won't harm.

**The example code doing enrichment could look like this:**

```csharp
class HandleCartFinalised: IEventHandler<EventEnvelope<ShoppingCartConfirmed>>
{
    public async Task Handle(EventEnvelope<ShoppingCartConfirmed> @event, CancellationToken cancellationToken)
    {
        var cart = await querySession.Events.AggregateStreamAsync<ShoppingCart>(
            @event.Data.CartId,
            version: @event.Metadata.StreamPosition,
            token: cancellationToken
        );

        if (cart == null)
            return;

        var externalEvent = new EventEnvelope<External.ShoppingCartConfirmed>(
            new CartFinalized(
                @event.Data.CartId,
                cart.ClientId,
                cart.ProductItems.ToList(),
                cart.TotalPrice,
                @event.Data.ConfirmedAt
            ),
            @event.Metadata
        );

        await externalEventBus.Publish(externalEvent, cancellationToken);
    }

    private readonly IQuerySession querySession;
    private readonly IEventBus externalEventBus;

    public HandleCartFinalized(
        IQuerySession querySession,
        IExternalEventBus externalEventBus
    )
    {
        this.querySession = querySession;
        this.externalEventBus = externalEventBus;
    }
}
```

**It's a simple event handler that:**
1. Takes the internal event.
2. Loads additional data.
3. Builds enriched external events from internal events and loaded data.
4. Forwards it to messaging tooling.

Event handler can be triggered by [outbox](/pl/outbox_inbox_patterns_and_delivery_guarantees_explained/), [subscription](en/integrating_Marten/) or your preferred messaging tooling. Event bus can store the message in the outbox to forward it later or just push it to your favourite messaging system.

If you're using Event Sourcing, you can append an event to the dedicated external stream (per shopping cart or per module, depending on your needs) and then forward it via subscription to the messaging system.

**I'm using Marten's _AggregateStreamAsync_ method that [builds state from event](/pl/how_to_get_the_current_entity_state_in_event_sourcing/) for loading.** That's a big benefit of event sourcing, as I can pass the internal event stream position and get the state at a specific point in time. If I used a regular approach, I may face race conditions related to eventual consistency. The event handler could be triggered after there was another state change. Then, if I load it, I would get too recent state. It could mean that we're trying to enrich the event about shopping cart confirmation but getting cancelled if someone did that in the meantime. It doesn't have to be a big deal if our Summary Event is a final one, but that's something that we should keep in mind.

**We can use precisely the same techniques if our module is not generic but supportive.** The difference could be that our API should be then more like _[Backend for Frontends](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends)_ and we publish more events fine-tuned for different customer needs. For instance, besides the internal channel, we could have two external channels:
- _shopping\_cart\_finance-external_ - for all other modules needing information about financial aspects of the buying process,
- _shopping\_cart\_products-external_ - for those modules that need information about products, e.g. shipment.

Then, we could have two different external events:

```csharp
namespace ShoppingCarts.External.Finances;

record ShoppingCartConfirmed(
    Guid CartId,
    Guid ClientId,
    decimal TotalAmount,
    DateTime FinalizedAt
);
```

And:

```csharp
namespace ShoppingCarts.External.Products;

record ShoppingCartConfirmed(
    Guid CartId,
    Guid ClientId,
    IReadOnlyList<PricedProductItem> ProductItems,
    DateTime FinalizedAt
);
```

Then, we get more information to fulfil conflicting module requirements and provide more precise events.

Of course, we should be careful and not try to send _passive-aggressive events_, so events that should be commands. If we know that we'll always have a single consumer for an event that always needs to run the specific logic and expect to get the particular event back, then it should probably be a command. Read more in [What's the difference between a command and an event?](https://event-driven.io/pl/whats_the_difference_between_event_and_command/).

How do we document our Events API? That's currently a bit of a challenge; there are initiatives like [Cloud Events](https://cloudevents.io/) and [AsyncAPI](https://www.asyncapi.com/), they provide a description format, but they're not yet a global standard as e.g. Open Telemetry. 

Tools like [EventCatalog](https://www.eventcatalog.dev/) allow us to design and view our events. Yet, also regular Markdown is good enough if we organise that together with our code.

**The most important aspect is to think about events as API.** We should understand that we'll shoot ourselves in the foot if we don't split our events into internal and external. We'll have a leaking abstraction that creates coupling, and it's a first step to the distributed monolith. I've been there; it's a dark place that I don't recommend.

**I hope this article will show you that simple techniques for discussing the API and enriching events can take you far and help create maintainable systems.**

Check also more in:
- [Events should be as small as possible, right?](/pl/events_should_be_as_small_as_possible/),
- [Mathias Verraes - Explicit Public Events](https://verraes.net/2019/05/patterns-for-decoupling-distsys-explicit-public-events/),
- [Derek Comartin - Event-Driven Architecture Gotcha! Inside or Outside Events](https://www.youtube.com/watch?v=qf-BSAhbrWw),
- [Marc Klefter - Powering Event-Driven APIs with Event Sourcing](https://www.youtube.com/watch?v=Pph8TFPOfko),
- [Pat Helland - Data on the Outside vs. Data on the Inside](https://queue.acm.org/detail.cfm?id=3415014).

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
