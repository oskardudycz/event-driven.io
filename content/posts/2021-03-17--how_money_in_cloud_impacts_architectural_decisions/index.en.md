---
title: How money in Cloud impacts Architectural decisions?
category: "Cloud"
cover: 2021-03-17-cover.png
author: oskar dudycz
---

![cover](2021-03-17-cover.png)

It's intriguing how our perspective on software development changed in the last few years. We transformed from the on-premise age to the cloud era. Cloud is no longer a "buzz word". When someone says "I use Azure", "I use AWS", we acknowledge it with a shrug. When the solution matures, we stop seeing it in black and white. We notice different shades of grey and begin to understand better features, characteristics. In "A Wizard of Earthsea", Ursula Le Guin wrote that we gain control over someone when we find out their real name. Did that happen already with Cloud?

**The cloud has several names, one of which is money.** We pay for every second of computing and data transfer. Nothing comes for free. We know perfectly well that the more we use Cloud, the more we'll pay. Apart from this obvious fact, others are not visible at the beginning. We may miss the impact of those continuous costs on our architecture. Some time ago, life was simpler. We didn't have too much choice. We were usually selecting out of a few databases. Most of them were relational. If we were a .NET shop, we were using MSSQL. If we had a lot of money, then we could use Oracle. If we wanted something for free, we used MySQL or Postgres. If we were brave enough and progressive to use a document database, we used Mongo or RavenDB.

The main cost was made when the project was kicked off. We were buying the licence, server machine and then we forgot about the cost. If the database was Open Source, the programmer could be a decision-maker. Now, in the cloud, even for Open Source technologies, we have to pay. We have more options, but that makes a choice more difficult.

An example from my previous project. We used AWS. We'd like to use DynamoDB extensively for everything in the write model. However, we weren't using it everywhere. We used it mainly for configuration data and operations that had to be fast. We used AuroraDB for business data - a distributed relational database. **Why? Because it is cheaper and it is good enough for our problem.** Therefore, architectural decisions can no longer be made at the convenience of developers. They also have to be made based on Excel calculations.

**Another aspect is performance.** We quite often relegate considerations about that at the very end of the project. Let's say that 1 second for a reply from our endpoint is "good enough". Assume that we didn't focus on that, and our request takes 10 seconds. We may not be paying attention, but we may realise that we are paying 10 times more for our services than we should. For a SASS startup, this can often turn out to be an important issue - to be or not to be. Those considerations should impact our strategy of dealing with performance.

Yet another curiosity. It is worth being good at math. In serverless, we can select the size of resources for lambda/function. The more resources we allocate, the more we will pay for the processing time. But! It turns out that it might be more profitable to allocate more resources because they will process the request faster and ultimately pay less.

**I bet that soon a consultant with an abacus will be a well-paid profession.** This person will come with the Cloud catalogue. We will tell what we need in our system, and the consultant will spit out a cost-optimal set of cloud services. 

What are your experiences in this area?

Cheers! 

Oskar

p.s. I also wrote my thoughts on the Cloud security in article ["Form a wall! And other concerns about security"](/en/form_a_wall/). Have a look!