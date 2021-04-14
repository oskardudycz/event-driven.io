---
title: Events should be as small as possible, right?
category: "Event Sourcing"
cover: 2020-04-14-cover.png
author: oskar dudycz
---

![cover](2020-04-14-cover.png)

TV size? The bigger, the better. Debt amount? Opposite. It's hard to find the right size that suits all. How big should the event be? What amount of information should it contain? Unfortunately, we haven't managed to standardise the SI unit on that yet. In this post, I'll discuss basic rules on that topic.

**The most common statement is that the event should be as small as possible**. It is roughly accurate. What does "as small as possible" mean? The answer is not apparent. Let's think about the reason for publishing events. An event is information about a fact in the past (*Read more about event basics in my other article ["What's the difference between a command and an event?"](https://event-driven.io/pl/whats_the_difference_between_event_and_command/)*).

It is an inverted type of communication. In the classic HTTP API, the interested client must request the service. By publishing the event, we inform all listening modules of its occurrence. We might not even know if anyone is interested. We're unsure and don't know what will happen after the message is received. That's okay most of the time, as it allows for decoupling of services and setting correct boundaries.

Contract definition practices and review are pretty standard for Web API. There’s a lot of discussion about whether or not we’re designing a system according to REST practices. For some reason, such an approach is not typical for the events' definition. 

**In my opinion, Web API and events' design are not so different. Both of them should be treated as the public API.** Of course, they have other formats, protocols, etc.; however, general design principles are the same. If we're using an _API-first_ approach, we should define public API as the first step of our design process. By public, I mean _"public-public"_ available for all and an _"internal public"_ API between our services. The API definition should be our starting point for the system design.

**The contrary approach is _"Backend for frontend"_**, where API is tailored for the client applications' needs. In this approach, the client's preferences are the most important. The client application should be able to use endpoints as effectively as possible. 

Both approaches have advantages and disadvantages. _"API first"_ is usually more consistent, more organic. Nevertheless, it can cause difficulties for the clients, as they need to adapt and sometimes do workarounds. _"Backend for frontend"_ allows clients to work more efficiently. However, it moves more effort on the backend. The duplication is more significant, and it may be harder to maintain a consistent vision. 

**Why am I writing about Web API when I should write about events?** By creating an event-based system, we will not avoid these dilemmas. Let's take the invoicing process as an example. After the final confirmation of the order:
- The Financial module should issue an invoice.
- The Shipment module should send it. 
- The Notification module should send an e-mail. 

Accordingly, we can define an _OrderConfirmed_ event with all the information collected during the process, e.g. the buyer's data, address, total amount, and order details. However, it may turn out that the shipment module does not need detailed financial data. It only needs to know where and to whom to send the product. The financial module does not need address data for shipment, but only the company data (which may differ from personal). The notification module, in turn, should not know anything about the buyer except his name and e-mail. The only thing that we'll be sending in an e-mail is a link to the order page. 

Therefore, it may turn out that the OrderConfirmed event in such an amassed form will have redundant data. Adding GDPR into the equation makes things more challenging. We might not want to send all data everywhere. Therefore, instead of one event, you can publish three: 
- _OrderConfirmed_ with necessary order data.
- _OrderReadyForShipment_ with data for the shipment module (like address, etc.). 
- _OrderPaid_ with financial information. 

Thanks to this, each module will be listening to a specific event. Those events can be sent to different stream/queue/topic/subscription. As with _"Backend for frontend"_, this can cause duplication of data and a slightly higher maintenance cost. However, it can be a much better solution than one event to rule them all. We're also risking bigger coupling between services. We need to know what other modules need, and our module must adapt.

On the other hand, **a common mistake is taking the rule that events should be as granular as possible literally**. Let's go back to our invoicing example. Before we place an order lot of things may happen:
- User shopping can be initiated.
- Product may be added to cart. 
- Deliver address may be selected.
- Product availability may be confirmed or denied. 
- etc.

All of those events are relevant and meaningful for the ordering module. We want to gather as much business information as we can. It's perfectly fine to have them as granular as possible. However, if we're going to publish all of them outside, that could be a huge issue. By doing that, we're asking other modules to:
- get user data from _BucketAssignedToUser_.
- product data from _ProductAddedToBucket_.
- address data from _DeliveryAddressSelected_.

In short, we're demanding other modules know all the internal details of our process. **It is the first step to a distributed monolith.**

What if we extend the process by an additional event? What if we change the shape of events? For example, if the financial module does not know that we added the _ProductQuantityUpdated_ event, it might not be able to not generate the correct data for the invoice. 

**It gets demanding not only for others but also for us.** We can ignore other’s needs and provide breaking changes. However, if we care for our product's success, then we need to develop coordination. Inform others about breaking changes, etc.  

**I suggest splitting events into Internal and External.** Internal are meaningful in the specific module context. External are understandable in the context of the entire system and overall business process. 

Can an event be internal and external at the same time? Of course they can, even the previously mentioned _OrderConfirmed_. However, if we have five events that change the order status, it might not be convenient to pass them externally. If other modules are only interested in information about the status change, we can do an event mapping. We can create an internal Event Handler that will listen for internal events, then map to the external _OrderStatusChanged_ event and publish it outside. In EventStoreDB, you can use [projections](https://developers.eventstore.com/server/v21.2/docs/projections/#introduction-to-projections) for events transformations and [subscriptions](https://developers.eventstore.com/clients/grpc/subscribing-to-streams/#subscription-basics) for listening to the projected stream and forwarding it further.

So there is no best answer. As usual: it depends.

Therefore, our events should be as small as possible, but not smaller. When designing them, let's keep a healthy pragmatism and not forget that they're also an essential part of our public contract.

Cheers!

Oskar

p.s. Check my two other articles where I expand more on the events in different contexts:
- [How to create projections of events for nested object structures?](https://event-driven.io/pl/how_to_create_projections_of_events_for_nested_object_structures/).
- [How to (not) do the events versioning?](https://event-driven.io/pl/how_to_do_event_versioning/).
- [Why a bank account is not the best example of Event Sourcing?](https://event-driven.io/pl/bank_account_event_sourcing/)