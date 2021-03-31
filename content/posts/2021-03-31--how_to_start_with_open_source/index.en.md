---
title: How to get started with Open Source?
category: "Open Source"
cover: 2020-03-31-cover.png
author: oskar dudycz
---

![cover](2020-03-31-cover.png)


As you may know, I'm an active Open Source contributor. Since December 2020, I'm working full-time on the Open Source project [EventStoreDB](https://eventstore.com). I have been the co-maintainer of the quite mature and relatively popular .NET library - [Marten](https://martendb.io/) for the last two years. 

How did it start? I could say it was in the normal way. I went from a user to a contributor to a maintainer. How exactly? You can read the details in my blog post ["Revolution Now!'](https://event-driven.io/en/revolution_now/). TLDR - I started as a user, then I found some missing pieces. I told myself: "why not try fixing that?". Then I became an active community member, contributed more, and here I am. It was a step by step process.

**What advice do I have on starting your journey with Open Source?**

1. **Start with something small.** It's not the best idea to start with massive PR without discussing it with the maintainers. I began like [this](https://github.com/JasperFx/marten/pull/841). It was not the most prudent move. It's like kicking in the door of the western saloon. You're risking a defensive attitude from the maintainers or simply not meeting the repository convention. It is best to report an issue or an idea and ask for tips. You can add that you will be happy to do PR. Start with a simple Pull Request, describe it well, don't just push the code. Maintainers love [small changes](https://github.com/JasperFx/marten/pull/1344), especially to documentation. By starting this way, you can even [become a .NET core contributor](https://github.com/dotnet/corefx/pull/37611). The time will come for bigger things. Don't know what to add? Search the "TODO" in the code: these are good places to start. The maintainers often put the label "Up for grabs" on issues, indicating something that can be a good start.
2. **Join the community.** Every popular library has its communication channel, be it Slack, Gitter, Discourse or a mailing list. Join it, check how people communicate with each other and how they help on issues. Verify if this is the place you want to be. From such a channel, you can also assess whether the community is alive. If there are active discussions, there is a greater chance that the library is maintained.
3. **Help others.** Open Source, as the name suggests, is about being OPEN. Ask, rejoice, but also help. Even if you do not consider yourself an expert, your advice may be valuable to someone. Don't be afraid that someone will tell you that you're wrong. Even if your suggestion is not optimal and someone criticizes it, you will at least learn something new. You will confront your thinking.
4. **Don't be demanding.** You should remember that there is a human on the other side who usually does it out of his passion and at the expense of other stuff. Can you see that something is missing? Contribute.

**Do you want to create your Open Source library?**

1. **Do something that has value for you.** Don't create the Wunderwaffe. Think about your problem and solve it.
2. **Deliver in small pieces.** Do not bury your work on the long-living branch. There is a high risk that you will never finish that. Break it up into smaller pieces and deliver on each piece, one by one. There is nothing more motivating than to finish something
3. **Take care of the documentation.** I can assure you that without it, no one will use your library. It's not that hard: for example, Github gives you the option of automatic documentation generation from MD files with Jekyll. At the very least, make a decent README. Also, check out my other article ["How to successfully do documentation without a maintenance burden?"](/en/how_to_successfully_do_documentation_without_maintenance_burden/).
4. **Create a CI / CD flow.** Many tools allow you to configure a free CI process for Open Source projects expressly: Azure DevOps, AppVeyor, Github Actions, Travis, etc. It can be a basic one. It would be good if it'd check at least if code is building and tests are passing. This is crucial for potential contributors. Nothing is more discouraging than a failing project or needing to make a Build Dance to get started on the code-base. If you're searching for inspiration, check my article ["How to set up a test matrix in XUnit"](/en/how_to_setup_a_test_matrix_in_xunit/).
5. **Take care of backward compatibility** This is one of the essential elements of creating libraries. The stability and predictability of the API is crucial. If you keep posting Breaking Change now and then, users will either not move to newer versions or quit. Follow the [Semantic Versioning](https://semver.org/) rules. Unfortunately, this requires one thing: thinking before coding to not release anything that you will regret later.
6. **Less is more.** Focus on the little things, deliver fewer features, but better quality. It also applies to technical details: only expose what you want users to use. If you inadvertently make a class public, then if you're going to throw it out, you may be surprised by how many users are using it and how weirdly and wonderfully they are using it.
7. **Don't expect to get money out of it.** The harsh reality shows that working on OSS is philanthropy. I'm lucky to be working right now on EventStoreDB, which has managed to find a way of maintaining full-time employees (watch our CEO Dave Remy explaining that: https://www.youtube.com/watch?v=HpiPqWmilN4). However, it's a rare case. From my work on Marten, I managed to get €0. Don't expect to be paid. The subject of "Open Source Sustainability" is a broad topic, even for a separate email or blog post (if you want me to write about it, let me know!). For now, take a look at the [controversy with the Redis license](https://www.wired.com/story/when-open-source-software-comes-with-catches), a [discussion about how the creator of one of the main npm packages started asking for support](https://github.com/zloirock/core-js/issues/548). There are initiatives such as [Open Collective](https://opencollective.com/), [Github Sponsors](https://github.com/sponsors).

    I've set-up also sponsorship accounts there:
    - Github sponsors - https://github.com/sponsors/oskardudycz
    - Open Collective - https://opencollective.com/eventsourcingnetcore

    There is already a group of people who appreciated my work enough to become financial supporters. Still, it's very far from being a good source of funding. So far, it is mainly a form of thanks for my work, and it makes me very happy! 

    Therefore, before you start working with Open Source make sure that it suits you. I encourage you to read the excellent post about the fact that Github Stars won't pay rent: [link](https://medium.com/@kitze/github-stars-wont-pay-your-rent-8b348e12baed).

8. **Promote your work.** Writing blog posts (like this one you're reading) helps readers learn from your experience, but it also helps increase awareness of your work. Create your [GitHub page](https://github.com/oskardudycz/), [write on Twitter](https://twitter.com/oskar_at_net), etc. I assume that you created something because you believe that's useful. Explain the people and help them solve their problems. Be active in the community. Marketing takes time, it's far from something that we developers like to do, but it's unavoidable if you want to spread your works' usage.

9. **Be prepared for non-pleasant situations.** You can find hate in the OSS world, unhealthy and drama situations like the React community event: [take a look here](https://dev.to/aryanjnyc/ken-wheeler-and-dan-abramov-deactivate-their-twitter-accounts-302). I was lucky enough to be removed from such events. But it can happen to you. If you expose your work publicly, then you should expect criticism. Still, cheer up! There are cases like this: [link](https://github.com/JasperFx/marten/issues/1347) that can put you on cloud 9.

**If you want to get started with OSS, you can check one of my repositories, e.g.:**
- https://github.com/oskardudycz/EventSourcing.NetCore - if you want to learn or share through examples of Event Sourcing, DDD and similar things,
- https://github.com/oskardudycz/GoldenEye - if you want to work on a .NET framework that makes it easier to work with WebAPI, DDD, etc.,
- https://github.com/oskardudycz/WebApiWith.NETCore - if you want to share your knowledge or learn something about doing a well-shaped WebApi,
- https://github.com/oskardudycz/EventSourcing.NodeJS - if you want to learn how to create WebAPI in NodeJS together with Event Sourcing.

How can you help?
- add an issue with what you do not understand,
- addition or corrections to documentation,
- new samples,
- new features,
- bugfix.

Of course, the best thing to do before a significant change is to contact me. If you have no idea but want to do something, also speak up.

Cheers!

Oskar