---
title: Running a regular SQL on Pongo documents
category: "TypeScript"
cover: 2024-10-15-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![](2024-10-15-cover.png)

**Have you heard someone say: _"We'll use this tool because it requires a long onboarding and lots of memorisation?"_**

You could have seen the decision as such in hindsight, but that doesn't happen too often intentionally. Or at least, I hope.

**The Tools I built need to share a common goal: they must be accessible and enable advanced users to customise them to their needs.** Users should be able to start quickly. Best if they could reuse the learnings in other areas. Users should get a learning ladder. That's why I optimise the API and tooling for the newbies.

That's why I wrote [Small rant about Software Design](/pl/small_rant_about_software_design/), which is being triggered by yet another tool that thinks too soon about the advanced user. Too often, we forget that we won't get advanced users if the newbies don't pass the very first steps of the learning ladder.

**That's why, in [Pongo](https://github.com/event-driven-io/Pongo), I'm trying to join two accessibilities: muscle memory and the Node.js community by reusing the MongoDB client API and PostgreSQL operation easiness and familiarity.** I think that enables me to ramp up quickly and deliver business value by deploying the first version of your software to production.

To use [Pongo](https://github.com/event-driven-io/Pongo), you just need to install it:

```shell
$ npm install @event-driven-io/pongo
```

Have a PostgreSQL instance working somewhere (e.g. [with Docker](https://hub.docker.com/_/postgres)).

Connect the client to the instance using database:

```ts
const connectionString =
  'postgresql://postgres:postgres@localhost:5432/postgres';cockroachdb

const pongo = pongoClient(connectionString);
const pongoDb = pongo.db();
```

Define your document type:

```ts
type History = { street: string };
type Address = {
  city: string;
  street?: string;
  zip?: string;
  history?: History[];
};

type User = {
  _id?: string;
  name: string;
  age: number;
  address?: Address;
  tags?: string[];
};
```

And boom, you can access the collection with all the typing benefits:

```ts
const users = pongoDb.collection<User>();
```

[You can even get the typed client that will make that even smoother](https://event-driven.io/pl/pongo_strongly_typed_client/).

Then you can insert some docs:

```ts
const docs = [
  {
     name: 'Anita',
     age: 25,
     address: { city: 'Wonderland', street: 'Main St'},
  },
  {
     name: 'Roger',
     age: 30,
     address: { city: 'Wonderland', street: 'Elm St'},
  },
  {
     name: 'Cruella',
     age: 35,
     address: { city: 'Dreamland', street: 'Oak St'},
  },
];

await users.insertMany(docs);
```

Then you can filter them:

```ts
const docs = await users.find({
  address: { city: 'Wonderland', street: 'Elm St'},
});
```

Update them:

```ts
await users.updateOne(
  { name: 'Anita'},
  { $inc: { age: 1 } };,
);
```

And all that jazz. MongoDB API has its quirks, but I believe it's flexible and familiar enough to be easy to use. But...

That may be my point of view, and other people may disagree. Some people are familiar enough with PostgreSQL JSONB syntax to just use SQL.

The other reason can be that Pongo doesn't support some MongoDB syntax yet. I'm continuously working on Pongo to deliver decent compatibility. Still, it may take some time to be fully aligned. I might never reach full compatibility, as the API can have numerous permutations that I didn't predict. I don't want to block anyone waiting for the new release with the fix. **I think that SQL is a decent fallback.**

That's why I added a few options for using SQL in the Pongo API. 

## SQL queries

If you want to query Pongo with SQL, you can use an SQL helper. It'll handle the parameter formatting, allowing you to customise it. For instance:

```ts
import { plainString, SQL } from '@event-driven-io/dumbo';

const wonderland = plainString('Wonderland');

const docs = await users.find(
  SQL`data @> '{"address":{"city":"${wonderland}"}}'`
);
```

In Pongo documents are stored as regular table, the structure looks as follows:

```sql
CREATE TABLE IF NOT EXISTS users (
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

As you see, we're querying the nested content of the JSON kept in the _data_ column. Of course, you can access any other column or use data from other tables.

Your SQL will be placed in the WHERE statement.

If you're wondering what's **@event-driven-io/dumbo**, then it's a shared package between [Pongo](https://github.com/event-driven-io/Pongo) and [Emmett](https://github.com/event-driven-io/emmett).

## SQL updates

In the same way, you can also do updates. So instead of using the object-oriented Mongo API, you can do the follows:

```ts
const wonderland = plainString('Wonderland');
const oz = plainString('Oz');

const docs = await users.updateMany(
  SQL`data @> '{"address":{"city":"${wonderland}"}}'`,
  SQL`jsonb_set(data || '{"address":{"city":"${oz}"}}'::jsonb, '{age}', to_jsonb(COALESCE((data->>'age')::NUMERIC, 0) + '1'), true)`
);
```

The first SQL will be placed in the WHERE part, and the next one will be put into the UPDATE SET pipeline.

This will do the same as:

```ts
const docs = await users.find(
  { address: { city: 'Wonderland' } },
  {
    $set: { address: { city: 'Oz' } },
    $inc: { age: 1 }
  }
);
```

My point is for the MongoDB syntax. But I'll let you decide what looks simpler to you. 

## Do whatever you want with SQL

You can also have the freehand mode, where you can draw anything or actually place any SQL. There you have it!

You can access it from both the Pongo db and the collection. For instance to query only document id and address you can do the following

```ts
const result = await pongoDb.sql.query(
  SQL`SELECT _id, data->'address' as address from users`
);
```

It will return:

```json
[
  {
    "_id": "01928fee-d18b-711b-89d7-830ba98585e8",
    "address": {
      "city": "Dreamland",
      "street": "Oak St"
    }
  },
  {
    "_id": "01928fee-d18b-711b-89d7-755d49f389f6",
    "address": {
      "city": "Oz"
    }
  },
  {
    "_id": "01928fee-d18b-711b-89d7-790f5373cd10",
    "address": {
      "city": "Oz"
    }
  }
]
```

**As you can imagine, this means that you can also join with other tables, in general, whatever the SQL syntax allows you.**

You can also do any other operation that changes the data like:

```ts
const result = await pongoDb.sql.command(`SQL
  UPDATE users 
  SET 
    data = jsonb_set(data || '{"address":{"city":"Oz"}}'::jsonb, '{age}', to_jsonb(COALESCE((data->>'age')::NUMERIC, 0) + '1'), true) || jsonb_build_object('_version', (_version + 1)::text),
    _version = _version + 1
WHERE 
    data @> '{"address":{"city": "Oz"}}'`);
```

I think that's pretty neat and powerful. 

So, if you're afraid of using Pongo, you'll get a showstopper in compatibility; hey, I have you covered!

It's the same if your favourite language is SQL; you can do whatever you want. Underneath, Pongo uses [node-postgres](https://node-postgres.com) with connection pooling enabled by default, so the additional performance issue should not hit you.

See also the videos where [I showed all of that live](/pl/pongo_behind_the_scenes/).

Thoughts? Yay or Nay?

If you have more questions, join our [Discord server](https://discord.gg/fTpqUTMmVa) and let's tackle that together!

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
