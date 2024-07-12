---
title: Event Sourcing on PostgreSQL in Node.js just became possible with Emmett
category: "PostgreSql"
cover: 2024-07-12-cover.png
author: oskar dudycz
---

![](2024-07-12-cover.png)

Last week, I announced [Pongo](https://github.com/event-driven-io/Pongo) - Mongo, but it was on PostgreSQL. So, the Node.js library allows using PostgreSQL as a document database. 

**Today, I have at least an equally big announcement: I released the PostgreSQL event store for [Emmett](https://event-driven-io.github.io/emmett/getting-started.html). Boom!**

What's Emmett? It's an Event Sourcing library. I announced it some time ago and have worked on it continuously for the last few months. It already supports EventStoreDB, and now it has our favourite PostgreSQL storage!

Read more:
- [Announcing Emmett! Take your event-driven applications back to the future!](/en/introducing_emmett/)
- [Testing Event Sourcing, Emmett edition](/en/introducing_emmett/)

How to use it? Pretty simple. Start with installing npm package:

```shell
$ npm add @@event-driven-io/emmett-postgresql
```

Then setup event store using connection string to PostgreSQL:

```typescript
import { getPostgreSQLEventStore } from '@event-driven-io/emmett-postgresql';

const connectionString =
  "postgresql://dbuser:secretpassword@database.server.com:3211/mydb";

const eventStore = getPostgreSQLEventStore(connectionString);
```

Internally, it uses the [node-postgres](https://node-postgres.com/) package with connection pooling. So you don't need to do much more. Well, maybe besides gracefully closing it on the application closure:

```typescript
await eventStore.close();
```

Cool, but what you can do with it? Check [Emmett docs](https://event-driven-io.github.io/emmett/getting-started.html#event-store). The same you can do with EventStoreDB storage you can do with PostgreSQL!

Or you can actually do more with PostgreSQL, as...

PostgreSQL has inline projections support. What are inline projections? They're functions updating your read models in the same transaction as appending events. So either all was stored or nothing. Of course, you need to be careful with them as they can slow your appends, but they're really useful. Async projections will come in future releases.

Ok, but how to use it? Let's say that you'd like to build a read model with a summary of your shopping cart:

```typescript
type ShoppingCartShortInfo = {
  productItemsCount: number;
  totalAmount: number;
};
```

Transformation function could look like that:

```typescript
const evolve = (
  document: ShoppingCartShortInfo | null,
  { type, data: event }: ProductItemAdded | DiscountApplied,
): ShoppingCartShortInfo => {
  document = document ?? { productItemsCount: 0, totalAmount: 0 };

  switch (type) {
    case 'ProductItemAdded':
      return {
        totalAmount:
          document.totalAmount +
          event.productItem.price * event.productItem.quantity,
        productItemsCount:
          document.productItemsCount + event.productItem.quantity,
      };
    case 'DiscountApplied':
      return {
        ...document,
        totalAmount: (document.totalAmount * (100 - event.percent)) / 100,
      };
  }
};
```

It'll be run for each event of type _ProductItemAdded_ and _DiscountApplied_ that's appended to the event store.

Let's say that you'd like to use Pongo and store it as a document in PostgreSQL, then you can define projection as:

```typescript
const shoppingCartShortInfoCollectionName = 'shoppingCartShortInfo';

const shoppingCartShortInfoProjection = pongoSingleProjection(
  shoppingCartShortInfoCollectionName,
  evolve,
  'ProductItemAdded',
  'DiscountApplied',
);
```

We're saying that we'd like to update the _shoppingCartShortInfo_ collection using the _evolve_ function for the following set of event types. 

Internally, it'll use the Pongo new feature: a handler that loads the existing document and tries to insert, replace or delete it depending on the result obtained from the function.

It look's as follows:

```typescript
const collection = pongo.db().collection<Document>(collectionName);

for (const event of events) {
  await collection.handle(getDocumentId(event), async (document) => {
    return await evolve(document, event);
  });
}
```

If you're wondering what _getDocumentId_ is, then for _pongoSingleProjection_, it'll automatically use the stream name as the document id. 

Suppose you'd like to customise it, e.g. to match events from different streams. In that case, you can use the _pongoMultiStreamProjection_ definition, which allows you to specify the document ID matcher for each event. For instance:

```typescript
const shoppingCartShortInfoCollectionName = 'shoppingCartShortInfo';

const getDocumentId = ({type}:  ProductItemAdded | DiscountApplied): string => {
  switch(type)
  {
    case 'ProductItemAdded': 
      return event.metadata.streamName;
    case 'DiscountApplied': 
      return event.metadata.streamName;
  }
};

const shoppingCartShortInfoProjection = pongoSingleProjection(
  shoppingCartShortInfoCollectionName,
  getDocumentId,
  evolve,
  'ProductItemAdded',
  'DiscountApplied',
);
```

You can also do a free-hand projection using _pongoProjection_ that takes the following handler:

```typescript
(pongo: PongoClient, events: ReadEvent<EventType>[]) => Promise<void>
```

Cool, isn't it?

Of course, those are still experimental features; they need to be optimised, tested extensively, etc. But they work, which makes me happy.

**As you see, I'm quite thrilled that I could deliver it, as this is a big milestone.** This will enable many people to finally do Event Sourcing in Node.js using PostgreSQL and have basic building blocks.

**All of that wouldn't be possible with my recent changes to Pongo.**

1. **I managed to close the basic coverage of document manipulation methods.** I added initial versions of what was initially missing: replaceOne, drop, rename, countDocuments, count, estimatedDocumentCount, findOneAndDelete, findOneAndReplace, findOneAndUpdate, etc.

Now, a bigger portion that were made as preparations to Emmett PostgreSQL projections you just learned about:

2. **Added option to inject external connection pool and db client to Pongo collection as the first step for transaction handling.** Now, you can create transactions outside and inject pool clients. It's not yet fully the same as Mongo API; it'll be delivered in follow-up PR.

3. **Strengthened the schema and updated the id from UUID to text.** Changed _id type to TEXT. In PostgreSQL, this should be almost equally the same indexable. Of course, it'll take a bit more storage, but let's live with that for now. Changing from uuid to text will allow more sophisticated key strategies. Most importantly, it'll reuse the stream ID as a document ID for Emmett projections.

Also, thanks to the Franck Pachot contribution, we confirmed that Pongo is compatible not only with vanilla Postgres but also databases like Yugabyte!

**It was just a week, but I'm extremely happy with how Pongo was taken by the community.** I got to [HackerNews front page](https://news.ycombinator.com/item?id=40897518) and got over 900 GitHub stars!

**Now it's the time for Emmett!** Synergy with Pongo should help with that.

What a week! It's easy to forget that Pongo was released just 7 days ago!

**Now I can go to vacations, next blog will be in August!**

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
