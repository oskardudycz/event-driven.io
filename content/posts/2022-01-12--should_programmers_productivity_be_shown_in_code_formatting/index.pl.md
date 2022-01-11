---
title: Should a programmer's creativity be shown in code formatting?
category: "Coding Life"
cover: 2022-01-12-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2022-01-12-cover.png)

Each of us has at least a dose of creativity. I have always liked drawing. I wanted to make effective plays in football. Today, I play the guitar and write blog articles for you. I was not outstanding in any of these things, but I enjoyed every form of it. You don't have to be great at something to be creative. This has pros and cons.

Let's say programming. I used to consider programming as an art. To this day, I remember a few of my tirades on this subject. Good class structure, SOLID, DRY principles, those things. Fortunately, I didn't go to the extreme to join the tabs vs spaces war. People can argue whether you should indent two spaces or four for a long time. Or, for example, braces. Should they be in the same line or the next one? Do we even call them braces or brackets? C# devs can probably still argue if using the dynamic var variable or a strictly tapped variable is better. Each language has its own conventions. Every developer has an opinion on this and won't hesitate to use it!

Over the years, I have concluded that we're not artists. We have to do our job so that the customer is satisfied. Does this take away some magic from us? Maybe a bit, but is it wrong? Do we expect creativity from a car mechanic or welder?

It seems that a lot of confusion comes from a dissonance between how we picture ourselves and what we actually do. Our projects are usually neither very unique nor insanely ambitious. Hence, our medley in selecting technology, formatting, discussions or some kind of convention.

[I am a perfectionist](https://www.youtube.com/watch?v=hPfVIoB9C0c). Dad and Grandpa taught me that _"either do something right or not at all"._ At first glance, this looks like a good approach; it seems more like a curse at the second one. That is why I fully understand people getting mad by the unnecessary new line. Nothing irritates me more than laziness and sloppiness. When I do PR, unnecessary spaces, redundant else ifs and unnecessary typing immediately catch my eye.

You could say I'm picky, and you're probably right. Still, there is also the other side of the coin. There is no such thing as multiple conventions - there is either one or no one at all. If every programmer starts to implement their own conventions, it's just patchwork, not the source code. Being sloppy on such simple subjects is kinda disrespectful to your colleagues.

Apart from the aesthetic value, it hurts delivery time and thus money. How so? Different code styles in each file make the codebase challenging to digest. Most of us are visual learners. Looking at something, we unconsciously look for patterns with what we know. If the code is written uniformly, it becomes transparent to us. We don't wonder and not get disturbed by why someone wrote it like that or the other way round. We just look at code able to focus on the business logic understanding.

This is important when we write code and when we do code review. I think you can recall discussions from review and comments like _"why is this brace here?", "Why don't you give var here?", "Why don't you check null here?"_. Often, those disputes are the most heated ones. They have nothing to do with the essence of the changes checked. Both sides lose precious time and positive energy.

Interestingly, not only us humans but also automations are better when dealing with patterns. The diff tools will show the differences better if the code is formatted according to the same rules.

It used to be challenging to implement this. It was a pain to set up static code analysis tools. Usually, some sort of Sonar tool would fire once in a while and then try to make recommendations if there was time. Typically, it wasn't. Today, virtually every language and IDE support _.editorconfig_ files to define source code rules. In addition, tools such as ESlint, Prettier in JavaScript and more, code analyzers in .NET, etc. etc. allow you to automate this process. We can now autoformat on each save, check the rules, etc.

There is nothing worse in the long term for an organizational culture than rules that are made to be broken. If we introduce a rule or principle in a project, it must be verifiable. We cannot arrange something and then do not check whether we are actually doing as was agreed. We should make real arrangements. I dislike the _"developer has to know and remember this"_ approach. We can be 100% sure that people will forget it regularly if we think so. If we have 10 people in the team, most probably statistically, someone will forget something every day. Therefore, the tedious processes must be automated.

When I tried to use Linter and Prettier in one of my previous projects, I met a lot of resistance at first. Artists wanted to prove who'll put newlines most beautifully. Yet, a patient drop has hollowed out the rock, repository after repository. At some point, even the most die-hard opponents started to add it to their repos themselves. Then a lot of code review fights and unnecessary discussions ended. It just works.

Of course, liners aren't just pretty code. Static code analysis also allows you to avoid errors and reduces the number of necessary tests. They catch issues that are easy to miss. IDE and plugins from JetBrains (e.g. ReSharper) have always been doing that.

If you want to see how you can configure it, e.g. in TS, please visit my repo: https://github.com/oskardudycz/EventSourcing.NodeJS. You can also look at the rules in the code in the EventStore - https://github.com/EventStore/EventStore/blob/master/src/.editorconfig.

I really recommend setting up some set of rules. First, compromise, then you can establish more controversial rules. I also recommend not to implement formatting changes and changes in business logic. Let's do a separate PR with corrections.  It is much easier for such a PR to be approved in a finite time when we know that we have not changed anything besides linter and formatting.

As Kent Beck says, let's [make the change easy, then make the easy change](https://www.youtube.com/watch?v=3gib0hKYjB0)!

Cheers!

Oskar