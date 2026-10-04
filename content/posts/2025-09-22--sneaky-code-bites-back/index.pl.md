---
title: Sneaky Code Bites Back
category: Software Architecture
cover: 2025-09-22-cover.jpg
author: oskar dudycz
useDefaultLangCanonical: true
---

Welcome to the new week!

Sneaky code bites back, I realised that again recently.

**I realised I'd been writing terrible code when I couldn't explain it to myself.**

The code worked. It was adding SQLite support to [Pongo](https://github.com/event-driven-io/pongo). But when I tried to describe how I was implementing multi-database support, I heard myself saying:

> _"First it checks if the Promise is cached, then it creates a proxy that defers to the real implementation which doesn't exist yet, but will be loaded dynamically when..."_

![Nicolas Cage's Most Outlandish Roles Ever](2025-09-22-cover.jpg "Nicolas Cage's Most Outlandish Roles Ever")

Yes, I sounded insane.

## **What I Was Building**

Pongo is my attempt to bring the familiar MongoDB API and use relational databases as document databases.

If you've used MongoDB, you know the API collection.find(), collection.insertOne(), collection.updateOne(). Pongo gives you that same API, but your data lives in [PostgreSQL using JSONB columns](/en/postgresql-jsonb-powerful-storage/).

Why would anyone want this? Teams often know MongoDB's API but need PostgreSQL's guarantees: real ACID transactions, mature replication, and existing infrastructure. Or they have PostgreSQL but want document storage without learning PostgreSQL's JSON query syntax, which looks like this:

```
SELECT data FROM users

WHERE jsonb_path_exists(data, '$.address.history[*] ? (@.street == "Elm St")')
```

```
users.find({ "address.history": { $elemMatch: { street: "Elm St" } } })
```

Same result, familiar syntax. I'd built something similar before with Marten for .NET, so I knew the approach worked.

It seemed that people appreciated it. And when someone appreciates something, they usually want more…

Users started requesting support for other databases, e.g. SQLite for edge deployments, DuckDB for analytics, Spanner for distributed systems, etc. Made sense. The MongoDB API could work on any database that supports JSON.

## **The Challenge**

Adding multi-database support meant dealing with drivers. Database drivers are how your application talks to databases. So code code handling connection protocols, type conversions, and query preparation. Each database needs its own driver.

The straightforward approach: make developers explicitly import the driver they need:

```
import { pongoClient } from '@event-driven-io/pongo';

import { databaseDriver } from '@event-driven-io/pongo/pg';

const client = pongoClient({
 driver: databaseDriver,

 connectionString: 'postgresql://localhost:5432/mydb'
});
```

This bothered me. The connection string already says "`postgresql`".

Why make developers say it twice?

I wanted automatic driver selection. Parse the connection string, load the right driver, only when needed.

## **The Sneaky Solution**

I built a deferred loading pattern in Dumbo, my database abstraction layer. Dumbo sits under Pongo, handling connection pools, transactions, and SQL generation. Both Pongo and my event sourcing library, [Emmett](https://event-driven-io.github.io/emmett/getting-started.html), use it.

Here's the pattern:

```
export const createDeferredConnectionPool = <Connector, ConnectionType>(
  connector: Connector,
  importPool: () => Promise<ConnectionPool<Connection<Connector>>>,
): ConnectionPool<ConnectionType> => {
  let poolPromise: Promise<ConnectionPool> | null = null;

  const getPool = async () => {
    if (poolPromise) return poolPromise;
    return (poolPromise = importPool());
  };

  return createConnectionPool({
    connector,
    execute: createDeferredExecutor(connector, async () => {
      const connection = await getPool();
      return connection.execute;
    }),
    close: async () => {
      if (!poolPromise) return;
      const pool = await poolPromise;
      await pool.close();
    },
    // ... every method proxied through getPool()
  });
};
```

Let me explain what's happening here, because it's the core of why my design went wrong.

The connection pool appears to exist immediately, but it's actually a proxy. Every method (`execute`, `close`, `transaction`, etc.) is wrapped to the first call `getPool()`. The first time `getPool()` runs, it imports the real driver and creates the real connection pool. Then—and this is crucial—it caches the Promise itself, not the result.

In JavaScript, a Promise is an object. Once created, it has an identity. You can await the same Promise multiple times, and the function will be evaluated once, the result will be cached and reused in subsequent awaits:

```
const work = doSomethingAsync();
const a = await work;
const b = await work; // Same Promise object, same eventual result
```

This is different from calling the async function twice:

```
const a = await doSomethingAsync(); // Creates Promise #1
const b = await doSomethingAsync(); // Creates Promise #2, does work again
```

**By caching the Promise, multiple parts of code can request the connection pool simultaneously, but the import only happens once.** Everyone waits for the same Promise to resolve. This pattern is called Promise memoisation.

In C# terms, it's like storing a `Task<T>` and having multiple threads await it. In Python, it's like `functools.lru_cache` for async functions. The concept exists across languages—cache the operation, not just the result.

This worked in Dumbo. The API stayed clean. Drivers are loaded on demand. You pay the differing cost only once.

Then I tried extending this pattern to Pongo itself.

## **The Cascade Effect**

To support automatic driver selection in Pongo, I'd need to defer everything.

Currently, when you create a Pongo client, it knows its driver:

```
const client = pongoClient({ connectionString });
const db = client.db('myapp');
const users = db.collection('users');
```

Each level—client, database, collection—is a concrete object with real methods.

**With automatic driver selection, none of these could be real until first use.** The client wouldn't know which driver to use until it parsed the connection string. However, parsing occurs asynchronously, as dynamic module loading in JavaScript can only happen with [async imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#import_a_module_for_its_side_effects_only). So the client also needs to become a proxy just like the Dumbo connection. The database becomes a proxy. The collection becomes a proxy.

**Here's what a deferred collection would look like:**

```
class DeferredPongoCollection<T> implements PongoCollection<T> {
  private realCollectionPromise: Promise<PongoCollection<T>> | null = null;

  constructor(
    private name: string,
    private getDb: () => Promise<PongoDb>
  ) {}

  private async getRealCollection(): Promise<PongoCollection<T>> {
    if (!this.realCollectionPromise) {
      this.realCollectionPromise = this.getDb()
        .then(db => db.collection<T>(this.name));
    }
    return this.realCollectionPromise;
  }

  async find(filter?: Filter<T>, options?: FindOptions): Promise<T[]> {
    const collection = await this.getRealCollection();
    return collection.find(filter, options);
  }

  async findOne(filter: Filter<T>, options?: FindOptions): Promise<T | null> {
    const collection = await this.getRealCollection();
    return collection.findOne(filter, options);
  }

  async insertOne(doc: T): Promise<InsertOneResult> {
    const collection = await this.getRealCollection();
    return collection.insertOne(doc);
  }

  async insertMany(docs: T[]): Promise<InsertManyResult> {
    const collection = await this.getRealCollection();
    return collection.insertMany(docs);
  }

  async updateOne(filter: Filter<T>, update: Update<T>): Promise<UpdateResult> {
    const collection = await this.getRealCollection();
    return collection.updateOne(filter, update);
  }

  async updateMany(filter: Filter<T>, update: Update<T>): Promise<UpdateResult> {
    const collection = await this.getRealCollection();
    return collection.updateMany(filter, update);
  }

  // ... and 20+ more methods
}
```

Every single method becomes a proxy that waits for the real collection. But the collection needs a database, which needs a client, which needs a driver. Three levels of deferred proxies.

Now add TypeScript generics that need to flow through all these layers. Add error handling—what if the import fails? Add specialised MongoDB types like `AggregationCursor`, `ChangeStream`, `BulkWrite`. Each needs its own deferred proxy class.

The driver would register itself through a side effect:

```
// In @event-driven-io/pongo/pg
import { registerDriver } from '@event-driven-io/pongo';
registerDriver('postgresql', () => import('./postgresqlDriver'));
```

Then you could add just the import anywhere in the app:

```
import * from '@event-driven-io/pongo/pg';
```

And magic registration will happen, and as a user, you wouldn’t need to know about all the stuff I just wrote, right? RIGHT?!

Right, if you remember about this import, if you forgot, then the registration doesn't happen. The error only surfaces at runtime when you try to connect.

## **The Failure**

When I was into this design, I reminded myself on a similar thing I wanted to do in past.

Years ago, I nearly shipped distributed transactions using [MSDTC (Microsoft's distributed transaction coordinator).](https://en.wikipedia.org/wiki/Microsoft_Distributed_Transaction_Coordinator) The code worked perfectly in testing. But when I imagined production failures, I realised I couldn't debug them. The complexity was hidden, not gone.

This was the same mistake.

Consider what happens when something goes wrong. A user reports:

> "I'm getting an error when inserting a document."

Where's the actual problem? Let's trace through the layers:

1.  User calls `collection.insertOne(doc)`

2.  Deferred collection waits for real collection via `getRealCollection()`

3.  Which waits for a deferred database via `getDb()`

4.  Which waits for a deferred client to resolve

5.  Which waits for the driver to be imported

6.  Which needs the connection string to be parsed

7.  Which needs the driver to be registered

8.  Which depends on a side-effect import that may not have happened

The stack trace shows `insertOne` at the top. The actual error—maybe a typo in the connection string, maybe a missing driver import, maybe a network issue—is buried under seven layers of Promise resolution.

But there's a worse problem: Promise memoisation means errors get cached forever.

If the first connection attempt fails, `poolPromise` holds a rejected Promise. Every subsequent request awaits the same rejected Promise. You can't retry without restarting the process. This is a fundamental property of Promises—once settled (resolved or rejected), they never change state.

In production, this means that one failed connection attempt during startup breaks everything until a restart is performed. A temporary network glitch becomes a permanent failure.

## **The Nightmare**

Let's say you're debugging this in production. You add logging:

```
async insertOne(doc: T): Promise<InsertOneResult> {
  console.log('insertOne called');
  const collection = await this.getRealCollection();
  console.log('Got real collection');
  return collection.insertOne(doc);
}
```

The logs show "insertOne called" but not "Got real collection". Where's the problem? Could be:

-   Driver not registered (missing import)

-   Connection string malformed

-   Network unreachable

-   Import failed (syntax error in driver)

-   Previous connection attempt failed (cached rejection)

You need to understand the entire deferred loading chain to debug a simple insert.

Now imagine explaining this to a contributor who wants to add a DuckDB driver.

> _"First, create your driver. Then register it via side effect. Understand Promise memoization because failures get cached. Know that everything is proxied through three levels of deferreds. When debugging, remember the stack trace lies about where errors originate..."_

## **The Alternative**

I chose explicit driver injection instead:

```
import { pongoClient } from '@event-driven-io/pongo';
import { databaseDriver } from '@event-driven-io/pongo/pg';

const client = pongoClient({
  driver: databaseDriver,
  connectionString: 'postgresql://localhost:5432/mydb'
});
```

One extra import. That's the entire cost.

The benefits:

-   TypeScript catches missing drivers at compile time: "Property 'driver' is missing"

-   Stack traces point to real problems

-   Failed connections can retry

-   New developers understand it immediately

-   Each driver can expose database-specific features

The code is boring. No magic. No proxies. No deferred loading. It works or it doesn't. When it fails, you know why and where.

## **The Pattern**

This isn't really about Pongo or database drivers. It's about a pattern we all fall into.

We see repetition and think "I can abstract this."

We see explicit configuration and think: _"I can infer this"_. We see upfront costs and think: _"I can defer this"_.

Sometimes we just don’t trust our colleagues, thinking that they’re too incompetent and we need to take precautionary steps.

Sometimes we're right. Most often we’re not.

**Too often, we're optimising the wrong metric. I was optimizing for fewer imports, not simpler code. I was hiding essential configuration, not accidental complexity.**

A minimal API with complex implementation isn't simple—it's a lie. The complexity doesn't disappear. It moves from the visible surface to hidden internals, where it's harder to understand, debug, and modify.

I've seen this pattern everywhere:

**ORMs with query optimization**: They generate "optimal" SQL you can't debug. When queries are slow, you're reverse-engineering what the ORM decided to do. The abstraction that was supposed to help becomes a barrier to fixing problems.

**Dependency injection with auto-wiring**: The container magically figures out what to inject where. Works great until it doesn't. Then you're debugging why the container chose the wrong implementation, and the magic configuration system has no good debugging tools.

**Build tools with convention over configuration**: They discover your project structure automatically. Perfect until your project doesn't fit the convention. Then you're fighting the tool's assumptions, wishing for explicit configuration.

**Test frameworks with magical setup**: They auto-mock dependencies, auto-setup databases, auto-configure everything. The tests become harder to understand than the code they're testing. When tests fail, you debug the framework, not your code.

The pattern is always the same. Good intentions. Hidden complexity. Eventual regret.

## **When Magic Becomes a Prison**

Magic in code should be like magic in a good movie—the audience shouldn't see how it works. But there's a crucial difference: movie audiences never need to modify the magic trick.

Code has maintainers. They need to understand the magic, extend it, debug it. When the magic is at the surface—the API level—every maintainer becomes a magician's apprentice.

The deferred loading pattern would have created a codebase where:

-   Reading code means understanding proxies and Promise memoization

-   Adding features means maintaining the deferred chain

-   Debugging means tracing through invisible layers

-   Onboarding means learning the entire magical system

It creates a priesthood of maintainers who understand the magic. Everyone else fears the code. They make small changes and hope nothing breaks. They don't refactor because they might disturb the magic.

Let's be honest about what I was trading:

**The cost of explicit drivers:**

-   One extra import line

-   Developers must know which database they're using

**The cost of automatic driver selection:**

-   Three levels of proxy objects

-   Promise memoization complexity

-   Cached failures requiring restarts

-   Incomprehensible stack traces

-   Side-effect registration

-   Impossible debugging

-   Steep learning curve for contributors

Was saving one import worth all that complexity? Obviously not. But I didn't see it until I started implementing it.

This is why I need to write code to understand ideas. My brain can't model all the implications abstractly. I need to "sweat out" designs in real code. Sometimes that means building something just to realize it's wrong.

The key is recognizing it before shipping.

## **The Lesson**

Every time I've tried to be sneaky, it's bitten me. The distributed transactions that worked until they didn't. The code generators that saved typing but destroyed readability. The clever abstractions that became maintenance nightmares.

**The problems sneaky code solves are almost always smaller than the problems it creates.** But we don't see that at design time. We see the elegance of the solution, not the pain of living with it.

I wanted to make Pongo simple. I was making its setup simplistic and obscure. Simple means easy to understand and maintain. Simplistic means oversimplified to the point of being inadequate for real-world use.

Now I'm removing the clever patterns. Each driver will be explicit. Each connection direct. Each error immediate and clear.

The new code is boring. Import a driver. Pass it to the client. It connects or fails with a clear error.

Boring code is debuggable. Explicit code is maintainable. Simple code—truly simple, not simplistic—is code that works and keeps working.

I got too clever. We all do sometimes. The key is catching it before it escapes into production, where it becomes someone else's nightmare.

If you want to see “The Removal”, check [this Pull Request](https://github.com/event-driven-io/Pongo/pull/126) and related follow-ups. I’m replacing the clever code with boring code. It's less exciting than it sounds, and that's the point.

And hey, there’s also another lesson: we all make mistakes, and fall into the rabbit hole. At least I do.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian](https://savelife.in.ua/pl/donate/) organisation or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
