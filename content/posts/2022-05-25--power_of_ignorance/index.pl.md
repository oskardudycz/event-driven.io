---
title: Power of ignorance, or how to write simple code
category: "Coding Life"
cover: 2022-05-25-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2022-05-25-cover.png)

I was asked to compile various statistics from our Event Store GitHub community some time ago. We wanted to analyze our public repositories in terms of, for example:
- summary data: number of stars, pull request, forks, etc.
- but also data over time, i.e. how did they increase over time,
- additionally, data such as issues, number of discussions, comments, etc.

The Event Store has a lot of repositories (we're busy bees), so trying to copy and paste data from GitHub UI into Excel would be pointless. Well, we are programmers for something; we automate. GitHub provides its API (https://docs.github.com/en/rest) to get the whole spectrum of information. I decided to go on this path. Still, having API is one thing, and scraping data efficiently, is another.

How to do it then? The top results will suggest Python if you google "data scraping". Probably you don't even need to google that. Python and data scraping come hand in hand.

And here comes my ignorance, which turned out to be my advantage. I don't know much about Python. Before this task, I only wrote a small, simple thing to integrate data from two APIs overnight. It was a bit similar, and I had pleasant memories, so I said: _"Why not? Let's go deeper"_. It turned out that Python is a straightforward and intuitive language. Even such an ignorant like me was able to write a program that scraped a significant amount of data from GitHub and analyzed it. Python is a dynamic programming language. Because of that, it allows rapid prototyping and reduces unnecessary code structures. Plus, it is very expressive and straightforward (as I already noted).

Additionally, it has ingeniously simple support for data processing and analysis. [Pandas](https://pandas.pydata.org/) allows you to use code like Excel. Really!

C# and Java developers sometimes feel superior and laugh at some languages ​​or technologies. Yet, they ignore the usage context. Each programming language is a tool. If the tool is used for the wrong job, it may have a harmful effect. But if we're using it in the proper context benefiting from the strong sides, it may turn out that the laughter is actually ignorance - the damaging ignorance.

The positive ignorance, in my case, resulted in being humble. I didn't know Python best practices too much, so I didn't try to overengineer it. I focused on getting the job done and using the simple solutions and tools that could help me to get it right. No layers there, just simple methods with no crazy structures or optimization. Even though I have 15 years of experience in C#, I'm sure that I wouldn't be able to get this job done in a similar time as I was able to do as a Python noob.

I have recently been discussing a bit with my sister, who is taking her first steps in IT. It turns out that explaining to a beginner why a given code is crap and the other is great is not easy. I could just say _"it depends"_, but such an answer will not explain anything to a beginner. For instance, when I was thinking about describing why CQRS is better than Spaghetti Code or why it is more straightforward, I realized how many things we're taking for granted. Having learned something, we often forget our journey and how we come to our current conclusions.

Okay, so what's the moral of that? Let's write simple code. How to do this? Using the right tools for the job and not trying to use all of the most sublime structures. Focusing on getting our code to do its job the best it can. Nothing more, nothing less.

There is such a thing as "elevator pitch" in startup nomenclature. If you accidentally find your dream investor in an elevator, you should be able to present your idea to him during the ride. If you cannot explain it and advertise it within this time frame, maybe your idea is not good enough or does not have noticeable direct benefits.

I propose to verify that our code and architecture will pass the _"junior developer pitch"_. So will you be able to describe in short, simple words how it works and why it was designed like that?

If you want to see the code I created, I open-sourced it. You can find it here: https://github.com/oskardudycz/community-stats. I take Pull Requests!

Cheers!

Oskar

p.s.2. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
