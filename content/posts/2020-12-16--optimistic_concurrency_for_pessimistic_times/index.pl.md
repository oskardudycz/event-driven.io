---
title: Optimistic concurrency for pessimistic times
category: "Wzorce projektowe"
cover: 2020-12-16-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2020-12-16-cover.png)

Apparently, one of the worst things you can wish someone is "may you live in interesting times". In these interesting times of ours, I wanted to write something to cheer you up, something optimistic. **What could be more optimistic than an optimistic concurrency?**

Why is concurrency optimistic? **It assumes that this scenario, when more than one person tries to edit the same resource (a record), will be a rare occurrence.** This assumption is correct for most system types. Usually, only one person at a time edits an order, ticket reservation, user data, etc. at the same time. 

Does it mean that we're following YOLO principle, and everyone overwrites everyone? Not at all. Well, almost not at all. The first person to get to the database/service is the luckier one, because their record update will be successful. The second one fails, and is told that someone has changed this resource in the meantime. Not a very pleasant thing, but as we know, our kind of concurrency is optimistic: the assumption is that such a scenario will be infrequent..

If we have an optimistic approach, then we should also have a pessimistic one, right? Yes, we do. How do these two approaches differ? Pessimistic assumes that there is a scheme that wants to spoil our resources, and if we just let it out of our sight for a moment, then something terrible will happen. Therefore, as a rule, as soon as we open an editing mode or open a record at all, we put a lock on it, which prevents others from editing until we graciously allow them to do so. Pessimistic locking is used, for example, in banking and other systems where finances are involved. In general, we're taking the semaphores up or down.

An optimistic approach has the advantage that the readings are allowed at any time; there are no restrictions here. Constraints are only for record updates (as described above).

This approach also has an essential business feature. **It assumes that we want to make decisions in our system based on the up-to-date information.** If we're going to change our resource and it has changed in the meantime, the system will ask us: "Someone updated this record. Do you really want to do it?".

How does the implementation of optimistic concurrency look?

1. Read the current version of the resource together with the record.
2. Modify the record and send it together with the (unchanged) version number.
3. The server/database reads the current version of the resource.
4. Check if the versions are the same.
5. If not, throw an error/return the error code.
6. If they are the same, allow the update, make it, and change the version (e.g. increment).

The version doesn't  have to be a number. Very often it does have one, but not always. Why? Because there is no need to verify if the number is bigger, smaller or different by one. It is enough to check if the version is the same. In distributed systems, it is challenging to get a globally incremented number (in any case without a negative impact on performance). That is why Guid is commonly used for versioning: it allows us to assign a new random Guid as a new version. This way, we do not have to do global number synchronization, which simplifies the solution considerably. Guids are used as versions of documents in Marten (see more: https://martendb.io/documentation/documents/advanced/optimistic_concurrency/). Entity Framework supports it as follows: https://docs.microsoft.com/en-us/ef/core/modeling/concurrency?tabs=data-annotations.

However, both EventStoreDB and Marten use numeric version numbers for event versioning (see, e.g. https://developers.eventstore.com/clients/dotnet/5.0/writing/optimistic-concurrency-and-idempotence.html#idempotence.). Those numbers are reused from the event sequence number (the number of occurrences in the events stream).

**Especially in distributed systems, optimistic concurrency shows its power**. In such systems, it is not easy to ensure strong data consistency. Using optimistic concurrency, together with distributed processing algorithms, allows for easier handling and simulating transactions. This is how distributed databases approach it:

- DynamoDB - https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBMapper.OptimisticLocking.html
- CosmosDB - https://docs.microsoft.com/en-us/azure/cosmos-db/database-transactions-optimistic-concurrency

**How can you handle this in the web API?** The most common approach is to send a version as an Etag header (https://en.wikipedia.org/wiki/HTTP_ETag). In the case of a version conflict, the 409 status is returned (https://http.cat/409).

Optimistic concurrency is also fundamental in ensuring the order of events in **Event Sourcing**. I encourage you to try going through the task from my "Self Paced Kit" as ademonstration of how this works: https://github.com/oskardudycz/EventSourcing.NetCore/tree/main/Workshops/BuildYourOwnEventStore/03-OptimisticConcurrency.

The lack of optimistic locking is also one of the reasons why Kafka is not a tool for Event Sourcing. You can learn more here: https://issues.apache.org/jira/browse/KAFKA-2260.

**Do you have any questions? Feel free to comment!**

Stay healthy and optimistic!

Oskar