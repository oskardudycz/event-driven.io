---
title: The magic is that there is no magic. Or how to understand design patterns.
category: "Event Sourcing"
cover: 2022-12-18-cover.jpg
author: oskar dudycz
---

![cover](2022-12-18-cover.jpg)

**The magic is that there is no magic.**

Many patterns perceived as complicated appear to be simple or even simplistic under the cover.

**Take, for example, Event Sourcing.** In a nutshell, you can append at the end of the stream and read all events from the stream. So append new business facts about the object or process. Then [read all events and build the current state from it](/en/how_to_get_the_current_entity_state_in_event_sourcing/) to know what happened and make the next decision.

**[Or CQRS](/en/cqrs_facts_and_myths_explained/)**, you just slice your application by business operations and group them into two behaviours: reads and business logic. You're getting by that predictability and possibility of on-point optimisation.

**[Or Outbox Pattern](/en/outbox_inbox_patterns_and_delivery_guarantees_explained/)**. You append the message together with the state change in the same database transaction. Then send the message asynchronously with retries etc., to ensure global process consistency.

Yet, it's not easy to explain, as people want to see magic where there are "just" smoke and mirrors.

I'm saying "just" as it's not easy to connect all the dots. 

**_"Show me the real production code"._** I hear that quite often. 

Yet, to learn patterns, you need isolated examples to practice and understand them. We need to put more effort into practising composition skills. 

Going straight into other people's code won't teach you to use patterns correctly, as you'll see tradeoffs already applied. It'll be hard to understand if they were applied on purpose or unintentionally.

[Before you play solos on guitar, you need to learn scales, chords and rhythm.](/en/how_playing_on_guitar_helps_in_being_better_developer/)

The same is with architecture. You need to learn basic patterns and then analyse how to join them together.

**Quite often on the Internet, what's shown as best or worst patterns are compositions that either succeeded or failed.** [We can find a lot of noise from the accidental complexity](/en/event_streaming_is_not_event_sourcing/). Rarely do authors present the patterns in a nutshell. They often show them mingled together as _the one way to rule them all_. While the presented configuration may be valid **for them**, it may be just one of the possible options **for others.**

We get so used to seeing complexity that when we're faced with the isolated pattern, we're saying **_"it cannot be that simple!"_**. 

Actually, it usually is, but it doesn't always mean it's easy. Composition with other patterns and with real-world tradeoffs brings complexity.

As we learn the pattern, we should get to the source materials. [Read what the original authors had in mind](/en/what_does_a_construction_failure_have_to_do_with_our_authorities/). Understand the intended context in which it was designed. We might be quite surprised. Quite often, you may realise that we played the Chinese whispers.

**The best way of learning is by doing.** Experiment on a smaller scale, understand the tradeoffs, try different configurations and get it on production. Wash, rinse, repeat.

For instance, when I started learning Event Sourcing, I created a [sample repository](https://github.com/oskardudycz/EventSourcing.NetCore) to understand patterns and tooling without breaking my system at work. I tried to play with different ideas in a sandbox environment. Once I felt more comfortable, I took what worked to a regular project. Then I continued the next iterations with the other things I wanted to explore deeper.

**Everything has pros and cons. We should not be _techarounding_ the issue and believing that some tool will magically solve our use case.** Too often, I see that people don't know what problem they have to solve but have already chosen a tech stack. Then they try to bend the definition of the pattern to the selected tooling.

**Distil the pattern, and think how it may compose with others, where it could work well, and where it may fail.** Then find the best matching tools to help you.

Realising that should make you a better developer and architect. You'll be able to make on-point decisions and understand the tradeoffs you're making. 

Still, beware! After that, **POOF!**

**Magic will be gone.**

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
