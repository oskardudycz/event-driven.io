---
title: Using event metadata in event-driven projections
category: "Event Sourcing"
cover: 2024-08-25-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![](2024-08-25-cover.png)

**Some time ago, I wrote about the dangers that come from the [I'll just add one more field"](/pl/i_will_just_add_one_more_field/) attitude.** Have you heard about the [Broken Window Theory](https://web.archive.org/web/20090418141450/http://www.theatlantic.com//doc//198203//broken-windows)? Authors (James Q. Wilson and George L. Kelling) wrote:

> Social psychologists and police officers tend to agree that if a window  in a building is broken and is left unrepaired, all the rest of the  windows will soon be broken. This is as true in nice neighborhoods as in rundown ones. Window-breaking does not necessarily occur on a large  scale because some areas are inhabited by determined window-breakers  whereas others are populated by window-lovers; rather, one un-repaired  broken window is a signal that no one cares, and so breaking more  windows costs nothing. (It has always been fun.)

Adam Tornhill tells us to treat our [code as a crime scene](https://pragprog.com/titles/atcrime2/your-code-as-a-crime-scene-second-edition/), and to some degree, we should. In event modelling, adding new property can be such a broken window if we're doing it without considering alternatives and tradeoffs. Yet, sometimes, it can be a decent option. When? Let's discuss it; that's what we're here for!

Let's use this blog's favourite example: the shopping cart. Let's say we defined the following events (in TypeScript, but treat it just as syntax):

```ts
export type ProductItemAddedToShoppingCart = Event<
  'ProductItemAddedToShoppingCart',
  {
    shoppingCartId: string;
    clientId: string;
    productItem: PricedProductItem;
    addedAt: Date;
  }
>;

export type ProductItemRemovedFromShoppingCart = Event<
  'ProductItemRemovedFromShoppingCart',
  {
    shoppingCartId: string;
    productItem: PricedProductItem;
    removedAt: Date;
  }
>;

export type ShoppingCartConfirmed = Event<
  'ShoppingCartConfirmed',
  {
    shoppingCartId: string;
    confirmedAt: Date;
  }
>;

export type ShoppingCartCancelled = Event<
  'ShoppingCartCancelled',
  {
    shoppingCartId: string;
    cancelledAt: Date;
  }
>;

export type ShoppingCartEvent =
  | ProductItemAddedToShoppingCart
  | ProductItemRemovedFromShoppingCart
  | ShoppingCartConfirmed
  | ShoppingCartCancelled;

export interface ProductItem {
  productId: string;
  quantity: number;
}

export type PricedProductItem = ProductItem & {
  unitPrice: number;
};
```

**They show what can happen in our shopping cart's lifetime.** They're [as small as possible, but not smaller](/pl/events_should_be_as_small_as_possible/). They're granular and focused on business but have some potential redundancy by all having shopping cart id. I want to keep events expressive and telling what has happened. I wrote in another article on [the danger of slicing too much from events](/pl/on_putting_stream_id_in_event_data/).

**Of course, this is the grey area and a careful act of balancing where to put where.** For instance, I put the client ID only in product items added to the shopping cart. I expect it to be always the first event in the stream, and I don't want to repeat it. Why? Because the stream represents a shopping cart, keeping the shopping cart id can be seen as explicit information about the context; the client id is an additional reference to another stream. That's why I'm not repeating the client id in other events. But maybe I should?

What if we'd like to have the read model that aggregates the general summary of client's pending, confirmed and cancelled shopping carts? It could be defined as:

```ts
export type ClientShoppingSummary = {
  clientId: string;
  pending: PendingSummary | undefined;
  confirmed: ConfirmedSummary;
  cancelled: CancelledSummary;
};

export type ShoppingSummary = {
  productItemsCount: number;
  totalAmount: number;
};

export type PendingSummary = ShoppingSummary & {
  cartId: string;
};

export type ConfirmedSummary = ShoppingSummary & {
  cartsCount: number;
};

export type CancelledSummary = ShoppingSummary & {
  cartsCount: number;
};
```

It contains the pending shopping cart information (if there's such a thing) plus the total number of confirmed and cancelled shopping carts, their total amounts, and total product item counts. 

**The id of our read model is equal to the client id. Every client will have a single summary.**

To build this read model, we need to correlate events with respective records. We'll be applying events sequentially. We need to know which record they need to update. If our read model id is equal to the client id, then best if we have the client id in events. But besides the Product Item Added event, we don't. 

Of course, we could reconsider adding it to all the events, but we already discussed that we would not necessarily like to. So what should we do? 

**We could query some other read model (e.g. shopping cart details) and load the client id, but then we'd have an even worse problem.** Tying those two models together and decreasing scaling and isolation. That's an important aspect, [I wrote about it here](https://event-driven.io/en/projections_and_read_models_in_event_driven_architecture/#scaling-and-data-isolation). 

**Still, if we think that business-wise, data should always be there, then we could use event metadata.** Besides the regular data, events can also have metadata, so common information that is typically used for some generic processing could also (if needed) be used for business processing. That's always a steep hill, and you better be careful not to make metadata a "bag for random data." This definitely can be a hidden trap. There are no hard rules here, but some good heuristics.

**We can look at our endpoints and commands that initiate business logic, resulting in events.** For instance, if we look at:

```
POST /clients/:clientId/shopping-carts/current/product-items

DELETE /clients/:clientId/shopping-carts/current/product-items

POST /clients/:clientId/shopping-carts/current/confirm

DELETE /clients/:clientId/shopping-carts/current

GET /clients/:clientId/shopping-carts/current
```

Then, we see that all of them are in the current shopping cart context and the specific client. That can lead to the conclusion that we already have this client context in our requests. Maybe it's used for authorisation, maybe for tenancy reasons. 

If that's not visible in endpoints, we can check on our authorisation rules and middleware. They typically need some data based on the currently authenticated user.

Having that, we could consider making the client id a part of the shopping cart event metadata. This could look as follows:

```ts
export type ShoppingCartEventMetadata = { clientId: string };

export type ProductItemAddedToShoppingCart = Event<
  'ProductItemAddedToShoppingCart',
 {
    shoppingCartId: string;
    clientId: string;
    productItem: PricedProductItem;
    addedAt: Date;
 },
  ShoppingCartEventMetadata
>;

export type ProductItemRemovedFromShoppingCart = Event<
  'ProductItemRemovedFromShoppingCart',
 {
    shoppingCartId: string;
    productItem: PricedProductItem;
    removedAt: Date;
 },
  ShoppingCartEventMetadata
>;

export type ShoppingCartConfirmed = Event<
  'ShoppingCartConfirmed',
 {
    shoppingCartId: string;
    confirmedAt: Date;
 },
  ShoppingCartEventMetadata
>;

export type ShoppingCartCancelled = Event<
  'ShoppingCartCancelled',
 {
    shoppingCartId: string;
    cancelledAt: Date;
 },
  ShoppingCartEventMetadata
>;
```

If we [define also such metadata for our commands](https://github.com/event-driven-io/emmett/blob/49d2b1fb1444f0fb129c327a27c06b7ec7c94ff2/samples/webApi/expressjs-with-postgresql/src/shoppingCarts/businessLogic.ts#L25), we can pass it as that:

```ts
 // Confirm Shopping Cart
router.post(
  '/clients/:clientId/shopping-carts/current/confirm',
  on(async (request: Request) => {
    const clientId = assertNotEmptyString(request.params.clientId);
    const shoppingCartId = getShoppingCartId(
      assertNotEmptyString(request.params.clientId),
    );

    const command: ConfirmShoppingCart = {
      type: 'ConfirmShoppingCart',
      data: { shoppingCartId },
      // 👇 See what we did here
      metadata: { clientId, now: getCurrentTime() },
    };

    await handle(eventStore, shoppingCartId, (state) =>
      confirm(command, state),
    );

    return NoContent();
  }),
);

// Business logic
export const confirm = (
  command: ConfirmShoppingCart,
  state: ShoppingCart,
): ShoppingCartConfirmed => {
  if (state.status !== 'Opened')
    throw new IllegalStateError('Shopping Cart is not opened');

  const totalQuantityOfAllProductItems = sum(state.productItems.values());

  if (totalQuantityOfAllProductItems <= 0)
    throw new IllegalStateError('Shopping Cart is empty');

  const {
    data: { shoppingCartId },
    metadata,
  } = command;

  return {
    type: 'ShoppingCartConfirmed',
    data: {
      shoppingCartId,
      confirmedAt: metadata?.now ?? new Date(),
    },
    // 👇 See what we did here
    metadata: { clientId: metadata!.clientId },  
  };
};
```

I'm using [TypeScript, Express.js and Emmett](https://event-driven-io.github.io/emmett/getting-started.html#webapi-definition), but I'm sure that you can translate that to your favourite language and tech stack. 

As we now have the client ID in metadata, we could use it for the event to read model correlation. For instance, using [Emmett+Pongo projections](/pl/emmett_projections_testing/):

```ts
const clientShoppingSummaryCollectionName = 'ClientShoppingSummary';

export const clientShoppingSummaryProjection = pongoMultiStreamProjection({
  collectionName: clientShoppingSummaryCollectionName,
  // 👇 See what we did here
  getDocumentId: (event) => event.metadata.clientId,
  evolve,
  canHandle: [
    'ProductItemAddedToShoppingCart',
    'ProductItemRemovedFromShoppingCart',
    'ShoppingCartConfirmed',
    'ShoppingCartCancelled',
 ],
});
```

We're saying that to find the document ID for each shopping cart event, you can use _event.metadata.clientId_.

Then, the projection definition can look as follows:

```ts
const evolve = (
  document: ClientShoppingSummary | null,
 { type, data: event, metadata }: ShoppingCartEvent,
): ClientShoppingSummary | null => {
  const summary: ClientShoppingSummary = document ?? {
    clientId: metadata!.clientId,
    pending: undefined,
    confirmed: initialSummary,
    cancelled: initialSummary,
 };

  switch (type) {
    case 'ProductItemAddedToShoppingCart':
      return {
        ...summary,
        pending: {
          cartId: event.shoppingCartId,
          ...withAdjustedTotals({
            summary: summary.pending,
            with: event.productItem,
            by: 'adding',
          }),
        },
    };
    case 'ProductItemRemovedFromShoppingCart':
      return {
        ...summary,
        pending: {
          cartId: event.shoppingCartId,
          ...withAdjustedTotals({
            summary: summary.pending,
            with: event.productItem,
            by: 'removing',
          }),
        },
    };
    case 'ShoppingCartConfirmed':
      return {
        ...summary,
        pending: undefined,
        confirmed: {
          cartsCount: summary.confirmed.cartsCount + 1,
          ...withAdjustedTotals({
            summary: summary.confirmed,
            with: summary.pending!,
            by: 'adding',
          }),
      },
    };
    case 'ShoppingCartCancelled':
      return {
        ...summary,
        pending: undefined,
        cancelled: {
          cartsCount: summary.confirmed.cartsCount + 1,
          ...withAdjustedTotals({
            summary: summary.confirmed,
            with: summary.pending!,
            by: 'adding',
          }),
        },
    };
    default:
      return summary;
    }
};

const initialSummary = {
  cartsCount: 0,
  productItemsCount: 0,
  totalAmount: 0,
};

const withAdjustedTotals = (options: {
  summary: ShoppingSummary | undefined;
  with: PricedProductItem | ShoppingSummary;
  by: 'adding' | 'removing';
}) => {
  const { summary: document, by } = options;

  const totalAmount =
    'totalAmount' in options.with
      ? options.with.totalAmount
      : options.with.unitPrice * options.with.quantity;
  const productItemsCount =
    'productItemsCount' in options.with
      ? options.with.productItemsCount
      : options.with.quantity;

  const plusOrMinus = by === 'adding' ? 1 : -1;

  return {
    ...document,
    totalAmount: (document?.totalAmount ?? 0) + totalAmount * plusOrMinus,
    productItemsCount:
      (document?.productItemsCount ?? 0) + productItemsCount * plusOrMinus,
 };
};
```

Is it the best option? It depends on the use case. I'd always treat it as a tradeoff and evaluate if there are other options (e.g. [in-flight event transformations](/pl/event_transformations_and_loosely_coupling/)). Still, I hope this article gives you enough context for the tradeoff analysis and making educated decisions in your design.

Read also more in:
- [Anti-patterns in event modelling - I'll just add one more field](/pl/i_will_just_add_one_more_field/).
- [Stream ids, event types prefixes and other event data you might not want to slice off](/pl/on_putting_stream_id_in_event_data/)
- [Events should be as small as possible, right?](/pl/events_should_be_as_small_as_possible/)
- [Event transformations, a tool to keep our processes loosely coupled](/pl/projections_and_read_models_in_event_driven_architecture/)
- [How to create projections of events for nested object structures?](/pl/how_to_create_projections_of_events_for_nested_object_structures/)
- [Guide to Projections and Read Models in Event-Driven Architecture](/pl/event_transformations_and_loosely_coupling)

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
