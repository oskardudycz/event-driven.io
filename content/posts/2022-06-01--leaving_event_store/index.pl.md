---
title: Why I'm leaving Event Store and getting ready for the next episode
category: "Coding Life"
cover: 2022-06-01-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2022-06-01-cover.png)

I've got some news today. Here comes the boom: **I'm leaving the Event Store**, which means I just became unemployed!

**How come?**

I am a pragmatic person. My usual decisions are entirely rational. Obviously, this is not the case here. Working at the Event Store was a massive opportunity for me. I wrote about it in more detail in the article [Revolution now!](/pl/revolution_now/). TLDR: It allowed me to work daily with the leading Event Sourcing solution. It also enabled me to do what I like: help the community, explain the benefits of Event Sourcing and help to solve learning issues. It also was a chance to master EventStoreDB knowledge. And that's what it was. The last year and a half was a lot of learning and an excellent possibility to show people what I learned. If it was so good, why am I leaving? 

**A Developer Advocate's job is not as sexy as it may seem from the side.** It's not only about conferences, after-parties, webinars and blogging. During the first months, I focused on improving [documentation for gRPC clients](https://developers.eventstore.com/clients/grpc/). It needed some love. [Whole lotta love](https://www.youtube.com/watch?v=HQmmM_qwG4k). It was quite basic with partial examples in .NET when I joined the team. EventStoreDB now provides [.NET](https://github.com/EventStore/EventStore-Client-Dotnet), [Java](https://github.com/EventStore/EventStoreDB-Client-Java), [NodeJS](https://github.com/EventStore/EventStore-Client-NodeJS), [Rust](https://github.com/EventStore/EventStoreDB-Client-Rust), [Go](https://github.com/EventStore/EventStore-Client-Go/) clients (plus unofficial ones). They required also love and work to align the used conventions. We intended to maintain local environment specialities while keeping a similar developer experience. To present them well in documentation, they had to be standardised first. I rolled up my sleeves myself and helped unify the clients:
- NodeJS, [see more](https://github.com/EventStore/EventStore-Client-NodeJS/pulls?q=is%3Apr+is%3Aclosed+author%3Aoskardudycz),
- Java, [see more](https://github.com/EventStore/EventStoreDB-Client-Java/pulls?q=is%3Apr+is%3Aclosed+author%3Aoskardudycz),
- Go, getting the community call to help us deliver something that Gophers will like, [see more](https://github.com/EventStore/EventStore-Client-Go/pull/65).

I continued the effort also with other clients. I also helped build the internal ADR and RFC process by discussing and providing my and community feedback. This process has matured, and I hope that at least some of these design documents will be published soon. I think my enigmatic title of Developer Advocate had the justification in such type of work. My main goal was to [make things accessible](/pl/small_rant_about_software_design/) and show that our tools (and Event Sourcing in general) can be adequate for broader adoption.

In addition, I wrote dozens of blogs and appeared many times at webinars and conferences and a few podcasts. I laughed that I'll be there asking if you want to talk about Event Sourcing popping out from your fridge.

**Okay, but why am I leaving?**

It was definitely a tough decision to make that required getting out of my comfort zone. It involved many considerations. Working at the Event Store was a good experience. There's no "bad blood" between us. In fact, we're discussing some lightweight forms of collaboration. Nevertheless, I want to go beyond the canon of what I have been doing and better implement my vision. Let's face it, a Developer Advocate's job is marketing for developers. Of course, we can put it in different words, but that's the fact. Of course, I tried to do it objectively without evangelising, explaining the pros and cons. Still, we are not expected to be creative but re-creative. **I like to create new things. I like to deliver. I would like to do it more.**

Perhaps even more important, the second reason is the need to get more flexibility with my time. Or simply putting: **spending more time with your family.** COVID indeed prevented me from travelling around the world to conferences. However, the work of a Developer Advocate is still mentally engaging. It's not easy to find calm, focus time. It requires constant contact with the community and coworkers. It's not easy to find the right balance, especially in remote work, where you don't see people in person but through the Zoom window. 

Plus, I usually finish my workday around 5 PM; my daughter is 2.5 years old. We're generally getting her ready to sleep around 7 PM, which effectively gave me 2 hours of fun with her. Not enough. Definitely not enough. And it is also due to fatigue. I want to adjust better and start to get a better work-life balance. Which I constantly struggle with. And overcome my workaholism and teetering on the edge of burnout.

**What's next? How will I earn a living?**

I plan to start with consulting, workshops, etc. I did not advertise myself so far, but practically every month, I got inquiries about consultancy, workshops and other forms of support. So, **it is also an opportunity for you and your company if you want to enter the land of event-based architectures.** I'm open to cooperation. I'm not yet ready for full-time or long-term work, but if I could help you, [feel free to reach me](mailto:oskar@event-driven.io).

 **And here comes the massive boom! In July, I want to finally start pre-ordering the online Event Sourcing course.** 

There, I said it. I have so far received positive feedback about the idea. Still, I'd like to do validation before fully committing my time to that. Because it will definitely be a significant effort, plus there is simply no such material on the web, so I want to do it with a bang. I hesitated for a few years, so now I'll just do it and see what comes out of it. I plan to explain how to transition from CRUD to Event Sourcing in the course. I intend to explain why would you consider doing that and how you can benefit from it. By explaining how to apply it in your current project, I will also provide enough knowledge for a new one. **Would you be interested? If yes, [drop me an email](mailto:oskar@event-driven.io) or comment under this post about what would make you buy it.** Sign also to [Architcture Weekly](https://www.architecture-weekly.com/).

I'd also like to get into paid developer tooling around EDA; if there's a tool that would help you, feel free to tell me, and I might consider building such one. Crazy ideas also count!

I've already started building my paid community around [GitHub sponsors](https://github.com/sponsors/oskardudycz) and [Architcture Weekly](https://www.architecture-weekly.com/). So far, it's not a high income, but already enough to pay rent. **Over 20 people have already joined, and I encourage you to do the same!** I think it's a fantastic place and community to gather knowledge and exchange ideas. We have a monthly webinar, Discord channel with direct access to me: https://github.com/sponsors/oskardudycz.

In short, I'll try different things and see what sticks. If it doesn't work out, I will return to my job. I don't know if it was a good decision, but I knew I needed a change. I've been thinking about it for a long time, and I know that I would regret it if I didn't try to do that.

Keep your fingers crossed!

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/). You may also consider joining [Tech for Ukraine](https://techtotherescue.org/tech/tech-for-ukraine) initiative.
