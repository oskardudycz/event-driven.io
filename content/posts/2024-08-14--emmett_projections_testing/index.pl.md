---
title: Writing and testing event-driven projections with Emmett, Pongo and PostgreSQL
category: "Event Sourcing"
cover: 2024-08-14-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![](2024-08-14-cover.png)

**In the [previous article](/pl/emmett_postgresql_event_store/), I told what happened when [Emmett](https://event-driven-io.github.io/emmett/getting-started.html) and [Pongo](https://event-driven-io.github.io/Pongo/getting-started.html) walked into a bar. In other words, I announced that you can now do Event Sourcing in Node.js on top of PostgreSQL.** You can use Emmett as an event store and Pongo, changing PostgreSQL into a document Mongo-like database. With all the strong consistency benefits and integration happening behind the scenes.

**Let's explore this in more detail today, focusing on the single-stream projection.** 

In event sourcing, a stream represents the history of a specific process or object, such as a shopping cart. After each business operation, a new event is appended to the end of the stream. For business logic, we're getting all events (so facts), interpreting them, and building the current state in memory. That works well for business logic, as streams should be short, and this shouldn't take long. You can read more about it in [How to get the current entity state from events?](/pl/how_to_get_the_current_entity_state_in_event_sourcing/)

Yet, reading more than one record wouldn't play well. For that, we need to materialise our data into read models. We can apply our events and store the result in the database table; then, we can apply filtering and get the set of results. Projections are functions that transform events into read models. Check more in [Guide to Projections and Read Models in Event-Driven Architecture](/pl/projections_and_read_models_in_event_driven_architecture/).

Some event stores, like EventStoreDB, separate the event storage and read model storage. That allows its creators to focus on making one thing right. Still, in many cases, it's more than enough to just use PostgreSQL. That's what the Emmett and Pongo combination does pretty well!

## Single Stream Projections with Pongo

Let's install Emmett PostgreSQL package:

```shell
$ npm add @event-driven-io/emmett-postgresql
```

Behind the scenes, it'll also install Emmett and Pongo as peer dependencies, so you don't need to install them separately.

Now we'll define a simplified Shopping Cart flow, expressing it by the events that can happen:

```ts
import { type Event } from '@event-driven-io/emmett';

type ProductItemAdded = Event<
  'ProductItemAdded',
  { productItem: PricedProductItem; addedAt: Date }
>;

type ProductItemRemoved = Event<
  'ProductItemAdded',
  { productItem: PricedProductItemm; removedAt: Date }
>;

type PricedProductItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

type DiscountApplied = Event<
  'DiscountApplied',
  { percent: number; couponId: string; discountedAt: Date }
>;

type ShoppingCartConfirmed = Event<
  'ShoppingCartConfirmed',
  { confirmedAt: Date }
>;

type ShoppingCartEvent = 
  | ProductItemAdded
  | ProductItemRemoved 
  | DiscountApplied
  | ShoppingCartConfirmed;
```

We'll skip the business logic part; you can learn about it in detail in [Emmett's Getting Started Guide](https://event-driven-io.github.io/emmett/getting-started.html#commands). Let's go straight to thinking about read models.

Let's say that we want to show the summary of the shopping cart, showing just the total items count and amount. This could be used, e.g., in the top menu bar, to give users quick feedback. It could be defined as:

```ts
type ShoppingCartSummary = {
  _id?: string;
  productItemsCount: number;
  totalAmount: number;
};
```

Now, let's define how we'd like to apply those events:

```ts
const evolve = (
  document: ShoppingCartSummary | null,
  { type, data: event }: ProductItemAdded | ProductItemRemoved | DiscountApplied,
): ShoppingCartSummary => {
  document = document ?? { totalAmount: 0; productItemsCount: 0 }

  switch (type) {
    case 'ProductItemAdded': 
      return withAdjustedTotals({
        document,
        productItem: event.productItem,
        by: 'adding'
      });
    case 'ProductItemRemoved':
      return withAdjustedTotals({
        document,
        productItem: event.productItem,
        by: 'removing'
      });
    case 'DiscountApplied':
      return {
        ...document,
        totalAmount: (document.totalAmount * (100 - event.percent)) / 100,
      };
  }
};

const withAdjustedTotals = (
  options: { 
    document: ShoppingCartSummary; 
    productItem: PricedProductItem; 
    by: 'adding' | 'removing'
  }) => {
    const { document, productItem, by } = options;
    const plusOrMinus = by === 'adding' ? 1: -1;

    return {
      ...document,
      totalAmount:
        document.totalAmount +
        productItem.unitPrice * productItem.quantity * plusOrMinus,
      productItemsCount:
        document.productItemsCount + productItem.quantity * plusOrMinus,
    }; 
  }
```

As you see, the transformation may not need to handle all events. We don't need to know the status (whether it's confirmed or not); we just need information about totals.

The next step is to define our Pongo projection. We do it by:

```ts
import { pongoSingleStreamProjection } from '@event-driven-io/emmett-postgresql';

const collectionName = 'shopping_carts_summary';

const shoppingCartSummaryProjection = pongoSingleStreamProjection({
  canHandle: ['ProductItemAdded', 'ProductItemRemoved', 'DiscountApplied'],
  collectionName,
  evolve,
});
```

By that we're handling the specified range of events, applying it using the evolve function and storing the result in the specified Pongo collection (so the PostgreSQL table with JSONB column for document data).

If you don't like getting a null document in the evolve function, then you can also provide the initial state:

```ts
const shoppingCartSummaryProjection = pongoSingleStreamProjection({
  canHandle: ['ProductItemAdded', 'ProductItemRemoved', 'DiscountApplied'],
  collectionName,
  evolve,
  initialState: () => { totalAmount: 0; productItemsCount: 0 }
});
```

Then your evolve can skip the setup step and look as follows:

```ts
const evolve = (
  document: ShoppingCartSummary,
  { type, data: event }: ProductItemAdded | ProductItemRemoved | DiscountApplied,
): ShoppingCartSummary => {
  switch (type) {
    case 'ProductItemAdded': 
      return withAdjustedTotals({
        document,
        productItem: event.productItem,
        by: 'adding'
      });
    case 'ProductItemRemoved':
      return withAdjustedTotals({
        document,
        productItem: event.productItem,
        by: 'removing'
      });
    case 'DiscountApplied':
      return {
        ...document,
        totalAmount: (document.totalAmount * (100 - event.percent)) / 100,
      };
  }
};
```

Emmett will provide the initial state if the document with id equal to the stream name doesn't exist.

**We need to complete registration by passing it to event store options:**

```ts
import { projection } from '@event-driven-io/emmett';
import { getPostgreSQLEventStore } from '@event-driven-io/emmett-postgresql';

const connectionString =
  "postgresql://dbuser:secretpassword@database.server.com:3211/mydb";

const eventStore = getPostgreSQLEventStore(connectionString, {
  projections: projections.inline([
    shoppingCartSummaryProjection,
  ]),
});
```

Inline registration means that projections will update your read models in the same transaction as appending events. So, either all was stored or nothing. Of course, you need to be careful with them, as they can slow your appends, but they're really useful. Async projections will come in future releases.

Sounds cool; now we can append a few events through regular event store append events api and query results using Pongo:

```ts
import { getPostgreSQLEventStore } from '@event-driven-io/pongo';

const connectionString =
  "postgresql://dbuser:secretpassword@database.server.com:3211/mydb";

const pongo = pongoClient(connectionString);

const shoppingCartsSummary = pongo.db().collection('shopping_carts_summary');

const summary = await shoppingCartsSummary.findOne({ _id : 'shopping_cart-123' });
```

Cool, but manually querying data isn't the best long-term solution. Wouldn't it be possible to test it automatically? Yes, it would.

**That's why Emmett gives you a built-in way to test projections.**

## Testing projections

In the same way as testing other parts of your development flow (read more in [Testing Event Sourcing, Emmett edition](/pl/testing_event_sourcing_emmett_edition/)).

Before we start, let's install PostgreSQL Test Containers. We'll need them soon:

```shell
$ npm add @testcontainers/postgresql
```

As I described in [How to test event-driven projections](/pl/testing_event_driven_projections/), projection tests should be tested against the real database. Both querying and update capabilities and serialisation can play tricks, so it is better to be certain that it really works. Tests that don't give us such assurance are useless. And we don't want them to be such.

Now, let's start with the setup:

```ts
import { PostgreSQLProjectionSpec } from '@event-driven-io/emmett-postgresql';
import { 
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { after, before, beforeEach, describe, it } from 'node:test';
import { v4 as uuid } from 'uuid';

void describe('Shopping carts summary', () => {
  let postgres: StartedPostgreSqlContainer;
  let connectionString: string;
  let given: PostgreSQLProjectionSpec<ProductItemAdded | ProductItemRemoved | DiscountApplied>;
  let shoppingCartId: string;

  before(async () => {
    postgres = await new PostgreSqlContainer().start();
    connectionString = postgres.getConnectionUri();

    given = PostgreSQLProjectionSpec.for({
      projection: shoppingCartShortInfoProjection,
      connectionString,
    });
  });

  beforeEach(() => (shoppingCartId = `shoppingCart-${uuid()}`));
});
```

We're setting up the PostgreSQL test container and projection specification. We'll use it to run our tests. The first one could look as follows:


```ts
import { expectPongoDocuments } from '@event-driven-io/emmett-postgresql';

void describe('Shopping carts summary', () => {
  // (...) test setup

  void it('first added product creates document', () =>
    given([])
      .when([
        {
          type: 'ProductItemAdded',
          data: {
            productItem: { unitPrice: 100, productId: 'shoes', quantity: 100 },
          },
          metadata: {
            streamName: shoppingCartId,
          },
        },
      ])
      .then(
        expectPongoDocuments
          .fromCollection<ShoppingCartSummary>('shopping_carts_summary')
          .withId(shoppingCartId)
          .toBeEqual({
            productItemsCount: 100,
            totalAmount: 10000,
            appliedDiscounts: [],
          }),
      ));
});
``` 

Tests are written in [Behaviour-Driven Design](/pl/behaviour_driven_design_is_not_about_tests/) style, using Given/When/Then:
- **Given** existing stream of events,
- **When** new events are added,
- **Then** read model is updated.

We do it this way, as we expect read models to be ONLY updated through upcoming events.

Emmett gives you also out-of-the-box test assertion helpers to make testing Pongo easier.

You may have noticed that our Given is empty, so let's fix it!

```ts
import {
  eventsInStream,
  newEventsInStream,
} from '@event-driven-io/emmett-postgresql';

void describe('Shopping carts summary', () => {
  // (...) test setup

  void it('applies discount for existing shopping cart with product', () => {
    const couponId = uuid();

    return given(
      eventsInStream(shoppingCartId, [
        {
          type: 'ProductItemAdded',
          data: {
            productItem: { unitPrice: 100, productId: 'shoes', quantity: 100 },
          },
        },
      ]),
    )
      .when(
        newEventsInStream(shoppingCartId, [
          {
            type: 'DiscountApplied',
            data: { percent: 10, couponId },
          },
        ]),
      )
      .then(
        expectPongoDocuments
          .fromCollection<ShoppingCartShortInfo>(
            shoppingCartShortInfoCollectionName,
          )
          .withId(shoppingCartId)
          .toBeEqual({
            productItemsCount: 100,
            totalAmount: 9000,
          }),
      );
  });
});
```

You probably noticed the next helpers: _eventsInStream_and _newEventsInStream_. They're responsible for shortening the setup. Depending on your preferences, you can use the raw events setup, including manual metadata assignment, or a more explicit intention helper. My preference would be to use the helper, but it's up to you to decide!

You could even write tests like this:

```ts
void describe('Shopping carts summary', () => {
  // (...) test setup

  void it('applies discount for existing shopping cart with product', () => 
    given(
        shoppingCartWithProductItem(shoppingCartId, {
          unitPrice: 100, 
          quantity: 100,
        })
      )
      .when(
        discountApplied(shoppingCartId, {
          percent: 10,
        }))
      .then(
        summaryUpdated(shoppingCartId, {
          productItemsCount: 100,
          totalAmount: 9000,
        })
      ));
```

The setup methods are defined below:

```ts
void describe('Shopping carts summary', () => {
  // (...) test

  const shoppingCartWithProductItem = (
      shoppingCartId: string, 
      productItem: Partial<PricedProductItem>,
  ) => 
    eventsInStream(shoppingCartId, [
      {
        type: 'ProductItemAdded',
        data: {
          productItem: { 
            unitPrice: 100, 
            productId: 'shoes', 
            quantity: 100,
            ...productItem
          },
        },
      },
    ]),

  const discountApplied = (
    shoppingCartId: string, 
    data: { discount?: number; couponId?: string },
  ) => 
    newEventsInStream(shoppingCartId, [
      {
        type: 'DiscountApplied',
        data: { percent: 10, couponId: uuid(), ...data },
      },
    ]),

  const summaryUpdated = (shoppingCartId: string, expected: ShoppingCartSummary) =>
    expectPongoDocuments
      .fromCollection<ShoppingCartShortInfo>(
        shoppingCartShortInfoCollectionName,
      )
      .withId(shoppingCartId)
      .toBeEqual(expected}),     
});
```

That approach is more focused on the business flow and allows us to reuse those test setups. Still, the outcome is the same.

**Can read model data be only updated? Not only that, you can also delete it.** Let's imagine that the confirming cart should clear its read model, as we expect a new, empty shopping cart to be created when the new buying process starts.

To have that, we need to update our evolve function by adding _ShopingCartConfirmed_ event:

```ts
const evolve = (
  document: ShoppingCartSummary,
  { type, data: event }: ShoppingCartEvent,
): ShoppingCartSummary | null => { // <= see here
  switch (type) {
    case 'ProductItemAdded': 
      return withAdjustedTotals({
        document,
        productItem: event.productItem,
        by: 'adding'
      });
    case 'ProductItemRemoved':
      return withAdjustedTotals({
        document,
        productItem: event.productItem,
        by: 'removing'
      });
    case 'DiscountApplied':
      return {
        ...document,
        totalAmount: (document.totalAmount * (100 - event.percent)) / 100,
      };

    case 'ShoppingCartConfirmed':
      return null; // <= and here
  }
};
```

We made the shopping cart confirmed event return null. That means that the document should be removed. Emmett is using the Pongo's _handle_ method internally:

```typescript
const collection = pongo.db().collection<Document>(collectionName);

for (const event of events) {
  await collection.handle(getDocumentId(event), async (document) => {
    return await evolve(document, event);
  });
}
```

Pongo's handle method loads the existing document and tries to insert, replace, or delete it depending on the function's result. It's a bit sneaky, but pretty useful, isn't it?

The test checking will look as follows:

```ts
void describe('Shopping carts summary', () => {
  let given: PostgreSQLProjectionSpec<ShoppingCartEvent>;
  // (...) test setup

  void it('confirmed event removes read mode for shopping cart with applied discount', () => {
    const couponId = uuid();

    return given(
      eventsInStream(shoppingCartId, [
        {
          type: 'ProductItemAdded',
          data: {
            productItem: { unitPrice: 100, productId: 'shoes', quantity: 100 },
          },
        },
        {
          type: 'DiscountApplied',
          data: { percent: 10, couponId },
        },
      ]),
    )
      .when(
        newEventsInStream(shoppingCartId, [
          {
            type: 'ShoppingCartConfirmed',
            data: { confirmedAt: new Date() },
          },
        ]),
      )
      .then(
        expectPongoDocuments
          .fromCollection<ShoppingCartShortInfo>(
            shoppingCartShortInfoCollectionName,
          )
          .withId(shoppingCartId)          
          .notToExist(), // <= see this
      );
  });
});
```

The pattern looks the same, but the assertion is different.

**I hope that this article shows you how powerful the combination of Emmett, Pongo, and PostgreSQL is.** I also wanted to show you that I intend to give you certainty and trust in the software you're building. Having built-in support for tests should help you with that.

Go ahead, play with it, check it, and drop me a line. [Joining our Discord](https://discord.gg/fTpqUTMmVa) is an excellent way to do this.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
