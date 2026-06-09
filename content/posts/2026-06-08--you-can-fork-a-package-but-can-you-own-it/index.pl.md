---
title: You can fork a package, but can you own it?
category: "Software Architecture"
cover: 2026-06-08-cover.jpg
author: oskar dudycz
useDefaultLangCanonical: true
---

![cover](2026-06-08-cover.jpg)

> Fork your dependencies, trim them to only your use case, never update unless it breaks for your users. I’ve been vocal about this for 10+ years. I’ve always said that updating is way riskier than latent bugs (which can be tracked and CVEs monitored).
> 
> If you are updating a dependency, it’s on you to analyze every single commit in the full transitive set of dependencies. If you dont see anything compelling, dont update!
> 
> I remember at HashiCorp once in awhile an engineer would try to update a dep or replace a DIY lib with an external one and id always ask “show me the commit we need.” Dont update for the sake of it.
> 
> Feeling pretty swell about this mentality with all the supply chain attacks happening.

**[That's from Mitchell Hashimoto](https://x.com/mitchellh/status/2057171518027887035). A friend sent it to me, and the first word he reached for was _bold_.** Mine too. I mostly agree with Mitchell, honestly. But the second I read it, my head jumped to a caveat, and the caveat turned out to be the thing I actually wanted to write about.

**We can fork a small library and trim it to what we use. I’ve done it, it’s fine. But could we fork React and maintain it?** I couldn’t. I don’t think most teams could either. So “fork your dependencies” is wonderful advice right up to the point where the dependency is too big to hold in our hands, and then it quietly stops being advice at all.

And that caveat says something about the advice itself. I think that it is, actually, not about forking. I see it more about knowing exactly what we’ve taken on and being willing to own it, and that’s the bit most of us skip. We don’t _decide_ to take a dependency. We just install one. And almost everything that goes wrong with dependencies:

* the supply chain attacks,    
* the licence dramas,    
* the half-finished SBOMs,    
* the things we find out about only after they break

comes back to that one move: we took dependence on someone else's product without ever deciding to. Everything else here is a variation on it.

## To fork or not?

I was reminded of this some time ago on a [live Q&A about my TypeScript port of some code](https://www.youtube.com/watch?v=Cf2oU_SUm3Y), and a whole chunk of it was one question asked five different ways:

> Why did you write your own `deepEquals` instead of just pulling a [package](https://www.npmjs.com/package/deep-equal)?

I tried to explain that it wasn't overachieving, and it wasn't not-invented-here pride either. I explained that maybe the code wasn't trivial, but straightforward enough for me, and is the type of code I write once and forget. The reception was, let's say, mixed. I get it, it’s much easier to just install a package and outsource maintenance costs. Especially when we're in a hurry, we don't make any decisions; we just do. We reach. And this reach can be a decent interim solution, but we should reflect on our next steps.

**Why do I reach for my own code on the small stuff?** Look at which packages actually get hit in all these supply chain attacks we keep reading about. It’s almost always the little ones. The one-liners. Remember the [Left-pad Incident](https://en.wikipedia.org/wiki/Npm_left-pad_incident)? It’s usually some tiny or low-level helper nobody thinks about. They’re everywhere, they’re trivial, and precisely because they’re trivial, nobody is watching them. Which is also exactly why they’re so easy to write ourselves. So for me, handwriting a small helper doesn't always mean that we're paranoid. It may be an option that will buy us some calm. It gives us knowledge of exactly what is in our own system.

That's also why, in [Emmett, my Event Sourcing library,](https://github.com/event-driven-io/emmett), I'm stubborn about keeping the core package free of dependencies and limiting whatever I inject elsewhere. Probably too stubborn, if I'm honest. But I'd rather err on the side of caution, because when it goes wrong on the user’s side, it goes far worse than a bit of code I maintain myself. It’s about responsibility for the outcome of our actions.

If I had to compress what I believe into one line, it wouldn’t be “fork everything”, and it wouldn’t be “write everything ourselves”. It would be something much less sexy than those two:

**Be precise about which dependencies we take on, look at how many dependencies pull in, and treat that as part of the decision. They're now our dependencies.**

The number of dependencies itself isn’t the point. It just tells us how much we’re agreeing to own without ever seeing it.

Because our direct dependencies were never the worst part, we chose those more or less cautiously. Most of the time, we can follow what they’re doing. The scary part is the dependencies of our dependencies, and theirs, all the way down, the part we didn’t choose, can’t see, and have no say over.

And I want to be careful here, because it’s easy to let this slide into another round of JavaScript-bashing, and that’s not what I mean. Every ecosystem has this. JS and TypeScript just sit at one far end of it, where there’s a package for absolutely everything, which is, in general, good, as we don't need to reinvent the wheel every other week, unlike in some other places. But it’s also how we end up with a node\_modules we couldn’t fully explain if someone put a gun to our head.

At the other extreme, there’s Microsoft and .NET, where the instinct runs so hard the opposite way that it tips into [Not Invented Here Syndrome](https://en.wikipedia.org/wiki/Not_invented_here). Neither end is the “right” one. They’re both defaults people drift into without ever making a decision.

**For me, it’s not about reaching zero dependencies. But having dependencies that we cautiously agreed upon.**

Which takes me to the part that, in my experience, almost nobody does. We can’t make a call on what we can’t see, and if we don’t even have the basic knowledge (e.g. some list) of what we depend on, then every conversation about supply chain risk is a bit of theatre.

## Dependency Inventory

**In most of the environments, [there are tools](https://openssf.org/technical-initiatives/sbom-tools/) to generate the [Software Bill of Materials](https://github.com/resources/articles/what-is-an-sbom-software-bill-of-materials) - the inventory of our dependency tree.** In some, they’re even built in. It’s easy to dunk on NPM, but it’d be better to do due diligence before doing so. Not many people seem to know this, but recent versions of npm ship an [npm sbom](https://docs.npmjs.com/cli/v11/commands/npm-sbom). So the tooling exists, even in NPM. That isn’t the problem.

The problem is that most organisations have never generated one in their life. No SBOM, no inventory, nothing written down anywhere. So the day the next [Log4Shell](https://en.wikipedia.org/wiki/Log4Shell) lands, and there will be a next one, they can’t answer the very first question anyone will ask them: do we run this, and if so, where?

**On the other hand, tools often don't help here, even those built to do so.** [NPM audit mostly does the opposite](https://overreacted.io/npm-audit-broken-by-design/). I honestly can’t remember the last time I installed something, and the audit didn’t immediately tell me to bump a stack of packages. Most of it is false positives, with no real attempt to say how dangerous any of it is. And that lands us in the oldest trap going: if it’s always red, we stop looking at red. So the one signal that was supposed to make us stop and decide ends up training everyone to decide nothing.

## Bus factor and rug pulls

There’s a related thing I can’t quite leave alone, so let me wander into it. I think a lot of teams spend their energy on the symptom and never once look at the source.

Watch what happens in the .NET world whenever a popular package changes the deal. [Fluent Assertions](https://www.infoq.com/news/2025/01/fluent-assertions-v8-license/) went commercial. [Moq shipped a thing that quietly hashed git email and phoned it home](https://snyk.io/blog/moq-package-exfiltrates-user-emails/). MassTransit and [AutoMapper](https://www.jimmybogard.com/automapper-and-mediatr-going-commercial/) announced commercial licenses within the same stretch. And nearly every time, the reaction across .NET shops is identical. It’s a mixture of:

* let’s rip it out and write their own,    
* search for a free alternative,    
* Cry to Microsoft to buy the lib or provide a replacement,

Essentially: a throw-the-baby-out-with-the-bathwater strategy.

And for me, that’s solving the wrong thing entirely. The source isn’t that the package started charging money, or pulled a rug. **The source is that we took on a critical dependency without ever admitting to ourselves that it was critical, and never once thought about what we’d do if the terms changed.** We didn’t consider the bus factor, and we didn’t do due diligence to ensure the work on it was sustainable and could continue. Pulling it out and hand-rolling a replacement fixes none of that. It just resets the same trap, this time with only the code we maintain.

[The IdentityServer episode](https://www.identityserver.com/articles/identityserver-vnext-duende-identityserver) was the clearest version of it I’ve seen. People were upset that they had to pay suddenly. Then, in the next sentence, it is called a critical security component. Then, in the sentence after that, it asks what the free alternatives were. A critical security component that we want for free and are ready to swap out overnight is, to my mind, asking for a security incident.

And there’s a bit of maths that quietly settles most of these arguments, if anyone bothers to do it. Take what the licence costs us per year. Then take into account what it would cost to have an engineer build and maintain our own version. Put the two side by side.

Almost every time, paying the maintainer comes out cheaper, and on top of that, we’ve lowered the bus factor on something we already lean on, which is its own kind of supply chain security. “We’d write it ourselves, but then we’d have to maintain it” is true. I just read it as the argument for paying the person who already does, not against it. If we depend on something, its survival is our problem too. That’s part of owning the decision.

[I know this case too well](https://www.architecture-weekly.com/p/why-open-source-isnt-always-fair).

## LLM as a fork

Getting back to Mitchell’s thought. The part I find most interesting is because of the moment we’re in. I keep hearing that LLMs change all of this, that writing our own small things is suddenly trivial, so the whole dependency question softens. I don’t buy it. It’s never that easy. Writing the small thing was never the hard part anyway. Owning it, understanding it, maintaining it, being the one on the hook when it breaks at 2 am, that’s the hard part, and no model takes that off our plate.

I don’t see how LLMs can change the cost of owning code. They can ([maybe](https://www.architecture-weekly.com/p/the-end-of-coding-wrong-question)) change the cost of producing it. That doesn’t fix the “install without deciding”. The old move was install and move on. The new move is “vibe it” and move on. Same missing decision, new flavour. The same lack of responsibility and ownership.

This trend isn’t new. It’s a classic [Shadow IT](https://en.wikipedia.org/wiki/Shadow_IT). If you haven’t been around long enough to run into the term, Shadow IT refers to the tools and systems people build or adopt within a company without going through whoever is officially meant to approve them. The spreadsheet that quietly runs a whole department. The little script someone wrote on a Friday that half the team now depends on. Nobody in the platform group has ever heard of the integration. It has always existed because people route around slow governance to get their job done, and most of the time, nobody notices until it breaks.

With LLMs, it’s more tempting than it has ever been. Someone in sales promises a customer a feature the team supposedly needs. The team has no time, so they cobble a tool together from the API and ship it. It doesn’t work. The customer says they’re not paying for this. It escalates. The thing was unowned from the moment it was conceived; nobody decided to take it on, it just appeared, and the blame game is starting.

And here’s where I think it all settles, because the corporate steamroller flattens everything in the end. Companies will dictate the allowed list, the way they always have. The cautious majority will stick to what’s known and popular: React, TypeScript, Python, Spring Boot. That’s what they did last time, and the time before. And the people who want to move faster will do it off the books, with an LLM, as Shadow IT. The declarative, standards-based frameworks that hide their complexity will do well in that world, because that style suits how these tools work, but it’s the same ceiling as before. We bet on React. We don’t own it. The small stuff we can hold; the big stuff stays as bet.

## What to do then?

We cannot fix the entire software industry, but we can fix how our own engineering teams operate. Instead of waiting for automated audits to scream at us, or ripping out packages in an emotional panic, I suggest a simple, regular exercise for our organisation.

Sit down and explicitly define your dependency posture:

1.  **Inventory:** List the dependencies you use (even without peer dependencies). Use tools `npm-sbom` to actually see what you are pulling in.    
2.  **Criticality:** Identify which of these packages are absolutely critical to your system.    
3.  **Lifecycle:** Define a clear strategy for upgrading and versioning them. Are you updating just for the sake of it, or are you looking for specific commits like Mitchell suggests?    
4.  **The Bus Factor:** Ask yourself: what happens if the author of a critical package gets hit by a bus, burns out, or the tool becomes paid?    
5.  **Mitigation:** Decide on a concrete backup plan for that exact scenario. Do you fork it? Do you pay the license fee? Maybe pay earlier for support or help in another way to maintain it.
6.  **Response Time:** Estimate how quickly you can upgrade and deploy the application if a major security breach occurs in a dependency. Also, if the strategy is to use replacement, then how fast will you be able to replace this dependency?

Building reliable software requires intent. We don't have to write everything from scratch, but we must be precise about what we bring into our software. Architecture is not just about writing code; it is about choosing which liabilities we are willing to own.

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/en/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/en/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
