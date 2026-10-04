---
title: 'React Query: A solution for Frontend State Management challenges? With Tomasz Ducin'
category: Software Architecture
cover: 2025-02-03-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---


`youtube: [Webinar recording](https://www.youtube.com/watch?v=MLO08iaRvBk)`

Welcome to the new week!

**[Tomasz Ducin](https://ducin.dev/) is back with us to explain the next parts of Frontend Architecture—this time with a deeper, more hands-on walkthrough of Frontend State Management on the [React Query](https://tanstack.com/query/latest) example**.

And this is a free episode available to all, so check it out!

**Why did we decide to zoom in on React Query? It’s a novel approach that can simplify front-end and back-end communication.** We wanted to show a practical example of a dedicated technology for handling server data, especially given how often I see teams mix local UI state and remote data in ways that cause stale info, redundant fetching, and scattered “loading” flags. Tomek walked me through exactly why React Query solves those problems.

**And Tomek is one of the best people I know, specialising in Frontend and Architecture.** He’s an Independent Consultant, Architect, Developer, Speaker, and Trainer. Expertise in Web Technologies & Software Architecture. Angular Devtools Contributor. [Egghead Instructor](https://egghead.io/q/resources-by-tomasz-ducin).

Just check the video to see how he used visuals to explain React Query and state management work.

What else have we discussed?

**Tomek emphasized the crucial distinction between purely local UI data, such as toggles or form inputs, and data you fetch from a server.** When these two categories are combined in one place, it becomes unclear which part of your code is responsible for updates, which can result in inconsistent behaviour.

Keeping them separate helps maintain a clean structure and ensures each data part is updated in the right context.

Tomek then outlined the main challenges:

-   caching strategies,

-   time-to-live settings,

-   stale-while-revalidate patterns.

He also discussed query keys, which let you organize and invalidate server responses based on what actually changed—no brute-force reloading.

We jumped into real code, showing how React Query handles data fetching and background prefetches and automatically updates the UI when tabs come in and out of focus. Tomek demonstrated how to set mutation hooks for things like deleting a record and how easy it is to invalidate just the relevant pieces of the cache. The DevTools panel gave a clear view of each query’s status, simplifying debugging.

Tomek also showed us and proved that even though technology started in the React community, it can be used in other frameworks like Angular. Actually, it’s not called a React Query anymore, but Tanstack Query.

**What surprised me was the overlap with backend patterns, like pub/sub or connection pooling.** Tomek’s explanation showed that when React Query decides whether to serve cached data or make a new HTTP call, it’s basically doing a form of “pooling” and “subscription” management.

That’s a familiar concept in many server-side architectures, which shows how these patterns aren’t just front-end tricks. Logically, it’s not far from what we discussed in [Mastering Database Connection Pooling](/en/architecture-weekly-189-mastering/).

So again, that showed that we should not put a fence between us and discuss whether we face Frontend or Backend Architecture, it’s _just_ Architecture!

`youtube: [Webinar recording](https://www.youtube.com/watch?v=EXj9TTJQwNc)`

I learned a lot, and I’m sure that you’ll learn to. Check the video, comment, and tell us how you liked it.

**Please also send us the topic that you’d like us to discuss next time. Tomek has a lot of fuel in his back!**

Check also more from Tomek:

-   [Blog](https://ducin.dev/)

-   [LinkedIn Profile](https://www.linkedin.com/in/tomasz-ducin-82234a4b),

-   [Bluesky Profile](https://bsky.app/profile/ducin.dev),

-   [Egghead courses](https://egghead.io/q/resources-by-tomasz-ducin),

-   [His Polish course Architecture on Frontend](https://architekturanafroncie.pl/) (yes, it’s polished!)

Of course, [React Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

And other webinars!

Cheers!

Oskar

* * *

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

-   #24 - Frontent Architecture, Backend Architecture or just Architecture? With Tomasz Ducin

-   [#25 - Applying Observability: From Strategy to Practice with Hazel Weakly](/en/applying-observability-from-strategy/)

-   #26 - React Query: A solution for Frontend State Management challenges? With Tomasz Ducin
