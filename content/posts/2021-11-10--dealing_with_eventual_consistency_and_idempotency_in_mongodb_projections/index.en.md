---
title: Dealing with Eventual Consistency and Idempotency in MongoDB projections
category: "API"
cover: 2021-11-10-cover.png
author: oskar dudycz
---

Auditability, diagnostics, time travelling are usually the first mentioned features when speaking about Event Sourcing. All of them are great, but to me, projections are the real killer feature of an event-driven approach. Why?

Projections are different interpretations of the same fact. Look at the photo below. Muhammad Ali is standing in triumph over Sonny Liston. Each of them interprets the same fact from an entirely different perspective.

![cover](2021-11-10-cover.png)

The same happens in our systems. Let's take a shopping cart as an example. After we added a product item to the shopping cart, we have to:
- update details of the shopping cart,
- increase the total amount in the summary view,
- adjust the number of products in the inventory,
- send a notification in the user menu.

All of that is triggered by a single _ProductItemAddedToShoppingCart_ event.

Projections have multiple advantages for the development process. The one that I'd like to highlight especially is reducing the cognitive load. You can break down a process into two parts. At first, on modelling the business logic and capturing its result. Then thinking about how to interpret it. This is a liberating experience from thinking all at once in the relational approach. "Gosh, when I add that field, then this will break foreign key. How do I do this migration?". Of course, we'll eventually need to think about connecting our event with the read model, but we can split that thought process.

Projections are powerful but also non-trivial. In theory, it's just a left-fold approach: you take the current state and apply event data, getting a new one. Yet, things can get more complex if we want a robust, fault-tolerant solution. Especially, the distributed environment may be challenging. As I described in the [Outbox, Inbox patterns and delivery guarantees explained](/en/outbox_inbox_patterns_and_delivery_guarantees_explained/), to be sure that our events are processed, we need to include durable storage, retry policies etc. That's how [EventStoreDB subscriptions](https://developers.eventstore.com/clients/grpc/subscriptions.html), [Marten's Async Daemon](https://martendb.io/events/projections/async-daemon.html), [Kafka Consumers](https://www.oreilly.com/library/view/kafka-the-definitive/9781491936153/ch04.html) work. We get more onto our plate by making solution resilient and fault-tolerant, e.g. eventual consistency and idempotency handling. We don't know when something will be processed.  We also don't know how many times we'll get the same message. We need to take that into account while designing our solution.

Some databases add more to that, e.g. MongoDB and ElasticSearch have latency between being able to read our writes. Recently I was hit by that.

Let's start with the business requirements. We'll be modelling the shopping cart process. We can add or remove items to open shopping carts (which have not yet been confirmed). When adding a new product item, the new element is added to the list. If we're adding an already existing product item, we should increase the quantity instead of adding a new element. Accordingly, if we're removing a product, we should decrease the quantity unless we zeroed it. Then we have to remove the whole item from the list.

This could be coded in TypeScript as:

```typescript
export type ProductItem = Readonly<{
  productId: string;
  quantity: number;
}>;

export function findProductItem(
  productItems: ProductItem[],
  productId: string
): ProductItem | undefined {
  return productItems.find((pi) => pi.productId === productId);
}

export function addProductItem(
  productItems: ProductItem[],
  newProductItem: ProductItem
): ProductItem[] {
  const { productId, quantity } = newProductItem;

  const currentProductItem = findProductItem(productItems, productId);

  if (!currentProductItem) return [...productItems, newProductItem];

  const newQuantity = currentProductItem.quantity + quantity;
  const mergedProductItem = { productId, quantity: newQuantity };

  return productItems.map((pi) =>
    pi.productId === productId ? mergedProductItem : pi
  );
}

export function removeProductItem(
  productItems: ProductItem[],
  newProductItem: ProductItem
): ProductItem[] {
  const { productId, quantity } = newProductItem;

  const currentProductItem = findProductItem(productItems, productId);

  const newQuantity = (currentProductItem?.quantity ?? 0) - quantity;

  if (newQuantity < 0) throw 'PRODUCT_ITEM_NOT_FOUND';

  if (newQuantity === 0)
    return productItems.filter((pi) => pi.productId !== productId);

  const mergedProductItem = { productId, quantity: newQuantity };

  return productItems.map((pi) =>
    pi.productId === productId ? mergedProductItem : pi
  );
}
```

As you see, we need to have both the current state and new data to calculate the result correctly. We're performing a merge, not just simple addition. 

Events in our process could look like:

```typescript
export type ShoppingCartOpened = Event<
  'shopping-cart-opened',
  {
    shoppingCartId: string;
    clientId: string;
    openedAt: Date;
  }
>;

export type ProductItemAddedToShoppingCart = Event<
  'product-item-added-to-shopping-cart',
  {
    shoppingCartId: string;
    productItem: ProductItem;
  }
>;

export type ProductItemRemovedFromShoppingCart = Event<
  'product-item-removed-from-shopping-cart',
  {
    shoppingCartId: string;
    productItem: ProductItem;
  }
>;

export type ShoppingCartConfirmed = Event<
  'shopping-cart-confirmed',
  {
    shoppingCartId: string;
    confirmedAt: Date;
  }
>;
```

The need to have the current state to process events is harder to fulfil on databases that are eventually consistent by default. MongoDB is one of them. The merging logic presented above may result in erroneous results if the decision is made on the stale state. When you open a shopping cart and immediately add and remove some products, such a case may happen. Accordingly, we'll have the wrong result if we don't support idempotency well and apply _ProductItemAddedToShoppingCart_ twice or thrice. 

As I noted in the ["State Obsession" article](/en/state-obsession/), the alternative is modelling events differently. We could ask our business if the requirement for merging is a must. Maybe we could just add separate product items. This will work, assuming that write operations are linearizable and are applied in the right order. MongoDB allows granular update to the inner document collection (read more in [docs](https://docs.mongodb.com/manual/reference/operator/update/push/)). If we could just add or remove an item, we wouldn't need to get the current state to do that. Of course, we assume that the correctness of the operation was validated as the event was added to the write model, so we accept the event data as is.

Nevertheless, the requirement can be set to stone. Then we can try to juggle tradeoffs in the event design. We could send the whole merged list in the event data. But we'll lose the specific business information or duplicate the event data. It's not the best approach, but pragmatically it can help us to resolve issues. 

Some events, by their nature, are idempotent. As confirmation, in our case, just update the status, then we could apply it multiple times. As long as we can have an ordering guarantee (like EventStoreDB or Marten), applying the same event multiple times won't harm us.

Still, sometimes making decisions on the current state is unavoidable. What do to then?

Adding a new item is not affected by eventual consistency, as we're not reading anything, e.g.:

```typescript
export async function projectShoppingCartOpened(
  event: ShoppingCartOpened,
  streamRevision: number
): Promise<Result<boolean>> {
  const shoppingCarts = await shoppingCartsCollection();

  await shoppingCarts.insertOne({
    shoppingCartId: event.data.shoppingCartId,
    clientId: event.data.clientId,
    status: ShoppingCartStatus.Opened.toString(),
    productItems: [],
    openedAt: event.data.openedAt,
    revision: streamRevision,
  });

  return success(true);
}
```

Problems arise on the first update. If we rapidly add a new product to the shopping cart, then such code may not be enough:

```typescript
export async function projectProductItemAddedToShoppingCart(
  event: ProductItemAddedToShoppingCart
): Promise<Result<boolean>> {
  const shoppingCarts = await shoppingCartsCollection();

  const { productItems } = await shoppingCarts.findOne(
    {
      shoppingCartId: event.data.shoppingCartId,
        revision: streamRevision,
    },
    { projection: { productItems: 1, revision: 1 } }
   );

 await shoppingCarts.updateOne(
   {
      shoppingCartId: event.data.shoppingCartId,
    },
    {  
      $set: {
        productItems: addProductItem(productItems, event.data.productItem),
      },
    },
    { upsert: false }
  )

  return success(true);
}
```

Why this may fail? For various reasons. The first one is eventual consistency. The shopping cart opening may not be fully processed, and we don't see the new read model. Then _findOne_ will return not expected data.

What's more, we may be lucky, and the first product item addition succeed. But if we have immediately added another product, then the first update may not be yet processed. We may read the shopping cart state, getting a stale result with an empty cart. Then we may accidentally overwrite the state with the wrong value. To ensure we have the right state, we need to include the aggregate version/stream revision (read more in [Let's talk about positions in event stores](/en/lets_talk_about_positions_in_event_stores/)). EventStoreDB subscriptions, by default, provide you with this information. We can use it in the _findOne_ condition to check if the document is in the expected state. Then use it for the [optimistic concurrency check](/en/how_to_use_etag_header_for_optimistic_concurrency/) while updating the read model state.

```typescript
export async function projectProductItemAddedToShoppingCart(
  event: ProductItemAddedToShoppingCart,
  streamRevision: number
): Promise<Result<boolean>> {
  const shoppingCarts = await shoppingCartsCollection();
  const lastRevision = streamRevision - 1;

  const { productItems, revision } = await shoppingCarts.findOne(
    {
      shoppingCartId: event.data.shoppingCartId,
        revision: streamRevision,
    },
    { projection: { productItems: 1, revision: 1 } }
  );

  await shoppingCarts.updateOne(
    {
      shoppingCartId: event.data.shoppingCartId,
      revision: lastRevision,
    },
    {
      $set: {
        productItems: addProductItem(productItems, event.data.productItem),
        revision: streamRevision,
      },
    },
    { upsert: false }
  );

  return success(true);
}
```

Thanks to that, we ensure that we'll get a read model that matches the expected state: the one after processing the last event.

Still, that's just a guard. It's not yet a guarantee of always getting the current state. By adding this condition, we'll get _null_ when the state is not at a particular version/revision. As the changes may still propagate, we have to retry reads until we get the expected state. 

AWS [suggests following retry policy](https://docs.aws.amazon.com/general/latest/gr/api-retries.html):

```
Do some asynchronous operation.

retries = 0

DO
    wait for (2^retries * 100) milliseconds

    status = Get the result of the asynchronous operation.

    IF status = SUCCESS
        retry = false
    ELSE IF status = NOT_READY
        retry = true
    ELSE IF status = THROTTLED
        retry = true
    ELSE
        Some other error occurred, so stop calling the API.
        retry = false
    END IF

    retries = retries + 1

WHILE (retry AND (retries < MAX_RETRIES))
```

It's reasonable. Thanks to exponential backoff, we'll start retrying quicker but slow with each retry. We also have max retries to ensure that we won't fall into an infinite loop. We could implement retry code based on that as follows:

```typescript
export type RetryOptions = Readonly<{
  maxRetries?: number;
  delay?: number;
  shouldRetry?: (error: any) => boolean;
}>;

export const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  delay: 100,
  shouldRetry: () => true,
};

export async function retryPromise<T = never>(
  callback: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<T> {
  let retryCount = 0;
  const { maxRetries, delay, shouldRetry} = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };

  do {
    try {
      return await callback();
    } catch (error) {
      if (!shouldRetry(error) || retryCount == maxRetries) {
        console.error(`[retry] Exceeded max retry count, throwing: ${error}`);
        throw error;
      }

      const sleepTime = Math.pow(2, retryCount) * delay + Math.random() * delay;

      console.warn(
        `[retry] Retrying (number: ${
          retryCount + 1
        }, delay: ${sleepTime}): ${error}`
      );

      await sleep(sleepTime);
      retryCount++;
    }
  } while (true);
}
```

I also added a random factor. This is critical, especially if we have _cron_ based logic. If we have multiple instances banging some service with the same cadence, we may overload it. Adding random will distribute the load. Of course, you should consider using tools, like [Polly](https://github.com/App-vNext/Polly), before writing your own code. 

As the final touch, let's add a helper for retrying when the document was not found:

```typescript
export async function assertFound<T>(() => find: Promise<T | null>): Promise<T> {
  const result = await find();

  if (result === null) {
    throw 'DOCUMENT_NOT_FOUND';
  }

  return result;
}

export function retryIfNotFound<T>(
  find: () => Promise<T | null>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<T> {
  return retryPromise(() => assertFound(find), options);
}
```

We can also add a similar wrapper for updates:

```typescript
export async function assertUpdated(
  update: () => Promise<UpdateResult>
): Promise<UpdateResult> {
  const result = await update();

  if (result.modifiedCount === 0) {
    throw 'FAILED_TO_UPDATE_DOCUMENT';
  }

  return result;
}

export function retryIfNotUpdated(
  update: () => Promise<UpdateResult>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<UpdateResult> {
  return retryPromise(() => assertUpdated(update), options);
}
```

Thanks to that, we can compose our logic using the wrappers:

```typescript
export async function projectProductItemAddedToShoppingCart(
  event: ProductItemAddedToShoppingCart,
  streamRevision: number
): Promise<Result<boolean>> {
  const shoppingCarts = await shoppingCartsCollection();
  const lastRevision = streamRevision - 1;

  const { productItems, revision } = await retryIfNotFound(() =>
    shoppingCarts.findOne(
      {
        shoppingCartId: event.data.shoppingCartId,
        revision: streamRevision,
      },
      { projection: { productItems: 1, revision: 1 } }
    )
  );

 await assertUpdated(
    shoppingCarts.updateOne(
      {
        shoppingCartId: event.data.shoppingCartId,
        revision: lastRevision,
      },
      {
        $set: {
          productItems: removeProductItem(productItems, event.data.productItem),
          revision: streamRevision,
        },
      },
      { upsert: false }
    )
  );

  return success(true);
}
```

Now we're sure that we'll get the expected state eventually. Adding the _revision: lastRevision_ to the update filter and setting _revision: streamRevision_ will ensure that we do not update the state more than once.

Though, it's not yet fully idempotent. We wouldn't like to fail when we successfully added a product item and the event is processed again (because of some retry). We'd want to just skip processing. For that case, stream revision will be equal to the event revision, so we need to change the check to greater or equal (_$gte_) and _if_ to skip processing. The final code will look like this:

```typescript
export async function projectProductItemRemovedFromShoppingCart(
  event: ProductItemRemovedFromShoppingCart,
  streamRevision: number
): Promise<Result<boolean>> {
  const shoppingCarts = await shoppingCartsCollection();
  const lastRevision = streamRevision - 1;

  const { productItems, revision } = await retryIfNotFound(() =>
    shoppingCarts.findOne(
      {
        shoppingCartId: event.data.shoppingCartId,
        revision: { $gte: lastRevision },
      },
      { projection: { productItems: 1, revision: 1 } }
    )
  );

  if (revision > lastRevision) {
    return success(false);
  }

  await assertUpdated(
    shoppingCarts.updateOne(
      {
        shoppingCartId: event.data.shoppingCartId,
        revision: lastRevision,
      },
      {
        $set: {
          productItems: removeProductItem(productItems, event.data.productItem),
          revision: streamRevision,
        },
      },
      { upsert: false }
    )
  );

  return success(true);
}
```

You can check the whole processing code in my [NodeJS samples](https://github.com/oskardudycz/EventSourcing.NodeJS/blob/optimistic_concurrency/samples/optimisticConcurrency/src/shoppingCarts/gettingById/projection.ts). 

Of course, what I showed here is the handling of the single stream. For multiple, things get more complex. We either have to maintain various revisions for each stream or store the event's global position in a separate collection. By that, we can enforce the uniqueness constraint, storing them together in the same transaction. Still, the general logic will remain the same. 

The same pattern can be applied to other databases with eventual consistency, e.g. ElasticSearch, CosmosDB, DynamoDB. In other languages, implementation will also look similar.

The above explanation assumes that we have ordering guarantees on the event handler processing. For instance, if you add item A to Cart X, then remove it, you will always see the _ProductItemAddedToShoppingCart_ event before the _ProductItemRemovedToShoppingCart_. EventStoreDB guarantees global ordering even between the streams (e.g. Kafka doesn't have full ordering guarantees). Dealing with out of order events is a topic for a dedicated blog article.

What's your experience with eventual taming consistency and idempotency issues?

Cheers!

Oskar

p.s. if you liked this article check also:
- [How to build event-driven projections with Entity Framework](/en/how_to_do_events_projections_with_entity_framework/)
- [How to scale projections in the event-driven systems?](/en/how_to_scale_projections_in_the_event_driven_systems/)
- [How to create projections of events for nested object structures?](/en/how_to_create_projections_of_events_for_nested_object_structures/)