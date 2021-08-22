---
title: How (not) to cut microservices
category: "Microservices"
cover: 2021-01-13-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2021-01-13-cover.png)

Today, I'm holding a keyboard in one hand and scissors in the other. What do I need these scissors for? According to the post title, I would like to talk about cutting (micro) services.

We've come a long way from the moment when the saying "you do a monolith" sounded like "you're dumb", to the time when many people refrain from saying the word "microservices". How is that? In the IT world, buzzwords are popping out every day. Just like in clothes selection, fashion is an essential thing in programming. It is also interesting how initially smart ideas and patterns, chewed by the jaws of the blogosphere, can eventually become something inedible.

I believe that we can divide misunderstandings about microservices into two categories:

1. **Technical**: the idea is reduced to the hosting itself, Docker, Kubernetes pods etc. In this (mis)understanding, a microservice is something that we deploy separately,
2. **Sociological**: cargo cult. We're doing that because others are doing it. I saw the scenarios, where technical leaders and managers decide to use microservices because they cannot find employees. After all, candidates want to do microservices - seriously!

Let's focus on the technical part today. More specifically, on the *"deployment unit"*: what is it? It's the single application hosted in one runtime environment, e.g. a web API. Yes, sometimes the deployment unit is called microservice. Is it right?

**When do I think it is worth having more than one deployment unit in the application?**

1. **The difference in traffic and workload in individual parts of the application.** Imagine that we are working on an e-book sales system. In such a scenario, modules for managing and adding e-books will have less traffic than the item search engine or shopping module. For such a case, it's worth deploying search and management modules separately. It might be worth having a larger machine for the search engine, a tiny one for the management panel, and medium one for shopping. Such a split will allow us to utilize resources better and thus save money.
2. **Increasing the throughput.** There are scenarios where we need dynamic scaling. For example, in the mentioned e-book system on Black Friday or Boxing Day, we may experience high "peak" traffic. It might be worth scaling horizontally by adding additional system instances. They could be clones of the same system version accessing the same resources (e.g. the same database). Both system and storage should be prepared for that. For example,  clones should be stateless because one clone knows nothing about the others and will not be able to share the state.
3. **Multi-tenancy.** Usually we are selling the same system to different customers (tenants). In that case, it is worth ensuring that the changes made by one customer don't affect another client operations. Data isolation is the key area that we need to take into considerations. Besides that, different customers may have different traffic. We may face the scenario when one client has more traffic than the others, or something unforeseen has happened to them (e.g. suddenly increased demand, DDoS ​​attack, etc). We want to avoid a scenario when that impacts other customers. Especially if we have competing companies as customers and one is affecting the throughput of the other. To achieve that, we may need to create separate system instances per customer (both data and network isolation). This approach is called sharding. In short, with this approach we keep independent clones of our system per customer.
4. **Multi-region.** Nowadays, quite often, our applications must work in multiple geographic regions. Many people do not realize it, but we have thick optical fibres pulled across the bottom of the oceans. The Internet is transmitted through them between continents. We don't think about it every day, but physical distances also matter. Therefore, we need to make sure that our application is efficient not only in our geographic area, but also in others. We can do that by cloning the instances across regions and putting them close to the users' location. What's more, we usually have to conjoin that with the considerations described in previous points.

**OK, so which technical reasonings about microservices I found unfortunate?**

1. **The necessity of having 100% availability of our application.** It would be nice to have a "rolling deploy", i.e. we put a copy of the application as a separate instance running in parallel. We switch the traffic to it and turn off the old version. However, in practice, after over 12 years of my career, I have never worked in a system where the business would not agree to a reasonable service window. In typical IT systems aiming for 100% availability is not worth the effort. It complicates the development and operations architecture. It's proven that we can do this today, but we should ask ourselves "why?". So let's first make sure that it is indeed a must-have for our client.
2. **The need to have different microservice per type of storage.** In the past (?) database was usually placed together with the application server. In today's era of clouds and Dockers, our database is generally hosted in a completely different location than our application. If our system uses two databases (e.g. Postgres for most data, Elastic for searching), do we need to have separate microservices per storage type? If the traffic is the same in every part of it and the cases described above do not apply, why to cut it? What benefit would we get out of that?

What is your opinion on this? I am happy to discuss that in the comments.

I'm looking forward to your opinion!

Cheers!

Oskar
