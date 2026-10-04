---
title: Requiem for a 10x Engineer Dream
category: Software Architecture
cover: 2025-08-11-cover.jpg
author: oskar dudycz
redirectFrom: /requiem-for-a-10x-engineer-dream/
---

Welcome to the new week!

**People claim they get 10x productivity boosts with AI coding tools. After my recent experiments with Claude Code, I'm starting to think we're not using these tools the same way. Or that they’re just lying. Or both.**

Those hyped posts seem to me like teenagers talking about sex. A lot of talking, not much doing.

**Yes, I’m LLM-sceptic.** But honestly, when I did a few times quick check and asked:

> “Ok, so what’s your development flow”

Then most of the answers I got could be summarised into:

> “Well, I’m typing and copy/pasting into chat".

Or

> “I’m doing Tab, Tab in Copilot.

Fine, that’s also what I was doing. Even as a sceptic (or hater, if you prefer), I like to try stuff on my own, before I make a judgement.

**I see the biggest potential improvement in LLMs in the boring, repetitive tasks, ideally done in the background without much intervention from me.** Maybe then I could get some boost working as a solopreneur. In theory, that’s what the new wave of CLI tooling promises.

I decided to give it a try and even paid for Claude Code Max.

I tried to find a task that would be a stereotypical perfect match for an AI assistant.

I have a workshop for [The Light and the Dark Side of Event-Driven Architecture](/en/training/#event-driven-architecture-the-light-and-the-dark-side). I wanted to expand some hands-on exercises to use RabbitMQ and Kafka instead of an in-memory implementation. Sure, "adding Kafka" sounds heavy, but it's not that.

I started with Java exercises. They use Spring Boot, which streamlines Kafka and RabbitMQ setup. Plus there are many resources in the Internet on how to do the setup. Essentially, the goal was to:

-   copy/paste existing code, that had tests, working implementation,

-   replace the in-memory implementation with Kafka or RabbitMQ,

-   Add Spring Boot config for Kafka or RabbitMQ,

-   Update the test setup to use TestContainers and add some awaits respecting the async nature of those tools.

So do the boilerplate that I didn’t want to spent much time.

**I wrote a detailed spec and hoped Claude could handle this boring work while I did something else.** After a week, even with hints from me, it was still spinning in circles, unable to finish.

Yet it was claiming that it got a huge success, getting 80% of tests passing. It wasn’t even able to complete the proper setup. Indeed, great success for the code that had a 100% passing rate. So much for autonomous AI assistance.

**Tho I’m not the person who easily gives up. Last Friday, I tried again, this time staying fully engaged. I wanted to refactor [Pongo](https://github.com/event-driven-io/pongo)'s SQL handling.** I wanted to make it generate parameterised queries instead of the raw ones. Thanks to that, getting better performance by benefiting from the query plan reuse.  

Again, that can sound complex, but it’s more complicated than complex. Mostly, it had to refactor how SQL was parsed, and update the execution to use not only raw SQL but also parameters.

With the Claude Code setup, I followed the [nice guide from Harper Reed](https://harper.blog/2025/05/08/basic-claude-code/):

-   brainstorming,

-   spec generation,

-   implementation plan with prompts.

Everyone is saying that you need to give LLM a precise plan to make it work correctly. And that’s entirely true. I managed to get acceptable results, especially after doing the final polish on my own. So what’s the story then?

**I also realised the fundamental flaw in this whole enterprise.**

The more detailed you make your prompts, the better Claude Code performs. But to get it to work correctly, you need specifications so detailed that you've almost done the implementation.

**You're not necessarily saving time - you're programming in Markdown instead of code.**

It's even worse than that, though. To be good at it, you need to become the world's most annoying micromanager.

You know the type - watching over someone's shoulder, correcting every keystroke, eventually grabbing the keyboard.

Just like my childhood friend Gabriel. He was the first one from the block to get a personal computer. Yes, I’m that old. You had to wait until he let you play Mortal Combat on his Amiga 600. But then you need to cherish your moment, as he was watching from behind, and quickly got annoyed and shouted:

> "that's not how you play!"

Then, grabbing the joystick to "show you how it should be done."

**So, to be effective, you need to behave just like Gabriel. You need to watch Claude plotting stuff in the console.** As one moment it generates sensible code, then completely loses the plot the next.

**When you hit unexpected problems (and you always do), Claude can't assess whether it needs help.** I told it to ask for clarification in these situations. Sometimes it does, usually it doesn't, preferring to solve everything by throwing more code at it. Mountains of code. Complex solutions to simple problems.

Also, if you’d like to make it autonomous, working in the background, then you need to provide a longer plan. The longer it gets, the longer it needs to be worked on. Adding to that, it has to be precise; the likelihood and the consequences of missing something important will get more severe. Of course, we can fix the plan and regenerate it, but…

We've seen this movie before. It's waterfall development with extra steps. [Remember UML tools](https://en.wikipedia.org/wiki/Computer-aided_software_engineering)? I still have nightmares from IBM Rational RequisitePro. They promised that we were going to model the world perfectly, then generate all the code. Just describe every class, every relationship, every edge case in beautiful diagrams. The tools would handle the mundane coding part.

**It failed because the specification was never the hard part - it was discovering what to build while building it.** Now we're making the same bet with prompts, hoping that if we just describe things clearly enough, the implementation will handle itself.

After a day of this, Claude had produced something that technically worked. But was it faster than doing it myself? Doubtful. Plus, I had to fix everything afterwards.

Someone might say, "but you're experienced, it helps juniors more." Except that less experienced developers have even less ability to judge if Claude's solutions are correct or completely insane.

Speaking about junior devs. Many people claim that working with LLM is like working with a junior. I think that’s disrespectful and just plain wrong. Junior devs don’t have enough knowledge yet, but they learn, you can teach them, mentor them, and they will get better. They can also reason and react based on what they're doing; they’re not just code outputters. LLMs won’t learn, as they don’t have memory; they just have context, which they happen to lose quickly and randomly.

* * *

**And another aspect: joy. We’re hearing a lot about vibes.**

But what vibes are they? Are they more like:

`youtube: [Embedded video](https://www.youtube.com/watch?rel=0&autoplay=0&showinfo=0&enablejsapi=0&v=apBWI6xrbLY)`

Or actually more like?

`youtube: [Embedded video](https://www.youtube.com/watch?rel=0&autoplay=0&showinfo=0&enablejsapi=0&v=N0L_wal-0cI)`

A lot of us came to programming to express our creativity. The puzzle-solving, the flow state, and the satisfaction of building something with our own hands.

Replace that with prompt engineering and micromanagement, and you've sucked all the fun out of the room.

**I spent a day watching an LLM struggle to generate sensible code. It was exhausting.** Not the good exhaustion of solving hard problems, but the bad kind - like teaching someone who forgets everything between lessons. If this is the future of programming, we're going to see a new kind of burnout: LLM burnout. Death by a thousand prompts.

Those tools have a sneaky UI with intentional [gamification](https://en.wikipedia.org/wiki/Gamification). It’s kinda addicting watching those CLI and trying to force it to do what you asked. It’s like playing an MMORPG game. Still, it’s exhausting.

We already established [Zoom fatigue](https://en.wikipedia.org/wiki/Zoom_fatigue), and I believe that we’re also about to establish LLM fatigue.

Of course, those tools will get better, any LLM fan will tell you that, as talking with GenAI fans is like talking to TV Series fans:

> "Dude, check those series, they're great! I mean, the first five seasons might not seem impressive if you're not into such series, but watch it, the 6th season will be mindblowing!"

I could also improve my prompting skills, but will it change the scale of the issue? I’ll try, but for now, I doubt that it’ll change the outcome substantially.

There are practical uses of those tools. There's value in using Claude for brainstorming. As a solopreneur, I don’t always have someone to challenge my ideas. Having something respond, even imperfectly, beats talking to yourself. But let's be honest about what's happening - we've invented a very expensive rubber duck that occasionally contributes ideas and can be useful to solving specific, narrowed-down coding challenges.

**Maybe I'm missing something. Maybe those 10x gains are real for others.** But after two serious attempts with real-world tasks, I'm convinced we're chasing a mirage. We're not getting dramatic productivity improvements. We're getting a new flavour of an old fantasy - that if we just specify things precisely enough, computers will do the hard work for us.

So do you really want to be like Gabriel?

Do we want to believe again that micromanagement is good management? Or that waterfall this time will work?

Or maybe you want to be a Markdown Programmer?

What are your thoughts? Did you find the workflow or type of tasks that work for you?

Check also:

-   [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)

-   [No, AI is not Making Engineers 10x as Productive by Colton Voege](https://colton.dev/)

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating, e.g. to the [Ukraine humanitarian](https://savelife.in.ua/en/donate/) organisation, [Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone) or [Red Cross](https://redcross.org.ua/en/).
