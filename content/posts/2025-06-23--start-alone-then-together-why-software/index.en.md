---
title: 'Start Alone, Then Together: Why Software Modelling Needs Solitary Brainstorming'
category: Software Architecture
cover: 2025-06-23-cover.png
author: oskar dudycz
redirectFrom: /start-alone-then-together-why-software/
---

**Watch a jazz quartet improvise, and you might think they're making it up as they go. They're not.** Every riff builds on practised scales and learned patterns. The constraints don't stifle creativity—they make it work.

![Tips For Learning Jazz Improvisation](2025-06-23-cover.png "Tips For Learning Jazz Improvisation")

Image source: [https://nolaschoolofmusic.com/blog/tips-for-learning-jazz-improvisation](https://nolaschoolofmusic.com/blog/tips-for-learning-jazz-improvisation)

Most software teams get this when writing code. You wouldn't build a critical system without established patterns, architectural principles, or coding standards. But put those same developers in a modelling session, and they drop all structure. The CTO speaks first, and everyone else responds. The loudest developer dominates the whiteboard. The most persuasive architect steers every decision.

**I’m calling that** _**“the CTO effect”**_**.**

The problem isn’t, of course, malicious. Quieter voices simply don't get heard when the first person to speak sets the direction.

**The solution: start modelling sessions with 10-15 minutes of solitary brainstorming before anyone speaks.**

**This breaks the hierarchy cycle at its source.** When everyone generates ideas simultaneously in silence, there's less chance for the first voice to set the agenda. No senior person's opening statement to shape everyone else's thinking. The junior developer and the CTO start from the same blank point for those crucial first minutes.

## Why Written Ideas Persist

**Written ideas are harder to dismiss than spoken thoughts.** When someone voices an idea in a meeting, it exists for thirty seconds before the next person talks over it. Write that same idea on a shared board, and it stays visible. It’s much harder to ignore something sitting there in front of everyone.

Once you've written something on a sticky note, you materialise it, and it exists. It’s mentally harder to handwave it. That requires justification. The same idea spoken aloud dies with a simple _"hmm, interesting"_ before moving on.

It’s not a novel idea, of course, other companies are already doing it. AWS start meetings with a silent reading time. Everyone quietly reviews the same document before discussion begins. No talking, no interrupting, no immediate reactions. Ideas get absorbed without social dynamics taking over. By the time the discussion starts, everyone works from the same information baseline rather than whoever spoke first setting the agenda. Read more [here](https://justingarrison.com/blog/2021-03-15-the-document-culture-of-amazon/).

## When Hierarchy Shapes Thinking

This happens beyond just CTOs. Senior architects get deference. The developer who wrote the original system carries weight. The expensive consultant commands attention.

These people can be seen as those who know what they’re talking about. And quite often they do. But not always. Sometimes they just extrapolate their past experience, and that’s dangerous, as Mathias Verraes wrote in _The “It's Just Like...” Heuristic:_

> _Your brain rewards you for classifying new information into existing buckets1. Looking for similarities costs less energy than understanding new differences. When you say “Oh I get it, it’s just like …”, then it probably is not “just like”. That’s very counterintuitive, because that “oh I get it” feeling is intuition, not reason2. You feel good about the insight, so it’s very tricky to then go “Oh I get it, so I must be wrong”._

So, they can be more often right than you, but then if they fail, that can be quite spectacular.

In other words, their presence narrows the solution space before alternatives get explored. You may be optimising for consensus, not quality. You build the system that the most senior person envisioned, not necessarily the system that best solves the problem.

Solitary brainstorming counters this. When everyone generates ideas simultaneously and silently, the junior developer's insight about edge cases appears alongside the architect's system design with equal visual weight.

## Structure Helps Improvisation

Going back to our improvisation metaphor.

Jazz musicians work within scales, follow chord progressions, and respond to patterns the group establishes. The structure doesn't limit creativity—it gives creativity a framework to work within.

Setting a format for your session doesn’t have to limit it; it can help you focus on the merit and reduce the likelihood of wandering off.

The brainstorming phase outcome provides the raw material, events, questions, and ideas from everyone's perspective. The EventStorming, C4 and others notations help in not having discussions on how to write stuff. We can cut time for questions on “what does this colour mean?” or “what is this box about?”. The structure helps facilitate discussions.

**The** _**solitary brainstorming**_ **approach requires discipline, which explains why teams skip it.** Starting with a discussion feels easier and more natural. But if you're already blocking time for modelling sessions, you've committed to doing the work properly.

So, try it on your own, set a timer for 10-15 minutes. Everyone works silently, generating ideas related to the modelling question. Use a shared digital board (like Miro), where ideas appear in real-time, but refrain from commenting until the time expires. This is active brainstorming, not a time for preparation. Quantity beats quality at this stage.

After the timer goes off, you have a board full of ideas from everyone, not just whoever speaks first or loudest. The collaborative phase can focus on synthesis and evaluation—what groups do well—instead of generation.

Individual brainstorming creates raw material. Group collaboration refines it. Ask a group to do both simultaneously, and one suffers.

## How EventStorming Works Here

EventStorming sessions show this approach in practice. Instead of having the domain expert explain how everything works while everyone takes notes, everyone spends the first phase independently writing domain events on orange sticky notes. Things that happen in the business that stakeholders care about.

The result can look messy. Some events are duplicates with different wording. Some are too abstract, others too specific. Some are probably wrong. That's the point.

You now have raw material representing everyone's understanding of the domain, not just whoever speaks first. The next phase, grouping similar events, identifying gaps, building a timeline, becomes collaborative work in reconciling different perspectives instead of rubber-stamping one person's vision.

Keep every sticky note during initial grouping. Every event that someone thought worth writing about stays visible, even if it ends up in the "questions" or "parking lot" sections. This prevents the premature filtering that occurs when ideas only exist as spoken words.

## What I've Observed

In my experience, modelling sessions that start this way become less about convincing others of predetermined solutions and more about exploring a shared problem space. When everyone contributes ideas upfront, people seem more willing to engage with the discussion.

This isn't about protecting feelings or ensuring everyone gets heard. Software systems are complex enough that no single person's mental model captures everything. The goal is to develop more effective systems.

I've found that individual work makes collaborative work more productive. Skip the solo brainstorming, and you haven't saved time: you've just moved idea generation into group discussion, where it's slower and less effective.

Software modelling is complex enough without predictable social dynamics making it more challenging.

What’s your take?

Read also more in:

-   [The Underestimated Power of Hot Spots and Notes in EventStorming](/en/the-underestimated-power-of-hot-spots/)

-   [On getting the meaningful discussions, and why that's important](/en/on-getting-the-meaningful-discussions/)

-   [15 tips on how to run meetings effectively](/en/fifteen_tips_on_how_to_run_meetings_effectively/)

-   [Agile vs Introverts](/en/agile_vs_introverts/)

Cheers!

Oskar

**p.s. Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating, e.g. to the [Ukraine humanitarian](https://savelife.in.ua/en/donate/) organisation, [Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone) or [Red Cross](https://redcross.org.ua/en/).
