---
title: How to quickly scale a legacy monolith?
category: "Architecture"
cover: 2022-02-09-cover.png
author: oskar dudycz
---

![cover](2022-02-09-cover.png)

Working with a legacy monolith is not easy. For years we learned how to tame that beast gently. We nurtured it and tried not to break it. We even may enjoy that carefully crafted ecosystem. Being a legacy doesn't have to be a bad thing. It usually means that you have paying clients. That's something that a lot of startups cannot say about themselves. Working with monolith gives as also a lot of stories to talk about with a glass of beer. Of course, those are primarily complaints, but at least we're talking.

**The problem begins when it turns out that we have tangled our code so much that the system ceases to be efficient.** Our business is doing well, the scale has grown, but our code is lagging. We can no longer handle needed traffic, especially when peaks in demand like Black Friday happen. Our system suddenly fails and cannot handle the best time to get deals. Sales related modules are especially vulnerable to that.

It quickly turns out that our tangled code slows processing. Rewriting it is not an option. Even if we get permission, it will take a long time, and time is already running out for us. Maybe we could break down the monolith into separate services? Nope, it will also take a lot of time. 

**Extracting bounded contexts, CQRS - everything is great, but you have to do it wisely to make it help - you can't be too quick. We're developers. We're cutting the Gordian Knot every day. Still, if we're asked for a miracle, we'll ask to wait a bit.**

So how do you deal with it if the time is running out?

Usually, the database is not the problem. Relational databases are designed for heavy loads. As long as we haven't done anything foolish like making dozens of stored procedures or having constant dead-locks, they should be able to handle it. We can also scale them up (vertically) by "turning up the slider".

In the case of application code, it often turns out that scaling vertically won't help. Adding a bigger machine might not help if our code is not designed for that, and it'll be still running redundant database connections, calling other services directly etc. Sometimes the only solution is to scale horizontally. Well, how to do it without breaking down monolith? 

**The potential answer is setting several instances of the monolith.** Sounds like a hack? It's possible, but [Facebook does that](https://engineering.fb.com/2020/08/24/production-engineering/scaling-services-with-shard-manager/), and it works out pretty well for them. 

How to prepare for it?

1. **Put API Gateway over our services.** It will create a unified entry point for frontend calls. In the beginning, it will be a 1:1 version of our monolith API. Thanks to that, we will also prepare to cut it into smaller pieces in the future. Most of the cloud providers have it "out of the box". ([Azure](https://docs.microsoft.com/en-us/azure////api-management/), [AWS](https://aws.amazon.com/api-gateway/)). We can also use on-premise solutions like [Kong](https://konghq.com/kong). Thanks to this, the front end won't be harmed by the effects of our next steps. They will be (relatively) transparent.
2. **Configure the Load Balancer and/or reverse-proxy.** It will be responsible for the even distribution of traffic between the clones of our monolith. Cloud providers also have built-in solutions here, but we can start with simpler ones like [NGINX](https://www.nginx.com/). It isn't a difficult task, but the proper configuration of timeout handling, web sockets, etc., can be tricky. It is worth taking a moment to check the edge cases.
3. **Set up several instances of our monolith**. We can, for example, do it with Docker containers, Kubernetes, or simply Virtual Machines. It is also worth making sure that our services are stateless. If we use session data (e.g. [ASP.NET Session State](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/app-state?view=aspnetcore-6.0#session-state), we will have to set up a shared session - e.g. by the database, because each instance will have a different one.
4. **Distribute reads evenly between instances.** - Usually, the most traffic comes from the read requests. We must speed them up at the beginning. Long-lasting writes are more acceptable and less harmful than long reads.
5. **Send all writes to one instance**. Writes are much more prone to changes related to a distributed environment. It is safer to start with having one instance that handle writes. Then we can gradually try to spread the writes as well, but first, let's begin with caution.
6. **Try sharding instances per customer.** We can set up load balancer rules to drive traffic based on the customer id sent in the request. That's the easiest way to split the traffic, reduce the impact of our changes, and isolate load between different customers. Thanks to that, our biggest customer may not be impacting our other, smaller ones.
7. **Consider using feature flags.** We can add feature flags (so more sophisticated ifs) that will disable or enable some of the features in the specific instances. We can use it to disable some endpoints or features to shard monolith instances to handle requests only to particular modules. That can be a decent first step to break down our monolith into microservices. Check [Launch Darkly](https://launchdarkly.com/) or your framework capabilities (e.g. [ASP.NET Feature management](https://docs.microsoft.com/en-us/azure/azure-app-configuration/use-feature-flags-dotnet-core?tabs=core5x)).

Is it enough? Can we call it a day? Of course not. It's just the first step that can buy us some time. It will be probably more expensive than one instance. If it is successful, it will also give us more trust from the business. Then they may more likely allow us to spend time on refactoring. It will also be a stepping stone that will allow us to cut monolith into smaller chunks gradually.

Additionally, it won't be redundant. We will have to do those steps to go into microservices or independently hosted modules. How to do it? Read more in [How (not) to cut microservices](https://event-driven.io/en/how_to_cut_microservices/).

Cheers!

Oskar