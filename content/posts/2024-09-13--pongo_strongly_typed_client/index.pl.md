---
title: Pongo gets strongly-typed client, migrations, and command line tooling
category: "TypeScript"
cover: 2024-09-13-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![](2024-09-13-cover.png)

**When you think upfront and want to make things right, there's an interesting feedback loop. Quite often, things start to click, often in a surprising way.**

**I recently wrote on [Architecture Weekly about my performance investigations](https://www.architecture-weekly.com/p/talk-is-cheap-show-me-the-numbers) in [Emmett](https://event-driven-io.github.io/emmett/getting-started.html) and [Pongo](https://event-driven-io.github.io/Pongo/getting-started.html).** One of the conclusions was that schema needs to be generated upfront. Initially, it was generated once on the first call. That reduced boilerplate and was good enough for many cases but not for serverless.

To generate the [Emmett](https://event-driven-io.github.io/emmett/getting-started.html) PostgreSQL schema, I also wanted to be able to generate it for [Pongo](https://event-driven-io.github.io/Pongo/getting-started.html) documents that I use for read models. 

Pongo documents are stored in collections, and collections are regular (well, almost) PostgreSQL tables. So, to know what to generate, I had to add some way to know what collections I'll have. There's no such API in vanilla Mongo, so I have to add it. And that's fine, as I want to make Pongo a superset of Mongo.

My initial idea was to provide a list of collections with names. This list could later contain a JSON schema definition, database indexes, etc. I also had to add an option to provide the database list. Pongo (just like Mongo) allows different dbs to be used.

The naive version could look like this:

```ts
const schema = [{ name: 'postgres', collections: ['users', 'orders'] }];

const client = pongoClient(postgresConnectionString, {
  schema: { definition: schema },
});
```

That would give me the information I need to set up users and order tables for collections in the default Postgres database. I could call it a day, but...

But then I thought, well, wouldn't it be nice to generate a strongly typed TypeScript client? Having schema makes that possible! I "just" have to use a sneaky feature like [Proxy type](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). So I did, and bang, here we are with the new release!

## Strongly Typed Client

The API needs to be a bit more advanced, but I think it's still straightforward and explicit. You need to define schema like:

```ts
type User = {
  _id?: string;
  name: string;
  age: number;
  address?: Address;
  tags?: string[];
};

type Customer = {
  _id?: string;
  name: string;
  address?: Address;
};

const schema = pongoSchema.client({
  database: pongoSchema.db({
    users: pongoSchema.collection<User>('users'),
    customers: pongoSchema.collection<Customer>('customers'),
  }),
});
```

And pass it to the client, getting the typed version.

```ts
const typedClient = pongoClient(postgresConnectionString, {
  schema: { definition: schema },
});
// 👇 client have the same database as we defined above, and the collection
const users = typedClient.database.users;

const doc: User = {
  _id: randomUUUID(),
  name: 'Anita',
  age: 25,
};
const inserted = await users.insertOne(doc);

// 👇 yup, the collection is fully typed!
const pongoDoc = await users.findOne({
  name: 'Anita'
});
```

I think that's much better developer experience, than the Mongo API that tells us always to do calls like:

```ts
const db  = client.db('postgres');

const users = db.collection<User>();
```

Of course, if you like it, you can still use it. It's great to have more options!

Internally, it generates the collections upfront and assigns them to the typed properties. If you want to know how that works internally, reply to this article, and I can explain how sausages are made in the follow-up!

### Pongo gets command line

And we're getting back to the announced synergy between making things right. Having schema also enabled upfront schema generation and even migration. To make that accessible, I added command line tooling.
 
You can either install it globally through:

```sh
npm install -g @event-driven-io/pongo
```

And run it with:

```bash
pongo
```

or without installing it globally by using [npx](https://docs.npmjs.com/cli/v8/commands/npx)

```bash
npx @event-driven-io/pongo
```

Cool, but what do you get from it?

## Sample configuration generation

You can generate the sample config by calling:

```bash
npx @event-driven-io/pongo config sample --generate --file ./src/pongoConfig.ts --collection users --collection orders
```

This command will create a config file in the selected location with predefined users and orders collections. It'll look as follows:

```ts
import { pongoSchema } from '@event-driven-io/pongo';

type User = { name: string; description: string; date: Date }
type Order = { name: string; description: string; date: Date }

export default {
  schema: pongoSchema.client({
    database: pongoSchema.db({
      users: pongoSchema.collection<User>('users'),
      orders: pongoSchema.collection<Order>('orders'),
    }),
  }),
};
```

Or just print it with:

```bash
npx @event-driven-io/pongo config sample --print --collection users --collection customers
```

Then, you can use adjust the generated typing and import it to your application.

```ts
import { pongoClient } from '@event-driven-io/pongo';
import config from './pongo.config';

const pongo = pongoClient(connectionString, {
  schema: { definition: config.schema },
});
```

### Performing Database Migrations

Having the existing configuration file and command-line tooling opens even more options. You not only get a strongly typed client but also can generate and perform migrations based on it!

You can do it with new command line tooling:

```bash
npx @event-driven-io/pongo migrate run --config ./dist/pongoConfig.js \
--connectionString postgresql://postgres:postgres@localhost:5432/postgres
``` 
It'll automatically run the migrations based on the defined collections. 

If you're unsure and don't trust it fully, you can also add the _—-dryRun_ parameter. This will run the migration in the transaction and roll it back without making any changes.

**You can also use migration CLI in your build pipelines.** You might not want to pass the connection string there, as it's not secured way. No worries, you can also set _DB_CONNECTION_STRING_ environment variable and run it  as

```bash
npx @event-driven-io/pongo migrate run --config ./dist/pongoConfig.js
``` 

You can also run it by providing a collections list:

```bash
npx @event-driven-io/pongo migrate run --collection users --collection customers \
--connectionString postgresql://postgres:postgres@localhost:5432/postgres
``` 

You can also just print migrations to see what schema structures will be generated by calling:

```bash
npx @event-driven-io/pongo migrate sql --print --collection users --collection customers
```

It will print:

```sql
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    application VARCHAR(255) NOT NULL DEFAULT 'default',
    sql_hash VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS users (
      _id           TEXT           PRIMARY KEY, 
      data          JSONB          NOT NULL, 
      metadata      JSONB          NOT NULL     DEFAULT '{}',
      _version      BIGINT         NOT NULL     DEFAULT 1,
      _partition    TEXT           NOT NULL     DEFAULT 'png_global',
      _archived     BOOLEAN        NOT NULL     DEFAULT FALSE,
      _created      TIMESTAMPTZ    NOT NULL     DEFAULT now(),
      _updated      TIMESTAMPTZ    NOT NULL     DEFAULT now()
  );

CREATE TABLE IF NOT EXISTS customers (
      _id           TEXT           PRIMARY KEY, 
      data          JSONB          NOT NULL, 
      metadata      JSONB          NOT NULL     DEFAULT '{}',
      _version      BIGINT         NOT NULL     DEFAULT 1,
      _partition    TEXT           NOT NULL     DEFAULT 'png_global',
      _archived     BOOLEAN        NOT NULL     DEFAULT FALSE,
      _created      TIMESTAMPTZ    NOT NULL     DEFAULT now(),
      _updated      TIMESTAMPTZ    NOT NULL     DEFAULT now()
  );
```

This first _migrations_ table is essential, as it keeps all the migrations running so far. So, if you run the migration CLI once, it'll only run the migrations once. Migrations are using internally [Postgres Advisory Locks](https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS) to ensure that no migrations are happening in parallel. Safety first!

In the future, you'll also be able to provide your custom schema and data migrations through it!

You already got [Schema Components abstraction](https://github.com/event-driven-io/Pongo/blob/c3ed330a3ddf7793e6d508309cd2f729c6b19cb2/src/packages/dumbo/src/core/schema/schemaComponent.ts). They define the database schema as a tree structure. They're used for database collection, allowing migration through code. They're exposed in the schema property. In the longer term, it'll be possible to add your own, like indexes, migrations, etc.
 
### Added possibility to disable generating Pongo schema upfront

And we're getting to performance. It appears that running schema migrations automatically is an excellent developer experience but not ideal for regular deployment. Surprise!

Now, thanks to the schema and CLI tooling for migrations, you can run migrations manually (or through the build process) and can ignore the automated migration in the Pongo client and get the performance boost:

```ts
const typedClient = pongoClient(postgresConnectionString, {
  schema: { autoMigration: 'None', definition: schema },
});
```

This will disable any automated schema generation. As a result, your application will have fewer database calls, opened connections, and overhead!

### TLDR

The need for those changes appeared unexpectedly. I had to improve the performance for non-pooled connections (e.g., in a serverless environment). I could have done a quick patch and called it a day, but I did a sanity check and rethought that a bit. That led to a bit more work but also surprising synergy and opening more options for the future.

I'm pretty happy about that. 

**I think that'll also boost the developer experience even more!**

Expect the follow up in Emmett.

**What are your thoughts?**

Read more about building Emmett and Pongo in:
- [Announcing Emmett! Take your event-driven applications back to the future!](/pl/introducing_emmett/)
- [Pongo - Mongo but on Postgres and with strong consistency benefits](/pl/introducting_pongo/)
- [Event Sourcing on PostgreSQL in Node.js just became possible with Emmett](/pl/emmett_postgresql_event_store/)
- [Testing Event Sourcing, Emmett edition](/pl/introducing_emmett/)
- [Writing and testing event-driven projections with Emmett, Pongo and PostgreSQL](/pl/emmett_projections_testing/)
- [Using event metadata in event-driven projections](/pl/projections_and_event_metadata/)
- [How to configure a custom Test Container on the EventStoreDB example](/pl/custom_test_container_on_esdb_example/)
- [How to build an in-memory Message Bus in TypeScript](/pl/inmemory_message_bus_in_typescript/)

Check also the [sample](https://github.com/event-driven-io/Pongo/blob/c3ed330a3ddf7793e6d508309cd2f729c6b19cb2/samples/simple-ts/src/typedClient.ts) and [release notes](https://github.com/event-driven-io/Pongo/releases/tag/0.14.0)

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
