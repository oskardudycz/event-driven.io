---
title: ChatGPT, revolution or not?
category: "Coding Life"
cover: 2023-04-02-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2023-04-02-cover.png)

[I started my career when StackOverflow didn't exist.](/pl/about/) That's how I quite often introduce myself. I'm that old.

That's, of course, nothing spectacular, as many people more experienced than me would roll out their eyes hearing me. Still, it gives me perspective on our coding industry before that.

Those were dark days. Getting quick help with the coding problem you're trying to solve was almost impossible. Now, does your notebook have a CD player? Nope, if you were a .NET developer, you installed the whole Microsoft Documentation from CD. Or best, you have to read books, but there was no Kindle. Webinars? Free content from [Developers Advocates](/pl/revolution_now/)? Forget about it.

Still, when we look at our stories from the trenches and the battles we somehow survived, they look pretty romantic from our current standpoint. _Hey boy, see we were wounded, but we're still standing!_. We tend to believe that others must go through those trenches to become as experienced and remarkable as we did.

Some may say that _no pain, no gain_. And that's the hard truth; you learn best if you feel the pain. You want to avoid it. Still, does it really have to hurt?

When StackOverflow had its hay days, I heard _"Now we won't need to code anything, just copy/paste and call it a day!" _. 

Or some more dramatic: _"We won't be needed anymore!" _.

**Somehow, that didn't happen.** Did our work change? Sure? Is it better or worse? It's different.

It appeared that StackOverflow is a helpful tool but not perfect. It's useful for quick and narrowed problems but not great for getting complete design guidance. The answers are not always correct; we must evaluate them and do due diligence. Also, how people interact is not the most efficient, and losing people to people's touch is not the most efficient.

**Does that sound familiar?**

We're getting into the hype peak of AI-related tooling like [ChatGPT](https://chat.openai.com). Some people believe that programmers won't be needed anymore. Some say that's the most revolutionised thing since we invented the wheel. Where's the truth? As always: in the middle.

**I needed a code to be the starting point for my new [workshop](/pl/training/), "Event Sourcing on production". I struggled to create code for the starting phase showing the common architecture/implementation flaws.** I was even considering paying some junior to write such. I found a solution when I started to use ChatGPT. The code it generates is a perfect match for such needs! 

Jokes aside, the tool is impressive, and I firmly believe it's a must-have nowadays as it speeds up boilerplate work enormously. Yet, as StackOverflow isn't a solution for all of our development pains, ChatGPT and related tooling won't be.

**Copilot, ChatGPT et al. are great for giving the initial solution for narrowed questions. They won't solve (yet?) or invent a solution for complex, abstract problems.** Why? Let's briefly look at how it works.

> "The GPT-4 rumor mill is a ridiculous thing. I don't know where it all comes from. (...) People are begging to be disappointed and they will be. The hype is just like... We don't have an actual AGI and that's sort of what's expected of us."

Who's quote is that? [Sam Altman, CEO of OpenAI, ChatGPT creators](https://www.theverge.com/23560328/openai-gpt-4-rumor-release-date-sam-altman-interview). 

**What's AGI? Per Wikipedia, _"Artificial general intelligence (AGI) is the ability of an intelligent agent to understand or learn any intellectual task that human beings or other animals can."_.**

So if those tools are not AGI, then what are they? GPT are [large language models](https://en.wikipedia.org/wiki/Large_language_model). You can consider them a huge graph, where nodes are words, and connections are probabilities. 

Taking two nodes and the probability between them will express how likely one word will come after another. It also takes specific context considerations and other words you are more likely to use.

That's why massive input data is critical for such models. The more we put into them to train them, the bigger number of contentions they have, the more they can answer.

**So, e.g. if you asked them, _"Who's the president?"_.** Then it'll probably tell you the name of the USA president, as US-based companies would most likely put the most information having it. So that's the most probable answer. 

If you add _"Who's the president Polish President?"_ it'll probably tell you the name of the President of Poland. Will it tell you the current one? Probably, as our current one is eight years in the position, so it should be in the trained data.

If you ask, _"Who's the president Polish President of the Polish programmer association?"_ then it'll either tell you it doesn't know or _make up_ the answer. Actually, it's not making up. It checks the connections, and let's say it has the minimum threshold of giving the answer defined as, e.g. 20%; if it finds something above the threshold, it'll take the most probable explanation. If not, then it'll say that it doesn't know.

**Of course, it's a plain English explanation from a non-native speaker. No one knows precisely how those tools work, even the authors.** And [OpenAI is not so open on their work](https://fortune.com/2023/03/17/sam-altman-rivals-rip-openai-name-not-open-artificial-intelligence-gpt-4/). For more educated explanation, read a great post by [Stephen Wolfram - What Is ChatGPT Doing … and Why Does It Work?](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/).

**And here are a few dangers.** Getting made-up answers or worse, [images or videos](https://www.washingtonpost.com/technology/2023/03/30/midjourney-ai-image-generation-rules/) is an obvious threat.

I explained some dangers in [Computer says no! Why we might have an issue with Artificial Intelligence soon](/pl/computer_says_no_we_may_have_an_issue_with_ai_soon/). Those models are as objective as the people who trained them and tuned their parameters. 

**We'll need to learn to use it cautiously and ethically, as IT people teach others about that.**

We should also get the tools to help us fight those fakes or detect AI-generated stuff. That won't be easy, but the need will be so strong that I expect this arms race to start soon.

The other is privacy. OpenAI and similar companies are not telling us what training set they used. We don't know if what we get respects the copyrights or laws like GDPR. [Italy already blocked ChatGPT](https://www.zerohedge.com/technology/italy-bans-openais-chatgpt-over-privacy-concerns) for that.

**Yet, those are _just_ tools. You can use a knife to put butter on the bread or stab someone (but please, don't).**

And that's okay; we need to adapt and find a good way of using this tool. I'm considering it a chance to focus on what's important.

**Working with ChatGPT reminded me to pair coding with a skilled coder but a bad programmer.** You will get decent results if you drive it well, but it won't set architecture for you. It's a tool that reminds me of [Memento](https://www.imdb.com/title/tt0209144/) plot. A guy with a lot of old memories, who remembers what happened a minute ago but forgets what we talked 10m ago.

It's great for providing the initial draft or solution for a focused case or brainstorming. Yet, beware, and remember how it works.

**Most of the stuff we can find on the Internet is mediocre.** If we ask ChatGPT about something, we'll probably get a mediocre answer because they repeat the most often in the training data. We can narrow it down, give more context and get a more detailed and correct answer, but we need to know what to ask for. 

Knowing what we want to achieve is the most important, ChatGPT et al. can help us to get answers on how to do that. But it's our role to decide which answer is correct, as they're _only_ the most probable. A mediocre solution can be good enough for everyday tasks, but for advanced or the most important? Probably not. We'll still need to put more work into that.

**Okay, then how it helped me to build the initial state for the [training](/pl/training/)?** See the current result in the repo: https://github.com/oskardudycz/event-sourcing-on-prod-workshop/. Even with its help, it took me a few days to prepare and fix its issues. But without its help, it'd taken me even more. Yet, watch out! Discussions with it and authoring may take longer than if you just did it on your own.

**Another example? I recently did a [webinar for Architecture Weekly subscribers](https://www.architecture-weekly.com/p/webinar-8-slim-down-your-aggregates) and asked ChatGPT for inspiration about the example of a complex DDD aggregate.** I used it as the base to show how you could refactor it and slim them down.

It generated something that was _okayish_; I've seen such code in other codebases, but definitely not the best way to design aggregates. Also, to be sure that it'll generate what I wanted, I had to give such precise commands:

> "Could you give me a real-world example of the complex DDD aggregate? Describe the business rules and invariants. It should have at least seven properties, several business rules and invariants showing business logic. 
> 
> It should have a list of nested data and one entity. 
> 
> Root aggregate should represent a complex workflow or process. It should express lifetime or state transition and have several methods for running business logic. 
> 
> Use some random, uncommon, business use case fitting the above requirement (other than Order to not get us bored). 
> 
> Describe aggregate flow, business rules first and invariants before implementation. 
> 
> Don't list or describe properties; just express them in code. Provide an example implementation using C# 11. 
> 
> Start with the main aggregate implementation, then put the rest of the entities' definitions. 
> 
> Write the whole code, including business logic and invariant checks. Provide aggregate and entities as separate code snippets. 
> 
> Remember that entities should also be broken into dedicated snippets."

**So, TLDR. Don't be afraid of AI-related tooling.** Learn how to use them, as they can speed up your work and give you a competitive advantage over the people that don't. Yet, it would be best to understand how they work and what they can provide you. 

I hope this article gives you some hints and considerations to help you do it consciously.

**Play with it, experiment and have fun!**

Cheers!

Oskar

p.s. Of course, I used AI to generate cover of this blog post.

p.s.2. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).