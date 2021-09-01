---
title: Will it scale... down?
category: "Architecture"
cover: 2021-09-01-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2021-09-01-cover.png)

[Some time ago, I wrote](/pl/how_to_scale_projections_in_the_event_driven_systems/) that there aren't many more annoying questions than _"...but will this scale?!"_. We usually think prematurely about upscaling. Recently, I had the thought that maybe we should be thinking more often about scaling down?

Intel did not think about that and is now losing its position as the market leader in processors ([read more](https://stratechery.com/2021/intel-problems/)). ARM processors associated with the Raspberry Pi and other IoT toys have entered the showrooms. The dynamic development of smartphones has helped develop powerful and energy-saving processors that are suitable for heavy use.

The Apple M1 processor is one thing, but it's just the beginning of the revolution. AWS has already introduced its cloud services based on [ARM Graviton processors](https://aws.amazon.com/ec2/graviton/). Other corporations are lagging behind, but of course, they have also started working on their ARM chips:
- Google: https://www.crn.com/news/components-peripherals/google-cloud-hires-intel-vet-uri-frank-to-design-server-chips,
- Microsoft: https://www.datacenterdynamics.com/en/news/microsoft-reportedly-developing-its-own-arm-server-chips/,
- Oracle: https://www.reuters.com/technology/oracle-launches-arm-based-cloud-computing-service-using-ampere-chips-2021-05-25/.

New opportunities and the immediate appearance of [ARM](https://en.wikipedia.org/wiki/ARM_architecture) processors in the _"premier league"_ causes that many companies cannot keep up with adjusting their solutions to support it. ARM chips have their own specificity; for instance, they are not necessarily well suited to traditional database approaches.

I have been asked multiple times if Event Sourcing suits the IoT. Potentially, this seems like a great match. Indeed, the IoT model seems compatible with Event Sourcing as we listen to events and then interact. However, this is not as trivial as it may seem. The main problem lies in the data coming from machines and the frequency of the events. Machine measurements might have a much higher frequency than the typical event store can ingress.

What's more, in Event Sourcing, events accumulate business value. IoT data is usually raw. They contain the unprocessed purely technical information. It might be needed to transform them. A typical pattern is to save the measurements using lightweight storage (e.g. simple key/value databases). Then grouping and processing into events that are understandable for business. This event transformation is essential for performance, but most importantly, for raw events to have business relevance.

Another point is that most event stores are not lightweight. They were created with larger enterprise projects in mind. Therefore, they cannot always run on IoT devices.

For example, in the EventStoreDB, the biggest problem for official ARM support is using the [V8 engine](https://v8.dev) for projection and gRPC, which also has issues with ARM servers. That should be solved in another version, but it still takes time to adopt, and multiple dimensions must be taken into account. Plus, a set of tedious regression testing.

https://twitter.com/arwinneil/status/1433326264815816705

The progress is made, but it takes effort and mind shift to adapt. 

Other types of databases will collide with similar issues. More and more people will expect software developers to run them on lighter and smaller environments. It is not only about IoT, but also serverless etc.

This is already directly influencing software development models. Not everyone likes it. For example, .NET is slimmed down with each release. Fewer and fewer functions are run automatically. A startup is getting shorter and more straightforward. Many people get upset that it is done for _"Bootcamp people who learned JavaScript"_ and that it doesn't matter in _"big projects"_. Maybe that's true for traditional monoliths, but not for the emerging use cases. For cases like serverless, initial (_"cold"_) startup time is critical. The slower it is, the more it costs (read more in ["How money in Cloud impacts Architectural decisions?](/pl/how_money_in_cloud_impacts_architectural_decisions/)). Also, the simpler it is, the less boilerplate it has, the smaller [cognitive load](/pl/sociological_aspects_of_microservices/) it has. That impacts adoption and many other cases.

The other area is edge computing. Single-page applications, static page rendering and solutions like [CloudFlare workers](https://workers.cloudflare.com/) enabled other use cases. Computing is not only distributed to the servers but also to client applications. [You can even host database on GitHub pages](https://phiresky.github.io/blog/2021/hosting-sqlite-databases-on-github-pages/).

We're putting more effort and computation to the edge:  web pages, IoT devices, and serverless functions. Thanks to that, we're reducing the traffic to the servers. By that, we're getting more scalable architecture. Right now, not only server nodes are used for computations but also client applications. By scaling down pieces of our architecture, we're giving more capabilities to scale up the whole solution. Still, besides the pros, it also has cons; it brings more complexity and forces us to optimise computing and trim resource usage. 

As you see, being able to scale down enables a lot of scenarios. It's so tempting and [cost effective](https://www.troyhunt.com/serverless-to-the-max-doing-big-things-for-small-dollars-with-cloudflare-workers-and-azure-functions/), that this will only grow. I anticipate that the ability to slim down your software and code will become more and more critical. 

**When we hear "Will it scale?" the next time, it might appear that it will mean downscaling, not upscaling.**

Cheers!

Oskar