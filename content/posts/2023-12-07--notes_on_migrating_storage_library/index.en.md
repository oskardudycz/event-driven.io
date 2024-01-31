---
title: A few notes on migrating storage library
category: "Coding Life"
cover: 2023-12-07-cover.png
author: oskar dudycz
---

![cover](2023-12-07-cover.png)

**I'm feeling like a surgeon in recent days.** Who knew that changing the connection management in storage library would be a delicate thing to do? I did, but it's still an intriguing feeling.

Most people say: _"you won't gonna change database ever!"_ but other things might happen that bring almost the same complexity. Examples?

**We created [Weasel](https://github.com/JasperFx/weasel) some time ago, a spin-off that maintains the schema for [Marten](https://martendb.io/) and [Wolverine](https://wolverine.netlify.app/).** Initially, we wanted to offload the Marten codebase and reduce coupling. We also hoped that it may be a first step to support other databases in the future.

And that happened to some degree. Wolverine supports not only Postgres but also MSSQL. What's more, it's supporting not only Marten but also EntityFramework.

**Adding a new database or storage library to an existing, big codebase is similar in complexity to switching a database.** And that may also happen to your business application.

Even if you don't, then libraries evolve and change conventions. For example, [Npgsql](https://www.npgsql.org/) (the PostgreSQL provider in a .NET world) changed conventions on connection management. Initially, it was a static configuration; now, you can set up individual [data sources](https://www.npgsql.org/doc/basic-usage.html#data-source) with different configurations.

And that's a change for good. That's the right direction the Npgsql team went, but making that switch is delicate. [And that's what I'm doing right now.](https://github.com/JasperFx/weasel/pull/112) Thus, surgeon-like feeling.

Of course, we could ignore and use the old way until it's fully obsolete. But then we'd need to change much more as our code will grow in that time, and we'd need to do it in a rush.

Also, we'd get much stronger pressure from our users, as the new features may be only available in the _new way_. And that's already happening, as to benefit from the new [Microsoft tool Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/database/postgresql-component), we need to use the new _data source way_.

We could just switch classes and call it a day. That still wouldn't be simple, but it would be at least faster. Yet, that'd be a half-assed solution, as we'd not benefit from the new features. Plus, trying to put your legs on different sides of the canyon is a recipe for disaster. Usually, the library creators assume that you go either one way or another, so choosing both can push you to nasty edge cases. Those are those that you usually find after production deployment.

**You may think that _meh, not my problem_. You may be right, but this may also happen to you.** Even if you use ORM, it may change its conventions and become obsolete; others will supersede that.

Should you then wrap your tooling? Nope, because you will end with the lowest common denominator and neglect the change.

As always [the magic is that there's no magic](/en/the_magic_is_that_there_is_no_magic/), the only solution is cautious evaluation and managing your dependencies. Keep them up to date, observe trends and predict how they may impact your solution. Plan what you do about them, and define strategy and tactics.

Don't assume that _it won't ever happen_ as those are famous last words.

**And hey, if you're feeling from time to time as a surgeon doing an operation on an open heart, that's fine.**

[Somebody's Gotta Do It](https://www.youtube.com/watch?v=M0SjU95U3-k).

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
