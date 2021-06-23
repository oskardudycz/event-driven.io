---
title: When not to use Event Sourcing?
category: "Event Sourcing"
cover: 2021-06-23-cover.png
author: oskar dudycz
---

![cover](2021-06-23-cover.png)

Event Sourcing is perceived as a complex pattern that's challenging to learn. Typically it's matched with the financial industry or big enterprise systems. If you’re familiar with my posts, you already know that I disagree with this categorisation. **I think that Event Sourcing is also relevant for the smaller systems.**

Indeed, Event Sourcing shines the most when we can work with the business to find the business events. [Event Storming](https://www.eventstorming.com/) and [Event Modeling](https://eventmodeling.org/posts/what-is-event-modeling/) proved that events work great as a way to describe business processes. We can use them as _"checkpoints"_ of our workflow.

Events are also essential as a data model. If we're storing them in a durable event store (e.g. [EventStoreDB](https://www.eventstore.com) or [Marten](https://martendb.io/)) then we won't lose any business data. The nature of Event Sourcing is storing the results of each business operation. We can use this information later for integration between services, advanced reporting etc.

## Event Sourcing is not a silver bullet. 

As with a hammer, you can drive a nail, but you can also hit yourself on the finger. There are cases when using it can be state-of-the-art. **The most important thing to understand is that Event Sourcing is not a system-wide architecture concept. It should be considered at the module level.** It's a perfectly valid case if part of the system is Event-Sourced. It's not an all-or-nothing decision. For example, we can use Event Sourcing in the core business module, and for "supportive modules", we can use a traditional approach.

What do I mean by _"supportive modules"_? I mean, for instance, a CMS (_Content Management System_), e.g., Confluence, WordPress, OneNote or even Excel. Such systems can be treated as bags for data. You put some data in there, sometimes in plain text, sometimes a table, sometimes a photo. We do not intend to perform advanced data analysis: we just want to store and retrieve data. It's not essential to know the type of data we're storing. All will be aligned and handled with the same patterns, e.g. a grid with data, edit form. We create, update, read or delete records. We can use such systems both for everything from wedding planning to warehouse inventory and budgeting.

**In this definition, we could say _"in my system the Event Sourcing system won't work out because it is a simple CRUD"_.**  Even if we add more fancy technical features like permissions management or logging, it's still a CRUD just wrapped in layers like a Matrioshka. We create some tables, add some services and add some forms, as the finishing touch on top of it.

I agree that Event Sourcing will not suit such systems. However, it usually happens that at some point, business comes to us and says:
- _"You know what, I'd like to have a template for monthly budgeting."_
- _"This template is great. Could we check when people are using it?"_
- _"Ah, the HR department would like to have a section that's only applicable for them with staffing information."_
- _"HR department loves that! It's great, but could we make some fields only editable for the manager?"_
- _"Can we send the budget automatically to the financial department?"_
- _"Integration works great! Can we add an approval process for the financial directors? If they approve the budget then it cannot be changed anymore, and if they reject it the budget should be sent back?"_

**If we ask a few more questions, then it appears that from the simple budgeting form, we get a complex process with different workflow paths.** If we think about our system as CRUD, we should also ensure that we consider the growth expectation. Especially for greenfield projects, we may already know that even though the first phase will be simple, the critical decision about go/no-go will happen if the expected growth is reached. Therefore, we should ask a lot of _"whys"_ and be proactive in investigating our business domain (read more in ["Bring me problems, not solutions!"](/pl/bring_me_problems_not_solutions/)).

On the other hand, we should be careful and remember the basics. For example, I was working on a project that had a dedicated service for configuration. Even though it mainly contained classical dictionaries, all integration was run through events. The amount of repetitive, boilerplate code was enormous. For such cases, maybe an old-school but a battle-tested solution like replication would be enough.

## Technical considerations are not the only ones we should evaluate.

Socio-technical issues can be even more critical.  I see three main categories here:
1. The team is doing well with the current approach.
2. The team could benefit from Event Sourcing but thinks they don't need it.
3. The team thinks that it needs Event Sourcing, but the team doesn't have the competence and experience.

**The first category is quite apparent. If you have a good process that works, then why fix something that's not broken?** If you do classical layered architecture and it works for you and your clients, then it might not be worth innovating just for the sake of doing it. I'm always saying that a well-done CRUD is much better than a poorly done Event Sourcing. There is nothing wrong with using unsexy technologies or patterns if that works. Of course, it's worth considering if adding portions of Event Sourcing won't make our life easier or open new possibilities. Especially trying it for the modules with the audit needs or complex workflows can benefit. Event Sourcing can also help in diagnostics and debugging. Nevertheless, even if something looks stupid but works then, it's not stupid.

**There is a joke:**

_The guy goes for a walk in the park. The weather is good, conditions are pleasant, but suddenly he hears groaning. He looks left, looks right and sees a pitiful dog lying near the bench. Worried, he goes to check what's wrong._

_On the bench, the dog's owner is sitting._

_The guy asks him: Why is this dog groaning? Is the dog hurt?_

_Owner answers: He's lying on the needle._

_The guy inquiries: Why the dog doesn't get up?_

_Because it doesn't hurt that much._

## That's the second category of socio-technical issues: reluctance.

The team has some problems with the current process. For example, the team members complain about it during private chats in the kitchen, but they're not motivated enough to pull the trigger. Maybe they'd like to change something, as some things are not going smoothly, but they prefer to not start a revolution. 

Sometimes the reluctance does not come from the team, but something external, e.g. from the company culture. For instance, it might be the management that does not reward for good and punish for wrong. People might be afraid to try a new approach to not be blamed and punished. Plus, some people don't want to take responsibility. They just want to "do their work".

If we're aiming to drive the change, and we get backslash, then it's easy to say that "those dinosaurs do not want that". We may come to the conclusion that we're hitting the second category described above. We should verify if we're not interpreting the first category as the second. Maybe the current approach actually works, and only we are trying to change it? We should look inside ourselves and check if our motivations are pure. Don't we want to do CV Driven Development or Hype-Oriented Programming?

If it appears that Event Sourcing should help, then we should consider whether we have sufficient motivation for evangelisation. If so, then let's try to do it in small bits. We might not even ask for permission. For example, we can try to rewrite a minor existing feature using Event Sourcing. Nothing too big, we'll know the business case, and we won't waste a lot of time if we fail. If we succeed, we could show by example the real benefit for our project. However, we should understand that this may not work out. A rational refusal shouldn't clip our wings and cause burnout.

**If we have the driving force (e.g. we are a technical leader, architect), let's make sure we really need Event Sourcing before we start to use it.** If we want to force our team or the entire organisation, make sure we want to take full responsibility. Someone has to take it, but let's ask ourselves if we are aware of the consequences. Technologies and patterns also need to be matched to the capabilities of the team we have.

## That's how we came to the third socio-technical category: over-enthusiasm 

I personally played the Brutus role once. I killed the idea of using Event Sourcing in one of my projects. I did that even though the domain seemed to be a good fit. However, I was the only person experienced in Event Sourcing. We had a few teams distributed across three countries and two continents. I wouldn't be able to onboard all of them and do proper knowledge sharing.

Some developers, when learning that they'll start a greenfield project, hear ka-ching. _"Now we're gonna go crazy."_ It is a very tempting prospect, but is it really right? We need to remember that we're building our systems to facilitate business processes. They should do it well, and the execution should be as cheap as possible for our client. If we start to play with technologies or begin our work writing the core libraries and architecture before we start delivering business cases, we're making a grave mistake.

We usually make the most important decisions when we are the dumbest: at the beginning of a project. We know the least about the business domain and technologies we use. It's easy to fall into accidental complexity. It would be good if we at least learned from our mistakes. We could do that, but then next project, again a new set of technologies...

**What I propose is to follow the principle of _"Start Small - Grow Big"_.** Start with non-important business functionality. Then we won't get into trouble if we fail. Money won't be lost; no one will die. This functionality must be simple and match the Event Sourcing typical scenarios, e.g. feature with the auditing or diagnostics needs. Let's try to bring it the most straightforward way, implement it, see what breaks down, what mistakes we made, and then, learning from this experience, try new things.

Does that apply only to Event Sourcing? No, basically to every new pattern and technology unknown to us. There is nothing magical about it, but we often forget about such pragmatism.

Cheers!

Oskar

p.s. if you liked this article, you may also like the ["Sociological aspects of Microservices"](/pl/sociological_aspects_of_microservices/).