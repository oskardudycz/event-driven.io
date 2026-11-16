---
title: "Make the change easy, then make the easy change"
tags:
  - Coding Life
cover: 2026-11-16.png
author: oskar dudycz
related:
  - chesterton_fence_and_software_architecture
  - dont-oversell-ideas-trunk-based-development
  - thoughts-on-platforms-core-teams
  - business-wont-let-me-and-other-lies
---

We’re in the middle of the Code Review World War. Many people claim that they’re slowing us down. Scotty, we need warp speed in three minutes, or we're all dead! Frankly, I was never a huge fan of pull requests, yet somehow I always defended them from removing the review part. Why?

Let me [quote again Gilbert Keith Chesterton](/en/chesterton_fence_and_software_architecture/)

> “There exists in such a case a certain institution or law; let us say, for the sake of simplicity, a fence or gate erected across a road. The more modern type of reformer goes gaily up to it and says, “I don’t see the use of this; let us clear it away.” To which the more intelligent type of reformer will do well to answer: “If you don’t see the use of it, I certainly won’t let you clear it away. Go away and think. Then, when you can come back and tell me that you do see the use of it, I may allow you to destroy it.”

So, in other words, before I remove something, I want to understand why I need to remove it and what the desired goal is.

I see code review issues more like a thermometer that we want to break when it shows a fever.

I don’t buy the idea that code review is now the bottleneck, especially when it's followed by “now we need to fine-tune our harnesses”. I see this as another claim to get back to coding instead of focusing on stuff that matters. Plus, I see code reviews vs lack of code reviews as a wrong framing of the problem we have.

The problem is that we, as an industry, didn’t actually have a proper delivery process as a standard. Now we’re trying to take this wrong process and just make it faster. Let’s do an experiment: get off the computer, find your sports clothes, go out and try to run really fast for an hour. How was it?

If it was great, you’re in a lucky minority. That’s how we also have exceptions in our industry that do things well, but what I see is that many teams I see:

- don’t have access to set up their development pipelines on their own,
- don’t even know what their development process,
- need to get approval from upper management/architects for small changes to the process,
- are doing long-lived branches,
- don’t know git enough to do rebases,
- don’t collaborate in other ways than long meetings, chat messages and e-mails,
- are even having code freezes or formal hands off between deployment steps,
- etc.

What’s more, as said in [the previous article](/en/eventstorming_collaboration_and_llm/), even collaboration technique evangelists either went silent or went full-mode into agentic solitude.

Ok, but I don’t writing this article just to complain. I wanted to write a reminder of the phrase I heard from Kent Beck: 

> “for each desired change, make that change easy (warning: this may be hard), then make the easy change”.

`youtube: https://www.youtube.com/watch?v=3gib0hKYjB0`

Such a powerful sentence in its simplicity.

Ok, how to apply it? Here are some ideas:

1. When you’re working on a new feature, do the first lines of code and tests, but don’t plug it anywhere. Yes, don’t plug it into the production API; just do it, merge it, and if it follows the basic standards (linters, build, test coverage, etc.), then even if it’s not ready yet, who cares? You may not need any fancy feature-toggle tooling; if you don’t plug it in, then it won’t be broken, aye?

2. Still, you shouldn’t keep it unplugged for too long. After the first merge, you can consider whether you can provide a basic increment that's actually useful, or maybe plug it in via an API but not use it on the frontend? The former is better, but at least the latter. If that’s challenging, maybe you could add a config/environment setting to toggle this feature on and off, and enable it in some environments or for friend-and-family-type clients?

3. If that’s hard, then at least point 1 gives you the option to distribute the work. You already have some place where you could work together without stepping on each other's toes. Still, I don’t mean that you should just divide the work, as… 

4. Why not take your friends, get on a call, and try to work with the agent on solving those scenarios together? If you solve the coding, you'll have more time. Also, maybe you could ask the agent to deliver something, review it together, steer it, and move forward. Maybe you could treat this as the code review? If you review small portions as you go, then it may be a much faster feedback loop and corrections than checking the sloppy 20 000 lines of code not knowing the transitions? If coding is solved, you should have more time for that type of activity, don’t you?

5. “That’s great Oskar, but I’m changing the existing features most of the time!”. Well, then, when you start thinking about whether you could split your work into mechanical refactoring/preparation and the actual change. Don’t mix them; split them into separate changes. For instance, I recently ran static analysis for concurrency issues in a pretty big codebase. I started by plugging in static analysis and just treating those concurrency issues as warnings. Then, as a follow-up, I applied the fixes for the obvious issues, mechanical stuff like using async/await correctly, passing CancellationToken in .NET code, etc. No big refactorings. I still kept some non-mechanical issues as warnings. Then I added separate changes for those “harder” issues that require more real refactoring. Did I have more sets of changes? Yes, I did. Were they easier to get in? Yes, because this huge change applied mechanical fixes that were mostly “OK, go” after talking with people. Of course, that requires trust in the team, but without it, you have bigger issues.

6. Sometimes making change easy requires a bit more code and duplication. If the change is big and would normally be a long-lived, risky branch, what if you wrap the existing flow (or part of it) in an abstraction (like an interface)? If you can already merge it, there's no harm in doing so. With that, you can apply the same logic as for the new change. Just plug it in when you’re ready. That also lets you run an existing test suite for your new code and see where it fails. So a bit of duplication gives you more certainty.

All of that was tedious back in the day. Now, with agents doing those transitions, it’s much easier. Easier, if we do it and ask agents to do it. If we don’t, they’ll just generate 20,000 lines of mixed-quality code (to say mildly). Not surprisingly, if we have a team of people doing that, reviews become unbearable. And that’s the same issue we had, just multiplied by the speed of code generation.

Is the answer to do code reviews faster? Or maybe dropping them entirely? Again, that’s the wrong question.

The proper should be: how can we do stuff differently than we did to fix issues we had, instead of making them bigger.

Cheers!

Oskar

p.s. there are still some places [my upcoming workshop: Event-Driven Architecture: The Light and the Dark Side](/en/light-and-dark-side-of-eda-workshop/). We're discussing there a lot on how to make hard things simpler. Feel invited!

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
