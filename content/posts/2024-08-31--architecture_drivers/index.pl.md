---
title: My Architecture Drivers
category: "Architecture"
cover: 2024-08-31-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![](2024-08-31-cover.png)

**I don't feel like an authority or an expert. I prefer to think about myself as a practitioner.** Our industry is filled with self-proclaimed experts; we need more doers. 

**For similar reasons, I was reluctant to call myself an "Architect" for a long time.** Somehow, it became pejorative, but should it be? I changed my mind thanks to [Jarek Pałka](https://www.linkedin.com/in/jpalka/), who says that "we all are architects". It's a simple line but multidimensional. That means (to me) that we all are responsible for making our systems work as they should. It's not about bragging but accountability.

**Still, I never feel comfortable being asked about Software Architecture Drivers.** How do you give someone a checklist for good software? Yet I had to answer this time, as [Maciej Jędrzejewski](https://www.linkedin.com/in/jedrzejewski-maciej/) asked me if I could write my thoughts [to his new book](https://leanpub.com/master-software-architecture). How could I reject the offer? Actually, I could, as it surprised me, but hey, maybe my few words will help others fight their impostor syndrome. Or it was just too flattering. Nevertheless, here they are!

It's funny that we called our industry SOFTware, but it's all about making HARD decisions. Usually, we make them when we're the dumbest: we don't know the business domain, we don't know the user needs, and we are unsure of technology choices. Plus, even if we do, our changing environment is open to proving us wrong.

**For me, architecture decisions are more a process than a set of specific rules. It's a process of answering the following questions:**

**WHY?** So, understanding the product vision and business model. Consider where the money flows: who the client and the user are. That's an important fact, as we should care about all users but optimise for clients, especially those who bring money. In the end, our product should bring money.

**WHAT?** Understand what we actually need to build. Set a mental model of the business workflow. This is an excellent moment for collaborative tooling, brainstorming and modelling practices like Event Storming, Domain Storytelling, etc.

**HOW?** Think about the requirements and guarantees you need to have. Find architecture patterns and class of solutions that will fulfil your requirements. So, the type of databases, deployment type, integration patterns, not the specific technologies. Consider tools like C4 and other tools to structure your findings.

**WITH.** Select the tooling based on the outcome of the previous point. It has to fulfil requirements, but also non-functional like costs, match team experience, ease of use. 
Then rinse and repeat. 

**Architecture is not created in a vacuum.** Talk and collaborate with business, users and your technical fellows. 

Consider the team you (can) have. Most of the time, the best technology is the one that your team knows. We're building new tools, but to be true, rarely sophisticated ones. Most of them are regular lines of business applications. 

**And hey, let me share the secret with you: your decisions will be wrong. Mine also.** And that's fine. We don't need to be flawless; our system also doesn't need to be. Expect the change; it'll come. 

So don't be afraid to make decisions, but don't rush yourself. Always consider alternative solutions. Record your decisions together with thrown away ideas. Provide the context and explain WHY, WHAT, HOW, WITH. Provide the assumed limits. Suggest how to evolve if, e.g. your system will be a huge success and becomes overwhelmed by traffic. Some problems are good to have. But don't need to be solved immediately.

We should optimise not for maintainability but for removability. If our system is built so that we can relatively easily remove pieces from it, then we can drop bad ideas and move on to new ones. Also, by accident, we're getting a system that's easier to maintain.

**What are your architecture drivers? Or better, what's your process?**

**Check also Maciej's book ["Master Software Architecture Book"](https://leanpub.com/master-software-architecture).** I'm still in front of reading it till the end. But I like what I see so far; the outline and range of topics show the holistic, actionable vision of building software. And, most importantly, it's not pompous.

I think getting more books/talks like that would be great. We need more books in the spirit of "this is my story, this is why I think it's important and worked out for me. ". It's good that it's from a personal perspective, allowing us to compare or benchmark it to our vision and experience.

If you need even more architecture benchmarks, I have gathered some of my past articles on my general approach to architecture and software design:
- [Architect Manifesto](/pl/architect_manifesto/)
- [How to design software architecture pragmatically](/pl/how_to_design_software_architecture_pragmatically/)
- [Removability over Maintainability](/pl/removability_over_maintainability/)
- [The risk of ignoring risks](en/the_risk_of_ignoring_risks/)
- [Why are we afraid of our decisions?](/pl/why_are_we_afraid_of_our_decisions/)
- [What do the British writer and his fence have to do with Software Architecture?](/pl/chesterton_fence_and_software_architecture/)
- [The magic is that there is no magic. Or how to understand design patterns](/pl/the_magic_is_that_there_is_no_magic/)
- [Not all issues are complex, some are complicated. Here's how to deal with them](/pl/how_to_solve_complicated_problems/)
- [What Dune can tell us about setting our goals](/pl/dune_and_long_term_goals/)
- [Stacking the bricks in the software development process](/pl/stacking_the_bricks/)
- [The Holy Grail syndrome](/pl/holy_graal_syndrome/)
- [Dive a bit deeper, look a bit wider](/pl/dive_a_bit_deeper_look_a_bit_wider/)
- [What does Mr Bean opening the car have to do with programming?](/pl/what_does_mr_bean_opening_the_car_have_to_do_with_programming/)
- [What does a construction failure have to do with our authorities?](/pl/what_does_a_construction_failure_have_to_do_with_our_authorities/)

**And check [Architecture Weekly](https://www.architecture-weekly.com/) where I'm showing my less-event-driven face every week!**

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
