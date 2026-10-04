---
title: Avoid Duke Nukem Forever Mode
category: Software Architecture
cover: 2026-09-07-cover.jpg
author: oskar dudycz
useDefaultLangCanonical: true
---

How old are you? I’m Duke Nukem 3D old.

Not in the sense that I was born in 1996, but that it came out when I was the right age. Being 11 years old was the right age to laugh hard at Duke’s jokes. Duke Nukem 3D was the first shooter game that asked the question: Why so serious? It was a unique game, as almost none of the earlier (and future) blockbusters won the audience with a lame sense of humour.

It was a great hit. Even though it wasn’t actually 3D, more like 2.5D. It doesn’t have the best graphics, but it's good enough, especially when paired with the creativity of the plot, scenarios, and gameplay. It sold 3.5 million copies.

It was such a success that the year after, the 3D Realms game studio co-founder George Broussard announced the sequel: Duke Nukem Forever. He expected to deliver it as a Christmas gift in 1998. It appeared to be quite a bold statement, since the game was released in June 2011. Yes, 13 years later than promised. What happened?

It’s a long story; look here: an almost hour-long video on that:

<iframe src="https://www.youtube-nocookie.com/embed/dfV4rI_gR1g?rel=0&amp;autoplay=0&amp;showinfo=0&amp;enablejsapi=0" frameborder="0" loading="lazy" gesture="media" allow="autoplay; fullscreen" allowautoplay="true" allowfullscreen="true" width="728" height="409" title="Embedded video" referrerpolicy="strict-origin-when-cross-origin"></iframe>

So let me be shorter and give you an even shorter version than the [Wikipedia Page](https://en.wikipedia.org/wiki/Development_of_Duke_Nukem_Forever):

1.  They realised that the 2.5D engine was already obsolete, and in 1.5 years it’ll be even more so, so they bought a license for the Quake 2 engine. For 0.5 million bucks. A lot, keeping in mind that they got only 0.6 million bucks in advance from their publisher for the new game.
    
2.  They showed the nicely looking trailer; critics were happy, but creators wanted more. They wanted something better, and after 14months of investment, they bought the latest-the-greatest at that time Unreal Engine, because why not. Just half a year till the promised Christmas.
    
3.  Not surprisingly, changing the engine while building the ~car~ game wasn’t the best move for the deadlines, and the game was still unfinished and in moving parts, even more so than it was. So, in 1999, they decided to change the engine again: to the new Unreal Engine, which had multiplayer capabilities. Yes, they decided to add multiplayer to an initially single-player game. A bit of scope creep.
    
4.  They worked on it and even showed something that looked nice in 2001, which, as Broussard said, was actually smoke & mirrors. Take-Two Interactive bought them and got into a fight with the new owners, claiming it would be done when it was done.
    
5.  In 2004, they switched engines again, this time to Doom 3.
    
6.  In 2006, nothing was working yet; the team was “basically pulling it all together and trying to make it fun”
    
7.  In 2009, they laid off the staff, downsizing the company. Take-Two filed a lawsuit against 3D Realms over their failure to complete Duke Nukem Forever, citing $12 million paid to Infogrames in 2000 for the publishing rights
    
8.  Nine ex-employees continued development throughout 2009 from their homes. Eventually, they created Triptych Games, an independent studio.
    
9.  Somehow, they managed to complete something and release it in 2011.
    
10.  The outcome? The game was a total flop, nowhere near the success of Duke Nukem 3D.
     

Fun fact: until 2024, Duke Nukem Forever held the Guinness World Record for the longest development of a video game, at 14 years and 44 days.

**Ok, why am I writing about it in the Architecture Weekly?**

Because I’m also the one to blame. Not for the Duke Nukem delay, but for falling into the same trap. “Do as we tell, not as we do”.

When [I started Emmett,](https://event-driven.io/en/introducing_emmett/) I went with the lean approach. I started by delivering the API for building Event-Driven applications. The first version didn’t even have any event store implementation.

I showed that to the rest of the world, and I quickly got feedback from folks who wanted to use it and said they were happy with what they saw. So I added the storage I already had [in my samples: EventStoreDB storage](https://github.com/oskardudycz/EventSourcing.NodeJS).

Then [I added, for fun, Pongo](https://event-driven.io/en/introducting_pongo/) - a MongoDB-compliant library that allows you to use PostgreSQL as a document database.

And I decided to add Dumbo, a shared package that will be responsible for connection management, SQL queries, etc. and use it to build the PostgreSQL event store.

That worked well; Pongo made it to Hacker News' front page. Emmett, PostgreSQL is probably the best Node.js PostgreSQL-based event store (not much competition, to be fair). People are using it in production. I haven’t had much success making income from it yet, but at least adoption is growing steadily.

**Then I decided it was time to make it production-ready.**

It was 1.5 years ago.

And yes, it’s production-ready, but the new official versions are still unreleased: 0.43.0 of Emmett and 0.17.0 of Pongo.

Why? For various reasons, some personal ones, but focusing on the development stuff:

1.  I entirely rewrote connection management and implemented my own connection pooling.
    
2.  Decided to add more database types for Emmett and Pongo: SQLite, [Cloudflare D1](https://event-driven.io/en/cloudflare_d1_transactions_and_tradeoffs/). Fun fact: I used the sqlite3 Node.js driver, which has since become unmaintained.
    
3.  That required making Dumbo drivers pluggable.
    
4.  I decided to add OpenTelemetry.
    
5.  I added resiliency and batching for processor implementations. Essentially rewrote the whole async processing.
    
6.  I added [Workflows](https://www.architecture-weekly.com/p/workflow-engine-design-proposal-tell) for business process coordination.
    
7.  And [many](https://github.com/event-driven-io/emmett/pulls?q=is%3Apr+is%3Aclosed+milestone%3A0.43.0), [many](https://github.com/event-driven-io/Pongo/pulls?q=is%3Apr+is%3Aclosed+milestone%3A0.17.0) other stuff.
    

Essentially, I locked myself into the big, great bang release. I also fell into:

<iframe src="https://www.youtube-nocookie.com/embed/gAjR4_CbPpQ?rel=0&amp;autoplay=0&amp;showinfo=0&amp;enablejsapi=0" frameborder="0" loading="lazy" gesture="media" allow="autoplay; fullscreen" allowautoplay="true" allowfullscreen="true" width="728" height="409" title="Embedded video" referrerpolicy="strict-origin-when-cross-origin"></iframe>

Which is fine, as those tools are great: Emmett 0.43.0 and Pongo 0.17.0 betas are totally different products: richer in features, more performant, resilient, etc.

Still, if you fell into that, then it’s easy to justify yourself and persuade yourself that there’s “one more thing needed” and “if I waited so long, then we could wait a bit more”.

**Luckily, I didn’t stop the feedback loop**. I was publishing alphas and betas quite often. I treated this as something I could release as-is if I had to. So didn’t turn upside down. Some people even started to use those betas in prod. Some couldn’t, of course, because of compliance yada yada.

Still, I should have known that better. In past, I either fell into the same miserable place and promised myself not to fall into that again. Well, I lied.

The worst thing is that this is mostly sitting in my own head. People would prefer to get more frequent updates. Of course, one reason was that I wanted to group breaking changes to make this easier for folks, but if you group too many, people won’t migrate. There are other options, and I already smoothed the migration story.

**That’s also a warning for you.** With GenAI tools, it’s super easy to fall into analysis paralysis or refucktoring. It’s also easy to fall into the waterfall-style plan. Having too many options, too many ideas, even if they’re great doesn’t help.

Yes, if you’re motivated enough, you can achieve anything, but…

…but you cannot achieve everything. The time and focus we have isn’t infinite.

It’s much better to stay focused, have one streamlined workflow, deliver continuously, and handle breaking changes. And most importantly…

Focusing on the feedback loop.

**So don’t be like George Broussard; don’t be like me and avoid Duke Nukem Forever mode.** It’s oh-too-easy to fall into it. And consequences can be severe.

Just because you can do something doesn’t mean you have to. We need to pick wisely.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
