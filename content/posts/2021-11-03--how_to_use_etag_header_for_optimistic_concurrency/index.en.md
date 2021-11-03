---
title: How to use ETag header for optimistic concurrency
category: "API"
cover: 2021-11-03-cover.png
author: oskar dudycz
---

![cover](2021-11-03-cover.png)

In my article ["Optimistic concurrency for the pesimistic times"](/en/optimistic_concurrency_for_pessimistic_times/), I described the premises for optimistic concurrency handling. As a reminder, we assume that conflict situations will be rare. A conflict arises when two people try to change the same record at the same time. When this happens, we will only allow the first person to update the state. All other updates will be rejected. For verification, we use a record version that changes with each save.

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

For _ETag_, an example of the _strong_ format would be concatenating the _Uuid_ record's identifier and its version. The _weak_ format can be, e.g. numeric id joined with version (in the context of the whole collection) or just version (in the context of specific record).

To use _ETag_ for optimistic concurrency, we need to use the _If-Match_ header. While sending a request to change the state (e.g. _PUT_), we should send the expected state version as the value of the _If-Match_ header. The server should check if the _ETag_ value is equal to the current one. If it equals, save succeed. Otherwise, it should send the [412](https://http.cat/412) response status.

The example flow may look as follows:

1. Return the entity's current version while reading the data.

```bash
$ curl -i user-management.com/api/users/ce601dc7-ea93-4b7c-879a-bdb4c187adfa

HTTP / 1.1 200 OK
ETag: ce601dc7-ea93-4b7c-879a-bdb4c187adfa_1
{
    id: ce601dc7-ea93-4b7c-879a-bdb4c187adfa,
    email: contact@oskar-dudycz.pl,
    version: 1
}
```

2. Modify the state and send it with the (unchanged) version.

```bash
$ curl -i -X PUT \
  -H "Content-Type: application/json" \
  -d '{ "email":"new.contact@oskar-dudycz.pl" }' \
  -H "If-Match: ce601dc7-ea93-4b7c-879a-bdb4c187adfa_1" \
  user-management.com/api/users/ce601dc7-ea93-4b7c-879a-bdb4c187adfa

HTTP/1.1 200 OK
ETag: ce601dc7-ea93-4b7c-879a-bdb4c187adfa_2
```

3. When someone else tries to update the state with the obsolete value, return an error code:

```bash
$ curl -i -X PUT \
 -H "Content-Type: application/json" \
 -d '{ "email":"this.will.fail.contact@oskar-dudycz.pl" }' \
 -H "If-Match: ce601dc7-ea93-4b7c-879a-bdb4c187adfa_1" \
 user-management.com/api/users/ce601dc7-ea93-4b7c-879a-bdb4c187adfa

HTTP/1.1 412 Precondition Failed
```

4. The client must then get the latest state together with new version.

```bash
$ curl -i user-management.com/api/users/ce601dc7-ea93-4b7c-879a-bdb4c187adfa

HTTP/1.1 200 OK
ETag: ce601dc7-ea93-4b7c-879a-bdb4c187adfa_2
{
    id:ce601dc7-ea93-4b7c-879a-bdb4c187adfa,
    email: new.contact@oskar-dudycz.pl,
    version: 2
}
```

5. And then make the change again, if it makes sense, using the new value from the _ETag_ header:

```bash
$ curl -i -X PUT \
 -H "Content-Type: application/json" \
 -d '{ "email":"this.wont.fail.contact@oskar-dudycz.pl" }' \
 -H "If-Match: ce601dc7-ea93-4b7c-879a-bdb4c187adfa_2" \
 user-management.com/api/users/ce601dc7-ea93-4b7c-879a-bdb4c187adfa

HTTP/1.1 200 OK
ETag: ce601dc7-ea93-4b7c-879a-bdb4c187adfa_3
```

Optimistic concurrency also allows you to simplify logic and, especially in non-relational databases, obtain strong guarantees without using such heavy tools as unique keys, foreign keys, etc. We can skip those checks if we know that we are making business decisions based on the latest state of our data.

Cheers!

Oskar