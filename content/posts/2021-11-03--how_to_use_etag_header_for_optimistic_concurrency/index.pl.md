---
title: How to use ETag header for optimistic concurrency
category: "API"
cover: 2021-11-03-cover.png
author: oskar dudycz
---

![cover](2021-11-03-cover.png)

In my article ["Optimistic concurrency for the pesimistic times"](/pl/optimistic_concurrency_for_pessimistic_times/), I described the premises for optimistic concurrency handling. As a reminder, we assume that conflict situations will be rare. A conflict arises when two people try to change the same record at the same time. When this happens, we will only allow the first person to update the state. All other updates will be rejected. For verification, we use a record version that changes with each save.

What does an optimistic concurrency implementation look like?
1. Return the entity's current version while reading the data.
2. Modify the state and send it with the (unchanged) version.
3. Check if the version from the database equals the expected version sent in the request.
4. If they match, allow saving, make the change and set a new entity version in the database (e.g. increment it)
5. If not, throw or return an error.

So much for the theory. However, how, in practice, can we handle transferring the version between the web/mobile application and the application server?

The [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) header can help with that. Originally it was invented to aid cache handling.

When the server returns a result, it computes a value representing the currently returned data. This value is passed as the response _ETag_ header. It can be a hash or an obligatory value, e.g. a version number.

When the client gets data from the server, it can cache the _ETag_ header value and the data itself. Then, when it wants to get the latest state, it can pass the downloaded _ETag_ value as the _If-None-Match_ header. The server should only return new data if something has changed. Otherwise, it should return the status [304](https://http.cat/304). Based on that client either replaces the cached data or assume that nothing has changed (in the case of _304_ status).

This is precisely how browsers work. They have built-in support for _ETag_ and _If-None-Match_ headers and use it for caching the results. If we make a mistake in the algorithm calculating the _ETag_ value, we can cause that client applications will not be able to refresh their cache. Of course, this may be dangerous, especially in the context of web applications.

_ETag_ is have two formats:
- _Strong_, a globally unique value, 
- _Weak_ (with the prefix _W/_) is unique only in a particular context.

The difference is similar to the [_Uuid_](https://en.wikipedia.org/wiki/Universally_unique_identifier) and numeric identifiers in relational databases. _Uuid_ is unique globally for the whole database; numeric, only in the context of a given table.

We could model ETag in TypeScript as follows:

```typescript
export type WeakETag = `W/${string}`;
export type ETag = WeakETag | string;

export function isWeakETag(etag: ETag): etag is WeakETag {
  return etag.startsWith('W/');
}

export function getWeakETagValue(etag: WeakETag): string {
  return etag.substr('W/'.length);
}

export function toWeakETag(value: any): WeakETag {
  return `W/"${value}"`;
}
```

For _ETag_, an example of the _strong_ format would be concatenating the _Uuid_ record's identifier and its version. The _weak_ format can be, e.g. numeric id joined with version (in the context of the whole collection) or just version (in the context of specific record).

To use _ETag_ for optimistic concurrency, we need to use the _If-Match_ header. While sending a request to change the state (e.g. _PUT_), we should send the expected state version as the value of the _If-Match_ header. The server should check if the _ETag_ value is equal to the current one. If it equals, save succeed. Otherwise, it should send the [412](https://http.cat/412) response status.

Example code for parsing the _ETag_ value from _If-Match_ header in TypeScript:

```typescript
export function getETagFromIfMatch(
  request: Request
): ETag {
  const etag = request.headers['if-match'];

  if (etag === undefined) {
    throw 'MISSING_IF_MATCH_HEADER';
  }
  return <ETag>etag;
}

export function getWeakETagValueFromIfMatch(
  request: Request
): string {
  const etag = getETagFromIfMatch(request);

  if (!isWeakETag(etag)) throw 'WRONG_WEAK_ETAG_FORMAT';

  return getWeakETagValue(etag);
}
```

Let's see how we could handle ETags and optimistic concurrency using the shopping cart flow example. We're running the Black Friday frenzy together with our partner. Still, we'd like to be sure that we know what we're doing and, e.g. do not order the same stuff twice.

1. Get the current shopping cart together with it's version send as a _weak ETag_:

```bash
$ curl -i we-buy-everything.com/api/clients/595d54aa/shopping-carts/ce601dc7

HTTP/1.1 200 OK
ETag: W/"1"
{
    id: 595d54aa,
    productItems: [],
    revision: 1
}
```

Implementation in Express NodeJS framework could look like:

```typescript
export const route = (router: Router) =>
  router.get(
    '/clients/:clientId/shopping-carts/:shoppingCartId',
    async function (request: Request, response: Response, next: NextFunction) {
      try {
        const query = mapRequestToQuery(request);

        const result = await getShoppingCartDetails(query);

        response.set('ETag', toWeakETag(result.revision));
        response.send(result);
      } catch (error) {
        next(error);
      }
    }
  );

function mapRequestToQuery(
  request: Request
): GetShoppingCartDetails {
  if (!isNotEmptyString(request.params.shoppingCartId)) {
    throw 'Invalid request';
  }

  return {
    shoppingCartId: request.params.shoppingCartId,
  };
}

```

_**Note:** If you want to use custom ETag handling in Express, you have to disable the default behaviour:_

```typescript
const app: Application = express();

app.set('etag', false);
```

2. Modify the state (e.g. add a new product item to the shopping cart) and send it together with the (unchanged) version.

```bash
$ curl -i -X POST \
  -H 'Content-Type: application/json' \
  -d '{ "productId":"4f3321fc", "quantity": 1 }' \
  -H 'If-Match: W/"1"' \
  we-buy-everything.com/api/clients/595d54aa/shopping-carts/ce601dc7/product-items

HTTP/1.1 200 OK
ETag: W/"2"
```

3. When someone else tries to update the state with the obsolete value (e.g. your partner trying to add the same product), return an _412_ error code:

```bash
$ curl -i -X POST \
 -H 'Content-Type: application/json' \
 -d '{ "productId":"4f3321fc", "quantity": 3 }' \
 -H 'If-Match: W/"1"' \
 we-buy-everything.com/api/clients/595d54aa/shopping-carts/ce601dc7/product-items

HTTP/1.1 412 Precondition Failed
```

4. The client must then get the latest state together with new version.

```bash
$ curl -i we-buy-everything.com/api/clients/595d54aa/shopping-carts/ce601dc7

HTTP/1.1 200 OK
ETag: W/"2"
{
    id: ce601dc7-ea93-4b7c-879a-bdb4c187adfa,
    productItems: [{ productId:4f3321fc, quantity: 1 }]
    revision: 2
}
```

5. And then make the change again, if it makes sense, using the new value from the _ETag_ header:

```bash
$ curl -i -X PUT \
 -H 'Content-Type: application/json' \
 -d '{ "productId":"4f3321fc", "quantity": 3 }' \
 -H 'If-Match: W/"2"' \
 we-buy-everything.com/api/clients/595d54aa/shopping-carts/ce601dc7

HTTP/1.1 200 OK
ETag: W/"3"
```

Example implementation of the update support, could look like:

```typescript
export const route = (router: Router) =>
  router.post(
    '/clients/:clientId/shopping-carts/:shoppingCartId/products',
    async function (request: Request, response: Response, next: NextFunction) {
      try {
        const command = mapRequestToCommand(request);

        const streamName = getShoppingCartStreamName(
          command.data.shoppingCartId
        );

        const result = await getAndUpdate(
          addProductItemToShoppingCart,
          streamName,
          command
        );

        response.set('ETag', toWeakETag(result.nextExpectedRevision));
        response.sendStatus(200);
      } catch (error) {
        if(error.type === ErrorType.WRONG_EXPECTED_VERSION)
            return next({ status: 412 });

        next(error);
      }
    }
  );

function mapRequestToCommand(request: Request): AddProductItemToShoppingCart {
  if (
    !isNotEmptyString(request.params.shoppingCartId) ||
    !isNotEmptyString(request.params.productId) ||
    !isPositiveNumber(request.body.quantity)
  ) {
    throw 'INVALID_REQUEST';
  }

  const expectedRevision = getWeakETagValueFromIfMatch(request);

  return {
    data: {
      shoppingCartId: request.params.shoppingCartId,
      productItem: {
        productId: request.body.productId,
        quantity: request.body.quantity,
      },
    },
    metadata: {
      $expectedRevision: expectedRevision,
    },
  };
}
```

I'm using EventStoreDB as an example, but the logic will be the same for most databases and frameworks. Supporting optimistic concurrency is a must for a mature production-grade system.

EventStoreDB append even will make sure that provided revision matches with the one from the database. It will also return a new expected one as the result of the operation. We can use it to produce the new _ETag_ header value in response. If the revisions don't match, it will throw _WrongExpectedVersionError_.

_ETag_ header is mapped from the header and passed through command metadata. The _getAndUpdate_ method takes command, command handler and stream name. The first step is to retrieve state from events (read more on that in [How to get the current entity state from events?](/pl/how_to_get_the_current_entity_state_in_event_sourcing/)). Both events and command are passed to the command handler, where the business logic is run. As a result, we're getting a new event that we can store in EventStoreDB. We're doing that together with the expected revision to perform an optimistic concurrency check. See details below:

```typescript
export function addProductItemToShoppingCart(
  events: ShoppingCartEvent[],
  command: AddProductItemToShoppingCart
): ProductItemAddedToShoppingCart {
  const shoppingCart = aggregateStream<
    ShoppingCart,
    ShoppingCartEvent
  >(events, when);

  if (shoppingCart.status & ShoppingCartStatus.Closed) {
    throw 'SHOPPING_CARD_CLOSED';
  }

  return {
    type: 'product-item-added-to-shopping-cart',
    data: {
      shoppingCartId: command.data.shoppingCartId,
      productItem: command.data.productItem,
    },
  };
}

export async function getAndUpdate<
  CommandType extends Command,
  StreamEventType extends Event
>(
  handle: (
    currentEvents: StreamEventType[],
    command: CommandType
  ) => StreamEventType,
  streamName: string,
  command: CommandType
): Promise<AppendResult> {
  const eventStore = getEventStore();

  const currentEvents = await readFromStream<StreamEventType>(eventStore, streamName);

  const newEvent = handle(currentEvents, command);

  const expectedRevision = command.metadata?.$expectedRevision
    ? BigInt(command.metadata?.$expectedRevision)
    : undefined;

  return appendToStream(eventStore, streamName, [newEvent], {
    expectedRevision,
  });
}

export async function readFromStream<StreamEventType extends Event>(
  eventStore: EventStoreDBClient,
  streamName: string,
  options?: ReadStreamOptions
): Promise<StreamEventType[]> {
  const events: StreamEventType[] = [];

  for await (const resolvedEvent of eventStore.readStream(
    streamName,
    options
  )) {
    if (resolvedEvent.event === undefined) continue;

    events.push(<StreamEventType>{
      type: resolvedEvent.event!.type,
      data: resolvedEvent.event!.data,
      metadata: resolvedEvent.event?.metadata,
    });
  }

  return events;
}

export function appendToStream<StreamEventType extends Event>(
  client: EventStoreDBClient,
  streamName: string,
  events: StreamEventType[],
  options?: AppendToStreamOptions
): Promise<AppendResult> {
  const jsonEvents: EventData[] = events.map((event) =>
    jsonEvent({
      type: event.type,
      data: event.data,
      metadata: event.metadata,
    })
  );

  return client.appendToStream(streamName, jsonEvents, options);
}
```

See the full sample in: https://github.com/oskardudycz/EventSourcing.NodeJS/pull/14.

Optimistic concurrency also allows you to simplify logic and, especially in non-relational databases, obtain strong guarantees without using such heavy tools as unique keys, foreign keys, etc. We can skip those checks if we know that we are making business decisions based on the latest state of our data.

Cheers!

Oskar