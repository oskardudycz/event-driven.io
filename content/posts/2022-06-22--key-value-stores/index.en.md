---
title: Unobvious things you need to know about key-value stores
category: "Databases"
cover: 2022-06-22-cover.png
author: oskar dudycz
---

![cover](2022-06-22-cover.png)

Today I wanted to talk a bit about Key-Value databases. It is a seemingly obvious subject, but it is easy to overlook the basic assumptions and have a spectacular failure in production.

The general concept of such databases is straightforward. **Data consists of a unique pair - key and value. Key is responsible for the uniqueness of the representation; the value can be anything: **
- binary data (e.g. serialised objects or even a video file), 
- structured binary format (e.g. Protobuf or Avro),
- structured text file (JSON, XML), 
- plain text 

or any other form of writing that comes to our mind depending on the specific implementation Database.

Such databases start with elementary forms such as Azure Blob Storage or AWS S3 - where the value has no clear structure - these are bags/buckets for data. Interestingly, in S3, the key to your resource is unique worldwide. It cannot be repeated by any S3 users.

**This uniqueness is essential.** Keys are like trying to come up with your email while setting up a new mailbox account. We must think twice and come up with a pattern that will make it unique. Of course, we could generate a totally random email, but if someone wants to drop us a line, later on, they will have a problem finding it. In the end, the result looks like  _john.doe@gmail.com_, _aggy14@kisskiss.com_ or another format that will ensure that our email will not be repeated.

The same we do with keys in key-value databases. To ensure the uniqueness of the key, we can use a random UUID (_[Universally unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier)_). We can also develop a specific format, such as _"CustomerId-ProjectNumber-TaskNumber"_, that can represent a particular task in a customer's project.

**The choice of the method for a key definition may have significant consequences.** Using UUID will allow us to create a unique value by definition, but we must remember that we typically write the values ​​to read them later. UUID has a severe issue: it indexes poorly and may lead to bad performance. Why? Due to the nature of its randomness. These are entirely random values, so the database index will not be able to set a rule. Primary keys are typically [clustered indexes](https://docs.microsoft.com/en-us/sql/relational-databases/indexes/clustered-and-nonclustered-indexes-described?view=sql-server-ver16). That means that they laid out in memory to do effective seek operations. As the UUID keys are random, the database cannot find the pattern and index them efficiently. The potential solution to that is [sequential UUIDs](https://www.2ndquadrant.com/en/blog/sequential-uuid-generators/). They're pseudo-randomised numbers. Typically they're generated based on the timestamp from the server. Because of that, they can be well indexed by a database, as they're generated using a particular algorithm. Yet, the uniqueness is only guaranteed if they're generated on the same server.

**As you know, tree structures are made for searching. Keys created with a specific format give us the advantage of using them to model a tree structure.** Having the key defined with nested parts (e.g. with _[Unique Resource Name](https://en.wikipedia.org/wiki/Uniform_Resource_Name)_ format), we can make a quick traversal and find the specific record. We can use that to perform efficient filtering on key-value databases. We cannot use value for that because it can be anything. As mentioned above, it may be even a (more or less) random BLOB or plain text file. That means that it may not have any specific, uniform structure. Because of that, the database won't be able to find a pattern to effectively search it. To filter records, the database would have to scan all the values, read them and check if they meet our criteria (e.g. if they contain a given piece of text). That's clearly ineffective. Therefore, the proper key structure allows us to quickly navigate and find our records.

For instance, having the _"CustomerId-ProjectNumber-TaskNumber"_ key structure presented above, we can search find a project(s) for a specific customer or task(s) for a given project of a selected customer.
It all looks pretty, but what if we want to search for all the tasks with a specific number? We would have to go through all the customers and their projects and then through tasks. We're ending up with a well-known and disliked full scan. It's like that because we know only the last part of the key, but the first part is unknown, so we cannot traverse through keys using a tree structure.

**Despite appearances, key-value databases are not far from relational databases. In fact, the key-value is a relationship, a tuple.** How do relational databases cope with searches? They create indexes. They're creating additional lookups based on some criteria defined in the values. That speeds up reading but slows down writing (because we need to update lookups after each write). Quite a few key-value databases support some form of indexing, but...

We should remember that key-value databases are most efficient when traversing the key tree structure. Thanks to that, they are incredibly fast because they can quickly go to a specific place in memory. It's, in fact, a relational base stripped down to a bare minimum. Relational databases can be used for any form of data storage. They'll do everything okayish. But they cannot reach the maximum optimisations because they need to support too many use cases.

**Keys based on a tree structure also allow for much easier partitioning.** Distributed multi-region/multi-tenant systems can benefit from that. The key can be used for "routing": finding the location of the data. If we added to our key, for example, the prefix _"Continent-DataStoreName-CustomerId-ProjectNumber-TaskNumber"_, we would already know exactly where to get the data. This is how the mentioned Azure Blob Storage and AWS S3 work.

**Okay, what are document databases?** Document databases are key-value databases whose values ​​have a defined structure. That is why they are called _document_. They can be compared to paper applications we send to some government departments. They have specific fields with a set of possible values. Examples of such databases are [Marten](https://martendb.io/documents/), MongoDB, RavenDB.

**A similar principle guides the wide-column databases.** It is a step closer to the relational base. In such databases, we still store data in the form of key-value, but the values ​​themselves are stored in the form of columns. So each value is one row with columns. How is this different from relational databases? That each value can have a different set of columns. Examples include DynamoDB, CosmosDB, Azure Table Storage, and Cassandra.

Redis and Elasticsearch are key-value databases. We can use such databases and not even know about that. Interestingly, for example, Kafka underneath is a key-value database wrapped with algorithms and techniques for data replication and consensus determination.

**The last group of key-value databases are event stores.** They have the same rules about keys as I explained above, but the value is a sequence of events (think the sequence of facts about the entity). Examples? [Marten](https://martendb.io/events/), [EventStoreDB](https://www.eventstore.com/), [Axon Server](https://developer.axoniq.io/axon-server/overview) etc. Interestingly event stores can be modelled on top of other databases, so relational ones, key-value etc. So they're kind of meta-databases.

If we look closer, we'll find that most of the systems we work on do not have relational data. Most of them reflect the physical process of documents' workflows. Our clients often transfer physical processes to digital forms: invoices, orders, tickets, personal data, and already mentioned applications. These are all documents.

So why do we use relational databases? Because they are good enough for many cases, popular, and suitable for advanced filtering, which is where relationships work great.

Did you know that the first RDBMS was released in 1979 by Relational Software - today is known as Oracle. It was only in the 1980s that relational databases gained their popularity. Before that, object bases ruled. Also, NoSQL databases are nothing new. They are older than relational databases. The success of relational databases was that in the 1980s, every bit, byte, was worth its weight in gold - literally. The normalisation of relational databases significantly reduced the size of stored data. Now we don't have this problem. Data storage is cheap. Information is priceless.

Therefore, when making decisions, let's remember the basics. Let's check the nature of the data we store. Remember that we do not have to limit ourselves to one type of database. We can use different types tailored to a specific problem where it makes sense. Especially with emerging cloud solutions, operational costs are lower, and we can be more precise in modelling and tool selection. Thanks to that, our systems can be optimised and benefit in those places that need innovations most.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/). You may also consider joining [Tech for Ukraine](https://techtotherescue.org/tech/tech-for-ukraine) initiative.
