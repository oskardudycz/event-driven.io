---
title: Documenting Event-Driven Architecture with EventCatalog and David Boyne
category: Software Architecture
cover: 2025-02-17-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---


`youtube: [Webinar recording](https://www.youtube.com/watch?v=bcfY-cPqNYo)`

Welcome to the new week!

> _“How to document systems build with Event-Driven Architecture?”_

and

> _“How to keep our understanding about evolving messages definitions?”_

Are one of the common questions I’m being asked. For many years my usual answer was:

> _"Keep it simple, use Markdown, and make it a part of your design and development process”_

Still, that does not scale, and governance requires proper practices and tooling.

**That’s why I’m happy that tools like [EventCatalog](https://www.eventcatalog.dev/) emerged.** **Well, it didn’t precisely emerge; [David Boyne](https://www.boyney.io/) thoroughly built it.** He brought not only his passion but to EDA, most importantly, his wide experience.

Over the past few years, [David](https://www.boyney.io/) has focused on serverless and event-driven architectures, making both more accessible to everyone through content such as [EDA Visuals](https://serverlessland.com/event-driven-architecture/visuals), [speaking](https://www.boyney.io/talks), and [open source tools](https://www.boyney.io/tools). He has also worked in AWS and on the [AsynApi initiative](https://www.asyncapi.com/). He has lead teams that have built applications scaling to millions of people worldwide.

Now, his main focus is on [EventCatalog](https://www.eventcatalog.dev/) and helping others to document and operate their Event-Driven systems.

**That’s why I’m super happy that he agreed to do a hands-on webinar and show us** **[EventCatalog](https://www.eventcatalog.dev/) in practice. And this is a free webinar for all, as I believe it’s essential to spread awareness of it.**

**What is [EventCatalog](https://www.eventcatalog.dev/)?** It is an open-source documentation tool focused on bringing discoverability to Event-Driven Architectures. EventCatalog is not locked down to any technology, broker or implementation details.

David showed us the ease of use and versatility of extensions, plugins, generators, and multiple schema formats.

**I love what he said during the webinar:**

> _The whole idea here is for teams to document their resources. I think this is important because schemas can only go so far, right?  
>   
> If I were to show you a schema of an order-placed event, we'd be looking at a JSON schema. That's great for engineers and developers, I guess, to an extent.  
>   
> But the question is, what's the semantic meaning behind all of this? And I think when I said earlier about Domain-Driven Design, you know, as we do things like event storming, we discuss the meaning of the events. We discuss, like, what is this thing?  
>   
> We talk about naming conventions, and there is conflict in these sessions. There is meaning behind these events.  
>   
> So why not document them and share that meeting with others so others can discover the event and say, okay, the order placed means this, in this context, means this particular thing.  
>   
> Oh, great. Fantastic. I can consume that. I know exactly what it is.  
>   
> Versus, I guess, just guessing_

Especially the last sentence is 🌶️

**Watch it fully, and tell us how you like it. Feel also invited to add your comments!**

We’re also considering moving another one going through the existing sample (for instance, [this one made with Emmett](https://github.com/event-driven-io/emmett-starter-postgresql)) and showing how to add EventCatalog to the existing project.

Cheers!

Oskar

* * *

## Other Webinars

-   [#1 - From CRUD to Event Sourcing](https://www.architecture-weekly.com/p/webinar-1-from-crud-to-event-sourcing)

-   [#2 - Keep your streams short! Or how to model Event-Sourced systems efficiently](https://www.architecture-weekly.com/p/webinar-2-keep-your-streams-short)

-   [#3 - Implementing Distributed Processes](https://www.architecture-weekly.com/p/webinar-3-implementing-distributed)

-   [#4 - From CRUD to CQRS in Practice](https://www.architecture-weekly.com/p/webinar-4-from-cqrs-to-crud-in-practice)

-   [#5 - Architecture Weekly 100 Edition - Live Q&A](https://www.architecture-weekly.com/p/webinar-5-architecture-weekly-100)

-   [#6 - Alexey Zimarev - You don't need an Event Sourcing framework. Or do you?](https://www.architecture-weekly.com/p/webinar-6-webinar-with-alexey-zimarev)

-   [#7 - Design and test Event-Driven projections and read models](https://www.architecture-weekly.com/p/webinar-7-design-and-test-event-driven)

-   [#8 - Slim down your aggregates!](https://www.architecture-weekly.com/p/webinar-8-slim-down-your-aggregates)

-   [#9 - Radek Maziarka - Modularization with Event Storming Process Level](https://www.architecture-weekly.com/p/webinar-9-radek-maziarka-modularization)

-   [#10 - PostgreSQL Superpowers in Practice](https://www.architecture-weekly.com/p/webinar-10-postgresql-superpowers)

-   [#11 - Maciej "MJ" Jędrzejewski - Evolutionary Architecture: The What. The Why. The How.](https://www.architecture-weekly.com/p/webinar-11-maciej-mj-jedrzejewski)

-   [#12 - Jeremy D. Miller: Simplify your architecture with Wolverine](https://www.architecture-weekly.com/p/webinar-12-jeremy-d-miller-simplify)

-   [#13 - Yves Goeleven - The Fantastic 9](https://www.architecture-weekly.com/p/webinar-13-yves-goeleven-the-fantastic)

-   [#14 - Mateusz Jendza - Why Verified Credentials is the Future of Digital Identity!](https://www.architecture-weekly.com/p/webinar-14-mateusz-jendza-why-verified)

-   [#15 - Mário Bittencourt: Leveraging BPMN for Seamless Team Collaboration in Software Development](https://www.architecture-weekly.com/p/webinar-15-mario-bittencourt-leveraging)

-   [#16 - Papers We Love #1 - Sagas (Hector Garcia-Molina, Kenneth Salem)](https://www.architecture-weekly.com/p/papers-we-love-1-sagas-hector-garcia)

-   [#17 - Simple patterns for events schema versioning](https://www.architecture-weekly.com/p/webinar-16-simple-patterns-for-events)

-   [#18 - Andrea Magnorsky: Introducing Bytesize Architecture Sessions!](https://www.architecture-weekly.com/p/webinar-17-andrea-magnorsky-introducing)

-   [#19 - Laïla Bougriâ: Debug your thinking](https://www.architecture-weekly.com/p/webinar-18-laila-bougria-debug-your)

-   [#20 - Papers We Love #2 - How do committees invent? (Melvin E. Conway)](https://www.architecture-weekly.com/p/papers-we-love-2-how-do-committees)

-   [#21 - Michael Drogalis: Building the product on your own terms](/en/webinar-21-michael-drogalis-building/)

-   [#22 - On Performance Testing with Jarosław Pałka](/en/webinar-22-on-performance-testing/)

-   [#23 - Gojko Adzic on designing product development experiments with Lizard Optimization](/en/webinar-23-gojko-adzic-on-designing/)

-   [#24 - Frontent Architecture, Backend Architecture or just Architecture? With Tomasz Ducin](/en/frontent-architecture-backend-architecture/)

-   [#25 - Applying Observability: From Strategy to Practice with Hazel Weakly](/en/applying-observability-from-strategy/)

-   [#26 - React Query: A solution for Frontend State Management challenges? With Tomasz Ducin](/en/react-query-a-solution-for-frontend/)

-   #27 - Documenting Event-Driven Architecture with EventCatalog and David Boyne
