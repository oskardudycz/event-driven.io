---
title: General strategy for migrating relational data to document-based
category: "Event Sourcing"
cover: 2023-05-07-cover.png
author: oskar dudycz
---

![cover](2023-05-07-cover.png)

**I was recently asked how to migrate a project using relational data to a document-based approach (e.g. from .NET ORM [Entity Framework](https://learn.microsoft.com/en-gb/ef/) into [Marten](https://martendb.io/)).** As always, it's easy to ask a question but much harder to answer. But hell, let's try!

Document approach differs from relational mainly by:
- using weak schema, 
- having denormalised data.

Contrary to common belief, document data is structured but less rigidly, as in the relational approach. We can easily extend the schema for our documents, even for specific ones, by adding new fields. We should also not fail if the field we expect to exist, but doesn't. That's why probably it's called _weak schema_. In my opinion, that's not a weakness by definition. In fact, it may mean that we [care about ourselves and apply backwards and forward compatibility](/pl/lets_take_care_of_ourselves_thoughts_about_comptibility/).

**Document databases work best if we access them by id, as they're [type of key-value databases](/pl/key-value-stores/).** That means we should group related data and keep them together to use it efficiently. For instance, selected product items only make sense with the shopping cart. That's why we should keep them together, use a shopping cart as a root document, and keep product items as nested collections. 

**Documents may also have relations.** But also lightweight, without enforcement like relational databases with their [foreign keys](https://www.w3schools.com/sql/sql_foreignkey.asp). Keeping the shopping cart example, we may have products' definitions as separate documents and keep only their ids in the product items list. We may also take the tradeoff and keep basic information like names to reduce the need to access other documents. Document databases usually don't provide efficient [joins like relational databases](https://www.w3schools.com/sql/sql_join.asp). They typically do look-ups. Look-up means that you're querying first one set of documents, then using data from them [getting related documents](https://martendb.io/documents/querying/linq/include.html). 

**So, how to migrate relational data into document-based?** The simplistic answer is to migrate data by loading batches from the relational database, serialising them and [storing them in batches in the document database](https://martendb.io/documents/storing.html#bulk-loading). But that's the technical recommendation. Moving from a relational way to the document one requires more than that, e.g. denormalising data and finding a way to break the strong relationships.

My general strategy would be:

1. Find root entities (e.g. for a shopping cart with product items, the shopping cart is the root entity). 
2. Then check related properties to see if they can live independently.
3. If they can't live separately, embed them inside the root entity. If they can, reference them by id.
4. Set those entities that can live on their own as documents.
5. Do this exercise and define policies for each table. Prepare the classes that will be loading and storing the data.
6. Set up a project to load data from a relational database and store them in a document database. The import process may take some time, so it should be run by a background worker. Remember to put extensive logging; this will help you troubleshoot issues.
7. Do a dry run and test the first migration for a single table.
8. After that, create a program that will load entities from relational and document databases and compare if they're the same.
9. Check what type of [indexes your document database provides](https://martendb.io/documents/indexing/) and apply those that make sense.
10. Rinse/repeat for other data.

11. Consider also using the _[strangler fig pattern](https://shopify.engineering/refactoring-legacy-code-strangler-fig-pattern)_ while migrating to your existing system to do it step by step. 

**Of course, you'll need to figure out a lot of grey matter, but it'd be worth first [making the change easy, then making the easy change](https://www.youtube.com/watch?v=3gib0hKYjB0).** So, minimising the data model refactoring during migration. 

It's also better to start with simple mapping without changing schema too much(unless your data is simple). After it works, consider adjusting it to fit the document approach. Read also my other article where I lined up the heuristics on changing legacy design: [What do the British writer and his fence have to do with Software Architecture?](/pl/chesterton_fence_and_software_architecture).

**See also decent reference guides:**
- [HevoData - How to Migrate Relational Database to MongoDB?: Made Easy](https://hevodata.com/learn/relational-database-to-mongodb/)
- [Couchbase - Migrating from Relational Databases](https://docs.couchbase.com/server/current/install/migrate-mysql.html),
- [MongoDB Data Modeling](https://learn.mongodb.com/courses/m320-mongodb-data-modeling).

Of course, those are just simple heuristics, as each migration should be made case by case, respecting the data we have and their business context. 

Still, I hope that they will be helpful enough to start your journey and plan your migration strategy!

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
