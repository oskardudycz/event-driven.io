---
title: Dive a bit deeper, look a bit wider
category: "Coding Life"
cover: 2022-09-28-cover.jpg
author: oskar dudycz
---

![cover](2022-09-28-cover.jpg)

**We live in a time of information overload. We are constantly stimulated. Our focus skills are similar to a goldfish.** Seemingly our life is easier than it used to be. The same can be observed in programming. Our tools are getting more accessible, and processes are becoming more automated. Knowledge is also at your fingertips: online courses, blogs, and books. In fact, it's hard to choose what and where to learn from. Many companies even [employ DevAdvocate](/en/revolution_now/) to show you how to best use the tool and why it is worth it.

**However, the technologies' evolution does not want to stop.** More and more, faster and faster. Javascript frameworks are getting so out of fashion every week.

The dynamic development of technology, the seemingly good quality of training materials and, truth be told, laziness make our knowledge more and more superficial.

**Some time ago, I wrote [about TypeScript and how apparently it is similar to C# and Java, yet very different](/en/structural_typing_in_type_script/).** Because of that, Java and C# devs using TypeScripts tend to ignore differences and make cliches of their habits. Generics maze, base class on top of other base class.

**In one of my projects, one colleague claimed that Postgres was not performing well for his use case. He stated that he will use Redis because of its in-memory cache.** He got hooked on his idea. Proof of concept worked well, but it turned out (surprisingly...) that when the cache is invalidated, you have to rebuild it again. In addition, if you only keep data in memory, it may disappear when Time To Leave is reached. Once he realised those surprising side effects, he asked the operations team if they could make backups of the in-memory Redis cache. He didn't think that this was an unusual request. The ops team had a contrary opinion. That's one I heard for the first time about my colleague's brilliant concept. Out of curiosity, I looked at the Postgres setup to see why it's underperforming. Of course, it turned out that there wasn't a single index defined in the database (except for the primary keys). Curtain.

**One of the things I like to follow when I perform recruitment is the N+1 problem and ways to optimise ORM.** Not that it is a thrilling topic for me, but it allows me to learn a lot about candidates and the industry. As I mentioned above, knowledge of the basics of databases is rare - this is the world we're living. The majority uses ORM, but are they doing it consciously? Unfortunately, it turns out that things such as solving the N+1 problem or disabling tracking changes are also secret knowledge.

**I hear once or twice in a discussion that there is no problem keeping half a million records in the event stream in Event Sourcing.** In Event Sourcing, the entity's current state is rebuilt from all events in the stream each time we want to perform the business operation. Also, I don't know any pattern (besides Big Data) where getting half a million records is the intended use case. In Event Sourcing, the streams must be as short-lived as possible and, therefore, the shortest. I wrote about it in my article [How to (not) do the events versioning?](/en/how_to_do_event_versioning/) and explained in [Keep your streams short! Or how to model Event-Sourced systems efficiently](https://www.architecture-weekly.com/p/webinar-2-keep-your-streams-short) webinar. Some may say that we can use Snapshots, but then we're getting to the brilliant idea with the Redis cache I explained above.

**A similar thing can be told about the CQRS pattern.** Greg Young [wrote a relatively short document explaining it](https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf). Yet, for some reason, people took some pictures out of context, e.g. that one about multiple databases, eventual consistency and event sourcing. CQRS doesn't need all of that; if someone checked in Greg's explanation, then for sure, they would notice that it's shown as **one of the options**, not the recommended one. They would also read that CQRS is about segregating behaviours, so slicing the architecture by the business operations. Yet, people prefer to read hottakes on blogs or conferences instead of reading original works. That's also one of the reasons why I tried to explain it on [my blog article](/en/cqrs_facts_and_myths_explained/) and [webinar](https://www.architecture-weekly.com/p/webinar-4-from-cqrs-to-crud-in-practice), maybe that will reach some people.

**[Marten](https://martendb.io/) users ask quite often  _"How to make joins between documents?"_.** And the answer is _"You should not". As I described in [Unobvious things you need to know about key-value stores](/en/key-value-stores/), each database type has its specifics. Relational databases are denormalised, and document ones are normalised. They work best if we're querying for a specific document. So we should rather keep nested data than join it with other document types.

**Examples could be multiplied, but complaining won't help** I once heard that if we want to be at least a decent programmer, we should look at least one level lower than the one we work daily. So if we use ORM, apart from understanding it, let's also understand the basics of relational databases. If we are doing a frontend, let's understand the rules of building a sound WebApi and how the backend roughly works.

If we use a document database or event sourcing, let's look for their specific modelling rules. If we use a new language, let's try to understand its conventions.

**We should strive to understand our tool and try to [break through the marketing sold by their authors](/en/event_streaming_is_not_event_sourcing/).** Let's not base our design on gut feeling and question hype and what we read on the blog.

**Let's not be lazy and try to look a bit deeper. Even one level deeper than usual. And look a bit wider.**

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/). You may also consider joining [Tech for Ukraine](https://techtotherescue.org/tech/tech-for-ukraine) initiative.
