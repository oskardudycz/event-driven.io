---
title: Never Lose Data Again - Event Sourcing to the Rescue!
category: "Event Sourcing"
cover: 2022-11-06-cover.jpg
author: oskar dudycz
---

![cover](2022-11-06-cover.jpg)

**Relational databases are not losing data. They're robust, consistent and secure! Are they?**

Too often, we mix technical and logical concepts. Business transactions are not the same as database transactions. The fact that we can safely assume that information that we put into the database will be stored durable doesn't mean that it won't be lost.

**We don't even need to delete any data to lose precious business information.** Each override replacing the previous state with the new one may already erase the valuable information. For instance, seeing that the shopping cart is empty, how will you know that it's just a new shopping cart or someone added and removed a product? Such "pessimistic" scenarios are sometimes more valuable insight for the business than just knowing that everything went right and someone bought something eventually. In this example, knowing that someone put the product into the shopping cart but decided not to buy it can give us information about some gap or even an opportunity to "close the deal". Yet, we need to have that information!

During my studies, I spent the first three summer breaks working as a shop assistant in a clothes shop. The most important trick I learned was to persuade customers to try clothes. After that, the chance of buying grew a lot. The same rule applies to e-commerce. The rate of abandoned carts is between 60-95%. That's a lot. Those customers who had the intention to buy it and were so close to doing it but at the last phase resigned. If we store details of our business process, we can optimise and improve it. What's more, targeting and focusing on the people we know are interested in is much more effective than trying to reach everyone. Such precision is much more cost-effective, and thus our business can benefit from it.

**Event Sourcing, contrary to the standard approach, keeps all the facts that happened in our system.** They're stored as business events. We can look back and make analyses and enhanced diagnostics. 

Events are a great source and input for future workflows: analytics, reporting or even machine learning. For instance, we can create a recommendation engine by knowing what products were bought together. We can also do various reporting and forecasting, e.g. having the number of sales as of the last month, we can see how it could look on the new pricing model. Such knowledge is critical in budgeting and process optimisations.

**Nowadays, storage is cheap, but the information is priceless.** We should take benefit of it. Keeping the business facts is much closer to how the real world works. In the real world, there's no such thing as deletion. If we throw something into the trash bin, it doesn't magically disappear. It's just moved from one place to another.

**It's also worth noting that Event Sourcing is pretty often conflated with Event Streaming.** Both names sound similar and are about events, but understanding the difference is essential. Event Sourcing is a storage pattern; it's focused on capturing business facts and durably storing them. Event stores are databases and guarantee atomic writes, reading your own writes, and optimistic concurrency. So everything you'd expect from databases. Event Streaming is about data in motion. Tooling is focused on moving data from one place to another. This is the place where queues shine. Some of them have durability features, but they don't provide a guarantee to make your decision based on the latest states. Read more in my other article [Event Streaming is not Event Sourcing!](/en/event_streaming_is_not_event_sourcing/).

**[InfoQ in their report](https://www.infoq.com/articles/architecture-trends-2022/) shows Event Sourcing is in the "Late Majority" adoption phase.** That means that it's an established, common technique. Indeed it's getting much more traction. Yet, in my opinion, it's still a niche. That's a chance for you as it means that you can get a competitive advantage by using it. You can do better than other companies, move fast and innovate.  Using an event-driven approach [can also help you build autonomous services and teams](/en/how_using_events_help_in_teams_autonomy/). That can help in making your development process even more efficient. Don't wait to jump on the bandwagon; some empty seats are still left!

**If you don't know how to start, don't be shy to contact me.** I'm here to help. Check my [training](/en/training/) page. A workshop is the most effective way to jump-start. Try also my [Introduction to Event Sourcing - Self-Paced Kit](https://event-driven.io/en/introduction_to_event_sourcing/). When not to use Event Sourcing? I got you covered; I explained that in [my other article here](/en/when_not_to_use_event_sourcing/).

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
