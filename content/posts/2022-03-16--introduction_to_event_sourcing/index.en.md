---
title: Introduction to Event Sourcing - Self Paced Kit
category: "Event Sourcing"
cover: 2022-03-16-cover.png
author: oskar dudycz
---

![cover](2022-03-16-cover.png)

**For many developers, Event Sourcing is like a Nessie, most of them have heard of it, but not many have seen it.** I was one of them. I started my journey with Event Sourcing over five years ago. Practical journey: Before that, I mostly read books, which shouldn't count. Why? Because there were few of them showing how to apply Event Sourcing practically. When my colleague said, _"well, you're doing a financial system then Event Sourcing sounds like a good match"_, I was curious. Then I was thrilled, as finally, I could use the pattern known from the books. I used [Marten](https://martendb.io/) library. The first steps were hard. I was irritated. I started to get doubts if that was something for me.

**I'm not the type of person to easily give up. Step by step, I understood more and more.** After making mistakes and learning from them, I got a better vision. I noticed Marten has some missing pieces, so I sent pull requests. I also began interacting with users on the Gitter channel because they had the same struggles. Then I became a co-maintainer.

That's what I wrote 1.5 years ago in my post [Revolution now!](/en/revolution_now/). I wrote it when I joined [EventStoreDB](https://www.eventstore.com/) as a Developer Advocate. That allowed me to have experience working with two different approaches to Event Sourcing and working with those two communities. There are also different shades, Domain-Driven, Object-Oriented, Functional techniques. You can do Event Sourcing in plenty of different ways. Yet, that's not easy when you're starting. The lack of resources motivated me to work on my sample [repository Event Sourcing in .NET](https://github.com/oskardudycz/EventSourcing.NetCore) which grew into an extensive compendium. I also started to do spin-off repositories:
- [TypeScript and NodeJS](https://github.com/oskardudycz/EventSourcing.NodeJS)
- [JVM based](https://github.com/oskardudycz/EventSourcing.JVM).

**One of the reasons is that I continue to learn to play in different ways, plus I'd like to cherish my dumbness, so I stay close to the people starting their journey.** I believe that Event Sourcing is a pretty practical and straightforward concept. It helps build predictable applications closer to business. Nowadays, storage is cheap, and information is priceless. [In Event Sourcing, no data is lost](/en/never_lose_data_with_event_sourcing/). Yet, it takes work to learn. My goal is to make it more accessible.

**Recently, I've been doing another private training, and as a side effect, I created a set of exercises together with suggested solutions that explain foundational concepts step by step:**

1. Events definition.
2. Getting State from events.
3. Appending Events:
4. Business logic (aggregates, command handlers, OOP vs Functional).
5. Optimistic Concurrency.
6. Projections (General approach, dealing with Idempotency and Eventual Consistency).

That shows the practical aspects of using Event Sourcing with different toolings like Marten and EventStoreDB.

**I decided to open-source them to allow people to do them as a self-paced kit. Get it here:**
- [C#](https://github.com/oskardudycz/EventSourcing.NetCore/tree/main/Workshops/IntroductionToEventSourcing),
- [Java](https://github.com/oskardudycz/EventSourcing.JVM/tree/main/workshops/introduction-to-event-sourcing),
- [Node.js and TypeScript](https://github.com/oskardudycz/EventSourcing.NodeJS/tree/main/workshops/introduction_to_event_sourcing).

It took me two weeks of full focus, plus all the hours I spent in the past years. Of course, it's not the same experience as attending the workshop. But it should be a decent starting point in your Event Sourcing journey. It should give you the tools to build on and play with your ideas and reduce the initial confusion. 

**If you need more than that and want full coverage with all nuances of the private workshop, check [the training page](/en/training/).** Feel invited to contact me via [email](mailto:oskar@event-driven.io).

I plan to extend it and provide similar exercises in other languages when I find enough time. Contact me if you want to [sponsor such an effort](https://github.com/sponsors/oskardudycz) and make that happen for your favourite tech stack.

**If you like it, share it with your friends to benefit.**

Drop me also a line with your thoughts!

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
