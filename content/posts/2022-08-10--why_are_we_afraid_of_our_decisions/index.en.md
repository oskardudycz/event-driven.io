---
title: Why are we afraid of our decisions?
category: "Architecture"
cover: 2022-08-10-cover.png
author: oskar dudycz
---

![cover](2022-08-10-cover.png)

**I don't know if it will work well in production!**

**Will it scale?**

**What if we get too many users during Black Friday?**

Do you know those questions? I asked them myself; what's more, I hear it regularly when talking to people. I am also often asked: how do I find the answers, and how do I deal with them? Well, I don't have all the answers. Sometimes I'm wrong; sometimes I'm right. And that's okay.

**These discussions take place on two levels: technical and metaphysical.** The metaphysical one is dangerous because it is not tangible. Warning! Stay with me after what you're about to read. It may sound like coaching gibberish, but it'll be made actionable later. I promise! So...

**To assess what actions we should take, we should first consider where our fear of making a decision comes from.** Sometimes, it is a justified fear, but most often, it's not.

Too often, it comes from issues directly related to our company's organisational culture (or lack thereof). Too often, we're not rewarded for good but punished for bad. The logical conclusion is to do nothing. Then we will have peace of mind.

Sometimes, it is a justified fear, but most often, it's not. 

Another problem is, what I call, a **broken contract between business and development.** We don't believe that business will give us time to correct our mishaps. Business doesn't trust us that the next refactoring will actually be needed and not just moving the code from one place to another.

**Fear may come from us not being experienced enough.** In our industry, we usually face new problems every day (or following in a coaching tone: _challenges_). We rarely have an identical case to solve. And even if we do, it often turns out that we were too fast in our assumptions. The similarity was only superficial, and the problem turned out completely different. A small detail made it so.

**All of these fears are real. If we focus on them, they will overwhelm us. How do you break this vicious circle?**

Let's start by asking ourselves three questions:
1. How is it working now (e.g. _on paper_)?
2. What must happen for our plan to succeed?
3. What's the worst case if our plan fails?

These are elementary questions, but they will put us on the right track.

**The first one will allow us to immediately understand the problem's nature and how business deals with it now.** This is helpful for many reasons. First, it will enable us to understand the current flows. From our company, if we're modelling existing processes or competitive solutions if the subject is entirely new to us. It often turns out that whatever we prepare will be better than what we have now. Realising that can already take a lot of pressure off. By diving into existing solutions, we'll learn the characteristics of the problem. What traffic should we expect, what frequency, and what are the expectations? They can often be unrealistic, but the confrontation with the current state will allow us to reduce it to honest discussions, not metaphysical ones. We should also investigate and understand alternative paths. Often a [compensating action](/en/what_texting_ex_has_to_do_with_event_driven_design/) (e.g. a refund) will be much easier to implement. It will also be much easier to maintain than the complicated byzantine code constructs trying hard to protect us from the inevitable.

**The second question I took from [Leslie Lamport](https://hanselminutes.com/790/leslie-lamport-in-partnership-with-acm-bytecast).** As programmers, we usually look for problems and edge cases. And that's okay because it allows us to understand our situation better. However, searching for the problem can easily change into a neverending story. Not this one with [fabulous Limahl hair](https://www.youtube.com/watch?v=2WN0T-Ee3q4), but with going down the rabbit hole and never coming close to the correct solution. **Focusing on what must happen to make our process successful is better.** From this perspective, we can break the problem into smaller fragments and plan all the necessary guards for each step. We will still have to explore the edge situations, but only those that can actually stand in our way. It will help us not go crazy.

**The third question is our sanity check. By understanding the worst thing can happen, we will ensure that our problem is as significant and complex as it seems.** It is worth taking a breath here, stopping for a while, and talking with domain experts but also people from other departments. We should not only crunch it inside our team but also confront colleagues from other teams. [Even talk to the rubber duck.](https://en.wikipedia.org/wiki/Rubber_duck_debugging) If we fall into tunnel thinking, our functionality seems to be the biggest priority. When too focused on solving the case, we may turn out critical thinking. If we ask around, it may be that our problem is not as important and challenging as we thought. We can also realise that a simpler solution will be better in this case.

**In addition to the questions, here are a few tips:**

1. **Don't assume that your design will stand the test of time.** If it is successful, it will change. Design is not meant to be engraved in the rock; it is to be useful to the given scale of the problem. If the scale or problem changes, **the design has to evolve!**

2. **The best decision is not always the right decision.** We make decisions at a given point in time. We are unable to predict the future. At least I am not. Sometimes something that looked like the best decision turns out to be wrong over time. We have to live with it. I wrote about this in an article on [The risk of ignoring risks](/en/the_risk_of_ignoring_risks/). The best we can is good enough.

3. **We should gather expected metrics and verify them.** Every time I hear _"is it gonna scale?"_ combined with the answer _"I don't know"_ to the counter-question: _"what does this mean for you?"_ a little unicorn dies. If we don't know how something should scale, we should find that out. Let's check how competing solutions work and assume something if we cannot find it. Without it, we again fall into metaphysical deliberations in discussions and lock ourselves in a decision clinch. Let's define the metrics and verify them later. Only then will we know whether we will meet expectations or not.

4. **We constantly verify our assumptions.** The sooner we catch a wrong decision, the greater the chance we will be able to correct it or fix the consequences. The sooner we update the plan, the better. If we know the risks that may occur and have pre-developed rescue plans, we should analyse them regularly.

**TLDR: Let's not be afraid to make difficult decisions.** If we discuss them well, they may not be all that difficult. Let's learn to live with them and accept that we may be wrong. We make decisions at a given point in time. However, this does not release us from analysing and assessing whether we made a mistake and correcting our mishaps.

Check also the follow up post, explaining how to make decisions based on the existing state: [What do the British writer and his fence have to do with architecture?](/en/chesterton_fence_and_software_architecture).

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/). You may also consider joining [Tech for Ukraine](https://techtotherescue.org/tech/tech-for-ukraine) initiative.
