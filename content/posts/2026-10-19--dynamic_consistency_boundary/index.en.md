---
title: "Thoughts on Dynamic Consistency Boundary"
tags:
  - Event Sourcing
cover: 2026-10-19-cover.jpg
author: oskar dudycz

---

![cover](2026-10-19-cover.jpg)

> _"Hi Oskar, have you ever given DCB any attention?"_

I got that question on Discord recently. I replied: _"Yes, I did, what's the question behind the question?"_ And after a few messages, it came:

> _"Is it on the Emmett roadmap?"_

That was my guess, and my answer was: not for now.

It wasn't the first time I've been asked, and I think it's time to share my standpoint. Especially since I have a GitHub issue on Emmett to answer the same question.

I wasn't much active in DCB discussions intentionally. I'm not against Dynamic Consistency Boundaries (DCB). I see it as an interesting pattern, but not as a safe default choice, as some people try to explain it. In other words, I don't see it as a high priority for me, and it's not the endeavour I want to take right now. But I also don't mind people doing it and bringing that to their solutions. 

## What's Dynamic Consistency Boundary

It's an idea brought by Sara Pellegrini and Milan Savic 3 years ago:

`youtube: https://www.youtube.com/watch?v=wXt54BawI-8`

At that time, engineers at Axon, the company behind the Java Event Store and CQRS Framework.

They started with the example of students signing up for courses. Let's use it here also to explain it.

The rules are:
- a course has a limited number of places,
- a student can't be enrolled in more than a certain number of courses.

Suppose student `Oskar` can attend at most five courses and is already enrolled in four. Courses `Math` and `Programming` both have free places.

If we're building an event sourcing system, we could design a stream per course and a stream per student. Enrolling needs information from both: how many students are already in the course and how many courses the student already has. So which stream should the decision live in?

If a course has a limited number of places, we can check it on the course stream. If it handles all sign-ups, we can validate whether we have already reached the limit. If we have, we wouldn't allow further sign-ups. All mature event stores support optimistic concurrency and atomic appends to the stream. Fine.

Now, how do we check whether our student has reached the course limit for the semester? The student stream could validate that. If we start sign-up from their stream, we could ensure that they didn't sign up for more than their limit. Fine.

But how do we ensure both? What if our event store doesn't have transactions or at least atomic multi-stream appends? Then we can't enforce both conditions in a single operation, because between one append and the other the process may die, and we end up inconsistent.

We could, of course, decide which rule is _more important_ and append to the course stream, then subscribe to it and asynchronously update the student stream to include that information. Then we could also run a compensating operation to cancel their sign-up if they had more course sign-ups than allowed. That would work, but we would need some coordination and compensation that may not be needed in simple cases, and some people are afraid of it.

**DCB proposes to stop asking which stream the decision belongs to.** Instead of appending events to streams, we tag them:

```json
{
  "type": "StudentSubscribedToCourse",
  "data": { "studentId": "s1", "courseId": "c1" },
  "tags": ["student:s1", "course:c1"]
}
```

When handling a command, we select the events needed for the decision by type and tag. To enrol `Oskar` in `Math` course, we need the events defining the course and its capacity, the subscriptions to this course, and the subscriptions of this student:

```json
[
  { "types": ["CourseDefined", "CourseCapacityChanged", "StudentSubscribedToCourse"], "tags": ["course:c1"] },
  { "types": ["StudentSubscribedToCourse"], "tags": ["student:s1"] }
]
```

We build the state from those events and make the decision. Then we append the new event with the condition: _"fail if any event matching this query was appended after the position I read"_. The event store checks this condition atomically with the append.

In our case, both requests read the same `student:Oskar` events. The first append succeeds. The second fails because an event matching its query, `StudentSubscribedToCourse` tagged with `student:Oskar`, was appended after the position it read. We retry, and this time the limit check rejects it.

We don't pick the consistency boundary upfront when designing the system; each command defines it with its query. That's where the _dynamic_ in the name comes from.

The strongest case for DCB goes like this:

- **One decision, one event.** Enrolling a student in a course is one business decision, and we record it once, instead of duplicating it in two streams or adding artificial events to other streams.
- **Boundaries chosen per command.** If we got the boundary wrong, we change a query rather than a stream design.
- **Narrower conflicts.** A decision conflicts only with new events it depends on, not with everything appended to the same stream, because the boundary includes event types, not only ids.
- **Reading only the last matching event**, which can replace snapshots.

Those are good points, and I see why people like them. To explain where I land differently, I need to go back to where the idea started.

**If you watched the video I linked earlier, the original idea didn't have tags.** The consistency boundary could be any query over past events, and I can see why that was so tempting. Deciding how to group events into streams is one of the first modelling decisions we make in Event Sourcing, and we make it upfront, when we know the least about the business. 

The power of Event Sourcing is that our domain model (events) is also the technical model. We can get synergy between them and more easily understand how our system works. 

But that can also mean that if we mess up modelling, we also mess up the technical part. The decision about stream type/category then drives not only the business model, but also consistency boundaries, concurrency, and performance. Changing that later, undeniably, has a cost.

The tagless idea promised to remove it. Events would just be facts in a log, and each decision would ask exactly the questions it needs: _"has anyone taken the last place in this course since I checked?"_, _"is this student already enrolled in too many courses?"_. If we understood the business better later, we'd change the question, not the data. That could also be closer to how business people describe their decisions.

That was truly dynamic, and honestly, that's the version I liked more, even though I already saw it as niche.

**Then it met reality.** To guarantee consistency, the event store has to run that query atomically with every append, while other appends happen in parallel, and make sure none of them changes the query result. For arbitrary queries over all events, the database has to either lock much more than needed or track everything that each transaction read. That's a fight with physics, and it won't hold at any larger scale or with many parallel writes. I explained that in [The Order of Things: Why You Can't Have Both Speed and Ordering in Distributed Systems](/en/the-order-of-things-why-you-cant/).

Tags are the pragmatic compromise to that. Instead of running any query over the event data, the event store can precompute an index for each tag and event type. That's something doable for most databases. I understand that compromise; some simplification was needed to make the idea work with typical storage systems. But that simplification changes its nature.

Tags have to be known when we append the event, which means we need to know upfront how we'll query for it later. Logically, it's similar to linking events to other streams, which some event stores support (e.g., KurrentDB and RailsEventStore). It's just less flexible: we can link an event to another stream later, but a tag has to be there from the start. We can retag events, but that's a migration. The selection at command time stays dynamic, but the boundaries are set when we append the event.

Now look again at `student:Oskar` and `course:Math`. Those are tags, but they also look like identifiers of specific entities, which is exactly what stream IDs are. Technically, those tags create streams; the difference is that a single event (logically) lands in several of them. That's more flexible than single-stream append, but for me, it's a big compromise compared to the original idea, as it brings us much closer to what we already had.

When I discussed it, I heard a fair counterargument: DCB is a superset of what we had before. We can do traditional Event Sourcing with DCB by always having one tag per event, which is essentially a stream name. Two tags let us touch more than one entity in a single append. And selecting by multiple event types is something only DCB can do.

Yet, if we only operate on tags, what's the difference from loading two streams and wrapping their optimistic concurrency checks in a single transaction? That's what multi-stream appends could give us. 

Back to our two requests: each of them loads its course stream and the `student:Oskar` stream, makes the decision and appends to both in one transaction, checking the expected versions of both. The first one bumps the version of `student:Oskar`. The second one fails its check, retries, and gets rejected by the limit. The result is the same as with DCB. DCB may be faster here, but not necessarily; I'll get to that later.

What's left is narrowing conflicts by event type. Say that while `Oskar` enrols in a `Math` course, they also change their email address, and we record `StudentEmailChanged` in the `student:Oskar` stream. With streams, the enrollment fails its concurrency check and has to be retried, even though the email has nothing to do with it. With DCB, it succeeds, as `StudentEmailChanged` isn't part of its query.

That's useful, but how often does it happen? We use optimistic concurrency because we assume that conflicts will be rare, and a retry means reloading the state and running the decision again. Personally, I've never had a situation where conflicts were so frequent that they became a real problem. When I saw them happening often, it was a design smell, and the answer was to look at the design, not to narrow the conflicts. If conflicts are frequent by the nature of the business case, pessimistic locking may be a better fit.

And if narrowing conflicts does matter in a specific case, I'd rather get it differently. That's also how I'd see tags: as low-cardinality labels, closer to hashtags, like `course:enrollment`. Such a label tells what kind of information the event carries. Identifying specific entities is what streams are already good at. I'd keep them as logical boundaries, but without locking the whole stream on each append. The append would then say: these are the streams I'm touching, and these are the labels I care about within them. For our enrollment, that's the `course:Math` and `student:Oskar` streams, and within them, the events labelled `course-enrollment`. `StudentEmailChanged` isn't one of them, and it wouldn't conflict. A small, fixed number of such labels would also simplify the implementation, since the unbounded number of high-cardinality tags is what complicates it.

Low-cardinality tags like `student:Oskar` and `course:Math` are good for the write model, where we want precise information about what to load and change. Yet they're also terrible for business analysis, because event size grows and you can't easily group or filter by criteria.

So to me, tags, as they're shown most of the time, made DCB mostly a solution to a technical problem, while it was supposed to solve a modelling one. And multi-stream appends solve that technical problem without changing the storage model.

Concurrency is also a different problem than stream length or aggregate size. A stream may live long and be big without having any concurrent writes. Of course, legacy noun-based aggregates, like keeping everything about the user in a single stream, are too big, and DCB is more forgiving for them. But it doesn't fix their design; it just makes it hurt less.

## Are more events a problem?

If multi-stream appends give us the same guarantees, what's left? The argument I hear most often is that streams end up with too many events. It comes in three flavours:

- the same fact recorded in several streams, e.g. the enrollment recorded both in the course and in the student stream,
- artificial events appended only to bump a stream's version,
- "technical" events in process streams, which domain experts wouldn't use.

Let's go through them and check whether they're really an issue.

Let's take the cinema reservation example, and say we have a distancing rule from _good-old-Covid_ times: when someone reserves a seat, the seats next to it must stay empty. If we have a stream per seat, we need to load the neighbouring seats too, as we need to check them (the seat on the left and the seat on the right of where we're sitting). To also get the optimistic concurrency check on them, we have to append something to their streams, something like `SeatNextToWereTaken`. Nobody in the cinema would describe what happened that way, in total 3 events.

I agree that `SeatNextToWereTaken` sounds redundant. But this could also be solved technically. If our event store supports multi-stream appends, and we're using the relational database, we could bump the version just on the stream's row in the streams table, without appending any event. 

The same fact recorded in several streams is a different story. With a multi-stream append, the course stream records that a student enrolled, and the student stream records that they got a new course. Is that a problem? I don't mind having multiple events instead of a single one. Events are usually small, and their size is rarely an issue. Each stream also gets a linear history of its own observations, which makes it easier to understand what happened from its perspective.

Same for the cinema reservation: if we see in the stream that `SeatNextToWereTaken`, we have clear local information about why we need to reject the reservation, without needing to look around at the queries we have and why it was rejected. Imho, this is a big benefit on its own.

The third flavour needs more context, since it comes from explicitly modelling processes. And that brings me back to the enrollment example.

**The course example is a good way to show how DCB works, as the rules are simple and easy to follow. But I don't think it's the best example of why we'd need DCB.** I'm not an expert in this domain, but whenever we enrol in something, there are usually a few steps before it's final. The example flattens that process into a single, CRUD-like operation, which raises the question of which stream the decision should live in. That's fine for an introduction, but I'd like DCB examples also to show how such a process works in reality.

When I raised that, I heard:

> _"Regardless of the process, at the step where we add the student to the course, we'd add them without checking the student's limit, and then we'd have to roll it back. DCB simplifies that step."_ 

Yes, but we don't need a saga or a rollback for that. We can either do it in a single transaction, as I described above, or have a stream dedicated to the process. In my experience, the latter is usually the better option, as it's closer to how the business works.

What do I mean by a stream dedicated to the process? Let me explain it with the example I used in my [webinar on distributed processes](https://www.architecture-weekly.com/p/webinar-3-implementing-distributed) and in [How TypeScript can help in modelling business workflows](/en/how_to_have_fun_with_typescript_and_workflow/): a hotel group checkout.

When a group of guests leaves the hotel, the clerk doesn't want to check them out one by one. They select multiple guest stays and run the checkout as a batch. Each guest stay has its own stream and its own rules. For instance, we can't check out a guest whose balance isn't settled. Some checkouts may succeed, and some may fail, so the group checkout must gather the results and decide whether it completed or failed.

Such a group checkout could get its own stream in which we would record the information on the completed single checkouts. It could look like that:


```text
Pos |  Event 
----|-----------------------------------------------------------------
1   | GroupCheckoutInitiated
2   | GuestCheckedOut {guestId: 'g1'}
3   | GuestCheckoutFailed {guestId: 'g2', reason: 'BalanceNotSettled'}
4   | GuestCheckedOut {guestId: 'g3'}
5   | GroupCheckoutFailed
```

We could also follow [the Workflow Pattern](https://blog.bittacklr.be/the-workflow-pattern.html) and record the commands it handled. That's also how [workflows in Emmett](/en/workflow-engine-design-proposal-tell/) work. The stream of a single group checkout can look as follows:

```text
Pos |  Kind   | Direction | Message
----|---------|-----------|------------------------------------------
1   | Command | Input     | InitiateGroupCheckout {groupId: '123'}
2   | Event   | Output    | GroupCheckoutInitiated
3   | Command | Output    | CheckOut {guestId: 'g1'}
4   | Command | Output    | CheckOut {guestId: 'g2'}
5   | Command | Output    | CheckOut {guestId: 'g3'}
6   | Event   | Input     | GuestCheckedOut {guestId: 'g1'}
7   | Event   | Input     | GuestCheckoutFailed {guestId: 'g2'}
8   | Event   | Input     | GuestCheckedOut {guestId: 'g3'}
9   | Event   | Output    | GroupCheckoutFailed
```

The clerk's command starts the process (1). The group checkout records that it was initiated (2) and sends a checkout command for each guest stay (3-5). Each guest stay handles its checkout according to its own rules, and the results come back as inputs (6-8). Once they're all back, the group checkout decides the outcome (9). In this case, it failed, as one of the guests didn't settle their balance.

Positions 6 to 8 are our third flavour. They record in the group checkout stream that it learned about each guest's checkout. Domain experts wouldn't phrase it that way, and that's why some people call such events "technical". I see it differently. It's close to bookkeeping, where we add entries to the ledger to record that something happened. If we use a transaction or DCB, we can skip it, as things happen "together". Logically, it still exists, but experts often don't say it explicitly, and it can feel a bit artificial. It also depends on the implementation style; without Event Sourcing, we don't need additional events, as we can just update the state.

Some may say that it's just an event-sourced process manager. Maybe, but I don't see a problem with that. For me, it's a form of data locality: everything about this group checkout is in one place, together with what triggered each decision.

Process streams are quite often also closer to how the domain really works. Payment is a good example. It's never just a `Paid` event; it's a bigger workflow, where `PaymentInitiated` is followed by `PaymentAccepted` or `PaymentCancelled`. If we don't have a place to model the process, we're tempted to flatten it into a single event.

So are those additional events an issue? For the event store, not really. Event stores handle a large number of streams well; what hurts them are long streams that are actively accessed. Process streams are the opposite. They're short, live only as long as the process, and once the process finishes, they're rarely read. We can then archive them, as I described in [Keep your streams short!](/en/keep-your-streams-short-temporal-modelling-for-fast-reads-and-optimal-data-retention/).

For us, they're useful, and the value becomes even more visible when a process crosses modules, because then we also have to deal with race conditions. Let's take the order process I described in [Saga and Process Manager](/en/saga_process_manager_distributed_transactions/). After the customer confirms the shopping cart, we initiate the order and request the payment from the payments module. When the payment is completed, we ask the shipments module to send the package. If the product turns out to be out of stock, we refund the payment. If the customer doesn't pay in time, we cancel the order.

Each module has its own storage and works at its own pace. Messages between them don't come in a guaranteed order; we have no ordering guarantees between different queues (read more in [Dealing with Race Conditions in Event-Driven Architecture](/en/dealing_with_race_conditions_in_eda_using_read_models/)). Let's say that the customer paid at the last moment. The timeout fired, and we cancelled the order, but a moment later, we got the information that the payment was completed. The order process stream could look as follows:

```text
Pos |  Kind   | Direction | Message
----|---------|-----------|------------------------------------------
1   | Event   | Input     | ShoppingCartConfirmed {cartId: 'c1'}
2   | Event   | Output    | OrderInitiated {orderId: 'o1'}
3   | Command | Output    | RequestPayment {orderId: 'o1'}
4   | Command | Input     | TimeoutOrderPayment {orderId: 'o1'}
5   | Event   | Output    | OrderCancelled {reason: 'PaymentTimedOut'}
6   | Event   | Input     | PaymentCompleted {orderId: 'o1'}
7   | Command | Output    | RefundPayment {orderId: 'o1'}
```

Positions 4 to 7 show the race condition and how we dealt with it. We cancelled the order because of the timeout, and only then did we learn that the payment went through, so we refunded it. If the payment had arrived before the timeout, the stream would continue with `SendPackage` to the shipments module, and then with either `PackageWasSent` or `ProductWasOutOfStock` followed by a refund.

The stream records the order in which we observed things and what we decided based on that. When a customer asks why they got a refund, we don't need to correlate events from the order, payment, and shipment modules by timestamp, which can lie because of clock skew between services. We read one short stream. Essentially, we're making the chaotic outside world linear, based on the order of our observations.

**DCB wouldn't help us here; it'd even make it harder.** Payments and shipments are separate modules with their own storage, and an external provider may even process the payment. To create a dynamic consistency boundary across them, all their events would need to live in the same event store, which means sharing storage between modules and coupling them through it.

In exchange for the additional events, we get:

- **Observability.** We look at the process stream and know exactly what happened and why.
- **Linearity.** Each stream tells the story from its own perspective, in the order in which it observed things.
- **Handling of race conditions.** The process stream is the place where we decide what to do when things come in an unexpected order, and it records that decision.
- **Easier migrations when the process changes**, as each process instance is a separate, short stream.
- **Scalability and autonomy.** Each stream could, if we insist, live in a different database, which makes sense in the serverless era. Modules can keep their own storage.

**Could we get the same by looking at tags or correlation ids?** Partially, yes. We can reconstruct the process that way, but then we need additional tooling, and without it, it's hard to tell where the source of truth is.

There's no perfect method; each of them has flaws. It also depends on what we optimise for. In my approach, I optimise for precision in understanding the domain and the process. The compromise I accept is that some events may seem redundant, or the ceremony may feel too big. I prefer to do a bit too much rather than flatten the process and the domain. That's, by the way, my biggest complaint about some practices in Event Modeling.

I mentioned that what hurts event stores are long streams that are actively accessed. That's the other side of "too many events": too many events in a single stream. 

DCB has an answer for that too: reading only the last matching event, which can replace snapshots. I think we shouldn't need snapshots at all. Snapshots are a good optimisation tool, but a technical one, focused on performance. They should be a conscious trade-off, not a hack we reach for by default. Yet they're often presented as the default way to handle long streams. The record holder I saw while working at Event Store had tens of millions of events in a single stream. By now, it probably has hundreds of millions. That's why I prefer to show how to model streams and keep them short, rather than work around long streams with a technical solution.

I explained how to do that in [Keep your streams short!](/en/keep-your-streams-short-temporal-modelling-for-fast-reads-and-optimal-data-retention/), using the example of cash registers in a department store. The classical approach is a stream per cash register, with all transactions registered on it. If we register one transaction every three minutes, that's around 4,200 events per month, and the stream never stops growing. Yet, if we take a closer look or talk with domain experts, we notice the lifecycle: the cashier's shift. It starts with `ShiftOpened` and ends with `ShiftClosed`, and we only care about the current shift. The `ShiftClosed` event contains the summary that the next shift starts from. It may look like a snapshot, but it's the result of a business operation: the cashier closes the shift and declares the tender.

The same goes for the [bank account, a common example in Event Sourcing](/en/bank_account_event_sourcing/). There's no database transaction between multiple bank accounts when we transfer money, and accounting doesn't treat a bank account as a transactional boundary. It works in periods, like the accounting month. Yes, there's no spoon (read more in [Implementing Closing the Books pattern](/en/closing_the_books_in_practice/)).

## What if I model it wrong?

All of that requires modelling, and we won't always get it right. That's why I often hear: _"What if I model it wrong?"_

When I asked what the biggest struggle with the classical stream design was, I heard that if we make a modelling error in an aggregate boundary, we may be forced to migrate. That's a real challenge, and it's tempting to think DCB removes it, since the boundary is just a query we can change. Yet tags have the same flaw. They also have to be defined upfront, and we can get them wrong as well. I'd even say we can get them wrong more easily, since with tags we're not drawing boundaries at all, and I think drawing them is important.

Why? Because a well-designed stream reflects our process and how things happen in reality. When we read the cashier's shift stream, we see what happened during that shift, in the order it happened. The group checkout stream shows the order in which we sent the checkouts and learned their results. The story is already there, and we don't need to reconstruct it. With tags, an event belongs to many logical streams at once, and to get the story of a single process, we have to reconstruct it with a query.

And if we get the stream design wrong? Then we need a migration, just like retagging in DCB. With streams, that's the copy-and-transform pattern: we subscribe to the old streams, transform their events, and append them to the new streams. Event stores should make that easy, and they don't, Emmett included. That's something I'd like to add out of the box, and I plan to do it before DCB.

I also heard the opposite argument: DCB could lower the barrier to entry. Tag the events, select the event types and tags needed for each command, and that's it. No need to think upfront about how to split the system into streams. Similarly, Event Sourcing can be easier for beginners to grasp than for people who spent their whole careers with state-based systems.

My experience is different. From training and teaching, especially people outside the Event Sourcing community, I see that people won't easily get which events they should select and why. Those are the people I optimise my work for, because I want to make Event Sourcing accessible to them. It's so different from how they work that they'd rather give up on it. Even the Decider pattern is hard for many of them. In Decider, the business logic is just two functions: _decide_, which takes a command and the current state and returns new events, and _evolve_, which builds the state from events (I explained it in [How to effectively compose your business logic](/en/how_to_effectively_compose_your_business_logic/)). That's already a different way of thinking than loading an entity, changing it and saving it. DCB adds even more heavy lifting: for each command, we also need to define which events to load and why, and that query becomes the consistency boundary.

Let's see what that means for our enrollment. With streams, the decision loads `course:Math` and `student:Oskar`, and whatever is appended to them is inside the box. That's why `StudentEmailChanged` caused a conflict. Now, say that the business adds a rule: a suspended student can't enrol in new courses. We start recording `StudentSuspended` in the student stream. We still need to handle it in the decision logic, but the enrollment already loads it, and if the suspension happens while the enrollment is processed, the concurrency check catches it. With DCB, we also have to add `StudentSuspended` to the enrollment query. If we forget, the decision won't see it, the append condition won't protect us, and nothing will tell us.

That's the trade-off. The box isn't as precise as a query, and it creates conflicts we don't care about, like the explained email change. But it's good enough for most typical cases, and we decide on it once per stream type. With DCB, we write a query for each command and decide which event types and tags it must include. We have to think about it every time. That's good for the important cases, but I don't see many teams with enough rigour to do it right every time.

I also got asked whether
> _"which events should I select?"_ 

is the same question as 

> _"why should this be a separate aggregate?"_ 

For me, not really, as **I don't think in aggregates**. I think in streams and in where I want my source of truth and consistency, and I decide on that once, not for each command.

I've heard that in the Event Modeling community, business people find the query-per-command approach natural and developers need the paradigm shift. That might be true for some people. Still, this is one way to model software systems; maybe it'll become mainstream someday, but for now it's a niche. A niche already aligned with event-driven thinking. That's not the same as saying that it's easier for newcomers who haven't worked much with event-driven systems. If DCB became the default, I'm afraid it'd make Event Sourcing harder to adopt outside that niche.

DCB can also align with [Vertical Slices](/en/my-thoughts-on-vertical-slices-cqrs/). Still, for me, it's similar to functional programming. When you understand it well and know what you're doing, it can make a slice simpler and more focused. If you go too far, newcomers won't understand the code. That's why I see DCB as a tool for experienced people.

Experience helps you get queries right, but it doesn't help with events we don't own. That's a concern I heard from someone looking at DCB from outside Event Sourcing, and I fully agree. DCB assumes that we own all the events we use in a decision. In most organisations, many teams work on different business domains. 

A "transaction" over events that don't belong to us ends in one of two ways: either we synchronise each change with the other team, which means a longer lead time, or we change things without communication, which means integration bugs. And, as we saw with the order process, once we cross system boundaries, like a payment provider, a courier or microservices that don't share a database, we still need workflows, process managers or sagas, with or without DCB.

To be fair to DCB, many of the pains that make people look for it don't come from the stream-based approach itself, but from the limits of the event stores we use. If the event store doesn't support multi-stream appends, we end up with artificial events like `SeatNextToTaken`. If it doesn't provide copy and transform, fixing a wrong stream design means a painful, custom migration. If it doesn't support archiving or closing the books, streams grow forever, and we end up reaching for snapshots. With such limitations, DCB looks like a way out, and I understand that. Yet those are tooling problems, and we can solve them in the tooling without changing the storage model. That's why I prefer to enable stream lifetime features like archiving, closing the books, etc. in Emmett first.

There's also one scenario where I think DCB can be an okayish starting point: migration. Let's say a team has an audit log of changes but no streams and wants to move toward Event Sourcing. 

If you'd like to use Event Sourcing but have an audit log or outbox with messages that carry entity ids, and nobody has grouped them into streams, regrouping all history upfront is a big step. DCB allows them to go step by step:

1. Treat the existing entries as events and tag them with the ids they already carry, e.g. `order:o1` or `customer:c1`.
2. For new decisions, select the needed events by types and tags, and append the results with the append condition. That gives consistency on top of the existing log, without regrouping it first.
3. Observe which events are read together, and where the lifecycles are. That's the knowledge we usually don't have upfront.
4. Introduce streams for those, move the events there with copy and transform, and switch decisions to them one by one.

It's not perfect. Audit log entries often aren't proper business events, but records of changed data. They need interpretation first (I wrote about the differences in [Is the audit log a proper architecture driver for Event Sourcing?](/en/audit_log_event_sourcing/) and about moving from relational data in [Hitchhiker's Guide To Moving From Relational Data To Events](/en/the_end_is_near_for_crud_data/)). And if the team builds the DCB part on its own, it effectively builds its own event store, with all the challenges I'll describe in the next section. I don't think they should; building an event store is a big project in itself.

**So where does DCB fit?** In my opinion, in very specific situations, where creating an additional stream or additional events would be redundant compared to how the business works. That means within one bounded context and one database, and with a team experienced enough to get the queries right. In my experience, those cases are much rarer than they seem. Of course, that also depends on the kinds of problems I was exposed to. And it can be a stepping stone in migrations, as long as it's not home-brewed.

## Why not in Emmett, then?

So far, I've talked mostly about modelling concerns, but I'm also building a tool. And that's where the second group of my reasons comes in.

A general-purpose event store must deliver three things at once: correct consistency under parallel writes, subscriptions with clear ordering guarantees, and decent performance. With streams, each of them has well-known solutions. DCB makes all three harder at the same time.

Let's start with consistency. In Emmett, as in Marten and SqlStreamStore before it, I keep a streams table. The optimistic concurrency check runs against a single row there: the expected stream position, incremented by one. A unique constraint on stream id and stream position is the last line of defence. Nothing queries the messages table inside the append transaction, so there's no risk of deadlocks and no need for table locks or serialisable isolation. I also take the global position in the final step, after the concurrency check, which reduces gaps.

A DCB append can't work the same way. Its condition says: _"nothing matching this query was appended after position X"_. To check it, the event store has to query events and their tags, instead of a single row. And it has to be atomic with the insert, relative to all parallel appends that could match it. Back to our two requests for `student:oskar`: both read the same student events, and when both try to append, one of them has to see the other's event, even though it wasn't committed when its check started.

The PostgreSQL implementations I've seen typically deal with that in one of the following ways:

- **Serialisable isolation.** The condition query and the insert run in a transaction with the serialisable isolation level. PostgreSQL then tracks what each transaction read and aborts one whose results could differ from running them one after another. That's correct, but it has consequences. Each conflict surfaces as a serialisation failure that needs retry logic, and under contention, retries compete with new appends and make it worse. PostgreSQL tracks reads with limited granularity (and coarsens it when there are many of them). It may then also abort transactions that didn't conflict from the business perspective. And the guarantee holds only if all transactions touching those tables use the serialisable level; a single regular append running with the default level can slip through. We can also end up with deadlocks if we mess something up in the query. Plus, technically, we're doing pessimistic locking by serialising the event appends. Which automatically lowers the performance. And if conflicts are rare, then ending up with the lowest-common-denominator performance doesn't sound like a good move to me.
- **Locking the events table.** The append function locks the whole events table in exclusive mode, checks the condition with a chain of CTEs, and inserts the events. That's also correct, but every append waits for the previous one to finish. We effectively get a single writer for the whole store.
- **Advisory locks.** A single advisory lock gives the same effect as locking the table. Locks per tag allow appends touching different entities to run in parallel, which is much better for throughput. Yet advisory locks bring their own challenges: they're tied to a session or a transaction, they're released when the connection dies, and they behave differently with connection poolers. I wrote about those in [Distributed Locking: A Practical Guide](/en/distributed-locking-a-practical-guide/), [Rebuilding Event-Driven Read Models in a safe and resilient way](/en/rebuilding_event_driven_read_models/) and [Sharing is (not always) caring. PgBouncer pooling modes in practice](/en/connection-pooler-modes-advisory-locks/). And parallel commits bring us to the ordering problem I'll describe in a moment.

Mature solutions exist, but most of what I saw were naive. I don't mean that their authors don't know what they're doing. They make the append correct by serialising it, and stop there. This can be fine for a specific project solution, but not for general solution tools.  The append (the write model) is the simpler part. Typical problems show up when we start reading what we've written. 

Subscriptions build read models and integrate different flows and parts of the system. If we're going into Event Sourcing, we typically do more than run our business logic against events; we embrace the event-driven way.

Subscriptions need to perform well enough to keep up with appends and should give us strong delivery guarantees. Plus, it helps if they deliver events in the order they were committed. All of that is trickier than it seems. For instance, in PostgreSQL, sequence values are taken before the commit, and transactions can commit out of order. A reader can see position 4 before position 3. If it moves its checkpoint to 4, it will never see position 3 when it finally commits. And if the transaction with position 3 is rolled back, there's a gap that will never be filled. I described that in detail in [How Postgres sequences issues can impact your messaging guarantees](/en/ordering_in_postgres_outbox/), and how it affects processing in [Checkpointing the message processing](/en/checkpointing_message_processing/).

Subscriptions also need to scale, run in multiple instances without processing the same events twice, and allow rebuilding read models without stopping appends.

Those are the 2nd-day cases you'll need sooner rather than later. Those are the features where most of my work on Emmett goes (see [Consumers, projectors, reactors and all that messaging jazz in Emmett](/en/consumers_processors_in_emmett/) and [On rebuilding read models, Dead-Letter Queues and Why Letting Go is Sometimes the Answer](/en/rebuilding_read_models_skipping_events/)). It was the same when I worked on Emmett.

Many DCB implementations I've seen don't provide subscriptions at all, or read events by sequence number, leading to the issues mentioned above. These issues will show up in production as missed events in read models and integrations. Subscriptions also require a different way to handle the schema, since we need to read by types and tags, not just by global position. A general-purpose tool can't skip any of that.

Then there's performance. Tag-based designs add a tags table. Each event means extra rows and index entries, and more writes than a regular append. That's write and read amplification and more storage, which contradicts the premise that DCB is simpler than streams. For the same workload, I expect a regular append to be faster and to scale better. Some argue that filtering by event types lets through appends that would otherwise fail, so DCB could be faster under the same concurrent workload. Maybe; it remains to be seen. That's why I think that DCB benchmarks should also include a regular stream append as a baseline. Even better, they'd compare implementation categories (DCB, stream-based) across scenarios based on realistic usage, with different concurrency characteristics and setups (e.g., how many stream types or tags we have).

Tags also bring cardinality issues, as tags like `student:Oskar` are unbounded. High-cardinality indexes put pressure on databases, and retagging makes it worse. If we drop the old tags, we lose auditability. If we keep both old and new ones, cardinality explodes. Fast reads by arbitrary tag combinations at scale are the same problem observability tools are struggling with.

Some approaches index all event data instead of tags, which is closer to the original idea. The cost is that the database must be able to query the payload. We can't compress, encrypt or serialise it our own way. And it brings back the problem of running a query on each append.

And then there's what happens on day two, after we deploy. In production, the harder part is living with the data: versioning events, changing queries, retagging, archiving. With streams, we know those challenges and have patterns to deal with them (I gathered my articles on that in the [Event versioning guide](/en/guides/event-versioning/), starting with [Simple patterns for events schema versioning](/en/simple_events_versioning_patterns/)). How would we do it with DCB?

Let's start with versioning. With streams, an event is read by decisions of a single stream type. If we change its schema, we know where it's used and can handle it by upcasting when reading. Keeping streams short helps too, as old schemas disappear together with closed and archived streams. With DCB, many queries across many slices can select the same event type. Renaming an event type, splitting it into two, or changing its payload means finding all the queries that name it. Tags make it even trickier. They're stored and indexed when we append the event. Upcasting can change what we read, but not what the query selects. If the new version of the event should be tagged differently, we're back to retagging.

Changing queries brings a similar challenge. We saw with `StudentSuspended` how a new event type can make an existing query incomplete. On day two, that's not a single case. A query is the consistency boundary of a decision, so changing it changes what the decision is protected against, and each new event type may affect many of them. How will incomplete queries be detected? How will the old queries be invalidated, both logically and technically? I haven't seen a convincing answer yet.

Then there's retagging. It's a migration done on the same storage that keeps taking appends. Until it finishes, queries using the new tag don't see the old events, so append conditions based on them are weaker than we think, and nothing tells us about it. We need to either stop writes or handle both tag versions for a while.

Finally, archiving. With streams, when the cashier's shift closes, we can archive its stream, since it won't be needed for new decisions. With DCB, an event belongs to several boundaries at once. We can archive it only when none of the queries needs it anymore, and the store doesn't know those queries, as they live in the code.

None of this makes DCB impossible. I'd implement it if it was easy, but it's really tricky to get right. A single project can take shortcuts that fit its needs. A general-purpose tool can't, and I don't want to add a half-baked solution.

If I were exploring this space, I'd try the direction I described earlier: streams as logical boundaries and tags as low-cardinality labels within them, like `course-enrollment`. Or I'd start with neither streams nor tags, see how far plain queries can take us, and add stream- or tag-like indexes purely as a performance optimisation. Incremental computation, like [DBSP](https://www.feldera.com/), looks promising for making such indexing cheaper, and I'd like to try it.

For now, I prefer to invest my limited time in features that address the root causes behind many DCB requests, or that every production system needs:

- transactional multi-stream appends, which are quite high in priority and a low-hanging fruit covering most multi-entity decisions,
- [workflows](/en/workflow-engine-design-proposal-tell/), which I see as a good alternative for processes spanning multiple streams and systems,
- built-in copy and transform, so fixing modelling mistakes stops being painful,
- archiving and closing the books, to keep streams short and storage under control,
- schema versioning, OpenTelemetry and more resiliency.

So sorry for not bringing good news if you were counting on it. I might add DCB at some point, but for now, I need to finish other things first. The only thing I see that could make it a higher priority is sponsorship.

If there's something you can do with DCB that you can't do with classical Event Sourcing in Emmett, please tell me. I'm happy to help find an alternative.

One of the people I discussed it with summed it up nicely: either paradigm can hurt when we make a modelling error; tooling can compensate, but DCB isn't a way to bypass modelling, and there's no free lunch. I agree with that. Just like I asked about the question behind the question, I prefer to solve the root cause rather than put a bandage on it.

And, as always, I keep my right to be wrong here. Take it with a pinch of salt: this is my perspective and why I'm focusing on other stuff, not why I tell you not to do DCB at all.

DCB is an interesting concept; I like that it appeared, as it already triggered a lot of good discussions and some innovations. Plus, I love how Sara and Bastian Waidelich are transparently working with the community. I love that they didn't just throw an idea out, but discussed it, and maintain specifications, example solutions and best practices at: https://dcb.events/

It's precisely how I see working with the community on the concept.

See also Sara's latest recording on her findings while adopting DCB. She tackled some of the stuff I discussed:

`youtube: https://www.youtube.com/watch?v=USirhSVcmKQ`

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
