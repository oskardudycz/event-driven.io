---
title: Follow the money to get a better design
category: "Architecture"
cover: 2023-07-02-cover.png
author: oskar dudycz
---

![cover](2023-07-02-cover.png)

**I noticed that we, developers, struggle to follow the money.** And that's impacting our design in the wrong way.

Of course, we're pretty good at getting high salaries, but I'm not speaking about that.

**I'm speaking about understanding who's the client and who's the user of our system. Why is it important?**

As cynical as it may seem, finding out who'll be paying us money is as helpful. That's critical in selecting the right tradeoffs. Example?

Let's say that we're building a SaaS platform like Shopify:
- **Who's our client?** A shop that'll be paying for our subscriptions. 
- **Who'll be using our platform the most?** People that'll be buying goods in online shops. **Will they be paying us?** No, our clients.

**Who should we optimise for?** Our clients, so subscription payers. Should we include other users' needs? Of course, but to the degree of balancing between making our clients happy and cost justification. So best if there's a direct relationship between making users and clients happy.

That may not sound like a nice thing to do. But we cannot make everyone happy. We should embrace that. That will help us to set up the priority. And that's a basis for tradeoff analysis.

**We should ask ourselves questions when discussing our features:**
- when will our client be sad?
- when will our user be sad?
- will the fact that our user is sad make our client sad eventually?
- will that be more disappointment, sadness or despair?

Of course, talk to both clients and users. But remember also to follow the money.

My intention is not to suggest ignoring user needs. I fully agree that it's one of the things that is a must-have. Yet, if we're too focused on our users, we may lose the end goal and who'll be paying us in the end. I'm not saying we should be greedy, but understand why we are building our system and what's a must-have for our product to survive.

**And too often, clients' needs are different from users' needs.** For instance, Google wouldn't sell ads if there were not enough users using search. Still, they could have a massive number of users with no business model and go bankrupt. It is, of course, a reinforcement loop, but more than having users is needed to have paying clients. In the end, client satisfaction will make or break our success story.

So, in other words, I'm voting for a good enough evolutionary approach, and without understanding the end goal (so _"where the money comes"_), we won't be able to achieve that and make good tradeoffs.

Of course, the basis is that we're not trying to do evil.

My suggestion to _follow money_ is about more than just money. It's about finding the essence of what makes our system go on. Who is the decision maker and what's our business model, and how to fulfil it best?

**Counterintuitively this is a decent exercise to start working on empathy.** We're starting to see businesses and people behind our system. That can help to design a proper resiliency without over-engineering. 

Following the money is also a decent technique to [find the risks](/en/the_risk_of_ignoring_risks/) and crunch our initial design. If we were more focused on asking and listening to our domain experts about their needs and why we are building our tool, our design would also be more sound. The solution we're using could potentially be more boring regarding the tech stack. But boring tech wins.

Interestingly, in the emerging impact of tools like ChatGPT, and GitHub Copilot, **empathy can be a skill that can be a difference-maker for you on the job market.** Those tools will reduce the need for people who _"just want to code"_. Their job market value will lower. They will still be needed, but only if they're good in the tech niche.

**So who's your client, and who's your user?**

Cheers!

Oskar

p.s. Read also more on how [A few words on communication](/en/a_few_words_on_communication/) and the [Bring me problems, not solutions!](/en/bring_me_problems_not_solutions/).

p.s.2. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
