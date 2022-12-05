---
title: What do the British writer and his fence have to do with Software Architecture?
category: "Architecture"
cover: 2022-08-17-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2022-08-17-cover.png)

**Gilbert Keith Chesterton was a British writer from the turn of the 19th and 20th centuries.** As for his times, we would call him an influencer or a maven. He had a lot of opinions and did not hesitate to share them. He wrote about 80 books, several hundred poems, 200 short stories, 4,000 essays and several plays. Plus countless letters, for example, to C. S. Lewis. Yes, _the Narnia guy_. In 1929, in his book _"The Thing "_, he wrote:

**_"There exists in such a case a certain institution or law; let us say, for the sake of simplicity, a fence or gate erected across a road. The more modern type of reformer goes gaily up to it and says, "I don't see the use of this; let us clear it away." To which the more intelligent type of reformer will do well to answer: "If you don't see the use of it, I certainly won't let you clear it away. Go away and think. Then, when you can come back and tell me that you do see the use of it, I may allow you to destroy it."_**

Chesterton was a professional writer. Even though he wasn't writing programs, the quote sounds almost like programming.

In our work, we regularly find a place where we wonder _what the author had in mind_. Not once, not twice, after removing the meaningless [IF](/pl/what_really_grind_my_gears_if/), it turned out that we got an angry call from the client informing us that some critical feature was not working anymore. It appears that the [IF](/pl/what_really_grind_my_gears_if/), which we considered useless, served something.

Rudy Tomjanovich, after defending the NBA title in 1995, despite many hardships, told: _["Don't ever underestimate the heart of a champion!"](https://www.youtube.com/watch?v=dTyP7I8X4UY)._ I would paraphrase that as: 

**_Don't ever underestimate the value of working software_**

Disregarding existing code can come from many sources:

- overconfidence and too much trust in our abilities.
- lack of knowledge inside our company, e.g. not existing documentation or people who wrote this functionality are gone.
- besieged fortress syndrome or [Not invented here](https://en.wikipedia.org/wiki/Not_invented_here) attitude, where _"what's not ours is worse"_.
- time pressure and insufficient code analysis skills.
- lack of experience and awareness of the potential consequences.
- laziness.
- shedding responsibility based on "it's not me, it's my predecessors!"

**Of course, I don't want to play a symmetrist.** The fact that something has been here for years doesn't mean it should stay longer.  

What I want to say, and what I think Chesterton wanted to say, is that **to make sure we don't mess up anything, we need to understand why something is here before removing it.**

It is not that simple, of course. Sometimes we have to be pragmatic because we don't have enough time to analyze. In that case, it may be okay to add yet another [IF](/pl/what_really_grind_my_gears_if/), but only if we plan to investigate it afterwards.

Of course, the analysis is much easier when we have documentation and someone to ask questions. Yet, we usually don't have such a chance in such a situation. 

**How to start?**

1. **Write down our understanding of the process and go to various people (preferably from business departments) and ask what they think.** Do they see any shortcomings? Does it work differently? People usually find it harder to explain the whole thing. Also, most of the time, there is not a single person with knowledge about the entire process. It's best to do a little roundtrip, collect answers, update your description, or confront contradictions. It is much easier to redact something written than do it from scratch. [Having a basis for discussions makes it more effective](/en/fifteen_tips_on_how_to_run_meetings_effectively/).

2. **Having our vision of how it should work, write automatic tests.** Of course, it's easier to say than do. Writing unit tests can be challenging because the code often is in a not testable state. I usually start with so-called _end to end_ tests, i.e. integration tests that verify the entire flow. (see also more in ["I tested it on production and I'm not ashamed of it"](/en/i_tested_on_production/)). It's best to start with the critical path (the one that always needs to work) and then gradually expand to include edge case tests. And here is the most important thing! **Let's try not to change the implementation until we describe it with tests. We want to understand the code to not have unpleasant surprises.** If our test doesn't work, we either didn't do a decent job in its setup or don't understand the functionality. Usually, test results can show us that a business process is one thing and the code another. We should go back to the drawing board with our business and discuss our findings. Like Kent Beck said, ["Make the change easy, make the easy change"](https://www.youtube.com/watch?v=3gib0hKYjB0). First, we write tests that correspond to reality. Only then can we change it.

3. **Write down all the arrangements and principles in a document describing the facts.** It is best to do this as a Markdown document and put it in the repository we are changing. In the future, this will be our basis for understanding, showing what has altered and our decision log. We will not have to maintain such documentation. We write down our knowledge on the day we do it. We can append subsequent changes in our state of knowledge or decisions in the form of separate records. Of course, we can also have a unified document that combines all of this, but this is a nice-to-have. It will be a secondary document representing the current state of the art. The decision log will be our source of truth and the story of why we made these decisions instead of others. Our successors (or us in the future) won't need to wonder, _"what is this fence for?"_ I wrote about it in ["How to successfully do documentation without a maintenance burden?"](/en/how_to_successfully_do_documentation_without_maintenance_burden/). Keeping the documentation in the form of Markdown also gives us an additional advantage. We can send it to other teams, asking them to share their opinions. Let's give them a few days. They may share important insights. It also increases the transparency of decisions and builds an appropriate work culture in the company. In the worst case, if they don't say anything, they waste their chance to speak up and accept what we wrote down.

4. **Having all that, we can decide to tear down the fence or strengthen it.** Knowing (at least roughly) the actual state, we can proceed to remove or refactor the code. Usually, new things are popping out again, but that's fine. Once that happens, we go back to the previous steps and refactor the documentation and tests. It is critical not to do this together with new changes. Nothing is worse for the reviewer than trying to understand a mammoth pull request where refactorings are mixed with the new changes. Let's do things sequentially and in isolation. We'll thank ourselves for that in the future. Or even sooner than we think. If we show that we're not changing implementation but only expanding tests and docs to enhance our understanding, then such changes will usually be accepted smoothly. Read more in ["Should a programmer's creativity be shown in code formatting?"](/en/should_programmers_productivity_be_shown_in_code_formatting/).

**Risk is always there, but we must learn to live with it and manage it consciously (see ["The risk of ignoring risks"](/en/the_risk_of_ignoring_risks/)).** By taking these steps, we make our lives easier and make our decisions more confident, predictable and safer. It will also [help to not be afraid of making decisions](/en/why_are_we_afraid_of_our_decisions/).

By dividing the process into smaller chunks, we also increase the chance of completing the changes. We won't end up with massive, never-ending refactoring. You've been there already, haven't you?

When you hear someone (e.g. yourself) telling **_That's stupid, let's remove it or refactor it!_**, demand an explanation as to what exactly it is wrong and needs to be replaced, removed or repaired. 

Just like Chesterton did with the fence.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
