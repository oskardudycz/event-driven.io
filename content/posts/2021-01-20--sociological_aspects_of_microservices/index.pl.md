---
title: Sociological aspects of Microservices
category: "Microservices"
cover: 2021-01-20-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2021-01-20-cover.png)

Last week, I started writing about the topic of cutting systems into microservices (read more [here](https://event-driven.io/pl/how_to_cut_microservices/)). I was sceptical about the frequent technical motivations associated with them. I have listed elements that, in my opinion, justify dividing our system into smaller pieces. I have distinguished these as:
- the difference in traffic in particular parts of the application (e.g. the administration module does not need as many resources as the search module),
- the ability to dynamically increase the system capacity with horizontal scaling (e.g. by adding more instances of the sales service on the Black Friday),
- multi tenancy, i.e. when we do not want the operations made by one client to affect operations of another client,
- multi-region: when we have a global system, and we want it to work equally fast, e.g. in the USA as in Europe.

Today I would like to put the cat among the pigeons again and talk about the sociological sphere of using microservices. Quite often, we make our decisions not only based on technical or business requirements. The same thing happens for cutting our systems into microservices. Let's check what the most common reasonings are:

1. **CV Driven Development, Hype Oriented Programming, Hipster As A Service.** These are patterns or doctrines that tell us to use the latest technologies, so we take the most fashionable, trendy, jazzy tools that we can get, usually blindly. I have participated in projects where I joked that we only use libraries with no more than two contributors because we want to discover young talents. I also had a visionary client who did not want to use popular and proven technologies. Although he tried to do an ordinary ETL process, he was always searching for something new instead of using, e.g. MSSQL Integration Services or Reporting Services. He wanted to be an "explorer" and be one of the latest blockbuster solution's first adopters. I ended up rewriting the solution 3-4 times from scratch using different, weird tools. Quite often we choose technology to have "fun". There is nothing wrong with that, as long as it coincides with the client's "fun". Unfortunately, too often, these two ways are mutually exclusive. That can be a recipe for disaster. We forget that our job is to create systems that just work. They're supposed to bring in money for our customer. If our decisions make our work enjoyable, then that's all the better for us. But "first things first", the most important should be customer satisfaction, not our pleasure.

2. **The recruitment aspect.** In our industry, everyone wants to do the latest things, using the latest technologies and the most popular frameworks. It's the same with microservices. I was involved a few times in conversations with others saying: "Well, I think that we do not need microservices, but without using them, I will not persuade people to work in my company". Cobol was cool once, now finding a living programmer to code in this might be challenging. But that's a different story. In my opinion, we should consider whether we, as programmers, are not exaggerating the lust for newer technologies. I am not talking about minimalism and looking for stagnation, but a pragmatic and common-sense approach that we often lack. Do we have to try everything? Maybe we should focus more on delivering business value than trying to use all technologies on earth?

3. **Independence and leadership.** When we discuss the possibility of cutting the system into independent modules we're thinking "this is my moment!". Now we can finally have  our own modules. Now we can separate ourselves from the people we don't like. We can focus on our work and tell the others "screw you!". Of course, autonomy is a significant value. We should aim to have self-organising teams. However, with great power comes great responsibility. We have to remember about Conway's Law:

    ***"Any organization that designs a system (defined broadly) will produce a design whose structure is a copy of the organization's communication structure."***

    The mere fact that we have independent microservices will not make them the right solution. If the teams cannot get along, so will the microservices they have created. I coined the pattern that I called the "Negotiator Pattern."; we have two systems that can't get along, so now we have to add a third one to coordinate them. After that, usually, you end up having three systems that don't talk to each other. The same applies to development teams. You can read more about that in my [Architect Manifesto](https://event-driven.io/pl/architect_manifesto/).

We also have to remember about "Cognitive Load". It relates to the amount of information that you can process at one time. In other words, how complex is what you're trying to learn. The higher it is, the more it costs and increases the risk of project failure. See more in the excellent presentation by Manuel Pais and Matthew Skeleton: 

`youtube: https://www.youtube.com/watch?v=haejb5rzKsM`

To sum up, we're usually focusing on the technical reasoning of microservices. We also have to consider sociological aspects, as they can be much more dangerous than making a technical mistake. 

Thoughts?

Oskar