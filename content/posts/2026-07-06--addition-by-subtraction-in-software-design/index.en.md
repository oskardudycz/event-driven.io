---
title: Addition by subtraction in Software Design
category: "Software Architecture"
cover: 2026-07-06-cover.jpg
author: oskar dudycz
---

I want it all, and I want it now. This is not only a Freddie Mercury quote but also, too often, a general plan for our software product. The picture tells more than words, so here it is, the typical product we designed:

![Swiss knife](2026-07-06-cover.jpg)

And, well, that’s probably not what our user wanted. They might just want a sharper steak knife, so something more like:

![Steak knife](2026-07-06-steak-knife.jpg)

I’m also to blame; I’m falling into precisely the same trap too often. Like recently, while working on [Strictland, the contract testing library I announced in the previous article](/en/announcing-strictland-contract-testing).

The idea behind it is to detect message schema drift easily. You write such a test:

```java
@Test
void orderPlacedSchema_DoesNotChange() {
    // Strictland specification
    MessageContract.specification(Json.Jackson.defaults())
        .given(new OrderPlaced(orderId, "Alice", placedAt))
        .whenSerialized()
        .thenContractIsUnchanged();
}
```

It serialises the message and stores the payload inside the same git repository as the test. Thanks to that, you can keep it close and detect contract changes during the review by looking at the changed files.

Initially, files were kept in the same folder as the test file. That made it accessible, as you don’t need to jump from one folder to another and see related test files. The file was named by message type class name (so in this case it’d be `OrderPlaced.approved.text`). Simple, but what if someone adds:
- Multiple tests, trying to store different snapshots for the same message type?    
- Multiple test files dispersed across different folders that test the same message type (e.g., in the features that consume those messages)?    
- Multiple message types across different modules/packages with the same name?    
- Multiple tests for different message-type versions and variants (e.g., with all fields, with only required fields, etc.)
    
All of that is solvable by some conventions, but what if you’re an open-source library creator like me? Then you can’t assume the same type of thinking, level of tidiness or knowledge of your users. You should be the one to take on the pain and make your users' lives easier. And guess what? That applies not only to open source, but also to other products.

_“Taking the pain”_ and _“helping users”_ can be interpreted as an attempt to please everyone, which translates to the mentioned earlier: “I want it all, and I want it now.”

That’s what I tried to do. I decided to add _“selectable storage layouts strategies”_:
- **Near the test file** - so similar to the one we had,
- **In the nested folder near the test file -** similar, but separating the snapshot files from tests, thanks to that, you could look in the nested folder, keeping the tests not polluted by the numerous tests,
- **In the root folder** - putting it close to the root folder, keeping snapshots together- still the same repo but giving potentially better accessibility.
    

And _”selectable storage layouts strategies”_ were not enough for me. I also wanted to add _“various grouping strategies”_ where one could select whether they want to group message snapshots by:
- Message type name,
- Test files and their names.
- Or just apply no grouping.
    

It sounded smart to me, and hell, with GenAI, I wouldn’t even need to fight with it, as my friend Claude would do it for me, right? [RIGHT?](https://www.architecture-weekly.com/p/requiem-for-a-10x-engineer-dream)

![That's what she said meme](2026-07-06-thats-what-she-said.jpg)

Now, _”selectable storage layouts strategies”_ should sound enough as a warning to me and _“various grouping strategies”_ should ring a loud alarm bell. But it didn’t. I planned how to do it and started the implementation.

A few iterations later, the permutations of those _various strategies_ started to pile up. Some of them were just hard to do. Some were conflicting. And most of them weren’t even useful.

Examples? I decided to make all files follow the unified format:

`{messageTypeName}.{version}.{variant}.snap.approved.{extension}`

And that’s fine, but then what to use as the message type name? Class name? Fine, but what about a flat layout, or grouping by message type name, with multiple messages of the same name?

Let’s use the full class path as the name? Fine, but then what if you have a root folder and a nested folder strategy? Would you nest folders by the class path, and then repeat it in the name?

Or maybe you’d differentiate the file name format depending on the strategy one chose?

Ok, but what if the user decides to change the strategy at some point?

I decided to run a sanity check I should have done earlier. Better later than too late. The discussion inside my head looked more or less like this:

- **Me:** What’s the actual goal of this library?
- **I:** To detect message schema drift.
- **Me:** Ok, then do I need to build the snapshot library?
- **I:** To some degree, I’m using snapshot comparison to detect that drift.
- **Me:** Sure, but I probably don’t need to cover all the cases that the generic snapshot library has to, right?
- **I:** Right.
- **Me:** Ok, so what’s our bet for users? Are they advanced or just beginning the journey?
- **I:** At the beginning.
- **Me:** Then I should help them, set a sane default, and guide them. Especially since this is the early phase of this library, I haven’t yet received much feedback.
- **I:** Agreed, maybe we could start then with the recommended layout and grouping, and then gather feedback. I can add more strategies as needed.
    

That sounds like an obvious thing to do, but it requires pausing to find the time to evaluate our assumptions. We shouldn’t always be mad at ourselves for not predicting everything earlier. Some stuff is just hard to predict. Personally, I usually see some steps after I try to implement them. Those are also the steps I explained in the [article about the OODA loop](https://event-driven.io/en/vibing_harness_and_ooda_loops/). We should:
- **Observe** - This is the intake of raw, unfiltered information. In our world, this means looking at the state of the system.
- **Orient** - This is the most critical and difficult stage. It’s where we filter our observations through your experience, culture, and technical knowledge.
- **Decide** - Based on our orientation, formulate a hypothesis.
- **Act** - We execute.
    

Rinse repeat.

If we think about it this way, the time spent considering those various cases is not wasted. It’s similar to the [anti-requirements exercise described by Andreas Öhlund and David Boike](https://particular.net/blog/antirequirements) or [Barry O'Reilly’s Residuality Theory](https://www.architecture-weekly.com/p/residuality-theory-a-rebellious-take). We gather numerous needs and ideas about our product evolution and see what sticks and what remains. Not all ideas will be great; some will be bad, but that doesn’t matter; it gives us food for thought.

**Still, we can’t forget about the most important part: subtraction.**

We need to subtract all the stuff that’s not needed, leaving only the useful residues, the one that solves the main goal.

For my case, I realised that if I chose the single strategy, it would organise my contract into the root test folder like this:

```plaintext
📁 src/test/resources/
  📁 contract-registry/
    📁 com/acme/orders/OrderPlaced/
      📄 OrderPlaced.1.default.snap.approved.json
      📄 OrderPlaced.2.default.snap.approved.json
    📁 com/acme/orders/OrderInitiated/
      📄 OrderInitiated.1.AllData.snap.approved.json
      📄 OrderInitiated.1.OnlyRequired.snap.approved.json
      📄 OrderInitiated.2.AllData.snap.approved.json
      📄 OrderInitiated.2.OnlyRequired.snap.approved.json
    📁 InvoiceIssuedEvent/
      📄 InvoiceIssuedEvent.1.default.snap.approved.json
```

By nesting by message type and full path and grouping by contract name, I’m not only keeping snapshots but also creating a Contract Registry.

So this subtraction of some features not only gave me focus on the specific scenario but also enabled me to create scenarios that I would actually like to have eventually, for instance:

- keep the message schema in the same folder as snapshots,
- markdown docs of the message,
- Having defined the folder structure, generate documentation,
- check dependency, and who uses that,
- etc.
    

That led me to conclude the following two rules:

1.  **The addition of imaginary features subtracts the actual value.**
    
2.  **The subtraction of imaginary features adds the actual value.**
    

It’s also aligned with my motto: [Removability over Maintainability](/en/removability_over_maintainability/).

## What’s the lesson then?

We’re not wasting time on building too slowly; we’re wasting time on building stuff that doesn’t matter. All those useless features we imagine without evaluating them with people are a wasted opportunity to deliver better for them.

Nowadays, with LLMs, it’s tempting to rush into implementation and add every feature we can imagine. That’s never free. We’re increasing the cognitive load for our users and also for us; we waste time on stuff that doesn’t matter and are constantly distracted.

Yet, if we don’t do sanity checks, trying things in a proof-of-concept way can be a big multiplier. If we stop after that and rethink.

I’d still advocate doing a sanity check earlier than I did in the described scenario and thinking first, but not all can be forseen like that. So:

1.  Generate as many ideas as you can.    
2.  Try to think about how they match together, think about the tradeoffs, the cost of adding them, the cost of removing them and the cost of changing your mind.    
3.  Define potential solutions.    
4.  **Stop the addition phase** and rethink what you came up with. Ask yourself what you’re building and what the actual goal is.    
5.  **Start the subtraction phase** and cut as much as you can on the stuff that’s actually not needed. Of course, don’t drop ideas, remember that quantification is subjective. [Deliver a simple solution that will give you enough optionality to change your mind](https://www.youtube.com/watch?v=yV97QwC5gnE).    
6.  Send it wild and gather feedback.
    
And that’s precisely what I did: I just released [Strictrland 0.4.0](https://github.com/event-driven-io/strictland) and will plan the next steps based on user feedback!

Cheers!

Oskar

**p.s. Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, and putting pressure on your local government or companies. You can also support Ukraine by donating, e.g. to the [Ukraine humanitarian](https://savelife.in.ua/en/donate/) organisation, [Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone) or [Red Cross](https://redcross.org.ua/en/).
