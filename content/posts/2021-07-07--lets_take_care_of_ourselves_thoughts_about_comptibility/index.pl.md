---
title: Let's take care of ourselves! Thoughts on compatibility
category: "Coding Life"
cover: 2021-07-07-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2021-07-07-cover.png)

In the last year, the word responsibility is used in all possible ways. Responsibility for us, for others. We can be heroes wearing masks instead of cloaks. Caring about others is essential not only in those crazy days but in general. We should take care of our colleagues. I often laugh that the best form of working in a corporation is doing nothing. Working in a corporation is a type of work where you are not rewarded for doing good, but you'll be punished for doing wrong. So the less we do, the less chance that we'll be wrong. It's similar to the doctors' ["Primum non Nocere"](https://en.wikipedia.org/wiki/Primum_non_nocere) rule. Still, not quite the same.

There is also a football saying _"it's better to stand smartly than run around dumbly "_. Work smart, not hard. Sometimes doing less or slower produces better and faster results than doing something quickly. It doesn't mean that we should avoid deeds, but we should think in advance about the effects of our actions. 

The basis for working in teams, especially remote ones, is respect for compatibility. We all heard about backward compatibility. 
But did we understand it?

Backward compatibility literally means that our new changes will work properly with the application's current (or previous) state. What does this mean in practice? Are migrations backwards compatible? Not really. They are transforming the earlier version of the application to the new one. Why is this not compatible? Imagine that we scale our system horizontally. We have several instances of the same service (to ensure better availability). We have the so-called rolling update, e.g. we deploy the new service's version instance by instance. We want to maintain the highest possible availability. What will happen if the first deployed instance will upgrade the shared storage schema? All other instances may start failing until we upgrade them.

Another situation is when we make a "core" library, which other libraries use, and decide to add the new parameter to the existing method. That may look like a harmless change, but what will happen if we make this parameter required (no default value) and someone updates to a new version of our package? Yup, compilation will fail.

If we're using an event-based architecture and we noticed there was a typo in our contract. I know that having _UserAnme_ instead of _UserName_ isn't cool. We may decide to change it. If we do that and release a version and start publishing the _"corrected event_ other systems subscribed to it will crash. They won't deserialise and understand the new format without changing their code and making a new deployment. For us humans, readability is essential. Computers do not care about that, as long as they get what they're expecting.

Of course, automated tests can help with that. Still, they won't resolve the real issue - thinking in advance and caring about the others work. Maybe you could say, _"Oh, someone from the other team should do update, it's just five minutes of work."_. Perhaps it's five minutes of work, but it's 5 minutes of work for you. Even if this someone is informed about it and does it, it is never that short. Add to that:
- context switching, 
- writing the code and automated tests, 
- integration checking if it really works, 
- pull request, 
- code review, 
Add to that time spent by several people reviewing the changes and potential discussions. And we are talking about an optimistic scenario, not a case where someone finds out when they get a production error because "something is wrong". Is it really five minutes? 

Jeff Sutherland, in his book [Scrum: The Art of Doing Twice the Work in Half the Time](https://www.goodreads.com/book/show/19288230-scrum), cites research from Palm:

_"They looked at the "Matts" across the entire company—hundreds of developers—and they decided to analyse how long it took to fix a bug if they did it right away versus if they tried to fix it a few weeks later. Now, remember, software can be a pretty complicated and involved thing, so what do you think was the difference?_

**_It took twenty-four times longer._** _If a bug was addressed on the day it was created, it would take an hour to fix; three weeks later, it would take twenty-four hours. It didn't even matter if the bug was big or small, complicated or simple—it always took twenty-four times longer three weeks later. As you can imagine, every software developer in the company was soon required to test and fix their code on the same day."_

I suggest the following rule:

**DO NOT MAKE BREAKING CHANGES AND DO NOT BREAK OTHER PEOPLE WORK. NEVER!**

Sounds radical? Maybe, but it is true. There is always a way to perform changes in a non-breaking manner. We can always do a step by step process.  

If we're creating an OSS library, we can mark features we want to remove with obsolete markers. We should add information about why and when we want to remove it and add a migration path. Then we can give our users time to migrate and not surprise them. In one of the follow-up releases, we can remove it.

Literally, it will be a breaking change but done in a non-breaking manner. If you are a library maintainer and provide breaking changes in each release, I can guarantee that you won't reach mainstream or broader usage. Most companies expect predictability. If you keep posting breaking changes now and then, users will either not move to newer versions or quit. Read more in my article ["How to get started with Open Source?"](/pl/jak_zaczac_z_open_source/).

Of course, sometimes breaking changes are needed to remove the ballast. Then migration guidelines are necessary to help your users. Still, it's a tactical thing that you should avoid if you can. 

There are ways to reduce the number of breaking changes. For instance,  keeping everything private, that doesn't have to be public. If you expose something, then you have to assume that someone uses it. Follow the [Semantic Versioning](https://semver.org/lang/pl/) rules. Also, grouping the breaking changes into a single release.

It's also worth providing migration tools (e.g. we did such a thing in EventStoreDB with [Replicator](https://replicator.eventstore.org)). Nevertheless, those are tactics. I stand on my take that the strategy to be reliable and effective is not doing breaking changes.

**To makes things harder, backward compatibility is not the only compatibility we should think of.** There is also forward compatibility? It means that we have to anticipate that our code may be called by the newer version of the code/service. It is backward compatibility seen from the perspective of this old code/state. For example, if we listen to an event, e.g. _UserAdded_, which has the fields _Id_, _Username_, we can expect that, for example, in the future, we may get its newer version with new fields, e.g. _Email_, _BirthDate_, etc. 

Of course, we can't predict how our application will evolve. We will not handle fields that we do not know. We don't have to predict everything. Nevertheless, we have to keep in mind that the contract may change, and if it is backwards compatible, we should handle it. How can we do that? Well, we can, for example, not throw an error when we get additional fields in the payload. If we do Event Sourcing and save the events to the database as JSON, we should keep them as they are. Thanks to that, when we update the code, we will create the new logic and handle the extended data.

We should help ourselves and help others. Let's try not to break others' work because it really pays off, literally. It really isn't a waste of time.

Cheers!

Oskar