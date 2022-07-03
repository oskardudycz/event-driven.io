---
title: How to ensure uniqueness in Event Sourcing
category: "Event Sourcing"
cover: 2022-03-09-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2022-03-09-cover.png)

_"How do I ensure uniqueness? For example, a unique username or an invoice number."_ That's usually one of the first questions I hear from someone starting the journey with Event Sourcing. 

Uniqueness is an intriguing case in general. In my over fourteen years of experience, the requirement of uniqueness appeared to be usually a myth. When we get the uniqueness requirement, it often means something other than the uniqueness itself. [Business often tries to bring us a solution, not a problem](/pl/bring_me_problems_not_solutions/). It's always worth asking why is it needed and what problem that would solve. It usually turns out that the problem lies somewhere else, and you should approach it differently.

Nevertheless, we might not always have a choice or enough power to argue about uniqueness. What to do when we actually have to do it?

Classically, we can use the unique index on the relational database. In Event Sourcing, we can also use it, as long as we use a relational implementation underneath. For example, Marten enables the following trick:
- we create an automatic snapshot that will store the current state of our aggregate (stream). This snapshot will be stored as a single record in the database.
- for such a snapshot, we can define a unique key on the fields. Marten stores the snapshot data in document form: [JSON type](https://www.postgresql.org/docs/current/datatype-json.html) columns. Postgres (on top of which Marten is built) allows defining indexes on a JSON column.

We can mark the snapshot as [inline](https://martendb.io/events/projections/inline.html) to be updated in the same transaction as the appended event. So if a snapshot is added/updated, the database key will ensure data uniqueness.

Let's be honest, however, that this is a pragmatic trick. It is not a "by the book" solution. Many Event Sourcing solutions do not provide such a possibility. For the most part, we have similar limitations as key/value databases.

Keys and indexes are fun, but they limit performance, cause deadlocks, etc. So if you want to get the most out of the [event log](/pl/relational_databases_are_event_stores/) and its "append-only" characteristics, it's worth considering other solutions.

All event stores I know give the uniqueness guarantee for the stream identifier. A stream is an ordered collection of events recorded for a specific object, for instance: events of a given user. The identifier could be an e-mail or social number for such a case.

Since the stream identifier is unique, by formatting it as _'user- {e-mail}'_, we can easily enforce the e-mail uniqueness for all users.

Oh well, but is it really easy? What if the user changes their e-mail? Or what if we say that e-mail should be unique only for active users? Or how to handle [GDPR](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation) then?

The first improvement is adding a hash function. It will allow adding new fields into unique constraints and anonymisation but won't help us with e-mail changes.

The _Reservation pattern_ comes to the rescue. When performing a business operation, first, we request a resource reservation: e.g. a unique e-mail value. Reservation should be durable and respected by concurrent resources. Typically it's recorded in some durable storage. For instance, for key/value storage like Redis, we may use the unique resource id (e.g. user e-mail) as a key. The most important is that this storage should allow us to claim the resource with a unique constraint. The reservation can be synchronous or asynchronous (e.g. when it requires more business logic than just adding an entry in some database). We can continue our main business logic only when we get confirmation that the reservation was successful. Remember, we cannot just ask if something is unique. Such a query doesn't give us any guarantees. Read more in [Tell, don't ask! Or, how to keep an eye on boiling milk](/pl/tell_dont_ask_how_to_keep_an_eye_on_boiling_milk/).

With a reserved resource (e.g. user e-mail), we can run the rest of the business logic and store the results in our main data storage. 

How to handle the case when the user has changed the e-mail? As the first step, we reserve a new e-mail to ensure that it's not used yet. Then we execute the business logic and finally send a request to release the reservation for an old e-mail. This can be compared to the good old concurrency pattern: [semaphore](https://en.wikipedia.org/wiki/Semaphore_(programming)).

It doesn't seem that complicated, but it can escalate. What to do when we reserve a resource, but the business logic crashes or the data fails to save? What if we change the e-mail, but releasing the reservation fails? We have a problem if our storage does not support transactionality (and a large part of key-value and event stores do not support it).

Here we come to the problems of distributed systems. I wrote more about it in my posts about [Outbox pattern](/pl/outbox_inbox_patterns_and_delivery_guarantees_explained/) and [Saga](/pl/saga_process_manager_distributed_transactions/). As always, it all depends on due diligence, risk management and potential consequences. The safest bet is to assume that everything can go wrong and have a [compensating action](/pl/what_texting_ex_has_to_do_with_event_driven_design/) up your sleeve. Such an operation could be triggered by a timer and cancel the reservation if it doesn't get a confirmation event within the set period. Alternatively, we can add an administrative method for the manual release of the resource. Such things will rarely happen, but if they do, we would prefer not to send a new software version to correct the data with some migration. Read more in [No, it can never happen!](/pl/no_it_can_never_happen/).

As always, the scenario is simple until it's not. It is always worth making sure what problem we're trying to solve. Do we really need a unique constraint? We should analyse our options risks and make a pragmatic decision tailored to our business and technical design.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/). You may also consider joining [Tech for Ukraine](https://techtotherescue.org/tech/tech-for-ukraine) initiative.
