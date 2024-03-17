---
title: Should you always keep streams short in Event Sourcing?
category: "Event Sourcing"
cover: 2024-02-24-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![cover](2024-02-24-cover.png)

**[In the last article](https://event-driven.io/en/closing_the_books_in_practice/) and [others](https://www.eventstore.com/blog/keep-your-streams-short-temporal-modelling-for-fast-reads-and-optimal-data-retention) I did my best explaining why keeping streams short is important in Event Sourcing. I also showed you how.** That should take you far enough, especially if you [talk to your business](/pl/a_few_words_on_communication/). That will help you to find the lifecycle. But what if it doesn't?

**What if your entity doesn't have such a lifecycle?** Should we _artificially_ find it for the sake of the specifics of the event model? Example? Personal or company data like names, addresses, etc.

The question sounds simple, but the answer is, as always, nuanced. I have the rule that if I answer _"it depends"_, then I should follow it up with _"...on this and that"_. Let's then discuss those _thises and thats_.

## Should you event-source everything?

You can, but will that give you a lot of additional benefits? What could be the benefit of event sourcing company data change events? Quite often, those data are kept in the event store to have them for read model updates or use them as a state-carried transfer. Those are valid reasons, as they can add some event-driven flavour and reactive way of integrating some of those changes with the rest of the application.

**Maybe, in this case, it's better to use a state-first approach for those entities.** What I mean by that is treating the state as the source of truth, using it to validate business rules. We can still record events together with updating the state. 

**Even if we append those events to the event store, we won't be doing Event Sourcing, and that's fine!** It's not Event Sourcing, as events are not a source of truth but are side effects of changing the state. Our main intention is not to record events but to change state and notify others about them. Logically, we're not appending events but publishing them.

We can still use event store for that and benefit from its publish-subscribe capabilities. We can also spare by adding yet another technology for that and spare ourselves another moving part.

If you're doing that, then you're doing [Event Streaming, not Event Sourcing](/pl/event_streaming_is_not_event_sourcing/). In that case, the length of the stream doesn't matter so much, as you're not reading from it to get the state; you just subscribe to its tail. We're using an event store as a queue to forward events to subscriptions/read models. 

In Marten, it's easier to keep consistency for that case than in EventStoreDB, as you can store the state as a document and append events in the same transaction. 

In EventStoreDB, you don't have built-in read models, so you would need to use an additional database. You could use [user-defined projection](https://developers.eventstore.com/server/v23.10/projections.html#user-defined-projections) and aggregate state from events. Then, you'd read the state from the last event in the projection stream. I saw one customer having 160,000,000 events in the stream, and the database survived. But please don't do that. Projections are always run on the leader node, impacting the cluster's performance. It's also challenging to test them. If you want to do it, limit the maximum count of events.

Ensure also that you're not doing [CRUD Sourcing](/pl/state-obsession/) or [Property Sourcing](/pl/property-sourcing/).

## When does keeping streams longer become an issue?

If the stream doesn't have a lot of events and performance is not critical here (_fameous last words_), then it may be okay to keep it living longer. That company details or address doesn't change often. You probably won't have a lot of events in such a stream. However, it may be living for a long time. 

Most of the considerations on keeping streams short relate to those that:
- have business lifecycles,
- are actively accessed,
- performance matters for their business case.

The first point relates to understanding the business process, and the others relate to technical performance requirements.
 
Company address or details won't change too often, and performance is not critical, so it should be fine.

## So, should I keep those streams short or not?

I think that it's still worth setting some lifetime for our data and not trying to keep it forever. It's about the data governance practices (but also storage size, which eventually may matter). So stuff that I described in the "GDPR series":

- [GDPR for busy developers](/pl/gdpr_for_busy_developers/)
- [How to deal with privacy and GDPR in Event-Driven systems](/pl/gdpr_in_event_driven_architecture/)

I wrote there that:

> Even for non-user data, most of us would have a challenge answering that, not even speaking about having policies. Yes, we don’t care much about data governance and privacy practices. The reality is we keep data until application logic removes it. We’re keeping all data because it may be useful in future, just in case. We’re starting to notice that when our database is overloaded or we don’t have space for backups.

**Even though Company Data doesn't have a clear business lifecycle, you don't need to keep all the history of its updates for business logic.** It's still worth defining the data retention and archive strategy, e.g. once per year or another period, publish a summary event with the current data and truncate past events. That still allows you to rebuild your read models and get clear causality of processing. 

This strategy is also useful for cases where you actually don't need this data anymore for 99% of situations. You keep it because you're legally obliged to allow users to modify closed/removed/entities for the next few years. Then, instead of keeping all past data, it's better to keep a single event in the stream and keep it alive by that.  You can append a summary event after a defined period and archive the old data.

**In the end, it's your choice; you know your business process and system better.** I suggest playing with different approaches and being flexible. You don't need to use the same strategy for each business process. I hope this article gives you a bit more nuanced explanation of your options for more state-based processes.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
