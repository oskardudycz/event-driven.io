---
title: Why We Should Learn Multiple Programming Languages
category: Software Architecture
cover: 2025-05-05-cover.jpg
author: oskar dudycz
redirectFrom: /why-we-should-learn-multiple-programming/
---

In a recent Discord chat, I heard the phrase that:

> _**A good senior developer should be able to program in any language.**_

As someone who's spent years working across multiple tech stacks, this got me thinking. Is language flexibility a core trait of senior engineers, or is deep specialisation more valuable?

During my almost 18-year career, I’ve used numerous languages, such as C#, Java, JavaScript/TypeScript, C++, Ruby, PHP, Python, Perl, and ActionScript. I’ve also played with even more. I’m not flexing, I'm not a polyglot programming wizard. That’s just how it goes if you’re long enough in this industry.

**Back in 1999, Andrew Hunt and David Thomas advised developers in "The Pragmatic Programmer" book to "learn at least one new language every year."** I think that’s too far, as we should not fall into the trap of pushing ourselves too much, but… This wasn't just about padding our resume but expanding our thinking. Different languages embody different approaches to solving problems, and exposure to these approaches enriches our toolbox regardless of your day-to-day language.

![Tower of Babel - Wikipedia](2025-05-05-cover.jpg "Tower of Babel - Wikipedia")

Source: https://commons.wikimedia.org/wiki/File:Pieter\_Bruegel\_the\_Elder\_-\_The\_Tower\_of\_Babel\_(Vienna)\_-\_Google\_Art\_Project.jpg

Without this exposure, we can end up "stewing in our own juices," unable to see alternatives. I've witnessed this repeatedly, for instance, with backend developers who construct elaborate workarounds to avoid touching JavaScript, not realising they're making their lives harder, not easier.

And hey, I’ve been there, I’ve been a JavaScript hater, even worse for TypeScript, and I left the project when I was forced to code in Perl. Still, I transitioned, and I’ve made my journey.

**Looking back, each time I've learned a new language, I've brought back new insights to my primary stack.** I just believe that having proficiency in more than just your favourite language opens doors to new ways of thinking.

## Learning the Language vs. Speaking It Fluently

When developers switch languages, they bring their habits with them, for better or worse.

Look at TypeScript code written by longtime Java or C# developers. You'll often see unnecessary class hierarchies, dependency injections, and repository patterns when simpler approaches would work better. They've learned the syntax but not the philosophy.

I've watched .NET and Java programmers struggle with Node.js because they're trying to force it into patterns that don't fit. Node.js is architecturally more similar to Go's minimalism than enterprise C# or Java, but they don't see that. They're writing C# with a different syntax.

It's like spoken languages - learning classroom English is different from speaking conversational English. Learning syntax doesn't mean you're writing idiomatic code that leverages the language's strengths.

Transitioning takes time. You might learn Go's syntax in a week, but understanding its ecosystem and idioms is a much longer journey. Most people reach a productivity plateau after 3-6 months, but true fluency takes longer.

## When It Makes Sense To Add A New Language

I've seen cases where adding a new language to the stack was worth it. The reasons were rarely related to the specific technologies, but rather to the state of the industry.

There are legitimate cases where a new language makes sense:

**When the specific business problem demands it**. Sometimes, specific services benefit from being written in a particular language. For example, when working with Node.js and needing CPU-intensive operations (like TypeScript migrations), it makes sense to use a more performant language for that specific component. See more in [TypeScript Migrates to Go: What's Really Behind That 10x Performance Claim?](/en/typescript-migrates-to-go-whats-really/)

**When it helps with hiring and retention**, I've had several clients who migrated from C#/Java to Node.js because they found it easier to hire developers. The systems they were building didn't actually require the ceremonial complexity that C#/Java provides; there was no business advantage beyond familiarity.

**When it opens up new career opportunities**. I personally benefited from refreshing my Java skills at one point. Most of my clients are Java, so that investment has paid off significantly in my consulting work. Some languages are also becoming obsolete. They’re still needed, but the market is shrinking (cheers, Cobol!).

**But let's be honest - not every technology experiment belongs in production.** The key question is rarely

> “Can we write this in X?"

but

> "Who will maintain this X code long-term?"

I once had to deal with a pricing algorithm module written in F#. While I actually like F# a lot, the decision wasn't justified in this context. One of my first decisions after taking over was painfully rewriting it in C#. The marginal benefits didn't outweigh the cognitive load on the rest of the team. It was a classical example of CV-driven design. The company burned money on a rewrite. But it was still cheaper than hiring or teaching new people F# to maintain it.

In another case, a team introduced a Python microservice because they thought it would be faster to develop. It turned out to be slower, leading to yet another rewrite. The business wasn't even aware they were paying for learning experiments and subsequent cleanup rather than actual features.

These failures usually happen because people don't ask the hard questions:

> _What's the actual business driver for this change?_
>
> _Is it worth spending 3-6 months of reduced productivity while the team learns something new?_
>
> _Who will maintain this code if the champion leaves?_

Even with good intentions, mixing technologies creates maintenance challenges. Small integrations in different technologies become business-critical risks. When key people leave, what should be a 15-minute fix can turn into weeks of investigation.

**That’s why such decisions usually need to be consulted and confirmed at a higher level than those of the inner teams.**

## Cross the Frontend-Backend Divide

There's one language-learning area I consider especially important: the frontend-backend divide.

If you're a backend developer, learning some frontend technologies means you won't limit yourself to just half of the feature delivery. You can help the frontend team when needed and understand the whole system better.

Similarly, frontend developers benefit from understanding what happens on the server. I've noticed backend developers often go to extreme lengths to avoid writing JavaScript, even when it's the simplest solution. This resistance ultimately makes their job harder, not easier.

You don't need to be an expert on both sides, but having enough knowledge to collaborate effectively improves everyone's lives.

Going back to our English classroom example. As we learn it to be able to communicate, learn in our projects and not be limited only to our native language projects and resources. We should learn both about the backend and frontend stack and the frontend, so as not to limit ourselves. We still can specialise in one of them, but you should be able to deliver a feature end-to-end, getting a little help from others, instead of waiting for them.

See also my interview with Tomasz Ducin on **Frontend Architecture, Backend Architecture or just Architecture?**

## "But I'm an Architect - Do I Still Need to Learn New Languages?"

My answer: **absolutely, perhaps even more so.**

Architecture decisions have long-lasting consequences. If you're not hands-on with the technologies you recommend, how can you truly understand their tradeoffs? You'll end up making decisions based on blog posts and conference talks rather than real-world experience.

The best architects I know still code regularly, even if not full-time, on production systems. They prototype in different languages, build proofs of concepts, and occasionally dive into codebases to understand pain points. They recognise that staying technically sharp is part of the job.

Without practical knowledge of multiple languages and ecosystems, how can you evaluate when a new technology is appropriate versus when it's just adding unnecessary complexity? How do you distinguish between legitimate technical concerns and simple resistance to change?

Architects who stop learning new technologies quickly lose touch with the realities of modern development, and their teams suffer for it.

Read more in my [Architect Manifesto](/en/architect_manifesto/).

## Finding Your Balance

So where does this leave us? Should every senior developer be capable of programming in any language? I think that's overstating it.

**It's more like: a senior developer should have the mental models to adapt to new languages relatively quickly, while recognizing that true mastery takes time and immersion.**

The challenge isn't the language syntax but the frameworks, libraries, and idioms around it. You might learn Go in a week, but that doesn't mean you're writing idiomatic Go code. You're likely writing Java-style Go, which misses the point entirely.

**For organizations, the calculus is a bit different:**

-   **For stable, long-term projects:** Maintaining technological consistency usually trumps introducing new languages

-   **For teams facing specific technical challenges**: Targeted use of specialized languages may be worth the investment

-   **For everyone:** Having a process for evaluating when to introduce new technologies is crucial

The key business question often gets overlooked: What's the actual driver for introducing a new language? Is it worth spending 3-6 months of reduced productivity while a team learns something new? Sometimes yes, but often no.

The question shouldn't be

> "Can we write this in X?"

but,

> "Who will maintain this X code long-term?"

## Investing in Growth, Mindfully

**Learning new languages represents an investment, both personal and organisational.** While syntax might come quickly, ecosystem familiarity takes longer. Even after spending years exploring a new language, many developers don't feel ready to join a project in that language at a senior level.

**Yet every senior developer I respect maintains curiosity about other approaches.** They might not be experts in five languages, but they're familiar enough with alternatives to know when their primary tool isn't the best fit.

This isn't about chasing trends or padding resumes. It's about expanding your mental models so you can recognize patterns across languages and ecosystems. It's about understanding that the "obvious solution" in your primary language might be fighting against the grain in another.

And perhaps most importantly, it's about maintaining the humility to recognize when you're forcing a problem into your favorite solution rather than finding the right approach for the challenge at hand.

**Because ultimately, programming languages are tools, not identities.** The best developers I know don't call themselves "Java programmers" or "JavaScript developers"; they're problem solvers who use the right tool for the job, whether it's the one they've used for a decade or the one they started learning last month.

What are your thoughts?

Cheers!

Oskar

**p.s. Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating, e.g. to the [Ukraine humanitarian](https://savelife.in.ua/en/donate/) organisation, [Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone) or [Red Cross](https://redcross.org.ua/en/).
