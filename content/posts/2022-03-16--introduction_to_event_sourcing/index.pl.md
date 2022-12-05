---
title: Introduction to Event Sourcing - Self Paced Kit
category: "Event Sourcing"
cover: 2022-03-16-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2022-03-16-cover.png)

For many developers, Event Sourcing is like a Nessie, most of them have heard of it, but not many saw it. I was one of them. I started my journey with Event Sourcing over five years ago. Practical journey: Before that, I mostly read books, which shouldn't count. Why? Because there were not many of them showing how to apply Event Sourcing practically. When my colleague said that "well, you're doing financial system then Event Sourcing sounds like a good match", - I was curious. Then I was thrilled, as finally, I could use the pattern known from the books. I used [Marten](https://martendb.io/) library. The first steps were hard. I was irritated. I started to get doubts if that was something for me.

I'm not the type of person to easily give up. Step by step, I understood more and more. Then making mistakes and learning from them, I started to get a better vision. I noticed that Marten has some missing pieces, and I sent pull requests. I also began to interact with users on the Gitter channel because they had the same struggles as I did. Then I became a co-maintainer.

That's what I wrote 1.5 years ago in my post [Revolution now!](/pl/revolution_now/). I wrote it when I joined [EventStoreDB](https://www.eventstore.com/) as a Developer Advocate. That gave me the chance to have experience of working with two different approaches to Event Sourcing and working with those two communities. There are also different shades, Domain-Driven, Object-Oriented, Functional techniques. You can do Event Sourcing in plenty of different ways. Yet, that's not easy when you're starting. The lack of resources motivated me to work on my sample [repository Event Sourcing in .NET](https://github.com/oskardudycz/EventSourcing.NetCore) that grew into a big compendium. I also started to do spin-off repositories:
- [TypeScript and NodeJS](https://github.com/oskardudycz/EventSourcing.NodeJS)
- [JVM based](https://github.com/oskardudycz/EventSourcing.JVM).

One of the reasons is that I continue to learn to play in different ways, plus I'd like to cherish my dumbness, so stay close to the people starting their journey. I believe that Event Sourcing is a pretty practical and straightforward concept. It helps build predictable applications closer to business. Nowadays, storage is cheap, and information is priceless. In Event Sourcing, no data is lost. Yet, it's not easy to learn. My goal is to make it more accessible.

Recently I've been doing another private training, and as a side effect, I created a set of exercises together with suggested solutions that explain foundational concepts step by step:

1. Events definition.
2. Getting State from events.
3. Appending Events:
4. Business logic (aggregates, command handlers, OOP vs Functional).
5. Optimistic Concurrency.
6. Projections (General approach, dealing with Idempotency and Eventual Consistency).

All of that shows practical aspects using Marten and EventStoreDB.

**I decided to open-source them to give people the chance to do them as a self-paced kit. Get it here:**
- C#: https://github.com/oskardudycz/EventSourcing.NetCore/tree/main/Workshops/IntroductionToEventSourcing.
- Java: https://github.com/oskardudycz/EventSourcing.JVM/tree/main/workshops/introduction-to-event-sourcing.

It took me two weeks of full focus, plus all the hours I spent in the past years. Of course, it's not the same experience as attending the workshop. But I hope it should be a good starting point in your Event Sourcing journey. It should give you the tools to build on and play with your ideas and reduce the initial confusion. 

If that's not enough and you'd like to get full coverage with all nuances of the private workshop, feel free to contact me via [email](mailto:oskar@event-driven.io).

I plan to extend it and provide similar exercises in other languages as soon as I find some time.

If you like it, share it with your friends to benefit. Drop me also a line of your thoughts. [You may also consider joining my fabulous supporters group at GitHub sponsors](https://github.com/sponsors/oskardudycz).

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
