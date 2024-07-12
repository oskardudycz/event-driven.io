---
title: Pongo - Mongo but on Postgres and with strong consistency benefits
category: "PostgreSql"
cover: 2024-07-07-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![](2024-07-07-cover.png)

**Flexibility or Consistency?** Why not have both? Wouldn't it be great to have MongoDB flexible schema and PostgreSQL consistency?

MongoDB is a decent database, but it gives headaches with its eventual consistency handling. I wrote about it a few times in past:
- [Dealing with Eventual Consistency and Idempotency in MongoDB projections](/pl/dealing_with_eventual_consistency_and_idempotency_in_mongodb_projections/)
- [Long-polling, how to make our async API synchronous](/pl/long_polling_and_eventual_consistency/)
- [How to test event-driven projections](/pl/testing_event_driven_projections/)

Don't get me wrong, eventual consistency is fine. We need to learn to live with that, still... Undeniably, having strong consistency guarantees, transactions, read your own writing is great.

**On Friday, I decided to spend my working day on the small proof of concept that I called [Pongo](https://github.com/event-driven-io/Pongo).** 

What's [Pongo](https://github.com/event-driven-io/Pongo)? 

**It's a MongoDB-compliant wrapper on top of Postgres.**

You can setup it like that:

```typescript
import { pongoClient } from "@event-driven-io/pongo";

const connectionString =
  "postgresql://dbuser:secretpassword@database.server.com:5432/yourdb";

const pongoClient = pongoClient(postgresConnectionString);
const pongoDb = pongoClient.db();

const users = pongoDb.collection<User>("users");
```

It will start internally with a PostgreSQL connection pool connected to your selected database. 

Having that, you can then perform operations like:

```typescript
const anita = { name: "Anita", age: 25 };

// Inserting
await pongoCollection.insertOne(roger);
await pongoCollection.insertOne(cruella);

const { insertedId } = await pongoCollection.insertOne(alice);
const anitaId = insertedId;

// Finding by Id
const anitaFromDb = await pongoCollection.findOne({ _id: anitaId });

// Updating
await users.updateOne({ _id: anitaId }, { $set: { age: 31 } });

// Deleting
await pongoCollection.deleteOne({ _id: cruella._id });

// Finding by Id
const anitaFromDb = await pongoCollection.findOne({ _id: anitaId });

// Finding more
const users = await pongoCollection.find({ age: { $lt: 40 } });
```

Internally, it'll set up the collection as the PostgreSQL table with the key-value structure:

```sql
CREATE TABLE IF NOT EXISTS "YourCollectionName" (
    _id           TEXT           PRIMARY KEY,
    data          JSONB          NOT NULL,
    metadata      JSONB          NOT NULL     DEFAULT '{}',
    _version      BIGINT         NOT NULL     DEFAULT 1,
    _partition    TEXT           NOT NULL     DEFAULT 'png_global',
    _archived     BOOLEAN        NOT NULL     DEFAULT FALSE,
    _created      TIMESTAMPTZ    NOT NULL     DEFAULT now(),
    _updated      TIMESTAMPTZ    NOT NULL     DEFAULT now()
)
```

**Essentially, it treats PostgreSQL as a key/value database.** Sounds familiar? Yet, it's a similar concept to [Marten](https://martendb.io/) or, more correctly, to AWS DocumentDB (see [here](https://www.enterprisedb.com/blog/documentdb-really-postgresql) or [there](https://news.ycombinator.com/item?id=18870397), they seem to be using Mongo syntactic sugar on top of AuroraDB with Postgres). 

I explained in [general strategy for migrating relational data to document-based](/pl/strategy_on_migrating_relational_data_to_document_based/) that contrary to common belief, document data is structured but less rigidly, as in the relational approach. JSON has structure, but it is not enforced for each document. We can easily extend the schema for our documents, even for specific ones, by adding new fields. We should also not fail if the field we expect to exist, but doesn't. 

Handling semi-structured data in a relational database can be tricky, but PostgreSQL's JSONB data type offers a practical solution. Unlike the plain text storage of the traditional JSON type, JSONB stores JSON data in a binary format. This simple change brings significant advantages in terms of performance and storage efficiency.

**The binary format of JSONB means that data is pre-parsed, allowing faster read and write operations than text-based JSON.** You don't have to re-parse the data every time you query it, which saves processing time and improves overall performance. Additionally, JSONB supports advanced indexing options like [GIN and GiST indexes, making searches within JSONB documents much quicker and more efficient](https://pganalyze.com/blog/gin-index#postgresql-jsonb-and-gin-indexes).

Moreover, JSONB retains the flexibility of storing semi-structured data while allowing you to use PostgreSQL's robust querying capabilities. You can perform complex queries, joins, and transactions with JSONB data, just as you can with regular relational data. 

This flexibility, performance, and consistency combination makes PostgreSQL with JSONB a powerful tool. There are [benchmarks showing that it can be even faster than MongoDB](https://info.enterprisedb.com/rs/069-ALB-339/images/PostgreSQL_MongoDB_Benchmark-WhitepaperFinal.pdf).

Still, the syntax is not the most pleasant (to say mildly). Just [check the docs](https://www.postgresql.org/docs/current/functions-json.html) or see what Pongo does behind the scenes.

**For instance, the MongoDB update syntax:**

```typescript
const pongoCollection = pongoDb.collection<User>("users");

await pongoCollection.updateOne(
  { _id: someId },
  { $push: { tags: "character" } }
);
```

will be translated to:

```sql
UPDATE "users"
SET data = jsonb_set(data, '{tags}', (COALESCE(data->'tags', '[]'::jsonb) || to_jsonb('character')))
WHERE _id = '137ef052-e41c-428b-b606-1c8070a47eda';
```

**Or for query:**

```typescript
const result = await pongoCollection
  .find({ "address.history": { $elemMatch: { street: "Elm St" } } })
  .toArray();
```

will result in:

```sql
SELECT data
FROM "users"
WHERE jsonb_path_exists(
  data,
  '$.address.history[*] ? (@.street == "Elm St")'
);
```

I thought that it'd be much easier if you could reuse your muscle memory from working with Mongo and use familiar syntax to access the data. I even prepared the compliant shim:

```typescript
import { MongoClient } from "@event-driven-io/pongo";
import { v4 as uuid } from "uuid";

type User = { name: string; age: number };

const connectionString =
  "postgresql://dbuser:secretpassword@database.server.com:3211/mydb";

const pongoClient = new MongoClient(postgresConnectionString);
const pongoDb = pongoClient.db();

const users = pongoDb.collection<User>("users");
const anita = { name: "Anita", age: 25 };

// Inserting
const { insertedId } = await pongoCollection.insertOne(alice);
const anitaId = insertedId;

// Updating
await users.updateOne({ _id: anitaId }, { $set: { age: 31 } });

// Deleting
await pongoCollection.deleteOne({ _id: cruella._id });

// Finding by Id
const anitaFromDb = await pongoCollection.findOne({ _id: anitaId });

// Finding more
const users = await pongoCollection.find({ age: { $lt: 40 } }).toArray();
```

And guess why? You can already use it by installing the package:

```shell
npm install @event-driven-io/pongo
```

Why did I create Pongo? There are two reasons. 

**First, I'll need it for [Emmett](https://event-driven-io.github.io/emmett/) read models.** I was a bit silent about updates to Emmett as I'm working on adding subscriptions and streaming capabilities. The ongoing [Pull Request](https://github.com/event-driven-io/emmett/pull/76) went a bit out of hand, and I was a bit worn out. 

**Thus, the second reason. Sometimes, you just need to have fun.** We too often forget about it. That's also why I came up with the name, a mixture of Mongo and Postgres and a reference to [one of my favourite children's movie characters](https://disney.fandom.com/wiki/Pongo).

**Is it production-ready?** You know the answer. What's there works fine, but it's far from having a fully compliant MongoDB API. And it might not have it fully, but [Pareto principle](https://en.wikipedia.org/wiki/Pareto_principle) works here. I also hope that I'll get from you or others who decide to use its contribution or sponsoring to bring it to the expected level.

Still, it can already do the most needed operations, so you should be fine with trying it!

I'm planning to do a series of articles on the internals of building such a tool!

**I'm curious about your thoughts on it. Yay or nay?**

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
