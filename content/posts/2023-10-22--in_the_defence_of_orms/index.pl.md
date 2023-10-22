---
title: In the defence of Object-Relational Mappers
category: "Architecture"
cover: 2023-10-22-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2023-10-22-cover.png)

**I'm happy I didn't have to use [Object-Relational Mapping tools](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping) in the last few years.** They're solutions to some set of problems, but those are the problems I try to avoid having in general. Still, I remember times when we didn't have ORMs, and I can say that they write better SQL than the average developer would write manually.

**Yet, I'm fed up with the takes "ORMs are bad".** 

They're easy targets to hit, but they're kinda whistleblowers of other design and organisational issues in the company. Usually, when you struggle to use them, that means that you should get back to the drawing board.

They're such as we made them, and there's a reason for their existence: reducing cognitive load. Instead of picking on them, we should analyse why they're popular and try to make other tools and practices easier (like in Marten).

**Of course, they're making some things too easy.** For instance, doing multiple nested joins or modifying a whole tree of dependencies. All that looks easy, as doing things in memory, but it's not, as it ends with a bloated set of operations and quite often, [the N+1 problem](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying#beware-of-lazy-loading). 

**Sometimes, that's just cheating from their creators.** For instance, Entity Framework Core till version 3.0, if it couldn't find the proper query in SQL, it was getting results into memory and filtering them. See [here](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-3.x/breaking-changes#linq-queries-are-no-longer-evaluated-on-the-client).

But then, if people take things for granted that [all will magically work](/pl/the_magic_is_that_there_is_no_magic/) and abuse ORMs, is it an issue with the tool or a people's problem? That's what I mean by organisational issues: lack of proper review, design phases and collaboration or just pure laziness. Some folks will always try to find the easiest way to _"just add one more if"_ and call it a day. To change their attitude, we need to build a better process. Tools may help in that, but they won't solve that issue.

**I heard once that it's always good to understand at least an abstraction level below we're working.** So, if we're using ORM, it's still important to understand Relational Databases and SQL because we won't be able to use them efficiently. ORM will then help us to reduce tedious work, but we can understand when it's better to fall back to regular SQL or RDB features.

Of course, some issues come from the fact that people are trying to use the Relational model where it doesn't suit their use case. That's why I prefer a document model instead of a tabular one as the default choice. Most of our applications are more suitable for it, as we're still moving the regular physical world (so documents) into computers. (Read also more in [General strategy for migrating relational data to document-based](/pl/strategy_on_migrating_relational_data_to_document_based/)). Luckily, nowadays, with Docker and Cloud Native managed services, it's much easier, and we have less friction to use other stuff than tabular data.

The relational model is much better for advanced filtering, etc. So, reading and correlating data via their relationships. It's also pretty good for optimising the data space and doing on-point updates. But it's not great for changing a wider object schema with nested data. And that's the schema we usually have in our business logic.

**Nowadays, ORMs are pretty smart and can do advanced mappings, but they still have limitations.** And we should embrace those limitations instead of unifying all models into one. If we do that, we're getting an inflexible, bloated model that's hard to maintain and understand. Our relational data and ORM tooling limitations are dragging us. Read more on how to [slim your aggregates](/pl/slim_your_entities_with_event_sourcing/).

**The other extreme is trying to break our models and doing mapping back and forth.** That's, too often, ending with complex, fancy data structure comparisons between domain model and entity to find what's changed and do optimised updates. That's never performant and always prone to mistakes. Of course, we have options to do it better; I showed that in [How events can help in making the state-based approach efficient](/pl/how_events_can_help_on_making_state_based_approach_efficient/).

I remember days without ORMs; they were full of gigantic_[stringly-typed code](https://www.dodgycoder.net/2011/11/yoda-conditions-pokemon-exception.html)_ vulnerable to SQL injection. I know where suggestions of _"just us SQL"_ can lead us. How viable it is depends on the context we're in. Removing ORMs out of the game won't automatically fix our issues.

**In my opinion, the main issue why people struggle with ORMs is that they're trying to squeeze a pig in a box.** They believe they can do all at once without embracing the reason they were built for. As their name suggests, they were made to facilitate mapping from relational storage, which was (is?) the de facto storage standard for many years. The standard that wasn't suitable for Object-Oriented programming. The fact that we do the mapping doesn't mean that this model should represent something more than a storage layer. 

See the difference between:
- [typical wild ORM usage](https://github.com/oskardudycz/slim-down-your-aggregate/blob/6bf937f92708b2bd1fef117f0b78de6cb654965e/csharp/Original/PublishingHouse.Persistence/Books/Mappers/BookEntityMapper.cs#L67),
- [more focused on behaviour and tools capabilities](https://github.com/oskardudycz/slim-down-your-aggregate/blob/9d7dbdea044991e446ce69ba438e2589176bda49/csharp/Slimmed/PublishingHouse.Persistence/Books/Repositories/BooksRepository.cs#L38).

**Trying to use ORMs for everything isn't the issue with the tools; that's a design and organisational issue.** Blaming and hating tools won't help. It'll just make an easy excuse for us, as tools won't defend themselves.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
