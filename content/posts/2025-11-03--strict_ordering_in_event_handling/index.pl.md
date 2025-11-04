---
title: Handling Events Coming in an Unknown Order
category: "Event Sourcing"
cover: 2025-11-03-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![](2025-11-03-cover.png)

After the last article on [Dealing with Race Conditions in Event-Driven Architecture with Read Models](/pl/dealing_with_race_conditions_in_eda_using_read_models/), I got such a [question from Ben](https://www.architecture-weekly.com/p/dealing-with-race-conditions-in-event/comment/171420356):

> You described the scenario where you know what events you should receive, just not the order. But what if you don't know that? For example, you get an ItemRemovedFromCart event, but the item doesn't exist in your view of the current state of the cart. Is it an invalid event? Or is there an ItemAddedToCart event that hasn't come through yet?

That's a good question, and good questions usually require more depth to give a precise answer. That's what we're here for!

Let's follow up and discuss how to determine whether we have complete information for our events!

## What we learned so far

Communication in messaging systems works like a department store. It has multiple cash registers and separate queues for each of them. You can only guess which person will be handled in a specific queue: first in, first out. Between queues, you only know that the slowest will be the one you're standing in.

Of course, you could put a single cash register and a single queue, and everything would be sequential. Such a setup can work for small groceries with few customers. Tho, for a supermarket, it'd end up with an extremely long waiting queue.

You can think about a single module as a single cash register in a department store or a small grocery store. Inside it, you can get strict ordering of processing, but not in the relationship with the outside world. For instance, you may know that on Monday morning, you're getting the fresh fruits delivery, and at noon, you're getting the dairy delivery. And it's typically like that, but from time to time, because of the fruit delivery delay, you may get your fresh dairy first.

Is it an issue? Not a huge one, as you just want them to come asap so you have fresh stuff to sell. When would it be an issue? If you were running the Milk Shake Cafe and needed both to make your special strawberry shake recipe.

In many systems, ordering is not a key concern, especially when we partition the workload. The issue may arise when we need to correlate separate actions.

**In the last article, we discussed the payment verification workflow.** To make the final decision, we needed to correlate data from the external payment gateway with our own modules, which calculate fraud scores, check limits, and assess risk. Only after receiving data on available merchant limits and the fraud assessment score could we make the final decision. Those pieces of information could return to us at different times and in a different order.

To resolve it, we were just gathering and aggregating data as they went. Then, after each step, we checked whether we now have all the data. If we had, we were making the final decision; if not, we were storing it as is, assuming that at some point, data would arrive.

If we model that as the workflow, then it'd look like that:

```typescript
function decide(
  current: PaymentVerification | null,
  event: PaymentVerificationEvent
):
  | PaymentVerification
  | { document: PaymentVerification; events: VerificationEvent[] } {
  current = current ?? {
    paymentId: event.paymentId,
    initialState,
  }

  switch (event.type) {
    // (...) other event handlers
    case 'MerchantLimitsChecked': {
      const updated = {
        ...current,
        merchantLimits: {
          withinLimits: event.withinLimits,
          dailyRemaining: event.dailyRemaining,
          checkedAt: event.checkedAt,
        },
        lastUpdated: event.checkedAt,
      };

      return tryCompleteVerification(updated, event);
    }
    case 'FraudScoreCalculated': {
      if (
        current.fraudAssessment &&
        event.calculatedAt <= current.fraudAssessment.assessedAt
      )
        return current;

      const updated = {
        ...current,
        fraudAssessment: {
          score: event.score,
          riskLevel: event.riskLevel,
          assessedAt: event.calculatedAt,
        },
        lastUpdated: event.calculatedAt,
      };

      return tryCompleteVerification(updated, event);
    }
  }
};
```

And:

```typescript
function tryCompleteVerifications(
  current: PaymentVerification,
  event: PaymentVerificationEvent
):
  | PaymentVerification
  | { document: PaymentVerification; events: VerificationEvent[] } {
  // Ignore if we already made decision
  if (current.decision)
    return current;

  // Check if we now have BOTH critical pieces
  if (!current.fraudAssessment || !current.merchantLimits)
    // Don’t have both yet - stay in processing
    return {
      ...current,
      status: 'processing',
      dataQuality: 'processing',
    };

  const decision =
    current.fraudAssessment.riskLevel === 'high'
      ? {
          approval: 'declined',
          reason: 'High fraud risk',
          decidedAt: event.checkedAt,
        }
      : !current.merchantLimits.withinLimits
      ? {
          approval: 'declined',
          reason: 'High fraud risk',
          decidedAt: event.checkedAt,
        }
      : {
          approval: 'approved',
          reason: 'Verified',
          decidedAt: event.checkedAt,
        };

  return {
    document: {
      ...current,
      status: decision.approval,
      decision,
    },
    events: [
      {
        type: 'PaymentVerificationCompleted',
        data: decision,
      },
    ],
  };
};
```

This works fine, as we know precisely which steps need to happen, so we know what we're waiting for. And that's how we made the full loop to Ben's question. What if we didn't know which steps we're waiting for?

## How to know what we don't know?

Let's have a look at the case brought by Ben: the e-commerce flow. First, we complete the shopping cart by adding and removing items, then we confirm it. The example event flow could look as follows for the online food ordering:

```
ItemAddedToCart     (cartId: 1, name: Pizza Napoletana) 
ItemAddedToCart     (cartId: 1, name: Pizza Napoletana)
ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
CartConfirmed       (cartId:1, confirmedAt: 2025-11-03 11:44:27)
```

We see here that someone added the first Pizza, then maybe accidentally added it again, corrected their mistake, and confirmed the order.

Then, if that was an online ordering system and we had it integrated with the kitchen ordering, then we could get those events in a different order, for instance:

```
ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
CartConfirmed       (cartId: 1, confirmedAt: 2025-11-03 11:44:27)
ItemAddedToCart     (cartId: 1, name: Pizza Napoletana) 
ItemAddedToCart     (cartId: 1, name: Pizza Napoletana)
```

We see that someone removed one Pizza from their shopping cart, which suggests that some information is missing. When we get a confirmation event, we still know that there's more to come, as an order with a removed item doesn't make sense. The same goes for the information that one pizza was added; when we correlate it with the removal event having the same cart identifier, we still see zero items in the shopping cart. Once we get the next event, we will finally know that we have more than one item in our shopping cart. 

Can we then proceed? Maybe yes and maybe no. For this particular order, it'd be correct, but what if our real order:

```
ItemAddedToCart     (cartId: 1, name: Pizza Napoletana) 
ItemAddedToCart     (cartId: 1, name: Pizza Napoletana)
ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
ItemAddedToCart     (cartId: 1, name: Spaghetti Carbonara)
ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
CartConfirmed       (cartId: 1, confirmedAt: 2025-11-03 11:44:27)
```

Also, since messaging systems retry to ensure delivery, how would we know that those "doubled" events for adding or removing are actually distinct events and not just retries?

For instance, in such a delivery case:

```
ItemAddedToCart     (cartId: 1, name: Pizza Napoletana) 
ItemAddedToCart     (cartId: 1, name: Pizza Napoletana)
ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
CartConfirmed       (cartId: 1, confirmedAt: 2025-11-03 11:44:27)
ItemAddedToCart     (cartId: 1, name: Spaghetti Carbonara)
ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
```

Let's discuss a few strategies to deal with that!

## External vs Internal events

> - Doctor, it hurts when I bend my arm this way.
> - Then don't bend it this way

![doctor](./2025-11-03-pun-small.jpg)

One of the most common mistakes we learn too late is separating our events into internal and external (or private and public). [Internal information can and should be more granular](/pl/events_should_be_as_small_as_possible/). We need it to be precise in capturing the business context and making our decision. 

Yet, other parts of our system don't need to know all of that. Is the kitchen interested in the details of all the changes procrastinating customer made to their shopping cart? No, they just want the final information on which meal they need to prepare.

So in our example, if we published to the outside world just:

```
CartConfirmed  {
    cartId: 1, 
    items: [ { name: "Spaghetti Carbonara" } ],
    confirmedAt: "2025-11-03 11:44:27"
}
```

Such a type of event is also called a **Summary Event**. We should not mistake it with _the latest state_. It's still an event because it tells what has happened business-wise. It gathers all the information needed for other modules and summarises the changes. And no more than that. It should still be as small as possible and expose only the information that other modules need. It's a contract made between different teams. I wrote about it in detail [Internal and external events, or how to design event-driven API](/pl/internal_external_events/). 

We can define such an internal event API as:

```typescript
type ItemAddedToCart = {
  type: 'sc:int:ItemAddedToCart';
  data: {
    cartId: string;
    productItem: ProductItem;
  };
};

type ItemRemovedFromCart = {
  type: 'sc:int:ItemRemovedFromCart';
  data: {
    cartId: string;
    productItem: ProductItem;
  };
};

type CartConfirmed = {
  type: 'sc:int:CartConfirmed';
  data: {
    cartId: string;
    confirmedAt: Date;
  };
};

type ShoppingCartEvent =
  | ItemAddedToCart
  | ItemRemovedFromCart
  | CartConfirmed;

type ProductItem = {
  productId: string;
  quantity: number;
}
```

and public as:

```typescript
type CartOpened = {
  type: 'sc:ext:CartOpened';
  data: {
    cartId: string;
    openedAt: Date;
  };
};

type CartConfirmed = {
  type: 'sc:ext:CartConfirmed';
  data: {
    cartId: string;
    productItems: { productId: string; quantity: number }[];
    confirmedAt: Date;
  };
};

type ShoppingCartExternalEvent = CartOpened | CartConfirmed;
```

As you see, we can even have more than one summary event, and not even be one-to-one with an internal event. Maybe we also have an analytics module that analyses how long it takes the user to make a final decision after adding the first product. Then we may decide to expose such an event, hiding the details of the internal flow. We're also defending ourselves and [minimising the need for versioning when flow changes](/pl/how_to_do_event_versioning/).

Ok, but how to map internal events into external?

We can enrich them using such a function:

```typescript
import type { ShoppingCartExternalEvent } from './shoppingCart.external';
import type { ShoppingCart, ShoppingCartEvent } from './shoppingCart.internal';

const enrich = (
  event: ShoppingCartEvent,
  state: ShoppingCart | null,
): ShoppingCartExternalEvent | [] => {
  switch (event.type) {
    case 'sc:int:ItemAddedToCart':
      return state == null
        ? {
            type: 'sc:ext:CartOpened',
            data: {
              cartId: event.data.cartId,
              openedAt: new Date(),
            },
          }
        : [];
    case 'sc:int:CartConfirmed':
      return {
        type: 'sc:ext:CartConfirmed',
        data: {
          cartId: event.data.cartId,
          productItems: state?.productItems ?? [],
          confirmedAt: event.data.confirmedAt,
        },
      };
    default:
      return [];
  }
};
```

We can then subscribe to internal events in our module, load the state (best to build it from events if we're using Event Sourcing), and publish enriched events externally.

**If we're using messaging, this means also separating queues/topics.** If you're using Kafka both for internal and external communication, then you should separate topics and have two different topics for outgoing communication, e.g.:
- *carts:events:int*
- *carts:events:out*.

Similarly, for RabbitMQ or similar tools, you should have separate queues for internal and external communications.

This is important, as you can now:
- Publish messages that other modules need, decreasing the number of issues with ordering,
- Have enrichment as an anti-corruption layer for your internal process changes,
- You can have different scaling capabilities for internal and external events. Maybe for internal, you don't even need a messaging system, maybe [outbox or event store subscriptions](/pl/outbox_inbox_patterns_and_delivery_guarantees_explained/) will be enough? Maybe you could cut costs using AWS SQS for internal communication and AWS Kinesis for cross-module?
- You can now define different security for those topics and retention policies.

Sweet, right?

## It's not me, it's them

Maybe it's sweet enough for you, but you may also say:

> But Oskar, I'm not producing those events, it's the other team and the external service. If I was responsible for that, I'd go this way, but I can't change it how messages are published.

I could handwave it and say I pity you, but well, this actually can happen. Let's see what else we could do about it. 

The first idea could be: Let's add timestamps!

Let's see how it looks for our example:

```
11:40:10 - ItemAddedToCart     (cartId: 1, name: Pizza Napoletana) 
11:40:10 - ItemAddedToCart     (cartId: 1, name: Pizza Napoletana)
11:42:13 - ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
11:43:18 - ItemAddedToCart     (cartId: 1, name: Spaghetti Carbonara)
11:44:23 - ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
11:44:27 - CartConfirmed       (cartId: 1)
```

And the out of order delivery:

```
11:40:10 - ItemAddedToCart     (cartId: 1, name: Pizza Napoletana) 
11:40:10 - ItemAddedToCart     (cartId: 1, name: Pizza Napoletana)
11:44:23 - ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
11:44:27 - CartConfirmed       (cartId: 1, confirmedAt: 2025-11-03 11:44:27)
11:43:18 - ItemAddedToCart     (cartId: 1, name: Spaghetti Carbonara)
11:42:13 - ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
```

Would that help? No, because how would we know, based on timestamps, that there will be two more events after confirmation? Timestamps only tell us when a certain operation happens. They could help us order items that were delivered, but they won't help us know what we're missing. Because how do we know that there's a gap in our knowledge? Within a minute, one could do nothing and order or remove a few more items. Also, timestamps might work if the data is coming from the same node, but we don't have any guarantees across nodes. Read more about [clock drift](https://en.wikipedia.org/wiki/Clock_drift).

What we actually need is the logical clock. One that increments after each operation. So something like:

```
1 - ItemAddedToCart     (cartId: 1, name: Pizza Napoletana) 
2 - ItemAddedToCart     (cartId: 1, name: Pizza Napoletana)
3 - ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
4 - ItemAddedToCart     (cartId: 1, name: Spaghetti Carbonara)
5 - ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
6 - CartConfirmed       (cartId: 1)
```

If we had such, then our delivery would look as follows:

```
2 - ItemAddedToCart     (cartId: 1, name: Pizza Napoletana) 
1 - ItemAddedToCart     (cartId: 1, name: Pizza Napoletana)
5 - ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
6 - CartConfirmed       (cartId: 1, confirmedAt: 2025-11-03 11:44:27)
4 - ItemAddedToCart     (cartId: 1, name: Spaghetti Carbonara)
3 - ItemRemovedFromCart (cartId: 1, name: Pizza Napoletana)
```

If this number were monotonic and gapless, we'd know that if the event has number 3, then we have completeness of information if we received three events; if not, then we're missing something.

We still need to define the completion criteria and determine, from a business perspective, where we can make a decision or proceed to the next step. Here we know that we can start preparing a meal when the shopping cart is confirmed.

In this case, we got the events in the following order: 2, 1, 5, 6.  

We know we're missing events 3 and 4, so we need to wait for them. Only when we receive them can we proceed. Ok, but how to do it? 

What if we kept a list of pending events in our data model? Let's try that!

Our kitchen order could look as follows:

```typescript
type KitchenOrder = {
  orderId: string;
  productItems: ProductItem[];
  status: 'Incomplete' | 'Ready' | 'InPreparation';
};

type KitchenOrderCommand =
  | {
      type: 'AddItem' | 'RemoveItem';
      productId: string;
      quantity: number;
    }
  | {
      type: 'Confirm';
      orderId: string;
    };

type ProductItem = {
  productId: string;
  quantity: number;
};
```

When storing it, we could store it with additional metadata:

```typescript
type DocumentWithPendingCommands<State, Command> = State & {
  metadata: {
    lastProcessedRevision: number;
    pendingCommands: PendingCommand<Command>[];
  };
};
```

As you see, besides the regular data, we have two other properties: pending commands and last processed revision.

You can think about pending commands as your git repository on your local disk. It contains the list of all operations that you'll eventually commit. The rest of the data is like the remote git repository. They will be updated when you push your changes there. Then, the last processed revision will be updated with the revision of the last applied command. 

The code for that workflow could look as follows:

```typescript
function handle(
  event: ShoppingCartEvent,
  document: DocumentWithPendingCommands<
    KitchenOrder,
    KitchenOrderCommand
  > | null,
): DocumentWithPendingCommands<KitchenOrder, KitchenOrderCommand> {
  const { metadata, ...data } = document ?? {
    metadata: {
      lastProcessedRevision: 0,
      pendingCommands: [],
    },
  };

  const state: KitchenOrder = {
    orderId: event.data.cartId,
    productItems: [],
    status: 'Incomplete',
    ...data,
  };

  const updated = {
    ...state,
    metadata: {
      lastProcessedRevision: metadata.lastProcessedRevision,
      pendingCommands: [
        ...metadata.pendingCommands,
        mapToPendingCommand(event),
      ],
    },
  };

  return handlePendingCommands(updated, decide);
}
```

It takes the current state of the kitchen order. If it doesn't exist, then we need to set it up with default data. We're also appending a pending command that's built from an event.

```typescript
function mapToPendingCommand(
  event: ShoppingCartEvent,
): PendingCommand<KitchenOrderCommand> {
  switch (event.type) {
    case 'sc:int:ItemAddedToCart':
      return {
        type: 'AddItem',
        productId: event.data.productItem.productId,
        quantity: event.data.productItem.quantity,
        metadata: {
          revision: event.metadata?.revision,
        },
      };
    case 'sc:int:ItemRemovedFromCart':
      return {
        type: 'RemoveItem',
        productId: event.data.productItem.productId,
        quantity: event.data.productItem.quantity,
        metadata: {
          revision: event.metadata?.revision,
        },
      };
    case 'sc:int:CartConfirmed':
      return {
        type: 'Confirm',
        orderId: event.data.cartId,
        metadata: {
          revision: event.metadata?.revision,
        },
      };
  }
}
```

Why not use a regular event here? We could. The benefit is that then we'd have all the data stored as it came. This could make troubleshooting and correction easier. Downside? We're coupling the event with our internal business logic. Also, keeping the whole event payload increases the size of our data. The choice is yours.

As you see, we're taking revision from the event metadata. We'll get to that later, how to fill it on the producer side. Now, let's focus on the workflow.

Let's see what processing pending items looks like:

```ts
function handlePendingCommands<State, Command>(
  document: DocumentWithPendingCommands<State, Command>,
  decide: (command: Command, state: State) => State,
): DocumentWithPendingCommands<State, Command> {
  const { metadata, ...data } = document;

  const commandsToHandle = getCommandsReadyToHandle(
    metadata.pendingCommands,
    metadata.lastProcessedRevision,
  );

  // Nothing to do see here, please disperse
  if (commandsToHandle.length === 0) return document;

  let state = data as State;
  for (const command of commandsToHandle) {
    state = decide(command, state);
  }

  const lastCommand = commandsToHandle[commandsToHandle.length - 1];

  return {
    ...state,
    metadata: {
      lastProcessedRevision: lastCommand.metadata.revision,
      pendingCommands: metadata.pendingCommands.filter(
        (a) => a.metadata.revision > lastCommand.metadata.revision,
      ),
    },
  };
}
```

We need to get the commands ready to be handled. For instance, if we already had commands with the following revisions 2, 6, 1, 4, and now we got an action with number 3, then that means:
- We can process actions 1, 2, 3, 4
- Action 6 remains, as we're missing 5.

The filtering can look as follows:

```ts
function getCommandsReadyToHandle<Command>(
  pending: PendingCommand<Command>[],
  lastProcessedRevision: number,
): PendingCommand<Command>[] {
  return (
    pending
      // filter out commands that have already been processed
      .filter((cmd) => cmd.metadata.revision > lastProcessedRevision)
      // sort by revision to ensure correct order
      .sort((a, b) => a.metadata.revision - b.metadata.revision)
      // only take commands that are consecutive in terms of revision
      .reduce<PendingCommand<Command>[]>((acc, command) => {
        const lastRevision = acc[acc.length - 1]?.metadata.revision;

        return !lastRevision || command.metadata.revision === lastRevision + 1
          ? [...acc, command]
          : acc;
      }, [])
  );
}
```

When we filter them out and have actions to process, we need to run the actual logic for each of them. For our case this could look like that:

```ts
function decide(
  command: KitchenOrderCommand,
  order: KitchenOrder,
): KitchenOrder {
  switch (command.type) {
    case 'AddItem':
    case 'RemoveItem': {
      if (order.status !== 'Incomplete') return order;

      const updatedItems = new Map(
        order.productItems.map((item) => [item.productId, item.quantity]),
      );
      const current = updatedItems.get(command.productId) ?? 0;

      const multiplier = command.type === 'AddItem' ? 1 : -1;
      const updated = current + multiplier * command.quantity;

      if (updated > 0) {
        updatedItems.set(command.productId, updated);
      } else {
        updatedItems.delete(command.productId);
      }

      return {
        ...order,
        productItems: Array.from(updatedItems.entries()).map(
          ([productId, quantity]) => ({
            productId,
            quantity,
          }),
        ),
      };
    }
    case 'Confirm':
      if (order.status !== 'Incomplete') return order;

      return {
        ...order,
        status: 'Ready',
      };
  }
}

type KitchenOrderCommand =
  | {
      type: 'AddItem' | 'RemoveItem';
      productId: string;
      quantity: number;
    }
  | {
      type: 'Confirm';
      orderId: string;
    };
```

After processing each command, we're returning the document with the updated state, filtered-out processed commands, and the last processed revision set to the revision of the last processed command.

Not that big a hassle as it may seem, but...

## What's revision and how to get it?

A revision needs to be created on the producer side. The best is to use Optimistic Concurrency for that. If you don't know what optimistic concurrency or locking is, then you should. Check my intros:
- [Optimistic concurrency for pessimistic times](/pl/optimistic_concurrency_for_pessimistic_times/)
- [How to use ETag header for optimistic concurrency](/pl/how_to_use_etag_header_for_optimistic_concurrency/).

Essentially, if you're:
- using a typical implementation of optimistic concurrency where each record/document change increments its version/revision,
- publishing an event after each business operation.

Then you can use this incremented state revision and pass it in your events metadata. Having that, you'd know precisely on which revision it was recorded and get gapless monotonic numeration. It'd also ensure that each message is produced in a certain order, as operations on the specific record will be sequential. Read also more on how revision can help in [Dealing with Eventual Consistency and Idempotency in projections](/pl/dealing_with_eventual_consistency_and_idempotency_in_mongodb_projections/).

> But Oskar, what if I have more than one record?

Well, then you either need to store multiple revisions. But this won't help if you need to correlate data between them, as revision is monotonic and gapless for the specific record. 

What about global positions? Well, they're useful for knowing the order of things, but they won't help here, as they're monotonic but may have gaps.

Read more on why in:
- [How does Kafka know what was the last message it processed? Deep dive into Offset Tracking](https://www.architecture-weekly.com/p/how-does-kafka-know-what-was-the),
- [Let's talk about positions in event stores](/pl/lets_talk_about_positions_in_event_stores/),
- [How Postgres sequences issues can impact your messaging guarantees](/pl/ordering_in_postgres_outbox/).

Then you're back to square one, and the [previous article](https://www.architecture-weekly.com/p/dealing-with-race-conditions-in-event).

## TLDR

Proper modelling in Event-Driven Architecture can spare you a lot of complicated implementation tricks. 

If you 
- define essential events for your process,
- ensure that they have completeness of information, 
- shape contracts and communication between modules, respecting the internal and external split.

Then, when things get easier to handle, we can define conditions that tell us when to take action.

Still, sometimes we may:
- have strict ordering needs,
- be using a queue that doesn't give us an ordering guarantee,
- need to adjust to the other teams.

Then, using revision can be a decent option to solve things in an organised way.

**If you're dealing with such issues, I'm happy to help you through consulting or mentoring. [Contact me](mailto:oskar@event-driven.io) and we'll find a way to unblock you!**

Read also more in:
- [Dealing with Race Conditions in Event-Driven Architecture with Read Models](/pl/dealing_with_race_conditions_in_eda_using_read_models/)
- [The Order of Things: Why You Can't Have Both Speed and Ordering in Distributed Systems](https://www.architecture-weekly.com/p/the-order-of-things-why-you-cant),
- [Internal and external events, or how to design event-driven API](/pl/internal_external_events/),
- [Dealing with Eventual Consistency and Idempotency in MongoDB projections](/pl/simple_trick_for_idempotency_handling_in_elastic_search_readm_model/)
- [Saga and Process Manager - distributed processes in practice](/pl/saga_process_manager_distributed_transactions/),
- [Predictable Identifiers: Enabling True Module Autonomy in Distributed Systems](https://www.architecture-weekly.com/p/predictable-identifiers-enabling)
- [Dealing with Eventual Consistency, and Causal Consistency using Predictable Identifiers](https://www.architecture-weekly.com/p/dealing-with-eventual-consistency),
- [Event-driven distributed processes by example](/pl/event_driven_distributed_processes_by_example/),
- [Workflow Engine design proposal, tell me your thoughts](https://www.architecture-weekly.com/p/workflow-engine-design-proposal-tell),
- [How TypeScript can help in modelling business workflows](/pl/how_to_have_fun_with_typescript_and_workflow/),
- [Oops I did it again, or how to update past data in Event Sourcing](/pl/how_to_update_past_data_in_event_sourcing/),
- [Event transformations, a tool to keep our processes loosely coupled](/pl/event_transformations_and_loosely_coupling/), 
- [Testing asynchronous processes with a little help from .NET Channels](/pl/testing_asynchronous_processes_with_a_little_help_from_dotnet_channels/).

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
