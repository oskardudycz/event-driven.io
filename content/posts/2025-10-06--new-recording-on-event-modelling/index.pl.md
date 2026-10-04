---
title: New Recording on Event modelling anti-patterns from DDDEU
category: Software Architecture
cover: 2025-10-06-cover.jpg
author: oskar dudycz
useDefaultLangCanonical: true
---

Welcome to the new week!

**I’m always saying that with Event-Driven Architecture, the modelling effort pays back.**

**That goes both ways: the less effort we put in modelling, the more it’ll hurt later.**

There’s a wide range of issues you may be facing, from overfocusing on the state instead of tracking behaviour, to asking others more often than allowing them to tell you what happened, and ending with race conditions and other unpleasant scenarios.

I packed as many of such cases into our talk, and the recording from this year’s DDD Europe just arrived:

`youtube: [Embedded video](https://www.youtube.com/watch?rel=0&autoplay=0&showinfo=0&enablejsapi=0&v=Lf1MZlpbkGA)`

During the session, I explained the specifics of event modelling (yes, no capital letter, and double l), starting with bad practices and knowing why and how to avoid them.

I told the story about the project that aimed to modernise legacy software into the event-driven world. In theory, artificial, but in practice, none of the examples were made up. Either I made those mistakes on my own, or I saw them in my projects or helped to fix them for my clients.

I tried to make it both entertaining and educational, bitter and sweet. It is not easy when you’re not a native speaker. There’s a thin line between being funny and being silly.

**There’s also a thin line between bad and good practices. And its name is:** _**context**_**.**

Also, as much some of those cases may seem wild, then I can assure you that all of those mistakes I either:

-   did by myself,

-   saw in my projects,

-   saw in my client’s project.

Check it out, why learn always from your mistakes? Learn from mine.

**The talk also summarised my article series about anti-patterns in event modelling. Here’s the full list:**

-   [State Obsession](/en/state-obsession/),

-   [Property Sourcing](/en/property-sourcing/),

-   [I’ll just add one more field](/en/i_will_just_add_one_more_field/).

-   [Clickbait event](/en/clickbait_event/),

-   [Should you record multiple events from business logic?](/en/one_or_more_event_that_is_the_question/),

-   [Stream ids, event types prefixes and other event data you might not want to slice off](/en/on_putting_stream_id_in_event_data/).

**Check also more general considerations:**

-   [Events should be as small as possible, right?](/en/events_should_be_as_small_as_possible/),

-   [What’s the difference between a command and an event?](/en/whats_the_difference_between_event_and_command/),

-   [Internal and external events, or how to design event-driven API](/en/internal_external_events/),

-   [Event Streaming is not Event Sourcing!](/en/event_streaming_is_not_event_sourcing/),

-   [Don’t let Event-Driven Architecture buzzwords fool you](/en/dont_let_event_driven_architecture_buzzwords_fool_you/),

-   [How to design software architecture pragmatically](/en/how_to_design_software_architecture_pragmatically/),

-   [How to deal with privacy and GDPR in Event-Driven systems](/en/gdpr_in_event_driven_architecture/).

**And hey, I’m also doing consulting and mentoring. If you’re struggling with your projects/organisation with such cases, I’m happy to help. Feel free to reach out to me through the [email](mailto:oskar@event-driven.io).**

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian](https://savelife.in.ua/pl/donate/) organisation or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
