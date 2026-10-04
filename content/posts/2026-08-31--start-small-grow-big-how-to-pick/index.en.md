---
title: 'Start Small, Grow Big: how to pick the first feature for Event Sourcing'
category: Event Sourcing
cover: 2026-08-31-cover.jpg
author: oskar dudycz
redirectFrom: /start-small-grow-big-how-to-pick/
---

![Girl Picking Cherries Stock Photo - Download Image Now - Cherry, Picking -  Harvesting, Girls - iStock](2026-08-31-cover.jpg "Girl Picking Cherries Stock Photo - Download Image Now - Cherry, Picking -  Harvesting, Girls - iStock")

Let’s say we did the hard part. We read up on Event Sourcing, even here on my blog; [we did a modelling workshop](/en/training/), we got the nods around the table, and someone finally said:

> “Fine, let’s try it somewhere”.

Then, after the cheerful atmosphere, the follow-up arrives:

> “OK, but where?”

We do some head-scratching, pick something from the top of our backlog without further consideration. Some people say we should event-source everything so we can select anything, right?

Yes, you can use Event Sourcing everywhere, but you don’t have to, and it won’t add enough value over the familiar approach to justify the learning curve. It’s not that hard; it really doesn’t, but well, if you need to learn both the new approach and new tooling, and persuade colleagues, then it’s better to pick wisely.

In [When not to use Event Sourcing?](/en/when_not_to_use_event_sourcing/) I ended with a suggestion: Start Small, Grow Big. Start with functionality that won’t hurt you if it fails, deploy it to production, learn from it, then rinse and repeat.

That sounds like nice advice, doesn’t it? But it’s easy to write and harder to apply.

## **Picking the right problem**

“Small” is a word everyone agrees with and nobody defines it the same way. It’s in the same category as the “good enough” term. How small is good enough? How small is too small or too big? If we pick something so small, we can get a wrong, simplistic impression. If we pick something too complex (like our core domain), we may get into trouble, as…

**Starting in the core domain is the most tempting mistake**

Our core domain usually sounds like the best fit for Event Sourcing. That’s where the most complex logic happens. That’s where the most sophisticated business processes are. In theory, that’s where extended business observability pays off. Choosing based on the business domain fit would sound reasonable, aye?

![Well Yes, But Actually No - Meming Wiki](image-2.jpg "Well Yes, But Actually No - Meming Wiki")

Starting a new pattern in the core domain means doing three hard things at once:

-   fighting the complexity of a domain we don’t understand yet,

-   learning the practice and the patterns,

-   and learning the tooling.

Each is a real burden on its own. If we join them together, then we get the triple-size burden (or more). When we start getting issues (and we will), we can’t tell which of the three is currently biting us. Something breaks, and we can’t say whether we modelled the process badly, applied the pattern badly, or hit a library limitation.

We make the most important decisions when we’re the dumbest, and here we’d manage to be dumb in three directions at the same time. Then the blame game starts, and we choose the easy excuse:

> Event Sourcing didn’t work for us.

Or worse:

> Event Sourcing is too hard.

When we onboard a project with a new approach, we’re betting our credibility. And that’s a risky bet. If we do it wrongly, then even if next time we come up with the right choice, our colleagues can say:

> Oskar, do you remember, how did it end up the last time you wanted to introduce Event Sourcing? Yeah, then how about no?

I’ve been on the other side of this. I rejected using Event Sourcing in a project where the domain fit well, as I was the only person familiar with it and we had teams spread across three countries. Saying no was cheaper than saying yes and becoming the single point of knowledge for everyone.

That’s also what [I advised my consulting clients](https://calendly.com/oskar-dudycz/consulting) several times when they asked me to review their idea of applying Event Sourcing to their projects. Rarely was their business use case the biggest issue. More often the selected business case complexity compared to their stage in the learning journey.

## **Small doesn’t mean unimportant**

In the [”When not to use Event Sourcing?” article](/en/when_not_to_use_event_sourcing/), I suggested starting with non-important business functionality. That can be interpreted differently than I meant, so let me correct myself.

What we want is functionality that’s _low-consequence-if-wrong_, which is different from _noone-cares-about-it_. Unimportant features usually have no business decisions in them, and a feature with no decisions [is not a great fit for Event Sourcing](/en/anti-patterns/).

If it’s crude, we may come up with events like _SomethingCreated_, _SomethingUpdated_, and _SomethingDeleted_, produce a lot of boilerplate, and conclude that Event Sourcing brings useless ceremony. When picking a trivial use case, we typically end up with [State Obsession](/en/state-obsession/) or [Property Sourcing](/en/property-sourcing/).

I was a victim of that. I worked on a project with a dedicated configuration service. Mostly classical crudish dictionaries, but all integration ran through events. The amount of repetitive code was enormous. If you pick such a choice, you’ll only learn that choosing a bad fit for Event Sourcing is a bad fit for Event Sourcing. Or conclude that Event Sourcing is stupid. Or both.

The feature we pick has to be real. Simple, but real. A colleague depends on it, it has a business name, it holds real data, and someone complains when it breaks. A demo shopping cart persuades nobody, including ourselves, because everyone knows demos work. It just needs to be a feature where being wrong for a day means somebody fixes it by hand and no money is lost.

One thing to rule out before we go looking. Collecting events from several sources and assembling them into a read model isn’t Event Sourcing. It’s useful, and I’ve written about doing it well when events arrive out of order in [Dealing with Race Conditions in Event-Driven Architecture](/en/dealing_with_race_conditions_in_eda_using_read_models/), but if all we do is gather data and display it, we’re doing event-driven integration.

I wrote a whole article on why the distinction matters: [Event Streaming is not Event Sourcing!](/en/event_streaming_is_not_event_sourcing/). What makes it Event Sourcing is making decisions. We treat our events as the source of truth by: reading them, [building state from them](/en/how_to_get_the_current_entity_state_in_event_sourcing/), and making a decision that produces a new event. In that race conditions article, the interesting moment is when the projection stops being a projection and becomes a workflow, because it started deciding something.

Audit needs are the same story. Event stores make auditing easier, and a proper audit log is more work than appending events, which I covered in [Is the audit log a proper architecture driver for Event Sourcing?](/en/audit_log_event_sourcing/). If the only reason for our pilot is “we’d like history”, we’ll build history and learn nothing about write models.

## **Selection checklist**

OK, let me give a rough checklist to make my rambling more actionable.

Let’s start with the business use case selection:

1.  **Who owns the process lifecycle?** If the lifecycle lives in another system and we watch it, we’re building an anti-corruption layer. Events from outside are rumours until we interpret them.

2.  **Do we produce our own events, or only consume other people’s?** If nothing new comes out of the module, we’re building a read model and calling it Event Sourcing.

3.  **Can a command be rejected for a business reason?** Database timeouts don’t count. I mean rules like “this was already approved, so it can’t be changed anymore”. If nothing can be refused, we have no business logic, no decision-making, and no reason for Event Sourcing.

4.  **Is the decision a business rule or a retry policy?** Retry, backoff and dead-lettering belong to our messaging tool. They’re technical concepts with business consequences, but not a real business decision.

5.  **Could we run an EventStorming session on it with a non-technical colleague?** It’s much easier if we can collaborate with business people to get the domain knowledge from them. We can still do it on our own, but then we risk inventing the business scenario. If the events have no real business names, there’s no domain to model, and we lose the shared understanding that makes events valuable in the first place.

6.  **Does the stream end?** Short streams keep event stores fast and versioning manageable. A pilot on an unbounded stream teaches that lesson the painful way.

Then, can we afford to be wrong?

7.  **Is it off the critical path?** Nobody should be waiting on our learning curve to hit a release date.

8.  **What happens if it’s wrong for a day?** If the answer involves money, safety or a regulator, it’s the wrong pilot.

9.  **Could we walk it back in a week?** If the retreat is a project of its own, we picked something too big.

10.  **Is it small enough to do slightly rogue?** If we need a formal decision before we can start, we’re back to arguing instead of showing.

11.  **Can the event store we choose run on storage we already operate?** A new database means a conversation with the platform team, and that’s where most pilots die.

Then, will we actually learn something?

12.  **Does it fit inside a single module?** We want eventual consistency and idempotency, and we don’t want clock skew and cross-queue ordering in the same week.

13.  **Is any part of it asynchronous?** Waiting on an external system counts, and so does a timeout that fires on its own. Testing the async approach isn’t entirely about Event Sourcing as a pattern, but about checking how our tooling behaves and how we can reason about the challenges that will eventually land.

14.  **Is it real?** Someone depends on it, it has a business name, it holds real data, and somebody complains when it breaks. Of course, we should limit the risk, but we shouldn’t also pick features that no one cares about, because then we won’t run it for real and get proper learning from production usage.

## **Bad picks**

What are the examples of bad picks? No problem, let me walk you through three examples.

**Email notification dispatch looks promising.** Sent, delivered, bounced, opened is a state machine with a decent vocabulary, except the state machine belongs to the mail provider and we’re only watching it. The decisions we’d implement are retry and escalation, which our broker already does, so it’s a technical concept. We’re not making decisions; we’re just handling side effects.

**Import and batch job processing looks promising too.** Started, chunk processed, failed, retried, completed. No domain expert will attend a meeting about ChunkProcessed, and retry-versus-abort is infrastructure policy. Imports deserve explicit events when we migrate relational data, as I described in [The end is near for CRUD data](/en/the_end_is_near_for_crud_data/), but they’re not a pilot. So same issue as before.

**A payment verification module looks the most promising of all.** Before a card payment goes through, several checks run at once: is this likely to be fraud, how risky is this customer, is the shop still within its daily limit. Each check runs in a different system and answers at its own pace, sometimes in the wrong order, so the fraud answer can land before we’ve even heard that the payment exists. Somebody has to collect those answers in one place and show whether verification is finished. Real vocabulary: a lifecycle that ends, out-of-order events on day one.

But look at who decided what. The fraud system decided the score. The risk system decided the rating. The shop’s limit was checked by the service that owns limits. Our module matches the answers up by payment number, fills in the blanks as they arrive, and displays how far along we are. Everything we hold was decided somewhere else; nothing can be refused, and nothing new comes out of us.

It becomes a candidate when we’re asked to rule on the answers rather than collect them: fraud beats an automatic approval, and once the fraud score and the limit check are both in, the payment is settled one way or the other. Now we hold state, apply a rule the business will argue about, and produce our own event saying verification is complete. That’s the moment I described in [Dealing with Race Conditions](/en/dealing_with_race_conditions_in_eda_using_read_models/), where a projection had quietly turned into a workflow.

So they all fail for the same reason: events flow through the module, and the module decides nothing.

As a rule of thumb: someone is waiting for an answer; the answer can be no, and something happens on its own while they wait.

## **A decent pick**

A customer wants to send back a pair of shoes.

They ask for a return; we check whether it’s still within the return window and whether we take it back at all. If it is, we send them a label and wait. The parcel may arrive next week, or never. When it arrives, warehouse staff scan it, inspect the item, and decide whether the shoes are in the state the customer claimed. Then the return is granted, and finance pays out, or it’s refused, and we ship the shoes back.

The events in a warehouse could look like that (pardon me if you’re a Warehousing expert; honestly, I’m not):

```text
ReturnRequested
ReturnRefused
ReturnLabelSent
ParcelArrivedAtWarehouse
ItemInspected
ItemFoundWorn
ReturnGranted
ReturnAbandoned
```

We decide two things here: whether to accept the return at all, which we can refuse when the customer asks on day 45 of a 30-day window. And whether the shoes came back in the state they described, which we can refuse after inspection. The courier and the scanner tell us where the parcel is.

Then there’s `ReturnAbandoned`. It fires thirty days after the label was sent, when the parcel never showed up. Nobody triggers it manually. If we talk to warehouse managers, they will happily argue about whether thirty days is the right number. And hey, this is what a basic handling policy looks like.

And if we get any of it wrong for a day, support fixes it by hand, and the customer waits an extra day for their money.

The CRUD version is a returns table with a status column: requested, label\_sent, received, granted. Each value overwrites the previous one, and so does updated\_at.

Six months later, finance wants to know whether shortening the window to 30 days made customers send things back sooner or just made us refuse more of them. The table holds current statuses and one timestamp per row, so it can’t answer either half. If our support team finds that some customers got refunded twice and asks whether the same parcel was inspected twice, the table shows just one “granted” and never records the first inspection at all.

Returns also make the business case without hand-waving. With a CRUD version and a status column, we know how many returns are open. With Event Sourcing events, we know how many arrive after the window closed, how long parcels sit in the warehouse before inspection, how often an inspection overturns what the customer told us, and which products come back worn.

Someone in operations asks all four of those within a month, and a status column has already erased the answers. That’s the [never lose data](/en/never_lose_data_with_event_sourcing/) argument, small enough to fit in a pilot.

Returns aren’t the only feature like this; for instance, budget approval works the same way: someone submits a budget, the financial director approves or rejects it, and an approved one can no longer be changed. So does a reservation that we hold for a while and release when nobody confirms it.

The waiting is the part we want in a pilot. The courier answers when it answers, and the thirty-day clock runs on its own. The read model showing open returns will be behind the events for a while, and the same courier callback will arrive twice sooner or later. We have to handle both of those rather than read about them.

We also don’t want to learn everything at once. Inside one module we control the order in which our own events land, and we can read what we just wrote. Once returns starts talking to the finance module over a queue, we get out-of-order delivery, timestamps from machines whose clocks disagree, and the question of what to do when the payout confirmation arrives before we recorded that we asked for the payout. I wrote about handling that in [Dealing with Race Conditions](/en/dealing_with_race_conditions_in_eda_using_read_models/). It’s a fourth learning curve on top of the three we already have.

## **Don’t forget to audit the tooling**

The pilot is also a chance to check the tooling. If we found a proper business concept that makes decisions, we should also check if we got strong consistency guarantees, for instance, ACID, optimistic concurrency. We can also check what options it gives for building read models, processing asynchronous subscriptions, etc. This will tell us a lot about how mature the tooling we selected is. And no, vibe-coded tools are not a good choice for critical infrastructure like an event store.

When I wrote [Let’s build event store in one hour!](/en/lets_build_event_store_in_one_hour/), I listed what an event store has to do:

-   appending an event at the end of the stream,

-   reading all events from the stream,

-   a guarantee of ordering within the stream,

-   being able to read our writes,

-   strong consistency, atomic writes and optimistic concurrency.

And the second tier, good to have rather than mandatory:

-   subscribing to notifications about newly appended events, best if push-based,

-   global ordering,

-   built-in projections,

-   streams archiving.

There’s a growing number of vibe-coded libraries that look like event stores and skip parts of the first tier. Optimistic concurrency is the usual omission, since it’s the hardest to implement. That means: you’ll have to deal with that on your own. Without such features, you’ll be vulnerable to race conditions, data loss, and eventual inconsistencies.

So it’s worth running these against our pilot:

-   append to the same stream from two places at once and see whether one of them is rejected,

-   kill the process while a projection is being updated, and check what state we come back to,

-   rebuild a projection from scratch,

-   add a field to an event type that already has data stored,

-   write a test for a single decision, and see how much setup it needs.

The last one is about developer experience rather than correctness, and it’s still worth measuring, because that’s what the team does all day.

It’s also worth preferring an event store that runs on storage we already have. If we can put it on the Postgres our organisation already operates, nobody has to agree to run a new database for an experiment, and we skip the conversation with the platform team. A lot of pilots stop right there. It doesn’t get the library out of the checks above, though. Running on familiar storage says nothing about whether it handles concurrent appends.

## **Showcasing the pilot outcome**

If we argue and try to persuade others during a meeting to do Event Sourcing, it’s not easy. We don’t have proof that this can work; we just have rumours and strong belief. We may immediately put ourselves in a defensive position, as others may fear the risk of change. And it’s fair to be afraid.

That’s why picking the scope is so critical. The pilot has to be small enough that we can do it slightly rogue. Not asking for a formal decision is reasonable when nobody is harmed by us spending a short time working on it.

Rogue means not asking permission, and being prepared to ask for forgiveness. We should still have justification for it and authority to make such a decision (read more in [Business Won’t Let Me and other lies we tell to ourselves](/en/business-wont-let-me-and-other-lies/)). It shouldn’t mean hiding the work from our team or writing something only we can maintain, because that destroys the persuasion we were going for. We also shouldn’t hide from ownership of our decision.

That’s why I recommend working on a feature [with removability in mind](/en/removability_over_maintainability/). It helps if we fail, because then we at least minimise the consequences of a bad decision.

If we fail, we drop our pilot; if we succeed, we can showcase what we did. Showing a returns process that has been running for two months, next to the chart of how many parcels never arrive, and mentioning that we’re using Event Sourcing, sparks much more proactive discussion than an imaginary scenario. The same inertia that blocks new ideas starts working for us once the code exists, because it’s hard to throw away something that already works.

Once one feature works, the next steps get earned by evidence rather than enthusiasm. A second stream type when we find another process with real decisions. A separate read model store when the queries start to hurt. Cross-module messaging when two modules genuinely need to talk. Each of those should answer something we observed in production.

None of this is specific to Event Sourcing. Any pattern new to the team deserves the same treatment: a real but forgiving feature, one learning curve at a time, an exit we’ve thought about, and something to show at the end. There’s nothing magical about it, we just forget the pragmatism when we’re excited.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
